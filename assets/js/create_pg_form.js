/**
 * Create PG Form Page Logic
 * Mirrors the Create Payment Link experience but for /pg/forms.
 * Uses same auth headers as create_payment_link.js, create_session.js, etc.: X-Client-Secret, X-Client-ID, optional X-Merchant-ID.
 */

let currentFormUrl = '';

function getPgFormAuthHeaders() {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Secret': typeof getConfigValue === 'function' ? getConfigValue('AUTH_KEY') : '',
        'X-Client-ID': typeof getConfigValue === 'function' ? getConfigValue('CLIENT_ID') : '',
    };
    if (typeof getConfigValue === 'function' && getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID')) {
        headers['X-Merchant-ID'] = getConfigValue('MERCHANT_ID');
    }
    return headers;
}

function pgFormEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Convert a value from a datetime-local input into an ISO string
// that preserves the local timezone offset (e.g. 2026-02-17T10:00:00+05:30)
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

    const offsetMinutes = date.getTimezoneOffset(); // minutes *behind* UTC
    const sign = offsetMinutes <= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(absMinutes / 60));
    const offsetMins = pad(absMinutes % 60);

    return (
        `${year}-${month}-${day}T${hours}:${minutes}:${seconds}` +
        `${sign}${offsetHours}:${offsetMins}`
    );
}

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
            : 'Configure title, amount and behavior for your payment form.';
    }
}

function savePgFormCreateData() {
    const data = {
        url_slug: document.getElementById('urlSlug')?.value || '',
        payment_for: document.getElementById('paymentFor')?.value || '',
        is_fixed_amount: document.getElementById('isFixedAmount')?.checked ?? true,
        amount: document.getElementById('amount')?.value || '',
        currency: document.getElementById('currency')?.value || 'INR',
        amount_title: document.getElementById('amountTitle')?.value || '',
        gst_percentage: document.getElementById('gstPercentage')?.value || '',
        service_charge_percentage:
            document.getElementById('serviceChargePercentage')?.value || '',
        type_of_goods: document.getElementById('typeOfGoods')?.value || '',
        hs_code: document.getElementById('hsCode')?.value || '',
        preferred_mop_type: document.getElementById('preferredMopType')?.value || '',
        redirect_url: document.getElementById('redirectUrl')?.value || '',
        thank_you_message: document.getElementById('thankYouMessage')?.value || '',
        valid_from: document.getElementById('validFrom')?.value || '',
        valid_until: document.getElementById('validUntil')?.value || '',
        collect_name: document.getElementById('collectName')?.checked ?? true,
        collect_email: document.getElementById('collectEmail')?.checked ?? true,
        collect_phone: document.getElementById('collectPhone')?.checked ?? true,
        collect_address: document.getElementById('collectAddress')?.checked ?? false,
        collect_pan: document.getElementById('collectPan')?.checked ?? false,
        collect_dob: document.getElementById('collectDob')?.checked ?? false,
        terms_and_conditions:
            document.getElementById('termsAndConditions')?.value || '',
        contact_email: document.getElementById('contactEmail')?.value || '',
        contact_phone: document.getElementById('contactPhone')?.value || '',
        contact_whatsapp: document.getElementById('contactWhatsapp')?.value || '',
        website_url: document.getElementById('websiteUrl')?.value || '',
        support_url: document.getElementById('supportUrl')?.value || '',
        primary_color: document.getElementById('primaryColor')?.value || '',
        twitter_url: document.getElementById('twitterUrl')?.value || '',
        instagram_url: document.getElementById('instagramUrl')?.value || '',
        facebook_url: document.getElementById('facebookUrl')?.value || '',
        linkedin_url: document.getElementById('linkedinUrl')?.value || '',
    };
    localStorage.setItem('pg_form_create_data', JSON.stringify(data));
}

const PG_FORM_KEY_TO_ID = {
    is_fixed_amount: 'isFixedAmount',
    url_slug: 'urlSlug',
    payment_for: 'paymentFor',
    amount: 'amount',
    currency: 'currency',
    amount_title: 'amountTitle',
    gst_percentage: 'gstPercentage',
    service_charge_percentage: 'serviceChargePercentage',
    type_of_goods: 'typeOfGoods',
    hs_code: 'hsCode',
    preferred_mop_type: 'preferredMopType',
    redirect_url: 'redirectUrl',
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
    primary_color: 'primaryColor',
    twitter_url: 'twitterUrl',
    instagram_url: 'instagramUrl',
    facebook_url: 'facebookUrl',
    linkedin_url: 'linkedinUrl',
};

