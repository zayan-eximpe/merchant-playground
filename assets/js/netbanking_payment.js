/**
 * Net Banking Payment Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

// Utility to decode base64 to string
function decodeBase64(str) {
    try {
        return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
        return window.atob(str);
    }
}

// Mapping of bank codes to display names and logo URLs
const bankLogoMap = {
    '3044': {
        name: 'State Bank Of India',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/state_bank_of_india.svg',
    },
    '3022': {
        name: 'ICICI Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/icici_bank.svg',
    },
    '3021': {
        name: 'HDFC Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/hdfc_bank.svg',
    },
    '3032': {
        name: 'Kotak Mahindra Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/kotak_mahindra_bank.svg',
    },
    '3003': {
        name: 'Axis Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/axis_bank.svg',
    },
    '3006': {
        name: 'Bank of India',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/bank_of_india.svg',
    },
    '3123': {
        name: 'Airtel Payments Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/airtel_payments_bank.svg',
    },
    '3058': {
        name: 'Yes Bank Ltd',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/yes_bank.svg',
    },
    '3005': {
        name: 'Bank of Baroda',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/bank_of_baroda.svg',
    },
    '3028': {
        name: 'IndusInd Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/indusind_bank.svg',
    },
    '3009': {
        name: 'Canara Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/canara_bank.svg',
    },
    '3055': {
        name: 'Union Bank of India',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/union_bank_of_india.svg',
    },
    '3020': {
        name: 'Federal Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/federal_bank.svg',
    },
    '3039': {
        name: 'RBL Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/rbl_bank.svg',
    },
    '3038': {
        name: 'Punjab National Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/punjab_national_bank.svg',
    },
    '3054': {
        name: 'UCO Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/uco_bank.svg',
    },
    '3042': {
        name: 'South Indian Bank',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/south_indian_bank.svg',
    },
    '3030': {
        name: 'Karnataka Bank Ltd',
        logo: 'https://staging-cdn.eximpe.com/logos/netbanking/karnataka_bank.svg',
    },
};

function createSampleData() {
    const sampleData = {
        amount: '1.00',
        currency: 'INR',
        reference_id: 'S2SNB' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        return_url: `${window.location.origin}/checkout/payment_callback.html`,
        type_of_goods: 'digital_goods',
        buyer_name: 'John Doe',
        buyer_email: 'john.doe@example.com',
        buyer_phone: '9876543210',
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
        bank_code: '3044', // State Bank Of India
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
    document.getElementById('bankCode').value = sampleData.bank_code;
    // Let the custom bank selector update its UI
    document.getElementById('bankCode').dispatchEvent(new Event('change'));

    document.getElementById('typeOfGoods').dispatchEvent(new Event('change'));

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

    localStorage.setItem('eximpe_form_data', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('eximpe_form_data');
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
    localStorage.removeItem('eximpe_form_data');
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

    // Custom bank selector (logos inline in dropdown)
    const bankCodeInput = document.getElementById('bankCode');
    const bankSelectButton = document.getElementById('bankSelectButton');
    const bankSelectDropdown = document.getElementById('bankSelectDropdown');
    const bankSelectLogo = document.getElementById('bankSelectLogo');
    const bankSelectLabel = document.getElementById('bankSelectLabel');

    function setBankSelectionFromCode(code) {
        if (!bankCodeInput || !bankSelectButton || !bankSelectDropdown || !bankSelectLabel || !bankSelectLogo) {
            return;
        }

        const info = bankLogoMap[code];
        bankCodeInput.value = code || '';

        if (info) {
            bankSelectLogo.style.display = 'inline-block';
            bankSelectLogo.src = info.logo;
            bankSelectLogo.alt = info.name + ' logo';
            bankSelectLabel.textContent = info.name;
            bankSelectButton.classList.add('has-value');
        } else {
            bankSelectLogo.style.display = 'none';
            bankSelectLogo.src = '';
            bankSelectLogo.alt = '';
            bankSelectLabel.textContent = 'Select Bank';
            bankSelectButton.classList.remove('has-value');
        }
    }

    if (bankCodeInput && bankSelectButton && bankSelectDropdown) {
        // Handle clicking on a bank option
        bankSelectDropdown.addEventListener('click', function (e) {
            const option = e.target.closest('.bank-option');
            if (!option) return;
            const code = option.getAttribute('data-code') || '';
            setBankSelectionFromCode(code);
            // Notify any listeners that the underlying value has changed
            bankCodeInput.dispatchEvent(new Event('change'));
            bankSelectDropdown.style.display = 'none';
        });

        // Toggle dropdown open/close
        bankSelectButton.addEventListener('click', function (e) {
            e.preventDefault();
            const isOpen = bankSelectDropdown.style.display === 'block';
            bankSelectDropdown.style.display = isOpen ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!bankSelectButton.contains(e.target) && !bankSelectDropdown.contains(e.target)) {
                bankSelectDropdown.style.display = 'none';
            }
        });

        // Sync initial state from any prefilled value
        setBankSelectionFromCode(bankCodeInput.value);

        // Also react if something else changes the hidden value
        bankCodeInput.addEventListener('change', function () {
            setBankSelectionFromCode(bankCodeInput.value);
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        createButton.disabled = true;
        btnText.textContent = 'Creating Net Banking Payment...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            btnText.textContent = 'Creating Net Banking Payment...';

            let amountValue = document.getElementById('amount').value;
            let phoneValue = document.getElementById('buyerPhone').value;
            if (phoneValue) {
                phoneValue = '+91' + phoneValue;
            }

            const payload = {
                amount: amountValue,
                collection_mode: "s2s",
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('ReferenceID').value || undefined,
                mop_type: "net_banking",
                netbanking_details: {
                    bank_code: document.getElementById('bankCode').value || undefined
                },
                buyer: {
                    name: document.getElementById('buyerName').value,
                    email: document.getElementById('buyerEmail').value || undefined,
                    phone: phoneValue || undefined,
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

                localStorage.setItem('last_used_order_id', orderId);
                clearCache();

                // If we received an ACS template (PayU-style), decode and auto-submit it
                if (acsTemplate) {
                    const html = decodeBase64(acsTemplate);
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const formEl = doc.querySelector('form');
                        if (formEl) {
                            document.body.appendChild(formEl);
                            formEl.submit();
                            return;
                        }
                        showModal(
                            'error',
                            'Authentication Error',
                            'Could not process the authentication page returned by the gateway.',
                        );
                        return;
                    } catch (e) {
                        console.error('Error parsing ACS template for netbanking:', e);
                        showModal(
                            'error',
                            'Authentication Error',
                            'An error occurred while processing net banking authentication.',
                        );
                        return;
                    }
                }

                // Otherwise fall back to redirect link (Cashfree-style)
                if (paymentLink) {
                    window.location.href = paymentLink;
                    return;
                }

                showModal('error', 'Error', 'No redirect information received from server.');
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
            btnText.textContent = 'Initiate Net Banking Payment';
        }
    });
});
