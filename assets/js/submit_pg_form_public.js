/**
 * Submit PG Form Public Page Logic
 * Uses /import/payment/forms/public/{url_slug}/ and /submit/ to simulate buyer submission.
 */

function pgFormSubmitEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function pgFormSubmitShowModal(type, title, message) {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');
    modalBox.className = 'modal ' + type;
    modalIcon.textContent = type === 'success' ? '✅' : '❌';
    modalTitle.textContent = title;
    modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
    TrustedTypes.setInnerHTML(
        modalMessage,
        pgFormSubmitEscapeHtml(message)
    );
    modalOverlay.classList.add('active');
}

function pgFormSubmitHideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document
    .getElementById('modalCloseBtn')
    .addEventListener('click', pgFormSubmitHideModal);
document
    .getElementById('modalOverlay')
    .addEventListener('click', function (e) {
        if (e.target === document.getElementById('modalOverlay'))
            pgFormSubmitHideModal();
    });

function pgFormSubmitFormatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

const pgFormLoadedState = {
    isFixedAmount: null,
    currency: 'INR',
};

/** Load Eximpe SDK from CDN; resolves when Eximpe is available. */
function loadEximpeSDK() {
    if (typeof Eximpe !== 'undefined') return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.eximpe.com/sdk/eximpe-sdk-1.1.0.min.js';
        script.integrity = 'sha384-5AHrZ8dfzODTyNdEelwQMZGQ//sTsYhkvFcBLN/gNacHKOREiQn2J7RM31qh4B6C';
        script.crossOrigin = 'anonymous';
        script.onload = () => (typeof Eximpe !== 'undefined' ? resolve() : reject(new Error('Eximpe SDK did not load')));
        script.onerror = () => reject(new Error('Failed to load Eximpe SDK'));
        document.head.appendChild(script);
    });
}

/** Poll payment status and submit return form when CAPTURED/FAILED (mirrors checkout-payment.js). */
function pgFormAutoCheckPaymentStatus(sessionId, options) {
    let lastStatus = null;
    let polling = true;
    const onSuccess = options.onSuccess;
    const onFailure = options.onFailure;
    const poll = () => {
        if (!polling || lastStatus) return;
        if (typeof Eximpe === 'undefined') return;
        Eximpe.checkPaymentStatus(sessionId, function (data) {
            if (data.data?.status === 'CAPTURED' && data.data?.return_url) {
                lastStatus = 'CAPTURED';
                polling = false;
                if (typeof onSuccess === 'function') onSuccess(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, 'Payment completed successfully');
            } else if (data.data?.status === 'FAILED' && data.data?.return_url) {
                lastStatus = 'FAILED';
                polling = false;
                if (typeof onFailure === 'function') onFailure(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, data.data?.message);
            } else if (data.data?.status === 'FAILED') {
                lastStatus = 'FAILED';
                polling = false;
                if (typeof onFailure === 'function') onFailure(data);
            } else if (!lastStatus) {
                setTimeout(poll, 3000);
            }
        });
    };
    poll();
    return () => { polling = false; };
}

/** Show/hide checkout loading overlay on submit form page. */
function pgFormShowCheckoutLoading(show, text) {
    const el = document.getElementById('checkoutLoading');
    const textEl = document.getElementById('checkoutLoadingText');
    if (el) el.style.display = show ? 'flex' : 'none';
    if (textEl && text != null) textEl.textContent = text || 'Loading checkout…';
}