function loadPgFormCreateData() {
    const saved = localStorage.getItem('pg_form_create_data');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
            const id = PG_FORM_KEY_TO_ID[key] || key;
            const el = document.getElementById(id);
            if (!el) return;
            if (typeof value === 'boolean') {
                el.checked = value;
            } else if (typeof value === 'string') {
                el.value = value;
                if (id === 'primaryColor' && document.getElementById('primaryColorPicker')) {
                    document.getElementById('primaryColorPicker').value =
                        /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#22c55e';
                }
            }
        });
    } catch (e) {
        console.error('Failed to load PG form cached data', e);
        localStorage.removeItem('pg_form_create_data');
    }
}

// Real-life sample: "Bake & Brew Café" — order payment with warm branding
function createPgFormSampleData() {
    const rand = Math.floor(Math.random() * 100000);
    const set = (id, valueOrChecked) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (typeof valueOrChecked === 'boolean') el.checked = valueOrChecked;
        else el.value = valueOrChecked;
    };

    // Form Identification
    set('urlSlug', `order-bake-brew-${rand}`);
    set('paymentFor', 'Bake & Brew Café — Order Payment');

    // Payment Configuration
    set('isFixedAmount', true);
    set('amount', '449.00');
    set('currency', 'INR');
    set('amountTitle', 'Order Total');
    set('gstPercentage', '5');
    set('serviceChargePercentage', '0');

    // Product / Service Details
    set('typeOfGoods', 'digital_goods');
    set('preferredMopType', '');

    // Form Settings
    set('redirectUrl', 'https://bakeandbrew.example.com/order-confirmed');
    set('thankYouMessage', 'Thank you for your order! We\'ll send a confirmation to your email and notify you when it\'s ready for pickup or delivery.');
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    set('validFrom', pgFormToDatetimeLocalInput(now));
    set('validUntil', pgFormToDatetimeLocalInput(in30Days));

    // Customer Data Collection
    set('collectName', true);
    set('collectEmail', true);
    set('collectPhone', true);
    set('collectAddress', true);
    set('collectPan', false);
    set('collectDob', false);

    // Branding & Appearance — warm café look
    set('primaryColor', '#c2410c');
    const picker = document.getElementById('primaryColorPicker');
    if (picker) picker.value = '#c2410c';

    // Terms & Contact
    set('termsAndConditions', 'Orders are subject to availability. Refunds are processed within 5–7 business days for cancelled orders. For disputes, contact us at support@bakeandbrew.example.com.');
    set('contactEmail', 'orders@bakeandbrew.example.com');
    set('contactPhone', '+91 98765 43210');
    set('contactWhatsapp', '+919876543210');
    set('websiteUrl', 'https://bakeandbrew.example.com');
    set('supportUrl', 'https://bakeandbrew.example.com/help');

    // Social Media Links
    set('twitterUrl', 'https://twitter.com/bakeandbrew');
    set('instagramUrl', 'https://instagram.com/bakeandbrew_cafe');
    set('facebookUrl', 'https://facebook.com/bakeandbrew');
    set('linkedinUrl', '');

    // Ensure fixed-amount UI is visible
    const fixedAmountGroup = document.getElementById('fixedAmountGroup');
    if (fixedAmountGroup) fixedAmountGroup.style.display = 'block';

    savePgFormCreateData();
    updatePgFormSummaryCard();
}

function clearPgFormCache() {
    const form = document.getElementById('pgFormCreateForm');
    if (!form) return;
    localStorage.removeItem('pg_form_create_data');
    form.reset();
    document.getElementById('isFixedAmount').checked = true;
    updatePgFormSummaryCard();
}

