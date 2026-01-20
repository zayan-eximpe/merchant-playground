/**
 * Create Payment Link Page Logic
 * Simplified workflow that mirrors the checkout experience.
 */

let currentPaymentLink = '';

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatAmountDisplay(value) {
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

function toDatetimeLocalInput(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function updateSummaryCard() {
    const amountEl = document.getElementById('summaryAmount');
    const descriptionEl = document.getElementById('summaryDescription');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('productDescription');

    if (amountEl && amountInput) {
        amountEl.textContent = formatAmountDisplay(amountInput.value);
    }

    if (descriptionEl && descriptionInput) {
        const text = descriptionInput.value.trim();
        descriptionEl.textContent = text
            ? text
            : 'Add a short description to help your customer understand what this payment link is for.';
    }
}

function saveFormData() {
    const data = {
        amount: document.getElementById('amount')?.value || '',
        productName: document.getElementById('productName')?.value || '',
        typeOfGoods: document.getElementById('typeOfGoods')?.value || '',
        productDescription: document.getElementById('productDescription')?.value || '',
        buyerName: document.getElementById('buyerName')?.value || '',
        buyerEmail: document.getElementById('buyerEmail')?.value || '',
        buyerPhone: document.getElementById('buyerPhone')?.value || '',
        buyerAddressLine1: document.getElementById('buyerAddressLine1')?.value || '',
        buyerAddressLine2: document.getElementById('buyerAddressLine2')?.value || '',
        buyerCity: document.getElementById('buyerCity')?.value || '',
        buyerState: document.getElementById('buyerState')?.value || '',
        buyerPostalCode: document.getElementById('buyerPostalCode')?.value || '',
        invoiceNumber: document.getElementById('invoiceNumber')?.value || '',
        expiryAt: document.getElementById('expiryAt')?.value || '',
    };
    localStorage.setItem('payment_link_form_data', JSON.stringify(data));
}

function loadFormData() {
    const savedData = localStorage.getItem('payment_link_form_data');
    if (!savedData) {
        return;
    }

    try {
        const formData = JSON.parse(savedData);
        Object.entries(formData).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element !== null && typeof value === 'string') {
                element.value = value;
            }
        });
    } catch (error) {
        console.error('Error loading saved form data:', error);
        localStorage.removeItem('payment_link_form_data');
    }
}

function createSampleData() {
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('productDescription');

    if (amountInput) {
        amountInput.value = '1.00';
    }
    if (descriptionInput) {
        descriptionInput.value = 'Advance payment for sample order ' + Math.floor(Math.random() * 90000000000);
    }
    const typeOfGoodsInput = document.getElementById('typeOfGoods');
    if (typeOfGoodsInput) {
        typeOfGoodsInput.value = 'goods';
    }
    const productionNameInput = document.getElementById('productName');
    const buyerName = document.getElementById('buyerName');
    const buyerEmail = document.getElementById('buyerEmail');
    const buyerPhone = document.getElementById('buyerPhone');
    const buyerAddressLine1 = document.getElementById('buyerAddressLine1');
    const buyerCity = document.getElementById('buyerCity');
    const buyerState = document.getElementById('buyerState');
    const buyerPostalCode = document.getElementById('buyerPostalCode');
    const invoiceNumber = document.getElementById('invoiceNumber');
    const expiryAt = document.getElementById('expiryAt');

    if (productionNameInput) productionNameInput.value = 'Sample Product';
    if (buyerName) buyerName.value = 'John Doe';
    if (buyerEmail) buyerEmail.value = 'john.doe+' + Math.floor(Math.random() * 1000) + '@example.com';
    if (buyerPhone) buyerPhone.value = '9876543210';
    if (buyerAddressLine1) buyerAddressLine1.value = '123 Sample Street';
    if (buyerCity) buyerCity.value = 'Mumbai';
    if (buyerState) buyerState.value = 'MH';
    if (buyerPostalCode) buyerPostalCode.value = '400001';
    if (invoiceNumber) invoiceNumber.value = 'INV' + Math.floor(Math.random() * 900000 + 100000);
    if (expiryAt) {
        const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
        expiryAt.value = toDatetimeLocalInput(d);
    }

    saveFormData();
    updateSummaryCard();
}

function clearCache() {
    const form = document.getElementById('linkForm');
    if (!form) {
        return;
    }

    localStorage.removeItem('payment_link_form_data');
    form.reset();

    updateSummaryCard();
}

function copyModalLink() {
    navigator.clipboard
        .writeText(currentPaymentLink)
        .then(() => {
            showModal('success', 'Copied!', 'Payment link copied to clipboard');
        })
        .catch(() => {
            showModal('error', 'Failed to copy link. Please try again.');
        });
}

function openPaymentLink() {
    window.open(currentPaymentLink, '_blank', 'noopener,noreferrer');
}

