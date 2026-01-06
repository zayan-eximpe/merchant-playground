/**
 * Upi Intent Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";
function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createSampleData() {
    const sampleData = {
        amount: '1.00',
        currency: 'USD',
        reference_id: uuid4(),
        buyer_name: 'John Doe',
        buyer_email: 'john.doe@example.com',
        buyer_phone: '9876543210',
        product_name: 'Sample Product',
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
    document.getElementById('buyerName').value = sampleData.buyer_name;
    document.getElementById('buyerEmail').value = sampleData.buyer_email;
    document.getElementById('buyerPhone').value = sampleData.buyer_phone;
    document.getElementById('productName').value = sampleData.product_name;

    // Note: File inputs cannot be programmatically set for security reasons
    // Users will need to manually select files

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

// Function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show a brief success indication
        const button = event.target;
        const originalText = button.innerHTML;
        button.textContent = '✅ Copied!';
        button.style.background = '#28a745';
        setTimeout(() => {
            TrustedTypes.setInnerHTML(button, originalText);
            button.style.background = 'rgb(38, 168, 135)';
        }, 4000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

function clearCache() {

    // Clear all form data
    clearFormData();
    // Reset form
    document.getElementById('sessionForm').reset();
}

document.addEventListener('DOMContentLoaded', function () {
    // Add spinner animation CSS
    if (!document.getElementById('pollingSpinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'pollingSpinnerStyle';
        style.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
        document.head.appendChild(style);
    }

    const form = document.getElementById('sessionForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const authKeyInput = document.getElementById('authKey');
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

        // Reset icon to bolt when closing
        const icon = mobileFab.querySelector('i');
        icon.className = 'fas fa-bolt';
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
        if (typeof ModalUtils !== 'undefined') {
            ModalUtils.show(type, title, message);
        } else {
            // Fallback if ModalUtils is not loaded
            modalBox.className = 'modal ' + type;
            if (type === 'minimal') {
                modalIcon.style.display = 'none';
                modalTitle.style.display = 'none';
            } else {
                modalIcon.style.display = 'flex';
                modalIcon.textContent = type === 'success' ? '✅' : '❌';
                modalTitle.style.display = 'block';
                modalTitle.textContent = title;
            }
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

    // Store QR code markup and order ID for status checks
    let currentQrCodeMarkup = '';
    let currentOrderId = '';

    // Function to check order status
    async function checkOrderStatus(orderId) {
        try {
            const apiUrl = `${window.API_URL}/pg/orders/${orderId}/status/`;
            console.log('Checking order status at URL:', apiUrl);

            const headers = {
                'Accept': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            };

            console.log('Making status check request with headers:', Object.keys(headers));
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers
            });

            console.log('Status check response status:', response.status);
            const data = await response.json();
            console.log('Status check response data:', data);
            return data;
        } catch (error) {
            console.error('Error checking order status:', error);
            return null;
        }
    }

    // Function to manually check order status and update modal
    async function handleStatusCheck() {
        if (!currentOrderId) {
            console.error('No order ID available for status check');
            return;
        }

        const checkButton = document.getElementById('checkStatusButton');
        if (checkButton) {
            checkButton.disabled = true;
            const originalText = checkButton.textContent;
            checkButton.textContent = 'Checking...';
            checkButton.style.opacity = '0.6';
        }

        try {
            const statusData = await checkOrderStatus(currentOrderId);

            if (!statusData || !statusData.success) {
                showModal('error', 'Status Check Failed', 'Unable to retrieve order status. Please try again.');
                if (checkButton) {
                    checkButton.disabled = false;
                    checkButton.textContent = 'Check Payment Status';
                    checkButton.style.opacity = '1';
                }
                return;
            }

            const status = statusData.data?.status;
            const statusMessage = statusData.data?.status_message || '';

            // Terminal statuses that indicate payment completion
            const terminalStatuses = {
                'payment_successful': 'success',
                'failed': 'failed',
                'payment_cancelled': 'failed',
                'payment_expired': 'failed',
                'payment_rejected': 'failed'
            };

            const isSuccess = status && terminalStatuses[status] === 'success';
            const isFailed = status && terminalStatuses[status] === 'failed';
            const isTerminal = isSuccess || isFailed;

            if (isTerminal) {
                const title = isSuccess ? 'Payment Successful!' : 'Payment Failed';
                const icon = isSuccess ? '✅' : '❌';
                const color = isSuccess ? 'rgb(38, 168, 135)' : 'red';

                const message = `
                            <div style="text-align: left; margin: 10px 0;">
                                ${currentQrCodeMarkup}
                                <p><strong>Order ID:</strong> ${currentOrderId}</p>
                                <p><strong>Status:</strong> ${escapeHtml(statusMessage || status)}</p>
                            </div>
                        `;

                // Update modal
                modalBox.className = 'modal ' + (isSuccess ? 'success' : 'error');
                modalIcon.style.display = '';
                modalTitle.style.display = '';
                modalIcon.textContent = icon;
                modalTitle.textContent = title;
                modalTitle.style.color = color;
                TrustedTypes.setInnerHTML(modalMessage, message);

                // Hide the check button since status is terminal
                if (checkButton) {
                    checkButton.style.display = 'none';
                }
            } else {
                // Status is still pending, show current status
                const message = `
                            <div style="text-align: left; margin: 10px 0;">
                                ${currentQrCodeMarkup}
                                <p><strong>Order ID:</strong> ${currentOrderId}</p>
                                <p><strong>Status:</strong> ${escapeHtml(statusMessage || status || 'Pending')}</p>
                                <p style="margin-top: 10px; color: #6b7280; font-size: 13px;">Payment is still being processed. Please check again in a moment.</p>
                            </div>
                        `;
                TrustedTypes.setInnerHTML(modalMessage, message);

                if (checkButton) {
                    checkButton.disabled = false;
                    checkButton.textContent = 'Check Payment Status';
                    checkButton.style.opacity = '1';
                }
            }
        } catch (error) {
            console.error('Error during status check:', error);
            showModal('error', 'Error', 'An error occurred while checking the status. Please try again.');
            if (checkButton) {
                checkButton.disabled = false;
                checkButton.textContent = 'Check Payment Status';
                checkButton.style.opacity = '1';
            }
        }
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
                            errorMsg += `<li><strong>${fieldName}:</strong> ${err}</li>`;
                        });
                    }
                }
            }

            processErrors(testError.error.details);
            errorMsg += '</ul>';
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
        btnText.textContent = 'Creating QR Code...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            // Update progress
            btnText.textContent = 'Creating QR Code...';

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
                mop_type: "QR",
                buyer: {
                    name: document.getElementById('buyerName').value,
                    email: document.getElementById('buyerEmail').value || undefined,
                    phone: phoneValue || undefined
                },
                product: {
                    name: document.getElementById('productName').value
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
                const qrCode = data.data.qr_code || {};
                const qrBase64 = qrCode.base64;
                const orderId = data.data.order_id;
                const qrImageMarkup = qrBase64
                    ? `<div style="margin-top: 16px; text-align: center;">
                                    <img src="data:image/png;base64,${qrBase64}"
                                         alt="Generated UPI QR Code"
                                         style="max-width: 220px; width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; padding: 8px; background: white;">
                                    <div style="margin-top: 8px; font-size: 12px; color: #4b5563;">Scan this code with any UPI app</div>
                               </div>`
                    : '';

                // Store QR code markup and order ID for status checks
                currentQrCodeMarkup = qrImageMarkup;
                currentOrderId = orderId;

                const successMessage = `
                            <div style="text-align: left; margin: 10px 0;">
                                <p><strong>Order ID:</strong> ${orderId}</p>
                                ${qrImageMarkup}
                                <div style="margin-top: 16px; text-align: center;">
                                    <button id="checkStatusButton"
                                            data-action="checkStatus"
                                            style="padding: 10px 20px; background: rgb(38, 168, 135); color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.2s;">
                                        Check Payment Status
                                    </button>
                                </div>
                            </div>
                        `;

                clearCache();
                showModal('minimal', '', successMessage);
                localStorage.setItem('last_used_order_id', orderId);
            } else {
                // Build error message with validation errors if present
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += '<ul style="text-align:left; margin: 10px 0 0 0; padding-left: 18px;">';

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
                                    errorMsg += `<li><strong>${escapeHtml(fieldName)}:</strong> ${escapeHtml(err)}</li>`;
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

                showModal('error', escapeHtml(data.error?.message || 'Validation Error'), errorMsg);
            }
        } catch (error) {
            showModal('error', 'Error', escapeHtml(error.message));
        } finally {
            createButton.disabled = false;
            btnText.textContent = 'Generate QR Code';
        }
    });

    // Event delegation for dynamically created buttons (CSP compliant)
    document.body.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'copyIntent') {
            const uri = target.getAttribute('data-uri');
            copyToClipboard(uri);
        } else if (action === 'openUpiApp') {
            const uri = target.getAttribute('data-uri');
            const app = target.getAttribute('data-app');
            if (typeof UPIUtils !== 'undefined') {
                UPIUtils.openApp(uri, app, target);
            } else {
                console.error('UPIUtils not found');
            }
        } else if (action === 'checkStatus') {
            handleStatusCheck();
        }
    });
});
