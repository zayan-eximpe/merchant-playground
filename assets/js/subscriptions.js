/**
 * Subscriptions Page Logic
 * Extracted from inline scripts for CSP compliance
 */

// Mark script as loaded
(function () {
    'use strict';
    window.subscriptionsScriptLoaded = true;
})();

document.body.style.zoom = "90%";

function createSampleData() {
    // Calculate dates for subscription
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() + 1); // Start next month
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // End after 1 year

    const sampleData = {
        // Order Details
        amount: '1000.00',
        currency: 'INR',
        reference_id: 'SUB' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        // Payment method and UPI flow type
        payment_method: 'collection',
        vpa: '9999999999@upi',
        upi_app_name: 'others',
        // Card details (for card subscriptions)
        card_type: 'CREDIT_CARD',
        card_network: 'VISA',
        card_number: '4111111111111111',
        cardholder_name: 'John Doe',
        expiry_month: '12',
        expiry_year: '2029',
        cvv: '123',
        card_nickname: 'My Credit Card',

        // Buyer Details
        buyer_name: 'John Doe',
        buyer_email: 'john.doe@example.com',
        buyer_phone: '9876543210',
        buyer_address_line_1: '123 Main Street',
        buyer_address_line_2: 'Apt 4B',
        buyer_city: 'Mumbai',
        buyer_state: 'Maharashtra',
        buyer_postal_code: '400001',
        user_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

        // Product Details
        product_name: 'Monthly Subscription Plan',
        type_of_goods: 'service',
        product_description: 'Monthly subscription for premium services',
        hs_code: '98051000',
        hs_code_description: 'Subscription services',

        // Invoice Details
        invoice_number: 'INV' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        invoice_date: today.toISOString().split('T')[0],

        // Standing Instruction Fields
        billing_amount: '1000.00',
        billing_currency: 'INR',
        billing_cycle: 'MONTHLY',
        billing_interval: '1',
        payment_start_date: startDate.toISOString().split('T')[0],
        payment_end_date: endDate.toISOString().split('T')[0],
        billing_date: '1', // 1st of every month
        billing_limit: 'AFTER',
        billing_rule: 'MAX',
        remarks: 'Monthly subscription for premium services'
    };

    const form = document.getElementById('subscriptionsForm');
    if (!form) {
        return;
    }

    // Populate all form fields
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name && sampleData[element.name] !== undefined) {
            element.value = sampleData[element.name];
            // Trigger change event for select elements to update their visual state
            if (element.tagName === 'SELECT') {
                element.dispatchEvent(new Event('change'));
            }
        }
    }

    // Map the data to the actual form field IDs (for fields that might have different IDs)
    const fieldMappings = {
        'amount': 'amount',
        'currency': 'currency',
        'ReferenceID': 'reference_id',
        'upiFlowType': 'payment_method',
        'upiId': 'vpa',
        'upiAppName': 'upi_app_name',
        'cardType': 'card_type',
        'cardNetwork': 'card_network',
        'cardNumber': 'card_number',
        'cardHolderName': 'cardholder_name',
        'expiryMonth': 'expiry_month',
        'expiryYear': 'expiry_year',
        'cvv': 'cvv',
        'cardNickname': 'card_nickname',
        'typeOfGoods': 'type_of_goods',
        'buyerName': 'buyer_name',
        'buyerEmail': 'buyer_email',
        'buyerPhone': 'buyer_phone',
        'buyerAddressLine1': 'buyer_address_line_1',
        'buyerAddressLine2': 'buyer_address_line_2',
        'buyerCity': 'buyer_city',
        'buyerState': 'buyer_state',
        'buyerPostalCode': 'buyer_postal_code',
        'productName': 'product_name',
        'hsCode': 'hs_code',
        'productDescription': 'product_description',
        'hsCodeDescription': 'hs_code_description',
        'invoiceNumber': 'invoice_number',
        'invoiceDate': 'invoice_date',
        'userIp': 'user_ip',
        'userAgent': 'user_agent',
        'billingAmount': 'billing_amount',
        'billingCurrency': 'billing_currency',
        'billingCycle': 'billing_cycle',
        'billingInterval': 'billing_interval',
        'paymentStartDate': 'payment_start_date',
        'paymentEndDate': 'payment_end_date',
        'billingDate': 'billing_date',
        'billingLimit': 'billing_limit',
        'billingRule': 'billing_rule',
        'remarks': 'remarks'
    };

    // Set values by ID
    for (const [fieldId, dataKey] of Object.entries(fieldMappings)) {
        const element = document.getElementById(fieldId);
        if (element && sampleData[dataKey] !== undefined) {
            element.value = sampleData[dataKey];
            if (element.tagName === 'SELECT') {
                element.dispatchEvent(new Event('change'));
            }
        }
    }

    // Trigger change events for select elements
    const selectElements = ['typeOfGoods', 'upiFlowType', 'upiAppName', 'billingCycle', 'billingLimit', 'billingRule', 'cardType', 'cardNetwork', 'expiryMonth', 'expiryYear'];
    selectElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.dispatchEvent(new Event('change'));
        }
    });

    // Update payment method visibility after loading sample data
    if (typeof updatePaymentMethodVisibility === 'function') {
        updatePaymentMethodVisibility();
    }

    // Save the sample data to localStorage
    saveFormData();

    // Show success message
    if (window.ModalUtils) {
        window.ModalUtils.show('success', 'Sample Data Loaded', 'Form has been populated with sample subscription data.');
    }
}