function pgFormShowModal(type, title, message, formUrl = '') {
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
        if (type === 'success' && formUrl) {
            currentFormUrl = formUrl;
            TrustedTypes.setInnerHTML(
                modalMessage,
                `
                <div>${pgFormEscapeHtml(message)}</div>
                <div class="modal-link">${pgFormEscapeHtml(formUrl)}</div>
                <div class="modal-actions">
                    <button class="modal-button secondary" data-action="copyFormUrl">
                        📋 Copy URL
                    </button>
                    <button class="modal-button primary" data-action="openFormUrl">
                        🔗 Open Form
                    </button>
                </div>
            `
            );
            setTimeout(() => {
                const copyBtn = modalMessage.querySelector(
                    '[data-action="copyFormUrl"]'
                );
                const openBtn = modalMessage.querySelector(
                    '[data-action="openFormUrl"]'
                );
                copyBtn?.addEventListener('click', () => {
                    navigator.clipboard
                        .writeText(currentFormUrl)
                        .then(() => {
                            pgFormShowModal(
                                'success',
                                'Copied!',
                                'Form URL copied to clipboard.'
                            );
                        })
                        .catch(() => {
                            pgFormShowModal(
                                'error',
                                'Copy Failed',
                                'Unable to copy the form URL.'
                            );
                        });
                });
                openBtn?.addEventListener('click', () => {
                    window.open(currentFormUrl, '_blank', 'noopener,noreferrer');
                });
            }, 0);
        } else if (type === 'error' && message.trim().startsWith('<')) {
            TrustedTypes.setInnerHTML(modalMessage, message);
        } else {
            modalMessage.textContent = message;
        }
    }

    modalOverlay.classList.add('active');
}

function pgFormHideModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay?.classList.remove('active');
}

