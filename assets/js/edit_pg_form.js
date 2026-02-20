// Edit PG Form Page Logic

function getPgFormAuthHeaders() {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Secret':
            typeof getConfigValue === 'function' ? getConfigValue('AUTH_KEY') : '',
        'X-Client-ID':
            typeof getConfigValue === 'function' ? getConfigValue('CLIENT_ID') : '',
    };
    if (
        typeof getConfigValue === 'function' &&
        getConfigValue('IS_PSP') &&
        getConfigValue('MERCHANT_ID')
    ) {
        headers['X-Merchant-ID'] = getConfigValue('MERCHANT_ID');
    }
    return headers;
}

function pgFormHideModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay?.classList.remove('active');
}

function pgFormShowModal(type, title, message) {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');

    if (!modalBox || !modalOverlay) return;

    modalBox.className = 'modal ' + type;
    if (modalIcon) {
        modalIcon.textContent = type === 'success' ? '✅' : '❌';
    }
    if (modalTitle) {
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? '' : 'red';
    }
    if (modalMessage) {
        modalMessage.innerHTML = message;
    }

    modalOverlay.classList.add('active');
}

function pgFormToTitleCaseField(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function pgFormFormatAmountDisplay(value) {
    const amount = parseFloat(value);
    if (Number.isNaN(amount) || amount <= 0) {
        return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}

function pgFormToDatetimeLocalInput(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes())
    );
}

function pgFormDatetimeLocalToIsoWithOffset(inputValue) {
    if (!inputValue) return undefined;
    const date = new Date(inputValue);
    if (Number.isNaN(date.getTime())) return undefined;

    const pad = (n) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const offsetMinutes = date.getTimezoneOffset();
    const sign = offsetMinutes <= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(absMinutes / 60));
    const offsetMins = pad(absMinutes % 60);

    return (
        `${year}-${month}-${day}T${hours}:${minutes}:${seconds}` +
        `${sign}${offsetHours}:${offsetMins}`
    );
}

const PG_FORM_KEY_TO_ID = {
    is_fixed_amount: 'isFixedAmount',
    url_slug: 'urlSlug',
    payment_for: 'paymentFor',
    amount: 'amount',
    currency: 'currency',
    gst_percentage: 'gstPercentage',
    service_charge_percentage: 'serviceChargePercentage',
    type_of_goods: 'typeOfGoods',
    hs_code: 'hsCode',
    description: 'productDescription',
    preferred_mop_type: 'preferredMopType',
    success_url: 'successUrl',
    fail_url: 'failUrl',
    thank_you_message: 'thankYouMessage',
    valid_from: 'validFrom',
    valid_until: 'validUntil',
    collect_name: 'collectName',
    collect_email: 'collectEmail',
    collect_phone: 'collectPhone',
    collect_address: 'collectAddress',
    collect_pan: 'collectPan',
    collect_dob: 'collectDob',
    terms_and_conditions: 'termsAndConditions',
    contact_email: 'contactEmail',
    contact_phone: 'contactPhone',
    contact_whatsapp: 'contactWhatsapp',
    website_url: 'websiteUrl',
    support_url: 'supportUrl',
    logo_url: 'logoPreview',
    primary_color: 'primaryColor',
    template_style: 'templateStyle',
    twitter_url: 'twitterUrl',
    instagram_url: 'instagramUrl',
    facebook_url: 'facebookUrl',
    linkedin_url: 'linkedinUrl',
};

function updatePgFormSummaryCard() {
    const amountEl = document.getElementById('summaryAmount');
    const descriptionEl = document.getElementById('summaryDescription');
    const amountInput = document.getElementById('amount');
    const paymentForInput = document.getElementById('paymentFor');

    if (amountEl && amountInput) {
        amountEl.textContent = pgFormFormatAmountDisplay(amountInput.value);
    }

    if (descriptionEl && paymentForInput) {
        const text = paymentForInput.value.trim();
        descriptionEl.textContent = text
            ? text
            : 'Enter a Form ID and load its configuration to see the summary.';
    }
}

