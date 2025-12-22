/**
 * Card Payment Page Logic
 * Extracted from inline scripts for CSP compliance
 */

// Populate expiry years
function populateExpiryYears() {
    const currentYear = new Date().getFullYear();
    const expiryYearSelect = document.getElementById('expiryYear');

    for (let year = currentYear; year <= currentYear + 20; year++) {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        expiryYearSelect.appendChild(option);
    }
}

// Helper to enable/disable card fields (moved outside DOMContentLoaded for global access)
function setCardFieldsDisabled(disabled) {
    const ids = [
        'cardNumber', 'cardHolderName', 'expiryMonth', 'expiryYear',
        'cvv', 'cardType', 'cardNickname'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = disabled;
            if (disabled) {
                el.style.background = '#f1f5f9';
                el.style.cursor = 'not-allowed';
            } else {
                el.style.background = '';
                el.style.cursor = '';
            }
        }
    });
    // If enabling, clear selected card token and identifier
    if (!disabled) {
        if (typeof selectedCardToken !== 'undefined') selectedCardToken = null;
        if (typeof selectedCardIdentifier !== 'undefined') selectedCardIdentifier = null;
    }
}

// Format card number with spaces
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
    input.value = formattedValue;
}

// Format CVV (numbers only)
function formatCVV(input) {
    input.value = input.value.replace(/[^0-9]/gi, '');
}

// Sample card toggling function
let sampleCardIndex = 0;
function toggleSampleCard() {
    const allowedSampleCards = [
        {
            card_number: '4895380110000003',
            card_type: 'credit_card',
            card_network: 'visa',
            expiry_month: '05',
            expiry_year: '2030',
            cvv: '123',
            card_nickname: 'VISA Credit',
            card_holder_name: 'John Doe'
        },
        {
            card_number: '4895380110000003',
            card_type: 'debit_card',
            card_network: 'visa',
            expiry_month: '05',
            expiry_year: '2030',
            cvv: '123',
            card_nickname: 'VISA Debit',
            card_holder_name: 'John Doe'
        },
        {
            card_number: '5506900480000008',
            card_type: 'credit_card',
            card_network: 'mastercard',
            expiry_month: '05',
            expiry_year: '2030',
            cvv: '123',
            card_nickname: 'MasterCard Credit',
            card_holder_name: 'John Doe'
        },
        {
            card_number: '5506900480000008',
            card_type: 'debit_card',
            card_network: 'mastercard',
            expiry_month: '05',
            expiry_year: '2030',
            cvv: '123',
            card_nickname: 'MasterCard Debit',
            card_holder_name: 'John Doe'
        }
    ];
    sampleCardIndex = (sampleCardIndex + 1) % allowedSampleCards.length;
    const sampleCard = allowedSampleCards[sampleCardIndex];
    document.getElementById('cardNumber').value = sampleCard.card_number;
    document.getElementById('cardNickname').value = sampleCard.card_nickname;
    document.getElementById('cardHolderName').value = sampleCard.card_holder_name;
    document.getElementById('expiryMonth').value = sampleCard.expiry_month;
    document.getElementById('expiryYear').value = sampleCard.expiry_year;
    document.getElementById('cvv').value = sampleCard.cvv;
    document.getElementById('cardType').value = sampleCard.card_type;
    document.getElementById('cardNetwork').value = sampleCard.card_network;
    // Save to localStorage
    saveFormData();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Populate the rest of the sample order fields
function populateSampleOrderFields() {
    const now = new Date();
    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }
    // Use window.API_URL with fallback to prevent undefined concatenation
    const apiUrl = window.API_URL || '';
    const sampleData = {
        amount: '1000.00',
        currency: 'INR',
        type_of_goods: 'goods',
        reference_id: 'CARD' + Math.random().toString(36).substring(2, 18).toUpperCase(),
        return_url: window.location.origin + '/checkout/payment_callback.html',
        buyer_name: 'John Doe',
        buyer_email: 'john.doe@example.com',
        buyer_phone: '9876543210',
        buyer_address_line_1: '123 Main Street',
        buyer_address_line_2: 'Apt 4B',
        buyer_city: 'City',
        buyer_state: 'State',
        buyer_postal_code: '123456',
        product_name: 'Sample Product',
        product_description: 'This is a sample product description',
        hs_code: '98051000',
        hs_code_description: 'Portable automatic data processing machines',
        invoice_number: 'INV' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        invoice_date: new Date().toISOString().split('T')[0],
        user_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
    document.getElementById('amount').value = sampleData.amount;
    document.getElementById('currency').value = sampleData.currency;
    document.getElementById('referenceId').value = sampleData.reference_id;
    document.getElementById('returnUrl').value = sampleData.return_url;
    document.getElementById('buyerName').value = sampleData.buyer_name;
    document.getElementById('buyerEmail').value = sampleData.buyer_email;
    document.getElementById('buyerPhone').value = sampleData.buyer_phone;
    document.getElementById('userIp').value = sampleData.user_ip;
    document.getElementById('userAgent').value = sampleData.user_agent;
    document.getElementById('buyerAddressLine1').value = sampleData.buyer_address_line_1;
    document.getElementById('buyerAddressLine2').value = sampleData.buyer_address_line_2;
    document.getElementById('buyerCity').value = sampleData.buyer_city;
    document.getElementById('buyerState').value = sampleData.buyer_state;
    document.getElementById('buyerPostalCode').value = sampleData.buyer_postal_code;
    document.getElementById('productName').value = sampleData.product_name;
    document.getElementById('typeOfGoods').value = sampleData.type_of_goods;
    document.getElementById('productDescription').value = sampleData.product_description;
    document.getElementById('hsCode').value = sampleData.hs_code;
    document.getElementById('hsCodeDescription').value = sampleData.hs_code_description;
    document.getElementById('invoiceNumber').value = sampleData.invoice_number;
    document.getElementById('invoiceDate').value = sampleData.invoice_date;
    saveFormData();
}

// Save form data to localStorage
function saveFormData() {
    const formData = {};
    const form = document.getElementById('sessionForm');
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            if (element.type === 'file') continue;
            if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }
    localStorage.setItem('eximpe_s2s_card_payment_form_data', JSON.stringify(formData));
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('eximpe_s2s_card_payment_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('sessionForm');
        const formElements = form.elements;
        for (let element of formElements) {
            if (element.name && formData[element.name] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = formData[element.name];
                } else {
                    element.value = formData[element.name];
                }
                if (element.tagName === 'SELECT') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        }
    }
}

