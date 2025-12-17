/**
 * Create Session Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

function createSampleData() {
    const sampleData = {
        amount: '1000.00',
        currency: 'INR',
        reference_id: 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        return_url: window.API_URL + '/checkout/payment_callback.html',
        mop_type: 'UPI',
        type_of_goods: 'goods',
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
        invoice_date: new Date().toISOString().split('T')[0]
    };

    const form = document.getElementById('sessionForm');
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

    // Map the data to the actual form field IDs
    document.getElementById('amount').value = sampleData.amount;
    document.getElementById('currency').value = sampleData.currency;
    document.getElementById('ReferenceID').value = sampleData.reference_id;
    document.getElementById('returnUrl').value = sampleData.return_url;
    document.getElementById('mopType').value = sampleData.mop_type;
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


    // Note: File inputs cannot be programmatically set for security reasons
    // Users will need to manually select files

    // Trigger change events for select elements
    document.getElementById('mopType').dispatchEvent(new Event('change'));
    document.getElementById('typeOfGoods').dispatchEvent(new Event('change'));

    // Save the sample data to localStorage
    saveFormData();

    // Show success message
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
    const form = document.getElementById('sessionForm');
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

    localStorage.setItem('eximpe_form_data', JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('eximpe_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('sessionForm');
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
    localStorage.removeItem('eximpe_form_data');
}

function clearCache() {

    // Clear all form data
    clearFormData();
    // Reset form
    document.getElementById('sessionForm').reset();
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('sessionForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
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
        mobileFab.classList.toggle('active', isMobileMenuOpen);
        mobileActionsMenu.classList.toggle('active', isMobileMenuOpen);
        mobileOverlay.classList.toggle('active', isMobileMenuOpen);

        // Update icon based on menu state
        const icon = mobileFab.querySelector('i');
        if (isMobileMenuOpen) {
            icon.className = 'fas fa-plus';
        } else {
            icon.className = 'fas fa-bolt';
        }
    }

    function closeMobileMenu() {
        isMobileMenuOpen = false;
        mobileFab.classList.remove('active');
        mobileActionsMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
    }

    if (mobileFab) {
        mobileFab.addEventListener('click', toggleMobileMenu);
        console.log('Mobile FAB found and event listener added');
    } else {
        console.log('Mobile FAB not found!');
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
        console.log('Mobile overlay found and event listener added');
    } else {
        console.log('Mobile overlay not found!');
    }

    // Debug: Check if mobile quick actions element exists
    const mobileQuickActions = document.querySelector('.mobile-quick-actions');
    if (mobileQuickActions) {
        console.log('Mobile quick actions element found');
        console.log('Computed style display:', window.getComputedStyle(mobileQuickActions).display);
        console.log('Computed style position:', window.getComputedStyle(mobileQuickActions).position);
    } else {
        console.log('Mobile quick actions element not found!');
    }

    // Close mobile menu when clicking on menu items
    const mobileActionItems = document.querySelectorAll('.mobile-action-item');
    mobileActionItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });

    // Load saved form data
    loadFormData();

    // Add event listeners to save form data on input changes
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
        modalBox.className = 'modal ' + type;
        modalIcon.textContent = type === 'success'
            ? '✅'
            : '❌';
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
        modalMessage.textContent = message;
        modalOverlay.classList.add('active');
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
    }

    // Make showModal available globally for testing
    window.showModal = showModal;
    window.hideModal = hideModal;

    // Test function to verify error handling
    window.testErrorHandling = function () {
        const testError = {
            "success": false,
            "error": {
                "code": "ERR_ORDER_002",
                "message": "Validation error",
                "details": {
                    "product": {
                        "name": "This field is required."
                    },
                    "buyer": {
                        "email": "Enter a valid email address."
                    },
                    "amount": "This field is required."
                }
            }
        };

        let errorMsg = '';
        if (testError.error && testError.error.details) {
            errorMsg += 'Validation errors:\n';

            function processErrors(errors, prefix = '') {
                for (const [field, errorValue] of Object.entries(errors)) {
                    if (typeof errorValue === 'object' && !Array.isArray(errorValue) && errorValue !== null) {
                        processErrors(errorValue, `${prefix}${field}.`);
                    } else {
                        const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                        errorArray.forEach(err => {
                            const fullFieldName = `${prefix}${field}`;
                            const fieldName = toTitleCaseField(fullFieldName.replace(/\./g, ' '));
                            errorMsg += `• ${fieldName}: ${err}\n`;
                        });
                    }
                }
            }

            processErrors(testError.error.details);
        }

        console.log('Test error message:', errorMsg);
        showModal('error', testError.error?.message || 'Validation Error', errorMsg);
    };

    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) hideModal();
    });

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

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        createButton.disabled = true;
        btnText.textContent = 'Uploading Documents...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            // Update progress
            btnText.textContent = 'Creating Session...';

            // Get form values
            let amountValue = document.getElementById('amount').value;
            let phoneValue = document.getElementById('buyerPhone').value;
            if (phoneValue) {
                phoneValue = '+91' + phoneValue;
            }

            // Build the new API payload structure
            const payload = {
                amount: amountValue,
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('ReferenceID').value || undefined,
                collection_mode: "hosted_payment",
                return_url: document.getElementById('returnUrl').value || undefined,
                mop_type: document.getElementById('mopType').value || undefined,
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
                    }
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

            if (data.success) {
                showModal('success', 'Session Created', 'Session created successfully! Redirecting...');
                setTimeout(() => {
                    hideModal();
                    clearFormData();
                    localStorage.setItem('last_used_order_id', data.data.order_id);

                    // Validate and sanitize session_id to prevent XSS
                    const sessionId = data.data.session_id;
                    if (sessionId && typeof sessionId === 'string' && /^[a-zA-Z0-9_-]+$/.test(sessionId)) {
                        window.location.href = `/checkout/checkout.html?session_id=${encodeURIComponent(sessionId)}`;
                    } else {
                        showModal('error', 'Invalid Session', 'Invalid session ID received from server.');
                    }
                }, 1200);
            } else {
                // Build error message with validation errors if present
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += 'Validation errors:\n';

                    function processErrors(errors, prefix = '') {
                        for (const [field, errorValue] of Object.entries(errors)) {
                            if (typeof errorValue === 'object' && !Array.isArray(errorValue) && errorValue !== null) {
                                // Handle nested objects (like product.name, buyer.email, etc.)
                                processErrors(errorValue, `${prefix}${field}.`);
                            } else {
                                // Handle array of errors or single error
                                const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                                errorArray.forEach(err => {
                                    const fullFieldName = `${prefix}${field}`;
                                    const fieldName = toTitleCaseField(fullFieldName.replace(/\./g, ' '));
                                    errorMsg += `• ${fieldName}: ${err}\n`;
                                });
                            }
                        }
                    }

                    processErrors(data.error.details);
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
            showModal('error', 'Error', error.message);
        } finally {
            createButton.disabled = false;
            btnText.textContent = 'Initiate Checkout';
        }
    });
});

// Event listeners for action buttons (CSP compliant - no inline onclick)
document.addEventListener('DOMContentLoaded', function () {
    // Get all buttons with data-action attribute
    const actionButtons = document.querySelectorAll('[data-action]');

    actionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');

            switch (action) {
                case 'createSampleData':
                    createSampleData();
                    break;
                case 'clearCache':
                    clearCache();
                    break;
                case 'goHome':
                    window.location.href = '/checkout/create_session.html';
                    break;
            }
        });
    });
});
