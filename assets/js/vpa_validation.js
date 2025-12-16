/**
 * Vpa Validation Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

function createSampleData() {
    const sampleData = {
        vpa: 'john.doe@payu',
        vpa_provider: 'others',
        client_id: '7411846657',
        auth_key: '7A856E3CFC78D145AF54',
        merchant_id: '9399726811',
        mode: 'sandbox'
    };

    const form = document.getElementById('vpaForm');
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

    // Save the sample data to localStorage
    saveFormData();
}

function clearCache() {

    // Clear all form data
    clearFormData();
    // Reset form
    document.getElementById('vpaForm').reset();

    // Hide result section
    document.getElementById('resultSection').classList.remove('show');
}

// Function to save form data to localStorage
function saveFormData() {
    const formData = {};
    const form = document.getElementById('vpaForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name) {
            formData[element.name] = element.value;
        }
    }

    localStorage.setItem('eximpe_vpa_form_data', JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('eximpe_vpa_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('vpaForm');
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
    localStorage.removeItem('eximpe_vpa_form_data');
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('vpaForm');
    const validateButton = document.getElementById('validateButton');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');

    // Modal elements
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

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

    // Make showModal available globally
    window.showModal = showModal;
    window.hideModal = hideModal;

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
        validateButton.disabled = true;
        btnText.textContent = 'Validating VPA...';
        resultSection.classList.remove('show');

        try {
            const vpa = document.getElementById('vpa').value.trim();
            const clientId = document.getElementById('clientId').value;
            const authKey = document.getElementById('authKey').value;
            const merchantId = document.getElementById('merchantId').value;

            if (!vpa) {
                showModal('error', 'Validation Error', 'Please enter a VPA to validate.');
                return;
            }

            if (!clientId || !authKey || !merchantId) {
                showModal('error', 'Configuration Error', 'Please fill in all API configuration fields (Client ID, Client Secret, Merchant ID).');
                return;
            }

            const response = await fetch(`${window.API_URL}/pg/vpa/validate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
                },
                body: JSON.stringify({
                    vpa: vpa
                })
            });

            const data = await response.json();

            // Handle both 200 and 400 responses for VPA validation
            if (response.ok || response.status === 400) {
                if (data.success && data.data?.is_valid) {
                    showModal('success', 'VPA Validated Successfully',
                        `The VPA "${vpa}" is valid and ready for payments.`);
                } else {
                    showModal('error', 'VPA Validation Failed',
                        `The VPA "${vpa}" is not valid. Please check the VPA format and try again.`);
                }
            } else {
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += 'Validation errors:\n';
                    for (const [field, errorValue] of Object.entries(data.error.details)) {
                        const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                        errorArray.forEach(err => {
                            errorMsg += `• ${field}: ${err}\n`;
                        });
                    }
                } else if (data.error && data.error.message) {
                    errorMsg = data.error.message;
                } else {
                    errorMsg = 'An unexpected error occurred. Please try again.';
                }

                showModal('error', data.error?.message || 'Validation Error', errorMsg);
            }
        } catch (error) {
            console.error('Error validating VPA:', error);
            showModal('error', 'Network Error', 'Failed to connect to the validation service. Please try again.');
        } finally {
            validateButton.disabled = false;
            btnText.textContent = 'Validate VPA';
        }
    });

    // Allow Enter key to trigger validation
    document.getElementById('vpa').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Mobile quick actions logic
    const mobileFab = document.getElementById('mobileFab');
    const mobileActionsMenu = document.getElementById('mobileActionsMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    let isMobileMenuOpen = false;

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        mobileFab.classList.toggle('active', isMobileMenuOpen);
        mobileActionsMenu.classList.toggle('active', isMobileMenuOpen);
        mobileMenuOverlay.classList.toggle('active', isMobileMenuOpen);
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
        mobileMenuOverlay.classList.remove('active');
        // Reset icon to bolt when closing
        const icon = mobileFab.querySelector('i');
        icon.className = 'fas fa-bolt';
    }

    if (mobileFab) {
        mobileFab.addEventListener('click', toggleMobileMenu);
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    // Close mobile menu when clicking on menu items
    const mobileActionItems = document.querySelectorAll('.mobile-action-item');
    mobileActionItems.forEach(item => {
        item.addEventListener('click', function () {
            closeMobileMenu();
            // Handle navigation for items with data-url
            const url = this.getAttribute('data-url');
            if (url) {
                window.location.href = url;
            }
        });
    });
});