function fillEditFormFromData(data) {
    if (!data || typeof data !== 'object') return;

    // Current logo preview (logo_url is not a form field; we show it in logoPreview)
    const logoPreviewEl = document.getElementById('logoPreview');
    if (logoPreviewEl) {
        logoPreviewEl.innerHTML = '';
        const logoUrl = data.logo_url;
        if (logoUrl && typeof logoUrl === 'string') {
            const img = document.createElement('img');
            img.alt = 'Current logo';
            img.style.maxHeight = '48px';
            img.style.display = 'block';
            img.src = logoUrl;
            logoPreviewEl.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.className = 'helper-text';
            span.textContent = 'No logo set.';
            logoPreviewEl.appendChild(span);
        }
    }

    Object.entries(PG_FORM_KEY_TO_ID).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === 'logoPreview') return; // already handled above

        const value = data[key];

        if (value === null || typeof value === 'undefined') {
            if (el.type === 'checkbox') {
                el.checked = false;
            } else {
                el.value = '';
            }
            return;
        }

        if (id === 'validFrom' || id === 'validUntil') {
            if (value) {
                const d = new Date(value);
                if (!Number.isNaN(d.getTime())) {
                    el.value = pgFormToDatetimeLocalInput(d);
                }
            }
            return;
        }

        if (el.type === 'checkbox') {
            el.checked = !!value;
        } else {
            el.value = value;
        }
    });

    const primaryColorInput = document.getElementById('primaryColor');
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    if (primaryColorPicker && primaryColorInput && /^#[0-9A-Fa-f]{6}$/.test(String(primaryColorInput.value))) {
        primaryColorPicker.value = primaryColorInput.value;
    }

    updatePgFormSummaryCard();
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pgFormEditForm');
    const updateButton = document.getElementById('updateButton');
    const btnText = document.getElementById('btnText');
    const loadButton = document.getElementById('loadButton');
    const formIdInput = document.getElementById('formId');
    const amountInput = document.getElementById('amount');
    const paymentForInput = document.getElementById('paymentFor');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const isFixedAmountCheckbox = document.getElementById('isFixedAmount');
    const fixedAmountGroup = document.getElementById('fixedAmountGroup');

    updatePgFormSummaryCard();

    if (amountInput) {
        amountInput.addEventListener('input', updatePgFormSummaryCard);
    }
    if (paymentForInput) {
        paymentForInput.addEventListener('input', updatePgFormSummaryCard);
    }

    if (isFixedAmountCheckbox && fixedAmountGroup) {
        const toggleFixed = () => {
            const isFixed = isFixedAmountCheckbox.checked;
            fixedAmountGroup.style.display = isFixed ? 'block' : 'none';
        };
        isFixedAmountCheckbox.addEventListener('change', toggleFixed);
        toggleFixed();
    }

    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const primaryColorInput = document.getElementById('primaryColor');
    if (primaryColorPicker && primaryColorInput) {
        primaryColorPicker.addEventListener('input', () => {
            primaryColorInput.value = primaryColorPicker.value;
        });
        primaryColorInput.addEventListener('input', () => {
            const v = primaryColorInput.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) primaryColorPicker.value = v;
        });
    }

    modalCloseBtn?.addEventListener('click', pgFormHideModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            pgFormHideModal();
        }
    });

    if (loadButton) {
        loadButton.addEventListener('click', async () => {
            const formId = formIdInput?.value.trim();
            if (!formId) {
                pgFormShowModal(
                    'error',
                    'Form ID Required',
                    'Please enter a Form ID to load.'
                );
                return;
            }

            const authKey =
                typeof getConfigValue === 'function'
                    ? getConfigValue('AUTH_KEY')
                    : '';
            const clientId =
                typeof getConfigValue === 'function'
                    ? getConfigValue('CLIENT_ID')
                    : '';
            if (!authKey || !clientId) {
                pgFormShowModal(
                    'error',
                    'Credentials Required',
                    'Please set your Client ID and Auth Key (API credentials) in the playground header or credentials panel, then try again.'
                );
                return;
            }

            loadButton.disabled = true;
            loadButton.textContent = 'Loading...';

            try {
                const response = await fetch(
                    `${window.API_URL}/pg/forms/${encodeURIComponent(formId)}/`,
                    {
                        method: 'GET',
                        headers: getPgFormAuthHeaders(),
                    }
                );
                const data = await response.json();
                const payload = (data && typeof data.data !== 'undefined') ? data.data : data;

                if (response.ok) {
                    fillEditFormFromData(payload);
                } else {
                    let errorMsg = 'Failed to load payment form';
                    const errDetail = (data && data.error && typeof data.error === 'object') ? data.error : data;
                    if (errDetail && typeof errDetail.message === 'string' && errDetail.message) {
                        errorMsg = errDetail.message;
                    } else if (errDetail && typeof errDetail === 'object') {
                        errorMsg = '<ul class="error-list">';
                        const details = (errDetail.details && typeof errDetail.details === 'object') ? errDetail.details : errDetail;
                        Object.entries(details).forEach(([field, fieldErrors]) => {
                            const fieldName = pgFormToTitleCaseField(
                                field.replace(/\./g, ' ')
                            );
                            const errorsArray = Array.isArray(fieldErrors)
                                ? fieldErrors
                                : [fieldErrors];
                            errorsArray.forEach((err) => {
                                errorMsg += `
                                    <li>
                                        <i class="fas fa-exclamation-circle"></i>
                                        <span><strong>${fieldName}:</strong> ${err}</span>
                                    </li>
                                `;
                            });
                        });
                        errorMsg += '</ul>';
                    }
                    pgFormShowModal('error', 'Load Error', errorMsg);
                }
            } catch (error) {
                pgFormShowModal(
                    'error',
                    'Error',
                    error.message || 'Something went wrong.'
                );
            } finally {
                loadButton.disabled = false;
                loadButton.textContent = 'Load Form';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            pgFormHideModal();

            const formId = formIdInput?.value.trim() || '';
            const urlSlugValue =
                document.getElementById('urlSlug')?.value.trim() || '';
            const paymentForValue =
                document.getElementById('paymentFor')?.value.trim() || '';
            const isFixed =
                document.getElementById('isFixedAmount')?.checked ?? true;
            const amountValue = parseFloat(amountInput?.value || '');

            if (!formId) {
                pgFormShowModal(
                    'error',
                    'Form ID Required',
                    'Please enter a Form ID before updating.'
                );
                return;
            }
            if (!urlSlugValue) {
                pgFormShowModal(
                    'error',
                    'Validation Error',
                    'URL Slug is required.'
                );
                return;
            }
            if (!paymentForValue) {
                pgFormShowModal(
                    'error',
                    'Validation Error',
                    'Payment For is required.'
                );
                return;
            }
            if (isFixed) {
                if (Number.isNaN(amountValue) || amountValue <= 0) {
                    pgFormShowModal(
                        'error',
                        'Invalid Amount',
                        'Please enter a valid amount greater than zero for fixed amount forms.'
                    );
                    return;
                }
            }

            const authKey =
                typeof getConfigValue === 'function'
                    ? getConfigValue('AUTH_KEY')
                    : '';
            const clientId =
                typeof getConfigValue === 'function'
                    ? getConfigValue('CLIENT_ID')
                    : '';
            if (!authKey || !clientId) {
                pgFormShowModal(
                    'error',
                    'Credentials Required',
                    'Please set your Client ID and Auth Key (API credentials) in the playground header or credentials panel, then try again.'
                );
                return;
            }

            updateButton.disabled = true;
            btnText.textContent = 'Updating...';

            try {
                function removeUndefined(obj) {
                    if (Array.isArray(obj)) {
                        return obj
                            .map(removeUndefined)
                            .filter((item) => item !== undefined);
                    } else if (obj !== null && typeof obj === 'object') {
                        const cleaned = {};
                        for (const [key, value] of Object.entries(obj)) {
                            const cleanedValue = removeUndefined(value);
                            if (cleanedValue !== undefined) {
                                cleaned[key] = cleanedValue;
                            }
                        }
                        return Object.keys(cleaned).length > 0
                            ? cleaned
                            : undefined;
                    }
                    return obj === '' ? undefined : obj;
                }

                const currencyValue =
                    document.getElementById('currency')?.value || 'INR';
                const gstPercentageValue =
                    document.getElementById('gstPercentage')?.value || undefined;
                const serviceChargePercentageValue =
                    document.getElementById('serviceChargePercentage')?.value ||
                    undefined;
                const typeOfGoodsValue =
                    document.getElementById('typeOfGoods')?.value || undefined;
                const preferredMopTypeValue =
                    document.getElementById('preferredMopType')?.value ||
                    undefined;
                const successUrlValue =
                    document.getElementById('successUrl')?.value || undefined;
                const failUrlValue =
                    document.getElementById('failUrl')?.value || undefined;
                const thankYouMessageValue =
                    document.getElementById('thankYouMessage')?.value ||
                    undefined;
                const validFromValue =
                    document.getElementById('validFrom')?.value || undefined;
                const validUntilValue =
                    document.getElementById('validUntil')?.value || undefined;

                const hsCodeInput = document.getElementById('hsCode');
                const hsCodeValue = hsCodeInput?.value.trim() || undefined;
                if (typeOfGoodsValue === 'physical_goods' && !hsCodeValue) {
                    pgFormShowModal(
                        'error',
                        'Validation Error',
                        'HS Code is required when Type of Goods is Physical Goods.'
                    );
                    return;
                }

                const payload = {
                    url_slug: urlSlugValue,
                    payment_for: paymentForValue,
                    is_fixed_amount: isFixed,
                    amount_cents: isFixed
                        ? Math.round(amountValue * 100)
                        : undefined,
                    currency: currencyValue,
                    gst_percentage: gstPercentageValue
                        ? parseInt(gstPercentageValue, 10)
                        : undefined,
                    service_charge_percentage: serviceChargePercentageValue
                        ? parseInt(serviceChargePercentageValue, 10)
                        : undefined,
                    hs_code: hsCodeValue,
                    type_of_goods: typeOfGoodsValue,
                    description:
                        document.getElementById('productDescription')?.value ||
                        undefined,
                    success_url: successUrlValue,
                    fail_url: failUrlValue,
                    thank_you_message: thankYouMessageValue,
                    valid_from: pgFormDatetimeLocalToIsoWithOffset(validFromValue),
                    valid_until:
                        pgFormDatetimeLocalToIsoWithOffset(validUntilValue),
                    collect_name:
                        document.getElementById('collectName')?.checked ?? true,
                    collect_email:
                        document.getElementById('collectEmail')?.checked ?? true,
                    collect_phone:
                        document.getElementById('collectPhone')?.checked ?? true,
                    collect_address:
                        document.getElementById('collectAddress')?.checked ??
                        false,
                    collect_pan:
                        document.getElementById('collectPan')?.checked ?? false,
                    collect_dob:
                        document.getElementById('collectDob')?.checked ?? false,
                    terms_and_conditions:
                        document.getElementById('termsAndConditions')?.value ||
                        undefined,
                    contact_email:
                        document.getElementById('contactEmail')?.value ||
                        undefined,
                    contact_phone:
                        document.getElementById('contactPhone')?.value ||
                        undefined,
                    contact_whatsapp:
                        document.getElementById('contactWhatsapp')?.value ||
                        undefined,
                    website_url:
                        document.getElementById('websiteUrl')?.value ||
                        undefined,
                    support_url:
                        document.getElementById('supportUrl')?.value ||
                        undefined,
                    primary_color:
                        document.getElementById('primaryColor')?.value ||
                        undefined,
                    template_style:
                        document.getElementById('templateStyle')?.value || 'template1',
                    twitter_url:
                        document.getElementById('twitterUrl')?.value ||
                        undefined,
                    instagram_url:
                        document.getElementById('instagramUrl')?.value ||
                        undefined,
                    facebook_url:
                        document.getElementById('facebookUrl')?.value ||
                        undefined,
                    linkedin_url:
                        document.getElementById('linkedinUrl')?.value ||
                        undefined,
                };

                const cleanPayload = removeUndefined(payload);

                let body;
                const headers = getPgFormAuthHeaders();
                const logoFileInput = document.getElementById('logoFile');
                if (logoFileInput?.files?.length && logoFileInput.files[0]) {
                    const formData = new FormData();
                    Object.entries(cleanPayload).forEach(([key, value]) => {
                        if (value === true || value === false) {
                            formData.append(key, value ? 'true' : 'false');
                        } else if (value != null && value !== '') {
                            formData.append(key, String(value));
                        }
                    });
                    formData.append('logo', logoFileInput.files[0]);
                    body = formData;
                    delete headers['Content-Type'];
                } else {
                    body = JSON.stringify(cleanPayload);
                }

                const response = await fetch(
                    `${window.API_URL}/pg/forms/${encodeURIComponent(formId)}/`,
                    {
                        method: 'PATCH',
                        headers,
                        body,
                    }
                );

                const data = await response.json();
                const resData = (data && typeof data.data !== 'undefined') ? data.data : data;

                if (response.ok) {
                    const formUrl =
                        resData.form_url ||
                        (resData.url_slug
                            ? `${window.API_URL}/pg/forms/${resData.url_slug}/`
                            : '');
                    const successMessage = (data && typeof data.message === 'string' && data.message.trim())
                        ? data.message + '\n\nForm ID: ' + (resData.form_id || formId)
                        : `Payment form updated successfully.\n\nForm ID: ${resData.form_id || formId}`;

                    pgFormShowModal(
                        'success',
                        'Form Updated',
                        successMessage
                    );
                    return;
                }

                let errorMsg = 'Failed to update payment form';
                const errDetail = (data && data.error && typeof data.error === 'object') ? data.error : data;
                if (errDetail && typeof errDetail.message === 'string' && errDetail.message) {
                    errorMsg = errDetail.message;
                } else if (errDetail && typeof errDetail === 'object') {
                    errorMsg = '<ul class="error-list">';
                    const details = (errDetail.details && typeof errDetail.details === 'object') ? errDetail.details : errDetail;
                    Object.entries(details).forEach(([field, fieldErrors]) => {
                        const fieldName = pgFormToTitleCaseField(
                            field.replace(/\./g, ' ')
                        );
                        const errorsArray = Array.isArray(fieldErrors)
                            ? fieldErrors
                            : [fieldErrors];
                        errorsArray.forEach((err) => {
                            errorMsg += `
                                <li>
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span><strong>${fieldName}:</strong> ${err}</span>
                                </li>
                            `;
                        });
                    });
                    errorMsg += '</ul>';
                }
                pgFormShowModal('error', 'Validation Error', errorMsg);
            } catch (error) {
                pgFormShowModal(
                    'error',
                    'Error',
                    error.message || 'Something went wrong.'
                );
            } finally {
                updateButton.disabled = false;
                btnText.textContent = 'Update Payment Form';
            }
        });
    }
});