/** Initiate hosted checkout with session_id: load SDK, then eximpe.checkout(). loadingAlreadyVisible: true = keep single continuous loading (do not show/hide at start). */
async function initiateCheckoutWithSession(sessionId, loadingAlreadyVisible) {
    if (!sessionId || typeof sessionId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
        pgFormShowCheckoutLoading(false);
        pgFormSubmitShowModal('error', 'Error', 'Invalid session ID.');
        return;
    }
    if (!loadingAlreadyVisible) {
        pgFormSubmitHideModal();
        pgFormShowCheckoutLoading(true, 'Loading payment…');
    }

    try {
        await loadEximpeSDK();

        const eximpe = new Eximpe({
            apiUrl: window.API_URL,
            mode: (new URLSearchParams(window.location.search)).get('mode') || 'sandbox',
        });
        eximpe.onSuccess(() => {
            pgFormShowCheckoutLoading(false);
            pgFormSubmitShowModal('success', 'Payment Successful', 'Your payment has been processed successfully.');
        });
        eximpe.onError((error) => {
            pgFormShowCheckoutLoading(false);
            pgFormSubmitShowModal('error', 'Payment Failed', error.message || 'An error occurred while processing your payment.');
        });

        await eximpe.checkout({
            paymentSessionId: sessionId,
            redirectTarget: '_self',
            onFormReady: function (formHtml) {
                pgFormShowCheckoutLoading(false);
                TrustedTypes.setInnerHTML(document.body, formHtml);
                const form = document.body.querySelector('form');
                if (form) {
                    pgFormAutoCheckPaymentStatus(sessionId, {
                        onSuccess: () => pgFormSubmitShowModal('success', 'Payment successful!', ''),
                        onFailure: (err) => pgFormSubmitShowModal('error', 'Payment failed', (err && err.message) || ''),
                    });
                    form.submit();
                } else {
                    pgFormSubmitShowModal('error', 'Error', 'Could not generate payment form.');
                }
            },
        });
    } catch (err) {
        pgFormShowCheckoutLoading(false);
        pgFormSubmitShowModal('error', 'Checkout Error', err.message || 'Failed to load or start checkout.');
    }
}

async function loadPublicForm() {
    const urlSlug = document.getElementById('urlSlug').value.trim();
    const formInfo = document.getElementById('formInfo');
    const formInfoContent = document.getElementById('formInfoContent');

    if (!urlSlug) {
        pgFormSubmitShowModal(
            'error',
            'Validation Error',
            'Please enter a form URL slug.'
        );
        return;
    }

    try {
        const response = await fetch(
            `${window.API_URL}/import/payment/forms/public/${urlSlug}/`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            }
        );
        const data = await response.json();
        const payload = (data && typeof data.data !== 'undefined') ? data.data : data;

        if (!response.ok) {
            let message = 'Failed to load form';
            if (data && typeof data === 'object') {
                if (data.error?.message) {
                    message = data.error.message;
                } else if (data.detail) {
                    message = data.detail;
                }
            }
            pgFormSubmitShowModal('error', 'Error', message);
            formInfo.style.display = 'none';
            return;
        }

        // payload is PGFormDetailSerializer (public)
        pgFormLoadedState.isFixedAmount = payload.is_fixed_amount;
        pgFormLoadedState.currency = payload.currency || 'INR';

        const lines = [];
        lines.push(
            `<strong>Payment For:</strong> ${pgFormSubmitEscapeHtml(
                payload.payment_for || ''
            )}`
        );
        if (payload.is_fixed_amount && payload.amount != null) {
            lines.push(
                `<strong>Amount:</strong> ${pgFormSubmitEscapeHtml(
                    payload.amount.toString()
                )} ${pgFormSubmitEscapeHtml(payload.currency || 'INR')}`
            );
        } else {
            lines.push('<strong>Amount:</strong> Variable (buyer decides)');
        }
        if (payload.description) {
            lines.push(
                `<strong>Description:</strong> ${pgFormSubmitEscapeHtml(
                    payload.description
                )}`
            );
        }
        if (payload.valid_until) {
            lines.push(
                `<strong>Valid Until:</strong> ${pgFormSubmitEscapeHtml(
                    pgFormSubmitFormatDate(payload.valid_until)
                )}`
            );
        }

        formInfoContent.innerHTML = lines.join('<br/>');
        formInfo.style.display = 'block';
    } catch (error) {
        pgFormSubmitShowModal(
            'error',
            'Error',
            error.message || 'An error occurred while loading the form.'
        );
        formInfo.style.display = 'none';
    }
}

document
    .getElementById('loadFormBtn')
    .addEventListener('click', function (e) {
        e.preventDefault();
        loadPublicForm();
    });