function showModal(type, title, message, paymentLink = '') {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');

    if (!modalBox || !modalOverlay) {
        return;
    }

    modalBox.className = 'modal ' + type;
    if (modalIcon) {
        modalIcon.textContent = type === 'success' ? '✅' : '❌';
    }
    if (modalTitle) {
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? '' : 'red';
    }

    if (modalMessage) {
        if (type === 'success' && paymentLink) {
            currentPaymentLink = paymentLink;
            TrustedTypes.setInnerHTML(
                modalMessage,
                `
                <div>${escapeHtml(message)}</div>
                <div class="modal-link">${escapeHtml(paymentLink)}</div>
                <div class="modal-actions">
                    <button class="modal-button secondary" data-action="copyModalLink">
                        📋 Copy Link
                    </button>
                    <button class="modal-button primary" data-action="openPaymentLink">
                        🔗 Open Link
                    </button>
                </div>
            `
            );

            setTimeout(() => {
                const copyBtn = modalMessage.querySelector('[data-action="copyModalLink"]');
                const openBtn = modalMessage.querySelector('[data-action="openPaymentLink"]');

                copyBtn?.addEventListener('click', copyModalLink);
                openBtn?.addEventListener('click', openPaymentLink);
            }, 0);
        } else {
            if (type === 'error' && message.trim().startsWith('<')) {
                // Render HTML (e.g., error list) safely using TrustedTypes
                TrustedTypes.setInnerHTML(modalMessage, message);
            } else {
                modalMessage.textContent = message;
            }
        }
    }

    modalOverlay.classList.add('active');
}

function hideModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay?.classList.remove('active');
}

function toTitleCaseField(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('linkForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('productDescription');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    loadFormData();
    updateSummaryCard();

    amountInput?.addEventListener('input', () => {
        saveFormData();
        updateSummaryCard();
    });
    descriptionInput?.addEventListener('input', () => {
        saveFormData();
        updateSummaryCard();
    });
    document.getElementById('typeOfGoods')?.addEventListener('change', saveFormData);

    modalCloseBtn?.addEventListener('click', hideModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideModal();

            const amountValue = parseFloat(amountInput?.value || '');
            const descriptionValue = (descriptionInput?.value || '').trim();

            if (Number.isNaN(amountValue) || amountValue <= 0) {
                showModal('error', 'Invalid Amount', 'Please enter a valid amount greater than zero.');
                return;
            }
            if (!descriptionValue) {
                showModal('error', 'Description Missing', 'Please add a short description for the payment link.');
                return;
            }

            createButton.disabled = true;
            btnText.textContent = 'Generating...';
            referenceIdValue = Math.random().toString(36).substring(2, 15);

            const buyerNameValue = (document.getElementById('buyerName')?.value || '').trim();
            const buyerEmailValue = (document.getElementById('buyerEmail')?.value || '').trim();
            const buyerPhoneValue = (document.getElementById('buyerPhone')?.value || '').trim();
            const buyerAddressLine1Value = (document.getElementById('buyerAddressLine1')?.value || '').trim();
            const buyerAddressLine2Value = (document.getElementById('buyerAddressLine2')?.value || '').trim();
            const buyerCityValue = (document.getElementById('buyerCity')?.value || '').trim();
            const buyerStateValue = (document.getElementById('buyerState')?.value || '').trim();
            const buyerPostalCodeValue = (document.getElementById('buyerPostalCode')?.value || '').trim();
            const invoiceNumberValue = (document.getElementById('invoiceNumber')?.value || '').trim();
            const expiryAtValue = (document.getElementById('expiryAt')?.value || '').trim();
            const productNameValue = (document.getElementById('productName')?.value || '').trim();
            const typeOfGoodsValue = document.getElementById('typeOfGoods')?.value || '';

            saveFormData();

            try {
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

                const payload = {
                    amount: amountValue.toFixed(2),
                    reference_id: referenceIdValue,
                    buyer: {
                        name: buyerNameValue || undefined,
                        email: buyerEmailValue || undefined,
                        phone: buyerPhoneValue ? (buyerPhoneValue.startsWith('+') ? buyerPhoneValue : '+91' + buyerPhoneValue) : undefined,
                        address: {
                            line_1: buyerAddressLine1Value || undefined,
                            line_2: buyerAddressLine2Value || undefined,
                            city: buyerCityValue || undefined,
                            state: buyerStateValue || undefined,
                            postal_code: buyerPostalCodeValue || undefined,
                        }
                    },
                    product: {
                        name: productNameValue || undefined,
                        description: descriptionValue || undefined,
                        type_of_goods: typeOfGoodsValue || undefined,
                    },
                    invoice: {
                        number: invoiceNumberValue || undefined,
                        date: undefined
                    },
                    expiry_date: expiryAtValue ? new Date(expiryAtValue).toISOString() : undefined,
                };

                const cleanPayload = removeUndefined(payload);

                const response = await fetch(`${window.API_URL}/pg/payment-links/`, {
                    method: 'POST',
                    headers: {
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
                    },
                    body: JSON.stringify(cleanPayload),
                });

                const data = await response.json();

                if (response.ok && data.data?.payment_link) {
                    showModal('success', 'Link Generated', 'Payment link generated successfully!', data.data.payment_link);
                    return;
                }

                let errorMsg = 'Failed to generate payment link';
                if (data.error?.details) {
                    errorMsg = '<ul class="error-list">';
                    Object.entries(data.error.details).forEach(([field, fieldErrors]) => {
                        const fieldName = toTitleCaseField(field.replace(/\./g, ' '));
                        const errorsArray = Array.isArray(fieldErrors) ? fieldErrors : (typeof fieldErrors === 'object' && fieldErrors !== null ? Object.values(fieldErrors) : [fieldErrors]);
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
                } else if (data.error?.message) {
                    errorMsg = data.error.message;
                }
                showModal('error', 'Validation Error', errorMsg);
            } catch (error) {
                showModal('error', 'Error', error.message || 'Something went wrong.');
            } finally {
                createButton.disabled = false;
                btnText.textContent = 'Generate Payment Link';
            }
        });
    }
});