function clearCache() {
    // Store current Client Secret, client ID, merchant ID, and PSP checkbox
    // Store Card Identifier value
    const currentCardIdentifier = document.getElementById('cardIdentifier').value;
    // Clear all form data
    setCardFieldsDisabled(false);
    document.getElementById('sessionForm').reset();
    // Restore Card Identifier value
    document.getElementById('cardIdentifier').value = currentCardIdentifier;
    // Re-enable card fields if they were disabled by saved card selection
}

document.addEventListener('DOMContentLoaded', function () {
    populateExpiryYears();
    // Load saved form data
    loadFormData();
    // Add event listeners to save form data on input changes
    var form = document.getElementById('sessionForm');
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            element.addEventListener('input', saveFormData);
            element.addEventListener('change', saveFormData);
        }
    }
    // Load Client Secret from local storage if it exists
    const saveCardCheckbox = document.getElementById('saveCard');
    const merchantIdGroup = document.getElementById('merchantIdGroup');
    const savedMerchantId = localStorage.getItem('eximpe_merchant_id');
    if (savedMerchantId && merchantIdInput) merchantIdInput.value = savedMerchantId;
    const savedSaveCard = localStorage.getItem('eximpe_save_card');
    if (savedSaveCard === 'true' && saveCardCheckbox) {
        saveCardCheckbox.checked = true;
    }
    if (saveCardCheckbox) {
        saveCardCheckbox.addEventListener('change', function () {
            localStorage.setItem('eximpe_save_card', this.checked.toString());
        });
    }

    // Add create order API call on form submit
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    // Remove the acsContainer.textContent = '';
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        createButton.disabled = true;
        btnText.textContent = 'Creating Card Payment...';
        // --- BEGIN: Card validation for only two allowed cards ---
        const allowedCards = [
            {
                number: '5506 9004 8000 0008',
                raw: '5506900480000008',
                network: 'MASTERCARD',
                expiry_month: '05',
                expiry_year: '2030',
                cvv: '123'
            },
            {
                number: '4895 3700 7734 6937',
                raw: '4895380110000003',
                network: 'VISA',
                expiry_month: '05',
                expiry_year: '2030',
                cvv: '123'
            }
        ];
        // Get entered card details
        const enteredNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const enteredNetwork = document.getElementById('cardNetwork').value.toUpperCase();
        const enteredMonth = document.getElementById('expiryMonth').value;
        const enteredYear = document.getElementById('expiryYear').value;
        const enteredCVV = document.getElementById('cvv').value;

        // --- END: Card validation ---
        // Populate the rest of the sample order fields before submit
        populateSampleOrderFields();
        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;
            // Get form values
            let amountValue = document.getElementById('amount').value;
            let phoneValue = document.getElementById('buyerPhone').value;
            if (phoneValue) {
                phoneValue = '+91' + phoneValue;
            }
            // Build the API payload structure for card payment
            let card_details;
            if (selectedCardToken) {
                // Always get latest identifier and network values when using token
                const latestIdentifier = (typeof selectedCardIdentifier !== 'undefined' && selectedCardIdentifier) ? selectedCardIdentifier : document.getElementById('cardIdentifier').value;
                const latestNetwork = document.getElementById('cardNetwork').value;
                card_details = {
                    token: selectedCardToken,
                    identifier: latestIdentifier,
                    network: latestNetwork
                };
            } else {
                card_details = {
                    nickname: document.getElementById('cardNickname').value || undefined,
                    number: document.getElementById('cardNumber').value,
                    cardholder_name: document.getElementById('cardHolderName').value,
                    expiry_month: document.getElementById('expiryMonth').value,
                    expiry_year: document.getElementById('expiryYear').value,
                    cvv: document.getElementById('cvv').value,
                    network: document.getElementById('cardNetwork').value,
                    identifier: document.getElementById('cardIdentifier').value || undefined
                };
            }
            const payload = {
                amount: amountValue,
                collection_mode: 's2s',
                mop_type: document.getElementById('cardType').value,
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('referenceId').value || undefined,
                return_url: document.getElementById('returnUrl').value || undefined,
                card_details: card_details,
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
            // Remove undefined values to clean up the payload
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
            // Add save_card to payload (top-level)
            // Prepare headers
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                'Cache-Control': 'no-cache',
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            };
            // Make the API call
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(cleanPayload)
            });
            const data = await response.json();
            if (data.success) {
                // Show success modal with order ID and any relevant info
                const orderId = data.data.order_id;
                clearCache();
                setCardFieldsDisabled(false);
                const acsTemplate = data.data.acs_template;
                showModal('success', 'Card Payment Order Created!', `<div style='text-align:left;'><b>Order ID:</b> ${orderId}</div>`, acsTemplate);
                localStorage.setItem('last_used_order_id', orderId);
            } else {
                // Build error message with validation errors if present
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += '<ul style="text-align:left; margin: 10px 0 0 0; padding-left: 18px;">';
                    function processErrors(errors, prefix = '') {
                        for (const [field, errorValue] of Object.entries(errors)) {
                            if (typeof errorValue === 'object' && !Array.isArray(errorValue) && errorValue !== null) {
                                processErrors(errorValue, `${prefix}${field}.`);
                            } else {
                                // Always treat as array for display
                                const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                                errorArray.forEach(err => {
                                    const fullFieldName = `${prefix}${field}`;
                                    errorMsg += `<li><strong>${fullFieldName.replace(/\./g, ' ')}:</strong> ${err}</li>`;
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
                showModal('error', data.error?.message || 'Validation Error', errorMsg);
            }
        } catch (error) {
            // Graceful fetch/network error handler
            console.error('Error in card payment submission:', error);
            console.error('Error stack:', error.stack);
            showModal('error', 'Network Error', 'Could not connect to the server. Please try again later.');
        } finally {
            createButton.disabled = false;
            btnText.textContent = 'Initiate Card Payment';
        }
    });

    // Modal functions
    function showModal(type, title, message, acsTemplate) {
        const modalBox = document.getElementById('modalBox');
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalOverlay = document.getElementById('modalOverlay');

        modalBox.className = 'modal ' + type;
        if (type === 'success') {
            TrustedTypes.setInnerHTML(modalIcon, '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#26a887"/><path d="M34 18L21.5 30.5L14 23" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            modalTitle.style.color = '#26a887';
        } else {
            TrustedTypes.setInnerHTML(modalIcon, '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#e53e3e"/><path d="M16 16L32 32M32 16L16 32" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>');
            modalTitle.style.color = '#e53e3e';
        }
        modalTitle.textContent = title;
        TrustedTypes.setInnerHTML(modalMessage, message);
        // If acsTemplate is provided, add the button inside the modal
        let acsBtn = document.getElementById('modalAcsButton');
        if (acsBtn) acsBtn.remove();
        if (type === 'success' && acsTemplate) {
            const btn = document.createElement('button');
            btn.id = 'modalAcsButton';
            btn.className = 'main-action-btn';
            btn.style.marginTop = '18px';
            TrustedTypes.setInnerHTML(btn, '<i class="fas fa-lock"></i> <span>Proceed with Card Authentication</span>');
            btn.onclick = function () {
                // Decode the ACS template
                const html = decodeBase64(acsTemplate);

                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const form = doc.querySelector('form');

                    if (form) {
                        document.body.appendChild(form);
                        form.submit();
                    } else {
                        console.error('No form found in ACS template');
                        showModal('error', 'Authentication Error', 'Could not process the authentication page.');
                    }
                } catch (e) {
                    console.error('Error parsing ACS template:', e);
                    showModal('error', 'Authentication Error', 'An error occurred while processing authentication.');
                }
            };
            modalBox.appendChild(btn);
        }
        modalOverlay.classList.add('active');
        // Center modal and add spacing
        modalBox.style.display = 'flex';
        modalBox.style.flexDirection = 'column';
        modalBox.style.alignItems = 'center';
        modalBox.style.justifyContent = 'center';
        modalBox.style.padding = '48px 32px 32px 32px';
        modalBox.style.minWidth = '320px';
    }

    function hideModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        // Remove dynamically added ACS button if present
        let acsBtn = document.getElementById('modalAcsButton');
        if (acsBtn) acsBtn.remove();
    }

    // Custom confirm modal
    function showConfirmModal(message) {
        return new Promise((resolve) => {
            const modalBox = document.getElementById('modalBox');
            const modalIcon = document.getElementById('modalIcon');
            const modalTitle = document.getElementById('modalTitle');
            const modalMessage = document.getElementById('modalMessage');
            const modalOverlay = document.getElementById('modalOverlay');

            modalBox.className = 'modal confirm';
            TrustedTypes.setInnerHTML(modalIcon, '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#3182ce"/><path d="M24 16V28" stroke="white" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="34" r="2" fill="white"/></svg>');
            modalTitle.style.color = '#3182ce';
            modalTitle.textContent = 'Confirm Action';
            TrustedTypes.setInnerHTML(modalMessage, message);

            // Remove any previous confirm buttons
            let yesBtn = document.getElementById('modalYesButton');
            let noBtn = document.getElementById('modalNoButton');
            if (yesBtn) yesBtn.remove();
            if (noBtn) noBtn.remove();

            // Create Yes button
            yesBtn = document.createElement('button');
            yesBtn.id = 'modalYesButton';
            yesBtn.className = 'main-action-btn';
            yesBtn.style.marginTop = '18px';
            TrustedTypes.setInnerHTML(yesBtn, '<i class="fas fa-check"></i> Yes');
            yesBtn.onclick = function () {
                closeModal();
                resolve(true);
            };
            // Create No button
            noBtn = document.createElement('button');
            noBtn.id = 'modalNoButton';
            noBtn.className = 'main-action-btn outline-btn';
            noBtn.style.marginTop = '18px';
            noBtn.style.marginLeft = '10px';
            TrustedTypes.setInnerHTML(noBtn, '<i class="fas fa-times"></i> No');
            noBtn.onclick = function () {
                closeModal();
                resolve(false);
            };
            // Add buttons to modal
            modalBox.appendChild(yesBtn);
            modalBox.appendChild(noBtn);
            modalOverlay.classList.add('active');
        });
    }

    // Make functions available globally
    window.createSampleData = function () { toggleSampleCard(); };
    window.toggleSampleCard = toggleSampleCard;
    window.populateSampleOrderFields = populateSampleOrderFields;
    window.showModal = showModal;
    window.hideModal = hideModal;

    // Utility to decode base64 to string
    function decodeBase64(str) {
        try {
            return decodeURIComponent(escape(window.atob(str)));
        } catch (e) {
            return window.atob(str);
        }
    }

    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    // Attach close event
    function closeModal() {
        modalOverlay.classList.remove('active');
        // Remove dynamically added ACS button if present
        let acsBtn = document.getElementById('modalAcsButton');
        if (acsBtn) acsBtn.remove();
    }
    modalCloseBtn.addEventListener('click', closeModal);
    // Optional: close modal when clicking outside the modal box
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Saved Cards Modal logic
    const searchSavedCardsBtn = document.getElementById('searchSavedCardsBtn');
    const savedCardsModalOverlay = document.getElementById('savedCardsModalOverlay');
    const savedCardsModal = document.getElementById('savedCardsModal');
    const closeSavedCardsModalBtn = document.getElementById('closeSavedCardsModalBtn');
    const savedCardsList = document.getElementById('savedCardsList');

    // Track selected card token and identifier globally
    let selectedCardToken = null;
    let selectedCardIdentifier = null;

    function showSavedCardsModal(cards) {
        savedCardsList.textContent = '';
        if (!cards || cards.length === 0) {
            TrustedTypes.setInnerHTML(savedCardsList, '<div style="color:#e53e3e;">No saved cards found for this identifier.</div>');
        } else {
            cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'saved-card-row';
                cardDiv.style = 'padding: 12px 90px 12px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f6f8fa; position: relative; cursor: pointer;';
                const nickname = escapeHtml(card.nickname || 'Card');
                const network = escapeHtml(card.network);
                const maskedPan = escapeHtml(card.masked_pan);
                const expiryMonth = escapeHtml(card.expiry_month);
                const expiryYear = escapeHtml(card.expiry_year);

                TrustedTypes.setInnerHTML(cardDiv, `
                            <div class="saved-card-title"><b>${nickname}</b> (${network})</div>
                            <div class="saved-card-details"><span>${maskedPan}</span> | Exp: ${expiryMonth}/${expiryYear}</div>
                        `);
                // Add Delete button
                const deleteBtn = document.createElement('button');
                TrustedTypes.setInnerHTML(deleteBtn, '<i class="fas fa-trash"></i>');
                deleteBtn.title = 'Delete';
                deleteBtn.style = 'position: absolute; top: 12px; right: 12px; border: none; background: none; color: #e53e3e; border-radius: 6px; padding: 6px 12px; font-size: 18px; cursor: pointer;';
                deleteBtn.onclick = async function (e) {
                    e.stopPropagation();
                    // Prepare headers
                    const headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'Cache-Control': 'no-cache',
                        ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})

                    };
                    try {
                        // Send card_token and identifier in request body for security
                        const requestBody = {
                            card_token: card.card_token,
                            identifier: document.getElementById('cardIdentifier').value
                        };
                        const url = `/pg/tokens/delete/`;
                        const response = await fetch(url, {
                            method: 'DELETE',
                            headers: headers,
                            body: JSON.stringify(requestBody)
                        });
                        if (response.ok) {
                            cardDiv.remove();
                            //showModal('success', 'Card Deleted', 'The saved card has been deleted successfully.');
                        } else {
                            const data = await response.json();
                            showModal('error', 'Delete Failed', data.error?.message || 'Failed to delete the card.');
                        }
                    } catch (err) {
                        showModal('error', 'Network Error', 'Could not connect to the server. Please try again later.');
                    }
                };
                cardDiv.appendChild(deleteBtn);
                cardDiv.onclick = function () {
                    // Autofill card details (only what is allowed)
                    document.getElementById('cardNumber').value = '';
                    document.getElementById('cardHolderName').value = card.cardholder_name || '';
                    document.getElementById('expiryMonth').value = String(card.expiry_month).padStart(2, '0');
                    document.getElementById('expiryYear').value = card.expiry_year;
                    // Map card_type to select value
                    document.getElementById('cardType').value = card.card_type;
                    document.getElementById('cardNetwork').value = card.network;
                    document.getElementById('cardNickname').value = card.nickname || '';
                    // Set identifier field to the selected card's identifier (if available)
                    if (card.identifier) {
                        document.getElementById('cardIdentifier').value = card.identifier;
                    }
                    // Disable card detail fields except identifier and network
                    setCardFieldsDisabled(true);
                    document.getElementById('cardIdentifier').disabled = false;
                    document.getElementById('cardNetwork').disabled = false;
                    // Hide CVV field
                    var cvvField = document.getElementById('cvvField');
                    if (cvvField) cvvField.style.display = 'none';
                    // Show 'Use another card' button
                    showUseAnotherCardBtn();
                    // Track selected card token and identifier
                    selectedCardToken = card.card_token;
                    selectedCardIdentifier = document.getElementById('cardIdentifier').value;
                    // Hide modal
                    savedCardsModalOverlay.style.display = 'none';
                };
                savedCardsList.appendChild(cardDiv);
            });
        }
        savedCardsModalOverlay.style.display = 'flex';
    }

    // Update selectedCardIdentifier if user edits identifier after selecting a card
    const cardIdentifierInput = document.getElementById('cardIdentifier');
    if (cardIdentifierInput) {
        cardIdentifierInput.addEventListener('input', function () {
            if (selectedCardToken) {
                selectedCardIdentifier = this.value;
            }
        });
    }

    // Show/hide 'Use another card' button
    function showUseAnotherCardBtn() {
        let btn = document.getElementById('useAnotherCardBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'useAnotherCardBtn';
            btn.type = 'button';
            btn.className = 'main-action-btn outline-btn';
            btn.style.margin = '18px 0 0 0';
            TrustedTypes.setInnerHTML(btn, '<i class="fas fa-plus"></i> Use another card');
            btn.onclick = function () {
                setCardFieldsDisabled(false);
                btn.remove();
                // Show CVV field again
                var cvvField = document.getElementById('cvvField');
                if (cvvField) cvvField.style.display = '';
            };
            // Insert after card details section
            const cardSection = document.querySelector('.section-title i.fa-credit-card').parentElement.parentElement;
            cardSection.appendChild(btn);
        }
    }

    if (searchSavedCardsBtn) {
        searchSavedCardsBtn.addEventListener('click', async function () {
            const identifier = document.getElementById('cardIdentifier').value.trim();
            if (!identifier) {
                showModal('error', 'Missing Identifier', 'Please enter a Card Identifier to search.');
                return;
            }
            // Prepare headers
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'Cache-Control': 'no-cache',
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            };
            if (isPsp && merchantId) {
                headers['X-Merchant-ID'] = merchantId;
            }
            try {
                const url = `/pg/tokens/?identifier=${encodeURIComponent(identifier)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data)) {
                    showSavedCardsModal(data.data);
                } else {
                    showSavedCardsModal([]);
                }
            } catch (err) {
                showSavedCardsModal([]);
            }
        });
    }

    if (closeSavedCardsModalBtn) {
        closeSavedCardsModalBtn.addEventListener('click', function () {
            savedCardsModalOverlay.style.display = 'none';
        });
    }
    if (savedCardsModalOverlay) {
        savedCardsModalOverlay.addEventListener('click', function (e) {
            if (e.target === savedCardsModalOverlay) savedCardsModalOverlay.style.display = 'none';
        });
    }



    // --- ORDER SUMMARY LOGIC ---
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateOrderSummary() {
        const get = id => document.getElementById(id)?.value || '';
        const summary = [
            { label: 'Amount', value: get('amount') + ' ' + get('currency') },
            { label: 'Product', value: get('productName') },
            { label: 'Description', value: get('productDescription') },
            { label: 'Buyer Name', value: get('buyerName') },
            { label: 'Buyer Email', value: get('buyerEmail') },
            { label: 'Buyer Phone', value: get('buyerPhone') },
            { label: 'Reference ID', value: get('referenceId') },
            { label: 'Invoice Number', value: get('invoiceNumber') },
            { label: 'Invoice Date', value: get('invoiceDate') },
        ];
        const content = summary.filter(item => item.value && item.value !== ' ').map(item =>
            `<div style='font-weight:500;'>${escapeHtml(item.label)}:</div><div>${escapeHtml(item.value)}</div>`
        ).join('');
        TrustedTypes.setInnerHTML(document.getElementById('orderSummaryContent'), content || '<span style="color:#718096;">No order details yet.</span>');
    }
    // Update summary on load and on input changes
    document.addEventListener('DOMContentLoaded', function () {
        updateOrderSummary();
        const form = document.getElementById('sessionForm');
        for (let element of form.elements) {
            if (element.name) {
                element.addEventListener('input', updateOrderSummary);
                element.addEventListener('change', updateOrderSummary);
            }
        }
    });

    // --- ORDER SUMMARY TILE LOGIC ---
    function updateOrderSummaryTile() {
        const get = id => document.getElementById(id)?.value || '';
        document.getElementById('orderSummaryProductName').textContent = get('productName') || 'Sample Product';
        document.getElementById('orderSummaryProductDesc').textContent = get('productDescription') || 'This is a sample product description';
        document.getElementById('orderSummaryAmount').textContent = (get('amount') ? '₹' + get('amount') : '₹1000.00');
        document.getElementById('orderSummaryCurrency').textContent = get('currency') || 'INR';
        document.getElementById('orderSummaryBuyerName').textContent = get('buyerName') || 'John Doe';
        document.getElementById('orderSummaryBuyerEmail').textContent = get('buyerEmail') || 'john.doe@example.com';
        document.getElementById('orderSummaryReference').textContent = get('referenceId') || 'CARD_XXXXXX';
        // Optionally, set product image if you have a URL field
        // document.getElementById('orderSummaryProductImg').src = get('productImageUrl') || 'https://via.placeholder.com/80x80?text=Product';
    }
    updateOrderSummaryTile();
    for (let element of form.elements) {
        if (element.name) {
            element.addEventListener('input', updateOrderSummaryTile);
            element.addEventListener('change', updateOrderSummaryTile);
        }
    }

    // Toggle ARN field based on network
    const cardNetworkSelect = document.getElementById('cardNetwork');
    function toggleArnVisibility() {
        const arnField = document.getElementById('arnField');
        const network = (cardNetworkSelect?.value || '').toUpperCase();
        if (network === 'AMEX' || network === 'RUPAY') arnField.style.display = '';
        else arnField.style.display = 'none';
    }
    if (cardNetworkSelect) {
        cardNetworkSelect.addEventListener('change', toggleArnVisibility);
        toggleArnVisibility();
    }
    // Save Card via tokens API
    const saveCardDetailsBtn = document.getElementById('saveCardDetailsBtn');
    if (saveCardDetailsBtn) {
        saveCardDetailsBtn.addEventListener('click', async function () {
            hideModal();
            // Gather and validate fields per CreateSavedCardDetailsSerializer
            const identifier = document.getElementById('cardIdentifier').value.trim();
            const card_number = document.getElementById('cardNumber').value.trim();
            const nickname = document.getElementById('cardNickname').value.trim();
            const cardholder_name = document.getElementById('cardHolderName').value.trim();
            const expiry_month = parseInt(document.getElementById('expiryMonth').value || '0', 10);
            const expiry_year = parseInt(document.getElementById('expiryYear').value || '0', 10);
            const network = document.getElementById('cardNetwork').value.trim();
            const authorization_reference_number = document.getElementById('authorizationRefNumber').value.trim();
            const card_type = document.getElementById('cardType').value;

            // Client headers
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'Cache-Control': 'no-cache',
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            };
            if (isPsp && merchantId) headers['X-Merchant-ID'] = merchantId;

            // Build payload
            const payload = {
                identifier: identifier || undefined,
                card_number,
                nickname: nickname || undefined,
                cardholder_name,
                expiry_month,
                expiry_year,
                network,
                authorization_reference_number: authorization_reference_number || undefined,
                card_type
            };
            // Simple front-end validations
            const missing = [];
            ['card_number', 'cardholder_name', 'expiry_month', 'expiry_year', 'network', 'card_type'].forEach(f => {
                if (!payload[f]) missing.push(f);
            });
            const netUpper = (network || '').toUpperCase();
            if ((netUpper === 'AMEX' || netUpper === 'RUPAY') && !authorization_reference_number) missing.push('authorization_reference_number');
            if (missing.length) {
                showModal('error', 'Missing Fields', 'Please fill: ' + missing.join(', '));
                return;
            }
            // Call tokens API
            try {
                const url = `/pg/tokens/`;
                const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
                const data = await response.json();
                if (response.ok && data.success) {
                    showModal('success', 'Card Saved', 'Your card has been saved successfully.');
                } else {
                    let errorMsg = escapeHtml(data.error?.message || 'Failed to save the card.');
                    if (data.error?.details) {
                        errorMsg += '<ul style="text-align:left; margin:10px 0 0 0; padding-left:18px;">';
                        for (const [k, v] of Object.entries(data.error.details)) {
                            const arr = Array.isArray(v) ? v : [v];
                            arr.forEach(m => errorMsg += `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(m)}</li>`);
                        }
                        errorMsg += '</ul>';
                    }
                    showModal('error', 'Save Failed', errorMsg);
                }
            } catch (err) {
                showModal('error', 'Network Error', 'Could not connect to the server. Please try again later.');
            }
        });
    }
});