document
    .getElementById('submitPgFormPublicForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault();

        const urlSlug = document.getElementById('urlSlug').value.trim();
        const submitButton = document.getElementById('submitButton');
        const btnText = document.getElementById('btnText');

        if (!urlSlug) {
            pgFormSubmitShowModal(
                'error',
                'Validation Error',
                'Please enter a form URL slug.'
            );
            return;
        }

        const buyerName =
            document.getElementById('buyerName').value.trim() || null;
        const buyerEmail =
            document.getElementById('buyerEmail').value.trim() || null;
        const buyerPhone =
            document.getElementById('buyerPhone').value.trim() || null;

        if (!buyerName || !buyerEmail || !buyerPhone) {
            pgFormSubmitShowModal(
                'error',
                'Validation Error',
                'Name, email and phone are required.'
            );
            return;
        }

        const variableAmountValue = document
            .getElementById('variableAmount')
            .value.trim();

        if (pgFormLoadedState.isFixedAmount === false) {
            const amt = parseFloat(variableAmountValue || '');
            if (Number.isNaN(amt) || amt <= 0) {
                pgFormSubmitShowModal(
                    'error',
                    'Validation Error',
                    'Amount is required and must be greater than zero for variable amount forms.'
                );
                return;
            }
        }

        const buyerAddressLine1 =
            document.getElementById('buyerAddressLine1').value.trim() || null;
        const buyerAddressLine2 =
            document.getElementById('buyerAddressLine2').value.trim() || null;
        const buyerCity =
            document.getElementById('buyerCity').value.trim() || null;
        const buyerState =
            document.getElementById('buyerState').value.trim() || null;
        const buyerPostalCode =
            document.getElementById('buyerPostalCode').value.trim() || null;
        const buyerPan =
            document.getElementById('buyerPan').value.trim() || null;
        const buyerDob =
            document.getElementById('buyerDob').value || null;

        submitButton.disabled = true;
        btnText.textContent = 'Submitting...';
        pgFormShowCheckoutLoading(true, 'Processing…');

        try {
            function removeUndefined(obj) {
                if (Array.isArray(obj)) {
                    return obj.map(removeUndefined).filter((item) => item !== undefined);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned = {};
                    for (const [key, value] of Object.entries(obj)) {
                        const cleanedValue = removeUndefined(value);
                        if (cleanedValue !== undefined) {
                            cleaned[key] = cleanedValue;
                        }
                    }
                    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
                }
                return obj === '' ? undefined : obj;
            }

            const payload = {
                buyer: {
                    name: buyerName,
                    email: buyerEmail,
                    phone: buyerPhone.startsWith('+')
                        ? buyerPhone
                        : '+91' + buyerPhone,
                    address: {
                        line_1: buyerAddressLine1 || undefined,
                        line_2: buyerAddressLine2 || undefined,
                        city: buyerCity || undefined,
                        state: buyerState || undefined,
                        postal_code: buyerPostalCode || undefined,
                    },
                    pan_number: buyerPan || undefined,
                    dob: buyerDob || undefined,
                },
                amount:
                    pgFormLoadedState.isFixedAmount === false &&
                    variableAmountValue
                        ? parseFloat(variableAmountValue).toFixed(2)
                        : undefined,
            };

            const cleanPayload = removeUndefined(payload);

            const response = await fetch(
                `${window.API_URL}/import/payment/forms/public/${urlSlug}/submit/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cleanPayload),
                }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                pgFormShowCheckoutLoading(false);
                let message = 'Failed to submit form';
                if (data.error?.details) {
                    message = JSON.stringify(data.error.details);
                } else if (data.error?.message) {
                    message = data.error.message;
                } else if (data.message) {
                    message = data.message;
                }
                pgFormSubmitShowModal('error', 'Error', message);
                return;
            }

            const result = data.data || {};
            const sessionId = result.session_id;

            // One continuous loading: keep overlay visible and start CDN payment
            await initiateCheckoutWithSession(sessionId, true);
        } catch (error) {
            pgFormShowCheckoutLoading(false);
            pgFormSubmitShowModal(
                'error',
                'Error',
                error.message || 'An error occurred while submitting the form.'
            );
        } finally {
            submitButton.disabled = false;
            btnText.textContent = 'Submit Form';
        }
    });

