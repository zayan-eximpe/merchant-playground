/**
 * Upi Intent Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

function createSampleData() {
    const sampleData = {
        amount: '1.00',
        currency: 'INR',
        reference_id: 'S2SI' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        return_url: `${window.location.origin}/checkout/payment_callback.html`,
        type_of_goods: 'physical_goods',
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
    document.getElementById('mopType').dispatchEvent(new Event('change'));
    document.getElementById('typeOfGoods').dispatchEvent(new Event('change'));
    document.getElementById('appName').dispatchEvent(new Event('change'));

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
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Show a brief success indication
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
        icon.className = 'fas fa-bolt';
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
        btnText.textContent = 'Creating UPI Intent...';

        try {
            const apiUrl = `${window.API_URL}/pg/orders/`;

            // Update progress
            btnText.textContent = 'Creating UPI Intent...';

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
                upi_flow_type: "intent",
                currency: document.getElementById('currency').value,
                reference_id: document.getElementById('ReferenceID').value || undefined,
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

            if (data.success && data.data) {
                const intentUri = data.data.intent_uri;
                const testSimulatorUrl = data.data.test_simulator_url;
                const orderId = data.data.order_id;

                if (!intentUri && !testSimulatorUrl) {
                    showModal('error', 'Error', 'No payment URI received from server.');
                    return;
                }

                const isTest = !!testSimulatorUrl;
                const finalUri = testSimulatorUrl || intentUri;
                const modeLabel = isTest ? "Test Simulator" : "Live Intent URI";

                // Create a message with the intent URI and UPI app options
                const qrUri = isTest ? testSimulatorUrl : (intentUri && intentUri.includes('upi://pay?') ? intentUri : `upi://pay?${intentUri || ''}`);
                const isDesktop = typeof UPIUtils !== 'undefined' && UPIUtils.isDesktop();

                const successMessage = `
                            <div style="text-align: center; margin: 10px 0;">
                                ${isDesktop ? `
                                <div style="background: white; border-radius: 24px; padding: 30px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); max-width: 320px; margin: 0 auto; border: 1px solid #f0f0f0; font-family: 'Inter', sans-serif;">
                                    <!-- Header: BHIM UPI Logo -->
                                    <div style="margin-bottom: 25px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                                        <img src="https://web-assets.payu.in/web/images/assets/upiLogo/BHIM.svg" alt="BHIM" style="height: 28px;">
                                        <div style="width: 1.5px; height: 22px; background: #cbd5e0; border-radius: 1px;"></div>
                                        <img src="https://web-assets.payu.in/web/images/assets/upiLogo/UPI.svg" alt="UPI" style="height: 20px;">
                                    </div>

                                    <!-- Middle: QR Code Container -->
                                    <div style="background: white; padding: 15px; border: 1px solid #edf2f7; border-radius: 20px; display: inline-block; margin-bottom: 25px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.03);">
                                        <img src="${UPIUtils.getQRCodeUrl(qrUri)}" alt="UPI QR Code" style="width: 210px; height: 210px; display: block; border-radius: 8px;">
                                    </div>

                                    <!-- Footer: UPI App Logos Grid -->
                                    <div style="display: flex; flex-direction: column; gap: 16px;">
                                        <div style="display: flex; justify-content: center; gap: 18px; align-items: center; opacity: 0.8;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/PAYTM.svg" title="Paytm" style="height: 12px;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/GOOGLEPAY.svg" title="Google Pay" style="height: 16px;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/BHIM.svg" title="BHIM" style="height: 16px;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/PHONEPE.svg" title="PhonePe" style="height: 16px;">
                                        </div>
                                        <div style="display: flex; justify-content: center; gap: 18px; align-items: center; opacity: 0.8;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/WHATSAPP.svg" title="WhatsApp" style="height: 20px;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/AMAZONPAY.svg" title="Amazon Pay" style="height: 16px;">
                                            <img src="https://web-assets.payu.in/web/images/assets/upiLogo/CRED.svg" title="CRED" style="height: 16px;">
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top: 25px; color: #64748b; font-size: 12px; font-weight: 500; letter-spacing: 0.02em;">
                                        Scan with any UPI app to pay
                                    </div>
                                </div>
                                ` : `
                                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                                            <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"/>
                                            <path d="M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"/>
                                        </svg>
                                        <span style="font-weight: 500; color: #4a5568; font-size: 14px;">PAY USING ANY UPI APP (${modeLabel})</span>
                                    </div>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="gpay" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/GOOGLEPAY.svg" alt="Google Pay" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Google Pay</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="phonepe" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/PHONEPE.svg" alt="PhonePe" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">PhonePe</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="bhim" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/BHIM.svg" alt="BHIM" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">BHIM</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="paytm" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/PAYTM.svg" alt="Paytm" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">PAYTM</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="amazonpay" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/AMAZONPAY.svg" alt="Amazon Pay" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Amazon Pay</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="whatsapp" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/WHATSAPP.svg" alt="WhatsApp" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">WhatsApp</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="cred" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/CRED.svg" alt="CRED" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">CRED</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="supermoney" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/SUPERMONEY.svg" alt="Supermoney" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Supermoney</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="fimoney" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/FIMONEY.svg" alt="Fi Money" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Fi Money</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="jupiter" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/JUPITER.svg" alt="Jupiter" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Jupiter</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="slice" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/SLICE.svg" alt="Slice" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">Slice</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="generalupi" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/UPI.svg" alt="General UPI" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">General UPI</span>
                                        </button>
                                        <button data-action="openUpiApp" data-uri="${finalUri}" data-is-test="${isTest}" data-app="generalintent" class="upi-app-button">
                                            <div class="upi-app-icon" style="background: white; padding: 8px;">
                                                <img src="https://web-assets.payu.in/web/images/assets/upiLogo/UPI.svg" alt="General Intent" style="width: 32px; height: 32px; object-fit: contain;">
                                            </div>
                                            <span class="upi-app-name">General Intent</span>
                                        </button>
                                    </div>
                                </div>
                                `}
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
            btnText.textContent = 'Initiate UPI Intent';
        }
    });

    // Event delegation for dynamically created buttons (CSP compliant)
    document.body.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'copyIntent') {
            const uri = target.getAttribute('data-uri');
            copyToClipboard(uri, target);
        } else if (action === 'openUpiApp') {
            const uri = target.getAttribute('data-uri');
            const app = target.getAttribute('data-app');
            const isTest = target.getAttribute('data-is-test') === 'true';

            if (isTest) {
                window.open(uri, '_blank');
            } else if (typeof UPIUtils !== 'undefined') {
                UPIUtils.openApp(uri, app, target);
            } else {
                console.error('UPIUtils not found');
            }
        }
    });
});
