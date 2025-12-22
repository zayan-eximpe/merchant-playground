/**
 * Upi Collection Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

function createSampleData() {
    const sampleData = {
        amount: '1000.00',
        currency: 'INR',
        reference_id: 'S2SC' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        vpa: 'john.doe@payu',
        upi_app_name: 'others',
        return_url: `${window.location.origin}/checkout/payment_callback.html`,
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
        invoice_date: new Date().toISOString().split('T')[0],
        user_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
    document.getElementById('upiId').value = sampleData.vpa;
    document.getElementById('upiAppName').value = sampleData.upi_app_name;
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

    // Note: File inputs cannot be programmatically set for security reasons
    // Users will need to manually select files

    // Trigger change events for select elements
    document.getElementById('typeOfGoods').dispatchEvent(new Event('change'));
    document.getElementById('upiAppName').dispatchEvent(new Event('change'));

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
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Function to show payment status selection modal
function simulateTransaction(orderId) {
    try {
        // Show payment status selection modal
        const statusSelectionMessage = `
                    <div style="text-align: left; margin: 10px 0;">
                        <div style="margin-bottom: 16px; text-align: center;">
                            <div style="color: #6c757d; font-size: 14px;">Choose payment outcome for Order: <span style="font-family: monospace; color: #495057;">${orderId}</span></div>
                        </div>

                        <div style="display: grid; gap: 12px; margin: 16px 0;">
                            <button data-action="confirmPayment" data-order-id="${orderId}" data-status="success" data-message="Payment completed successfully" style="padding: 16px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s;">
                                ✅ Mark as Successful
                            </button>

                            <button data-action="confirmPayment" data-order-id="${orderId}" data-status="failure" data-message="Payment failed due to insufficient funds" style="padding: 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s;">
                                ❌ Mark as Failed
                            </button>
                        </div>

                        <div style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 6px; text-align: center;">
                            <div style="color: #6b7280; font-size: 12px;">This will call the confirm_payment API to update the transaction status</div>
                        </div>
                    </div>
                `;

        showModal('success', 'Select Payment Status', statusSelectionMessage);

    } catch (error) {
        console.error('Error showing status selection:', error);
        showModal('error', 'Error', `Failed to show status selection: ${error.message}`);
    }
}

// Function to confirm payment status via API
async function confirmPaymentStatus(orderId, status, message) {
    try {
        hideModal(); // Close the selection modal

        // Show loading state
        const loadingMessage = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top: 4px solid rgb(38, 168, 135); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                        </div>
                        <div style="color: #6b7280;">Updating payment status...</div>
                    </div>
                `;
        showModal('success', 'Processing', loadingMessage);

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Client-Secret': getConfigValue('AUTH_KEY'),
            'X-Client-ID': getConfigValue('CLIENT_ID'),
            ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
        };

        const payload = {
            status: status,
            message: message
        };

        const response = await fetch(`${window.API_URL}/pg/orders/${orderId}/confirm_payment/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to confirm payment status';
            showModal('error', 'Error', errorMessage);
            return;
        }

        // Show success message
        const successMessage = `
                    <div style="text-align: left; margin: 10px 0;">
                        <div style="margin-bottom: 16px; text-align: center;">
                            <div style="color: #10b981; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Payment Status Updated!</div>
                            <div style="color: #6c757d; font-size: 14px;">Order: <span style="font-family: monospace; color: #495057;">${orderId}</span></div>
                        </div>

                        <div style="padding: 16px; border-left: 4px solid #10b981; border-radius: 6px; margin: 16px 0;">
                            <div style="color: #166534; font-size: 14px;">Message: ${message}</div>
                        </div>

                        <div style="text-align: center; margin-top: 16px;">
                            <button data-action="openOrderDetails" style="padding: 8px 16px; background: rgb(38, 168, 135); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                🔍 View Order Details
                            </button>
                        </div>
                    </div>
                `;

        showModal('success', 'Success', successMessage);

    } catch (error) {
        console.error('Error confirming payment status:', error);
        showModal('error', 'Error', `Failed to confirm payment status: ${error.message}`);
    }
}

// Function to fetch order details and show result
async function fetchOrderDetailsAndShowResult(orderId, acsTemplate) {
    try {

        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'X-Client-Secret': getConfigValue('AUTH_KEY'),
            'X-Client-ID': getConfigValue('CLIENT_ID'),
            ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
        };

        const response = await fetch(`${window.API_URL}/pg/orders/${orderId}/`, {
            method: 'GET',
            headers: headers
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to fetch order details';
            showModal('error', 'Error', errorMessage);
            return;
        }

        const orderData = responseData.data;
        let orderIdPaymentId = 'N/A';

        // Extract order_id-payment_id from payments
        if (orderData.payments && orderData.payments.length > 0) {
            const latestPayment = orderData.payments[0]; // Get the latest payment
            if (latestPayment && latestPayment.payment_id) {
                orderIdPaymentId = `${orderId}-${latestPayment.payment_id}`;
            }
        }

        const formatCurrency = (amount, currency) => {
            if (!amount) return 'N/A';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency || 'INR'
            }).format(amount);
        };

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        };

        // Create simplified success message with PayU simulator link
        const payuSimulatorUrl = `https://pgsim01.payu.in/UPI-test-transaction/confirm/${orderIdPaymentId}`;

        const successMessage = `
                    <div style="text-align: left; margin: 10px 0;">
                        <div style="margin-bottom: 16px; text-align: center;">
                            <div style="color: #6c757d; font-size: 14px;">Transaction ID: <span style="font-family: monospace; color: #495057;">${orderIdPaymentId}</span></div>
                        </div>

                        ${getSelectedEnv() != 'production' ? `
                        <div style="padding: 16px; background: #fff3cd; border-radius: 8px; border: 2px solid #ffc107;">
                            <div style="text-align: center; margin-bottom: 16px;">
                                <div style="font-weight: 600; color: #856404; font-size: 16px; margin-bottom: 8px;">🧪 Complete Test Payment</div>
                                <div style="color: #856404; font-size: 13px; line-height: 1.5;">To complete this payment, visit the PayU simulator and select Success or Failure</div>
                            </div>

                            <div style="text-align: center; margin-bottom: 12px;">
                                <a href="${payuSimulatorUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    🔗 Open PayU Simulator
                                </a>
                            </div>

                            <div style="padding: 12px; background: white; border-radius: 6px; margin-top: 12px;">
                                <div style="color: #6c757d; font-size: 12px; word-break: break-all; font-family: monospace;">
                                    ${payuSimulatorUrl}
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div style="padding: 16px; background: #e9ecef; border-radius: 8px; border: 2px solid #6c757d; text-align: center;">
                            <div style="color: #495057; font-size: 16px; font-weight: 600; margin-bottom: 8px;">ℹ️ Transaction Testing</div>
                            <div style="color: #6c757d; font-size: 13px; margin-bottom: 12px;">Switch to sandbox mode to test transaction success/failure scenarios</div>
                            <button data-action="openOrderDetails" style="padding: 8px 16px; background: rgb(21, 56, 56); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                🔍 View Order Details
                            </button>
                        </div>
                        `}
                    </div>
                `;

        clearCache();
        showModal('success', 'UPI Collection Initiated!', successMessage);
        localStorage.setItem('last_used_order_id', orderId);

    } catch (error) {
        console.error('Error fetching order details:', error);
        showModal('error', 'Error', 'Failed to fetch order details: ' + error.message);
    }
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
        modalBox.className = 'modal ' + type;
        modalIcon.textContent = type === 'success'
            ? '✅'
            : '❌';
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
        TrustedTypes.setInnerHTML(modalMessage, message);
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
        btnText.textContent = 'Creating UPI Collection...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            // Update progress
            btnText.textContent = 'Creating UPI Collection...';

            // Get form values
            let amountValue = document.getElementById('amount').value;
            let phoneValue = document.getElementById('buyerPhone').value;
            if (phoneValue) {
                phoneValue = '+91' + phoneValue;
            }

            // Build the new API payload structure
            const payload = {
                amount: amountValue,
                collection_mode: "s2s",
                upi_flow_type: "collection",
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('ReferenceID').value || undefined,
                vpa: document.getElementById('upiId').value || undefined,
                upi_app_name: document.getElementById('upiAppName').value || undefined,
                mop_type: "UPI",
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
                const acsTemplate = data.data.acs_template;
                const orderId = data.data.order_id;

                // Fetch order details to get the order_id-payment_id parameter
                await fetchOrderDetailsAndShowResult(orderId, acsTemplate);
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
            showModal('error', 'Error', error.message);
        } finally {
            createButton.disabled = false;
            btnText.textContent = 'Initiate UPI Collection';
        }
    });

    // Event delegation for dynamically created buttons (CSP compliant)
    document.body.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'confirmPayment') {
            const orderId = target.getAttribute('data-order-id');
            const status = target.getAttribute('data-status');
            const message = target.getAttribute('data-message');
            confirmPaymentStatus(orderId, status, message);
        } else if (action === 'openOrderDetails') {
            window.open('/sample-integration/order-details/', '_blank', 'noopener,noreferrer');
        } else if (action === 'simulateTransaction') {
            const orderId = target.getAttribute('data-order-id');
            simulateTransaction(orderId);
        }
    });
});
