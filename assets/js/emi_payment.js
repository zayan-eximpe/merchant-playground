/**
 * EMI (Cardless EMI) Payment Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

// Utility to decode base64 to string (kept for parity with other S2S pages)
function decodeBase64(str) {
    try {
        return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
        return window.atob(str);
    }
}

function createSampleData() {
    const sampleData = {
        amount: '5000.00',
        currency: 'INR',
        reference_id: 'S2SEMI' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        return_url: `${window.location.origin}/checkout/payment_callback.html`,
        type_of_goods: 'digital_goods',
        buyer_name: 'John Doe',
        buyer_email: 'john.doe@example.com',
        buyer_phone: '8714268343',
        buyer_address_line_1: '123 Main Street',
        buyer_address_line_2: 'Apt 4B',
        buyer_city: 'City',
        buyer_state: 'State',
        buyer_postal_code: '123456',
        product_name: 'Sample Product',
        hs_code: '98051000',
        product_description: 'This is a sample product description',
        hs_code_description: 'Portable automatic data processing machines',
        invoice_number: 'INV' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        invoice_date: new Date().toISOString().split('T')[0],
        user_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        emi_mode: 'card',
        emi_provider: '',
        emi_tenure: '3',
        emi_bank_name: 'HDFC Bank',
        card_number: '4386241223215159',
        cardholder_name: 'John Doe',
        card_expiry_month: '12',
        card_expiry_year: '2029',
        card_cvv: '123'
    };

    const form = document.getElementById('sessionForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name && sampleData[element.name] !== undefined) {
            element.value = sampleData[element.name];
            if (element.tagName === 'SELECT') {
                element.dispatchEvent(new Event('change'));
            }
        }
    }

    document.getElementById('amount').value = sampleData.amount;
    document.getElementById('currency').value = sampleData.currency;
    document.getElementById('ReferenceID').value = sampleData.reference_id;
    document.getElementById('typeOfGoods').value = sampleData.type_of_goods;
    document.getElementById('buyerName').value = sampleData.buyer_name;
    document.getElementById('buyerEmail').value = sampleData.buyer_email;
    document.getElementById('buyerPhone').value = sampleData.buyer_phone;
    document.getElementById('buyerAddressLine1').value = sampleData.buyer_address_line_1;
    document.getElementById('buyerAddressLine2').value = sampleData.buyer_address_line_2;
    document.getElementById('buyerCity').value = sampleData.buyer_city;
    document.getElementById('buyerState').value = sampleData.buyer_state;
    document.getElementById('buyerPostalCode').value = sampleData.buyer_postal_code;
    document.getElementById('productName').value = sampleData.product_name;
    document.getElementById('hsCode').value = sampleData.hs_code;
    document.getElementById('productDescription').value = sampleData.product_description;
    document.getElementById('hsCodeDescription').value = sampleData.hs_code_description;
    document.getElementById('invoiceNumber').value = sampleData.invoice_number;
    document.getElementById('invoiceDate').value = sampleData.invoice_date;
    document.getElementById('userIp').value = sampleData.user_ip;
    document.getElementById('userAgent').value = sampleData.user_agent;
    document.getElementById('emiProvider').value = sampleData.emi_provider;
    document.getElementById('emiTenure').value = sampleData.emi_tenure;
    const emiModeSelect = document.getElementById('emiMode');
    if (emiModeSelect && sampleData.emi_mode) {
        emiModeSelect.value = sampleData.emi_mode;
    }

    document.getElementById('typeOfGoods').dispatchEvent(new Event('change'));

    if (window.updateEmiModeUI) {
        window.updateEmiModeUI();
    }

    saveFormData();
}

function toTitleCaseField(field) {
    const spaced = field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase();
    return spaced.replace(/\b\w/g, char => char.toUpperCase());
}

function saveFormData() {
    const formData = {};
    const form = document.getElementById('sessionForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name) {
            if (element.type === 'file') {
                continue;
            }
            formData[element.name] = element.value;
        }
    }

    localStorage.setItem('eximpe_form_data_emi', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('eximpe_form_data_emi');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('sessionForm');
        const formElements = form.elements;

        for (let element of formElements) {
            if (element.name && formData[element.name] !== undefined) {
                element.value = formData[element.name];
                if (element.tagName === 'SELECT') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        }
    }
}

function clearFormData() {
    localStorage.removeItem('eximpe_form_data_emi');
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        if (button) {
            const originalText = button.innerHTML;
            button.textContent = '✅ Copied!';
            button.style.background = '#28a745';
            setTimeout(() => {
                TrustedTypes.setInnerHTML(button, originalText);
                button.style.background = 'rgb(38, 168, 135)';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

function clearCache() {
    clearFormData();
    document.getElementById('sessionForm').reset();
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('sessionForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    loadFormData();

    const emiModeSelect = document.getElementById('emiMode');
    const emiProviderGroup = document.getElementById('emiProviderGroup');
    const emiBankNameGroup = document.getElementById('emiBankNameGroup');
    const cardEmiDetailsSection = document.getElementById('cardEmiDetailsSection');

    function updateEmiModeUI() {
        if (!emiModeSelect) return;
        const mode = emiModeSelect.value || 'cardless';
        if (mode === 'card') {
            if (emiProviderGroup) emiProviderGroup.style.display = 'none';
            if (emiBankNameGroup) emiBankNameGroup.style.display = '';
            if (cardEmiDetailsSection) cardEmiDetailsSection.style.display = '';
        } else {
            if (emiProviderGroup) emiProviderGroup.style.display = '';
            if (emiBankNameGroup) emiBankNameGroup.style.display = 'none';
            if (cardEmiDetailsSection) cardEmiDetailsSection.style.display = 'none';
        }
    }

    window.updateEmiModeUI = updateEmiModeUI;

    if (emiModeSelect) {
        emiModeSelect.addEventListener('change', function () {
            updateEmiModeUI();
        });
        updateEmiModeUI();
    }

    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            element.addEventListener('input', saveFormData);
            element.addEventListener('change', saveFormData);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showModal(type, title, message) {
        if (typeof ModalUtils !== 'undefined') {
            ModalUtils.show(type, title, message);
        } else {
            modalBox.className = 'modal ' + type;
            modalTitle.textContent = title;
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(modalMessage, message);
            } else {
                modalMessage.innerHTML = message;
            }
            modalOverlay.classList.add('active');
        }
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
    }

    window.showModal = showModal;
    window.hideModal = hideModal;

    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) hideModal();
    });

    document.querySelectorAll('select').forEach(function (select) {
        select.addEventListener('change', function () {
            if (select.value) {
                select.classList.add('has-value');
            } else {
                select.classList.remove('has-value');
            }
        });
        if (select.value) {
            select.classList.add('has-value');
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        createButton.disabled = true;
        btnText.textContent = 'Creating EMI Payment...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            btnText.textContent = 'Creating EMI Payment...';

            let amountValue = document.getElementById('amount').value;
            // Raw 10-digit phone for EMI (cardless); buyer.phone uses +91 prefix
            const phoneValueRaw = document.getElementById('buyerPhone').value;
            let buyerPhoneWithCountry = phoneValueRaw;
            if (buyerPhoneWithCountry) {
                buyerPhoneWithCountry = '+91' + buyerPhoneWithCountry;
            }

            const emiMode = document.getElementById('emiMode')
                ? document.getElementById('emiMode').value || 'cardless'
                : 'cardless';

            const tenureValue = document.getElementById('emiTenure')
                ? document.getElementById('emiTenure').value
                : '';

            let emiDetails;
            if (emiMode === 'card') {
                const bankName = document.getElementById('emiBankName')
                    ? document.getElementById('emiBankName').value
                    : '';
                const cardNumber = document.getElementById('cardNumber')
                    ? document.getElementById('cardNumber').value
                    : '';
                const cardholderName = document.getElementById('cardholderName')
                    ? document.getElementById('cardholderName').value
                    : '';
                const cardExpiryMonth = document.getElementById('cardExpiryMonth')
                    ? document.getElementById('cardExpiryMonth').value
                    : '';
                const cardExpiryYear = document.getElementById('cardExpiryYear')
                    ? document.getElementById('cardExpiryYear').value
                    : '';
                const cardCvv = document.getElementById('cardCvv')
                    ? document.getElementById('cardCvv').value
                    : '';

                const cardDetails = {
                    number: cardNumber || undefined,
                    cardholder_name: cardholderName || undefined,
                    expiry_month: cardExpiryMonth || undefined,
                    expiry_year: cardExpiryYear || undefined,
                    cvv: cardCvv || undefined,
                };

                emiDetails = {
                    bank_name: bankName || undefined,
                    emi_tenure: tenureValue || undefined,
                    card_details: cardDetails,
                };
            } else {
                emiDetails = {
                    provider: document.getElementById('emiProvider').value || undefined,
                    emi_tenure: tenureValue || undefined,
                    // Use E.164-style format so backend PhoneNumberField accepts it
                    phone: buyerPhoneWithCountry || undefined,
                };
            }

            const payload = {
                amount: amountValue,
                collection_mode: "s2s",
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('ReferenceID').value || undefined,
                mop_type: "emi",
                emi_details: emiDetails,
                buyer: {
                    name: document.getElementById('buyerName').value,
                    email: document.getElementById('buyerEmail').value || undefined,
                    phone: buyerPhoneWithCountry || undefined,
                    address: {
                        line_1: document.getElementById('buyerAddressLine1').value,
                        line_2: document.getElementById('buyerAddressLine2').value || undefined,
                        city: document.getElementById('buyerCity').value,
                        state: document.getElementById('buyerState').value,
                        postal_code: document.getElementById('buyerPostalCode').value
                    },
                    ip_address: document.getElementById('userIp').value || undefined,
                    user_agent: document.getElementById('userAgent').value || undefined,
                },
                product: {
                    name: document.getElementById('productName').value,
                    description: document.getElementById('productDescription').value || undefined,
                    hs_code: document.getElementById('hsCode').value,
                    hs_code_description: document.getElementById('hsCodeDescription').value || undefined,
                    type_of_goods: document.getElementById('typeOfGoods').value
                },
                invoice: {
                    number: document.getElementById('invoiceNumber').value || undefined,
                    date: document.getElementById('invoiceDate').value || undefined
                }
            };

            function removeUndefined(obj) {
                if (Array.isArray(obj)) {
                    return obj.map(removeUndefined).filter(item => item !== undefined);
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

            const cleanPayload = removeUndefined(payload);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
                },
                body: JSON.stringify(cleanPayload)
            });

            const data = await response.json();

            if (data.success && data.data) {
                const orderId = data.data.order_id;
                const paymentLink = data.data.link;
                const acsTemplate = data.data.acs_template;

                if (acsTemplate) {
                    const html = decodeBase64(acsTemplate);
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const formEl = doc.querySelector('form');
                        if (formEl) {
                            document.body.appendChild(formEl);
                            localStorage.setItem('last_used_order_id', orderId);
                            clearCache();
                            formEl.submit();
                        } else {
                            showModal('error', 'Authentication Error', 'Could not process the authentication page.');
                        }
                    } catch (e) {
                        console.error('Error parsing ACS template:', e);
                        showModal('error', 'Authentication Error', 'An error occurred while processing authentication.');
                    }
                    return;
                }

                if (!paymentLink) {
                    showModal('error', 'Error', 'No payment link received from server.');
                    return;
                }

                localStorage.setItem('last_used_order_id', orderId);
                clearCache();

                // If link is raw HTML (PayU acsTemplate routed via link), open in new window
                if (paymentLink.trim().startsWith('<')) {
                    const win = window.open('', '_blank');
                    if (win) {
                        win.document.open();
                        win.document.write(paymentLink);
                        win.document.close();
                    } else {
                        showModal('error', 'Popup blocked', 'Please allow popups and try again.');
                    }
                } else {
                    // Redirect customer to the EMI payment page
                    window.location.href = paymentLink;
                }
            } else {
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += '<ul style="text-align:left; margin: 10px 0 0 0; padding-left: 18px;">';

                    function processErrors(errors, prefix = '') {
                        for (const [field, errorValue] of Object.entries(errors)) {
                            if (typeof errorValue === 'object' && !Array.isArray(errorValue) && errorValue !== null) {
                                processErrors(errorValue, `${prefix}${field}.`);
                            } else {
                                const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                                errorArray.forEach(err => {
                                    const fullFieldName = `${prefix}${field}`;
                                    const fieldName = toTitleCaseField(fullFieldName.replace(/\./g, ' '));
                                    errorMsg += `<li><strong>${escapeHtml(fieldName)}:</strong> ${escapeHtml(err)}</li>`;
                                });
                            }
                        }
                    }

                    processErrors(data.error.details);
                    errorMsg += '</ul>';
                } else if (data.error && data.error.message) {
                    errorMsg = escapeHtml(data.error.message);
                } else {
                    errorMsg = 'An unexpected error occurred. Please try again.';
                }

                showModal('error', escapeHtml(data.error?.message || 'Validation Error'), errorMsg);
            }
        } catch (error) {
            showModal('error', 'Error', escapeHtml(error.message));
        } finally {
            createButton.disabled = false;
            btnText.textContent = 'Initiate EMI Payment';
        }
    });
});