function pgFormToTitleCaseField(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pgFormCreateForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const amountInput = document.getElementById('amount');
    const paymentForInput = document.getElementById('paymentFor');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const isFixedAmountCheckbox = document.getElementById('isFixedAmount');
    const fixedAmountGroup = document.getElementById('fixedAmountGroup');

    loadPgFormCreateData();
    updatePgFormSummaryCard();

    if (amountInput) {
        amountInput.addEventListener('input', () => {
            savePgFormCreateData();
            updatePgFormSummaryCard();
        });
    }
    if (paymentForInput) {
        paymentForInput.addEventListener('input', () => {
            savePgFormCreateData();
            updatePgFormSummaryCard();
        });
    }

    [
        'urlSlug',
        'currency',
        'amountTitle',
        'gstPercentage',
        'serviceChargePercentage',
        'typeOfGoods',
        'hsCode',
        'preferredMopType',
        'redirectUrl',
        'thankYouMessage',
        'validFrom',
        'validUntil',
        'termsAndConditions',
        'contactEmail',
        'contactPhone',
        'contactWhatsapp',
        'websiteUrl',
        'supportUrl',
        'logoFile',
        'primaryColor',
        'twitterUrl',
        'instagramUrl',
        'facebookUrl',
        'linkedinUrl',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', savePgFormCreateData);
            el.addEventListener('change', savePgFormCreateData);
        }
    });

    [
        'collectName',
        'collectEmail',
        'collectPhone',
        'collectAddress',
        'collectPan',
        'collectDob',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', savePgFormCreateData);
        }
    });

    if (isFixedAmountCheckbox && fixedAmountGroup) {
        const toggleFixed = () => {
            const isFixed = isFixedAmountCheckbox.checked;
            fixedAmountGroup.style.display = isFixed ? 'block' : 'none';
        };
        isFixedAmountCheckbox.addEventListener('change', () => {
            toggleFixed();
            savePgFormCreateData();
        });
        toggleFixed();
    }

    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const primaryColorInput = document.getElementById('primaryColor');
    if (primaryColorPicker && primaryColorInput) {
        primaryColorPicker.addEventListener('input', () => {
            primaryColorInput.value = primaryColorPicker.value;
            savePgFormCreateData();
        });
        primaryColorInput.addEventListener('input', () => {
            const v = primaryColorInput.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) primaryColorPicker.value = v;
            savePgFormCreateData();
        });
    }

    modalCloseBtn?.addEventListener('click', pgFormHideModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            pgFormHideModal();
        }
    });

    // Wire sample-data and clear-cache actions via common-utils
    window.createSampleData = createPgFormSampleData;
    window.clearCache = clearPgFormCache;

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            pgFormHideModal();

            const urlSlugValue =
                document.getElementById('urlSlug')?.value.trim() || '';
            const paymentForValue =
                document.getElementById('paymentFor')?.value.trim() || '';
            const isFixed =
                document.getElementById('isFixedAmount')?.checked ?? true;
            const amountValue = parseFloat(amountInput?.value || '');

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

            const authKey = typeof getConfigValue === 'function' ? getConfigValue('AUTH_KEY') : '';
            const clientId = typeof getConfigValue === 'function' ? getConfigValue('CLIENT_ID') : '';
            if (!authKey || !clientId) {
                pgFormShowModal(
                    'error',
                    'Credentials Required',
                    'Please set your Client ID and Auth Key (API credentials) in the playground header or credentials panel, then try again.'
                );
                return;
            }

            createButton.disabled = true;
            btnText.textContent = 'Creating...';

            savePgFormCreateData();

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

                const currencyValue =
                    document.getElementById('currency')?.value || 'INR';
                const amountTitleValue =
                    document.getElementById('amountTitle')?.value || undefined;
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
                const redirectUrlValue =
                    document.getElementById('redirectUrl')?.value || undefined;
                const thankYouMessageValue =
                    document.getElementById('thankYouMessage')?.value || undefined;
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
                    amount_title: amountTitleValue,
                    gst_percentage: gstPercentageValue
                        ? parseInt(gstPercentageValue, 10)
                        : undefined,
                    service_charge_percentage: serviceChargePercentageValue
                        ? parseInt(serviceChargePercentageValue, 10)
                        : undefined,
                    hs_code: hsCodeValue,
                    type_of_goods: typeOfGoodsValue,
                    redirect_url: redirectUrlValue,
                    thank_you_message: thankYouMessageValue,
                    valid_from: pgFormDatetimeLocalToIsoWithOffset(validFromValue),
                    valid_until: pgFormDatetimeLocalToIsoWithOffset(validUntilValue),
                    collect_name:
                        document.getElementById('collectName')?.checked ?? true,
                    collect_email:
                        document.getElementById('collectEmail')?.checked ?? true,
                    collect_phone:
                        document.getElementById('collectPhone')?.checked ?? true,
                    collect_address:
                        document.getElementById('collectAddress')?.checked ?? false,
                    collect_pan:
                        document.getElementById('collectPan')?.checked ?? false,
                    collect_dob:
                        document.getElementById('collectDob')?.checked ?? false,
                    terms_and_conditions:
                        document.getElementById('termsAndConditions')?.value ||
                        undefined,
                    contact_email:
                        document.getElementById('contactEmail')?.value || undefined,
                    contact_phone:
                        document.getElementById('contactPhone')?.value || undefined,
                    contact_whatsapp:
                        document.getElementById('contactWhatsapp')?.value || undefined,
                    website_url:
                        document.getElementById('websiteUrl')?.value || undefined,
                    support_url:
                        document.getElementById('supportUrl')?.value || undefined,
                    primary_color:
                        document.getElementById('primaryColor')?.value || undefined,
                    twitter_url:
                        document.getElementById('twitterUrl')?.value || undefined,
                    instagram_url:
                        document.getElementById('instagramUrl')?.value || undefined,
                    facebook_url:
                        document.getElementById('facebookUrl')?.value || undefined,
                    linkedin_url:
                        document.getElementById('linkedinUrl')?.value || undefined,
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

                const response = await fetch(`${window.API_URL}/pg/forms/`, {
                    method: 'POST',
                    headers,
                    body,
                });

                const data = await response.json();

                if (response.ok) {
                    const formId = data.form_id || data.uid || 'N/A';
                    const formUrl =
                        data.form_url ||
                        (data.url_slug
                            ? `${window.API_URL}/pg/forms/${data.url_slug}/`
                            : '');

                    pgFormShowModal(
                        'success',
                        'Form Created',
                        `Payment form created successfully.\n\nForm ID: ${formId}`,
                        formUrl
                    );
                    return;
                }

                // Handle validation errors (standard DRF error format)
                let errorMsg = 'Failed to create payment form';
                if (data && typeof data === 'object') {
                    errorMsg = '<ul class="error-list">';
                    Object.entries(data).forEach(([field, fieldErrors]) => {
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
                createButton.disabled = false;
                btnText.textContent = 'Create Payment Form';
            }
        });
    }
});