function toTitleCaseField(field) {
    // Convert camelCase to snake_case temporarily
    const spaced = field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Insert space between camelCase
        .replace(/_/g, ' ')                     // Replace underscores with spaces
        .toLowerCase();                         // Normalize to lowercase

    // Capitalize first letter of each word
    return spaced.replace(/\b\w/g, char => char.toUpperCase());
}

// Function to save form data to localStorage
function saveFormData() {
    const formData = {};
    const form = document.getElementById('subscriptionsForm');
    if (!form) return;

    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name) {
            if (element.type === 'file') {
                // Don't save file data
                continue;
            }
            formData[element.name] = element.value;
        }
    }

    localStorage.setItem('eximpe_subscription_form_data', JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('eximpe_subscription_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('subscriptionsForm');
        if (!form) return;

        const formElements = form.elements;

        for (let element of formElements) {
            if (element.name && formData[element.name] !== undefined) {
                element.value = formData[element.name];
                // Trigger change event for select elements to update their visual state
                if (element.tagName === 'SELECT') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        }
    }
}

// Function to clear saved form data
function clearFormData() {
    localStorage.removeItem('eximpe_subscription_form_data');
}

function clearCache() {

    // Clear all form data
    clearFormData();
    // Reset form
    const form = document.getElementById('subscriptionsForm');
    if (form) {
        form.reset();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('subscriptionsForm');
    if (!form) {
        return;
    }

    // Remove any action attribute to prevent default submission
    if (form.action) {
        form.removeAttribute('action');
    }
    // Ensure form doesn't submit normally
    form.setAttribute('onsubmit', 'return false;');

    const createButton = document.getElementById('createButton');
    if (!createButton) {
        return;
    }

    // Modal elements
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Mobile quick actions functionality
    const mobileFab = document.getElementById('mobileFab');
    const mobileActionsMenu = document.getElementById('mobileActionsMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    let isMobileMenuOpen = false;

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        if (mobileFab) mobileFab.classList.toggle('active', isMobileMenuOpen);
        if (mobileActionsMenu) mobileActionsMenu.classList.toggle('active', isMobileMenuOpen);
        if (mobileOverlay) mobileOverlay.classList.toggle('active', isMobileMenuOpen);

        // Update icon based on menu state
        if (mobileFab) {
            const icon = mobileFab.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bolt';
            }
        }
    }

    function closeMobileMenu() {
        isMobileMenuOpen = false;
        if (mobileFab) mobileFab.classList.remove('active');
        if (mobileActionsMenu) mobileActionsMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');

        // Reset icon to bolt when closing
        if (mobileFab) {
            const icon = mobileFab.querySelector('i');
            if (icon) icon.className = 'fas fa-bolt';
        }
    }

    if (mobileFab) {
        mobileFab.addEventListener('click', toggleMobileMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu when clicking on menu items
    const mobileActionItems = document.querySelectorAll('.mobile-action-item');
    mobileActionItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });

    // Load saved form data
    loadFormData();

    // Handle payment method type changes
    const upiFlowTypeSelect = document.getElementById('upiFlowType');
    const vpaInput = document.getElementById('upiId');
    const vpaGroup = document.getElementById('vpaGroup');
    const vpaRequired = document.getElementById('vpaRequired');
    const vpaDescription = document.getElementById('vpaDescription');
    const vpaHelperText = document.getElementById('vpaHelperText');
    const upiPaymentSection = document.getElementById('upiPaymentSection');
    const cardPaymentSection = document.getElementById('cardPaymentSection');

    // Populate expiry year dropdown
    function populateExpiryYears() {
        const expiryYearSelect = document.getElementById('expiryYear');
        if (!expiryYearSelect) return;

        const currentYear = new Date().getFullYear();
        expiryYearSelect.innerHTML = '<option value="">Year</option>';

        for (let i = 0; i <= 20; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            expiryYearSelect.appendChild(option);
        }
    }

    populateExpiryYears();

    function updatePaymentMethodVisibility() {
        const paymentMethod = upiFlowTypeSelect ? upiFlowTypeSelect.value : 'collection';

        if (paymentMethod === 'card') {
            // Card selected - show card section, hide UPI section
            if (upiPaymentSection) upiPaymentSection.style.display = 'none';
            if (cardPaymentSection) cardPaymentSection.style.display = 'block';

            // Set default expiry year to 2029 when card is selected
            const expiryYearSelect = document.getElementById('expiryYear');
            if (expiryYearSelect && !expiryYearSelect.value) {
                expiryYearSelect.value = '2029';
                // Trigger change event to update visual state
                expiryYearSelect.dispatchEvent(new Event('change'));
            }
        } else {
            // UPI selected (collection or intent) - show UPI section, hide card section
            if (upiPaymentSection) upiPaymentSection.style.display = 'block';
            if (cardPaymentSection) cardPaymentSection.style.display = 'none';

            // Update VPA field visibility for UPI flows
            updateVpaFieldVisibility();
        }
    }

    function updateVpaFieldVisibility() {
        const flowType = upiFlowTypeSelect ? upiFlowTypeSelect.value : 'collection';
        if (flowType === 'intent') {
            // INTENT flow: VPA is optional
            if (vpaInput) {
                vpaInput.value = '';
                vpaInput.removeAttribute('readonly');
                vpaInput.required = false;
            }
            if (vpaRequired) {
                vpaRequired.textContent = 'Optional for Intent flow';
                vpaRequired.className = 'tooltip-optional';
            }
            if (vpaDescription) {
                vpaDescription.textContent = 'Not required for Intent flow. Customer will select VPA in their UPI app.';
            }
            if (vpaHelperText) {
                vpaHelperText.innerHTML = 'UPI ID (optional for Intent flow)';
            }
        } else {
            // COLLECTION flow: VPA is required
            if (vpaInput) {
                vpaInput.value = '9999999999@upi';
                vpaInput.removeAttribute('readonly');
                vpaInput.required = true;
            }
            if (vpaRequired) {
                vpaRequired.textContent = 'Required for Collection flow';
                vpaRequired.className = 'tooltip-required';
            }
            if (vpaDescription) {
                vpaDescription.innerHTML = 'For sandbox subscriptions, use <code>9999999999@upi</code> for Collection flow.<br>Not required for Intent flow.';
            }
            if (vpaHelperText) {
                vpaHelperText.innerHTML = 'Sandbox UPI ID (required for Collection flow) <span class="required">*</span>';
            }
        }
    }

    // Initialize payment method visibility
    updatePaymentMethodVisibility();

    // Update visibility when payment method changes
    if (upiFlowTypeSelect) {
        upiFlowTypeSelect.addEventListener('change', updatePaymentMethodVisibility);
    }

    // Add event listeners to save form data on input changes
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            element.addEventListener('input', saveFormData);
            element.addEventListener('change', saveFormData);
        }
    }

    // Card-style modal with optional ACS button (mirrors S2S card payment flow)
    function showModal(type, title, message, acsTemplate) {
        if (!modalBox || !modalIcon || !modalTitle || !modalMessage || !modalOverlay) {
            return;
        }

        modalBox.className = 'modal ' + type;
        if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
            if (type === 'success') {
                window.TrustedTypes.setInnerHTML(
                    modalIcon,
                    '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#26a887"/><path d="M34 18L21.5 30.5L14 23" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                );
                modalTitle.style.color = '#26a887';
            } else {
                window.TrustedTypes.setInnerHTML(
                    modalIcon,
                    '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#e53e3e"/><path d="M16 16L32 32M32 16L16 32" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>'
                );
                modalTitle.style.color = '#e53e3e';
            }
            modalTitle.textContent = title;
            window.TrustedTypes.setInnerHTML(modalMessage, message);
        } else {
            modalIcon.textContent = type === 'success' ? '✅' : '❌';
            modalTitle.textContent = title;
            modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
            modalMessage.textContent = message;
        }

        // Remove any existing ACS button
        let acsBtn = document.getElementById('modalAcsButton');
        if (acsBtn) acsBtn.remove();

        // Add ACS button for success + template
        console.log('showModal called - type:', type, 'acsTemplate:', acsTemplate ? 'Present' : 'Missing', acsTemplate);
        // Show button for success modals when acsTemplate is provided
        if (type === 'success' && acsTemplate) {
            console.log('Adding ACS button to modal');
            const btn = document.createElement('button');
            btn.id = 'modalAcsButton';
            btn.className = 'main-action-btn';
            btn.style.marginTop = '18px';
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(btn, '<i class="fas fa-lock"></i> <span>Proceed with Authentication</span>');
            } else {
                btn.innerHTML = '<i class="fas fa-lock"></i> <span>Proceed with Authentication</span>';
            }

            // Container is no longer needed since we redirect instead of showing in modal

            btn.onclick = function () {
                // Check if acsTemplate is available
                if (!acsTemplate) {
                    showModal('error', 'Authentication Error', 'ACS template is not available. Please try again.');
                    return;
                }

                // Close the modal first
                closeModal();

                // Decode and parse the ACS template
                const html = decodeBase64(acsTemplate);

                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const form = doc.querySelector('form');

                    if (form) {
                        // Clone the form to avoid issues
                        const clonedForm = form.cloneNode(true);
                        clonedForm.style.display = 'none';

                        // Append form to body and submit (this will redirect to the ACS URL)
                        document.body.appendChild(clonedForm);

                        // Submit the form which will redirect to the ACS authentication page
                        clonedForm.submit();
                    } else {
                        // If no form found, try to extract URL from HTML or use data URL
                        showModal('error', 'Authentication Error', 'Could not process the authentication form.');
                    }
                } catch (e) {
                    console.error('Error parsing ACS template:', e);
                    showModal('error', 'Authentication Error', 'An error occurred while processing authentication.');
                }
            };

            modalBox.appendChild(btn);
        }

        modalOverlay.classList.add('active');
        modalBox.style.display = 'flex';
        modalBox.style.flexDirection = 'column';
        modalBox.style.alignItems = 'center';
        modalBox.style.justifyContent = 'flex-start';
        modalBox.style.padding = '48px 32px 32px 32px';
        modalBox.style.minWidth = '320px';
        modalBox.style.maxWidth = '90%';
        modalBox.style.maxHeight = '90vh';
        modalBox.style.overflowY = 'auto';
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
        const acsBtn = document.getElementById('modalAcsButton');
        if (acsBtn) acsBtn.remove();
    }

    function hideModal() {
        closeModal();
    }

    // Utility to decode base64 to string (copied from card payment)
    function decodeBase64(str) {
        try {
            return decodeURIComponent(escape(window.atob(str)));
        } catch (e) {
            return window.atob(str);
        }
    }


    // Make functions available globally
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.createSampleData = createSampleData;
    window.clearCache = clearCache;

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Floating label for select
    document.querySelectorAll('select').forEach(function (select) {
        select.addEventListener('change', function () {
            if (select.value) {
                select.classList.add('has-value');
            } else {
                select.classList.remove('has-value');
            }
        });
        // On load, set has-value if value is present
        if (select.value) {
            select.classList.add('has-value');
        }
    });

    // Event delegation for quick actions buttons
    document.body.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'create-sample-data') {
            e.preventDefault();
            createSampleData();
        } else if (action === 'clear-cache') {
            e.preventDefault();
            clearCache();
            if (window.ModalUtils) {
                window.ModalUtils.show('success', 'Form Cleared', 'All form fields have been cleared.');
            } else {
                showModal('success', 'Form Cleared', 'All form fields have been cleared.');
            }
        } else if (action === 'navigate-home') {
            e.preventDefault();
            // Navigate to home - find the home link in the page
            const homeLink = document.querySelector('.right-actions a.header-button[href]');
            if (homeLink && homeLink.href) {
                window.location.href = homeLink.href;
            } else {
                // Fallback - go up one directory level
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                window.location.href = basePath || '/';
            }
        } else if (action === 'copyIntent') {
            const uri = target.getAttribute('data-uri');
            copyToClipboard(uri, target);
        }
    });

    // Form submission handler
    if (form && createButton) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            createButton.disabled = true;
            if (btnText) btnText.textContent = 'Creating Subscription...';

            try {
                // Read UPI flow type value from dropdown
                const upiFlowTypeSelect = document.getElementById('upiFlowType');
                if (!upiFlowTypeSelect) {
                    showModal('error', 'Error', 'UPI Flow Type dropdown not found. Please refresh the page.');
                    createButton.disabled = false;
                    if (btnText) btnText.textContent = 'Create Subscription';
                    return;
                }

                const selectedFlowType = upiFlowTypeSelect.value;

                // Determine API URL based on selected payment method
                let apiUrl;
                let buttonText = 'Creating Subscription...';
                const isCard = selectedFlowType === 'card';
                const isIntent = selectedFlowType === 'intent';

                if (isCard) {
                    // Card selected - use Card API
                    apiUrl = `${window.API_URL}/pg/subscriptions/card/`;
                    buttonText = 'Creating Card Subscription...';
                } else if (isIntent) {
                    // Intent selected - use Intent API
                    apiUrl = `${window.API_URL}/pg/subscriptions/intent/`;
                    buttonText = 'Creating UPI Intent Subscription...';
                } else {
                    // Collection selected (or default) - use Collection API
                    apiUrl = `${window.API_URL}/pg/subscriptions/`;
                    buttonText = 'Creating UPI Collection Subscription...';
                }

                // Update button text immediately
                if (btnText) btnText.textContent = buttonText;

                // Store the flow type for later use in payload
                const upiFlowType = selectedFlowType;

                // Get form values
                let amountValue = document.getElementById('amount').value;
                let phoneValue = document.getElementById('buyerPhone').value;
                if (phoneValue) {
                    phoneValue = '+91' + phoneValue;
                }

                const vpaValue = document.getElementById('upiId').value || undefined;

                // Build the API payload structure with standing instruction
                const payload = {
                    amount: amountValue,
                    collection_mode: "s2s",
                    currency: document.getElementById('currency').value,
                    reference_id: document.getElementById('ReferenceID').value || undefined,
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
                    },
                    standing_instruction: {
                        billing_amount: document.getElementById('billingAmount').value,
                        billing_currency: document.getElementById('billingCurrency').value,
                        billing_cycle: document.getElementById('billingCycle').value,
                        billing_interval: parseInt(document.getElementById('billingInterval').value) || undefined,
                        payment_start_date: document.getElementById('paymentStartDate').value,
                        payment_end_date: document.getElementById('paymentEndDate').value,
                        billing_date: document.getElementById('billingDate').value ? parseInt(document.getElementById('billingDate').value) : undefined,
                        billing_limit: document.getElementById('billingLimit').value || undefined,
                        billing_rule: document.getElementById('billingRule').value || undefined,
                        remarks: document.getElementById('remarks').value || undefined
                    }
                };

                // Add payment method specific fields
                if (upiFlowType === 'card') {
                    // Card flow: Add card details and mop_type
                    const cardType = document.getElementById('cardType').value;
                    const cardNetwork = document.getElementById('cardNetwork').value;
                    const cardNumber = document.getElementById('cardNumber').value;
                    const cardHolderName = document.getElementById('cardHolderName').value;
                    const expiryMonth = parseInt(document.getElementById('expiryMonth').value);
                    const expiryYear = parseInt(document.getElementById('expiryYear').value);
                    const cvv = document.getElementById('cvv').value;
                    const cardNickname = document.getElementById('cardNickname').value;

                    payload.mop_type = cardType; // CREDIT_CARD or DEBIT_CARD
                    payload.card_details = {
                        number: cardNumber,
                        cardholder_name: cardHolderName,
                        expiry_month: expiryMonth,
                        expiry_year: expiryYear,
                        cvv: cvv,
                        network: cardNetwork,
                        nickname: cardNickname
                    };
                } else if (upiFlowType === 'intent') {
                    // Intent flow: Call Intent API - upi_flow_type must be "intent", no VPA required
                    payload.mop_type = "UPI";
                    payload.upi_flow_type = "intent";
                    payload.upi_app_name = document.getElementById('upiAppName').value || undefined;
                    // VPA is NOT included for Intent flow (per API documentation)
                } else {
                    // Collection flow: Call Collection API - upi_flow_type is "collection", VPA required
                    payload.mop_type = "UPI";
                    payload.upi_flow_type = "collection";
                    payload.vpa = vpaValue; // VPA is required for Collection flow
                    payload.upi_app_name = document.getElementById('upiAppName').value || undefined;
                }

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

                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID')
                };

                // Add X-Merchant-ID header if PSP mode is enabled and merchant ID is provided
                const isPsp = getConfigValue('IS_PSP');
                const merchantId = getConfigValue('MERCHANT_ID');

                // Debug logging (can be removed in production)
                console.log('PSP Check - IS_PSP:', isPsp, 'Type:', typeof isPsp);
                console.log('PSP Check - MERCHANT_ID:', merchantId);
                console.log('PSP Check - window.Config.IS_PSP:', window.Config?.IS_PSP);
                console.log('PSP Check - window.Config.MERCHANT_ID:', window.Config?.MERCHANT_ID);

                // Check if PSP is enabled (handle boolean true, string "true", or window.Config fallback)
                const isPspEnabled = isPsp === true || isPsp === 'true' || isPsp === 1 ||
                    (window.Config && (window.Config.IS_PSP === true || window.Config.IS_PSP === 'true'));
                const finalMerchantId = merchantId || (window.Config && window.Config.MERCHANT_ID);

                console.log('PSP Check - isPspEnabled:', isPspEnabled, 'finalMerchantId:', finalMerchantId);

                if (isPspEnabled && finalMerchantId) {
                    headers['X-Merchant-ID'] = finalMerchantId;
                    console.log('Added X-Merchant-ID header:', finalMerchantId);
                } else {
                    console.log('X-Merchant-ID header NOT added - isPspEnabled:', isPspEnabled, 'finalMerchantId:', finalMerchantId);
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(cleanPayload)
                });

                const data = await response.json();

                if (data.success) {
                    const orderId = data.data.order_id;
                    const subscriptionId = data.data.subscription_id;
                    const message = data.data.message || 'Subscription created successfully';
                    const paymentLink = data.data.payment_link; // intent_uri for INTENT flow
                    // Check for acsTemplate in multiple possible field names
                    const acsTemplate = data.data.acs_template || data.data.acstemplate || data.data.acsTemplate || data.data.acs_form; // For COLLECTION and CARD flows
                    const isIntentFlow = upiFlowType === 'intent';
                    const isCardFlow = upiFlowType === 'card';

                    // Debug logging
                    console.log('Subscription created - acsTemplate:', acsTemplate ? 'Present' : 'Missing');
                    console.log('Flow type - isCardFlow:', isCardFlow, 'isIntentFlow:', isIntentFlow);

                    // Persist latest subscription ID for use in Subscription Management page
                    if (subscriptionId) {
                        localStorage.setItem('last_used_subscription_id', subscriptionId);
                    }

                    if (isCardFlow) {
                        // CARD flow: Show success modal with ACS template button
                        clearCache();
                        let successMessage = `<strong>Card Subscription Created Successfully!</strong><br><br>`;
                        successMessage += `<strong>Order ID:</strong> ${orderId}<br>`;
                        successMessage += `<strong>Subscription ID:</strong> ${subscriptionId}<br>`;
                        successMessage += `<br>${escapeHtml(message)}<br><br>`;
                        if (acsTemplate) {
                            successMessage += `<strong>Note:</strong> Please complete the 3D Secure authentication using the button below.`;
                        }
                        showModal('success', 'Card Subscription Created', successMessage, acsTemplate);
                    } else if (isIntentFlow && paymentLink) {
                        // INTENT flow: Show card-style display with QR code (same as S2S QR payment)
                        const intentUri = paymentLink;

                        // Get QR code from API response (generated on backend)
                        const qrCode = data.data.qr_code || {};
                        const qrBase64 = qrCode.base64;

                        // Build QR code image markup (same as S2S QR payment)
                        const qrImageMarkup = qrBase64
                            ? `<div style="margin-top: 16px; margin-bottom: 16px; text-align: center;">
                                    <img src="data:image/png;base64,${qrBase64}"
                                         alt="Generated UPI QR Code"
                                         style="max-width: 220px; width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; padding: 8px; background: white;">
                                    <div style="margin-top: 8px; font-size: 12px; color: #4b5563;">Scan this code with any UPI app</div>
                               </div>`
                            : '';

                        const successMessage = `
                            <div style="text-align: left; margin: 10px 0;">
                                <div style="margin-bottom: 16px; text-align: center;">
                                    <div style="color: #6c757d; font-size: 14px;">Order ID: <span style="font-family: monospace; color: #495057;">${orderId}</span></div>
                                    <div style="color: #6c757d; font-size: 14px; margin-top: 8px;">Subscription ID: <span style="font-family: monospace; color: #495057;">${subscriptionId}</span></div>
                                </div>
                                ${qrImageMarkup}
                            </div>
                        `;

                        clearCache();
                        showModal('minimal', '', successMessage);
                    } else {
                        // COLLECTION flow: Show success modal with ACS template button
                        clearCache();
                        let successMessage = `<strong>Subscription Created Successfully!</strong><br><br>`;
                        successMessage += `<strong>Order ID:</strong> ${orderId}<br>`;
                        successMessage += `<strong>Subscription ID:</strong> ${subscriptionId}<br>`;
                        if (!isIntentFlow && paymentLink) {
                            successMessage += `<strong>Payment Link:</strong> <a href="${escapeHtml(paymentLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(paymentLink)}</a><br>`;
                        }
                        successMessage += `<br>${escapeHtml(message)}`;
                        // Check for acsTemplate in multiple possible field names
                        const template = acsTemplate || data.data.acstemplate || data.data.acsTemplate || data.data.acs_form;
                        console.log('Collection flow - Full response data:', JSON.stringify(data.data, null, 2));
                        console.log('Collection flow - acsTemplate value:', template);
                        showModal('success', 'Subscription Created', successMessage, template);
                    }
                } else {
                    // Build error message with validation errors if present
                    let errorMsg = '';
                    if (data.error && data.error.details) {
                        errorMsg += '<ul style="text-align:left; margin: 10px 0 0 0; padding-left: 18px;">';

                        function processErrors(errors, prefix = '') {
                            for (const [field, errorValue] of Object.entries(errors)) {
                                if (typeof errorValue === 'object' && !Array.isArray(errorValue) && errorValue !== null) {
                                    // Handle nested objects (like product.name, buyer.email, standing_instruction.billing_amount, etc.)
                                    processErrors(errorValue, `${prefix}${field}.`);
                                } else {
                                    // Handle array of errors or single error
                                    const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                                    errorArray.forEach(err => {
                                        const fullFieldName = `${prefix}${field}`;
                                        const fieldName = toTitleCaseField(fullFieldName.replace(/\./g, ' '));
                                        errorMsg += `<li><strong>${fieldName}:</strong> ${err}</li>`;
                                    });
                                }
                            }
                        }

                        processErrors(data.error.details);
                        errorMsg += '</ul>';
                    } else if (data.error && data.error.message) {
                        // If no detailed errors, show the general error message
                        errorMsg = escapeHtml(data.error.message);
                    } else {
                        // Fallback error message
                        errorMsg = 'An unexpected error occurred. Please try again.';
                    }

                    showModal('error', data.error?.message || 'Validation Error', errorMsg);
                }
            } catch (error) {
                showModal('error', 'Error', error.message || 'An unexpected error occurred. Please try again.');
            } finally {
                createButton.disabled = false;
                if (btnText) btnText.textContent = 'Create Subscription';
            }
        });
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Function to copy text to clipboard
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML;
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(button, '✅ Copied!');
            } else {
                button.innerHTML = '✅ Copied!';
            }
            button.style.background = '#28a745';
            setTimeout(() => {
                if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                    window.TrustedTypes.setInnerHTML(button, originalText);
                } else {
                    button.innerHTML = originalText;
                }
                button.style.background = 'rgb(38, 168, 135)';
            }, 2000);
        }).catch(err => {
            // Failed to copy to clipboard
        });
    }

});
