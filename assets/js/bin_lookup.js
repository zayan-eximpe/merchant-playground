/**
 * BIN Lookup Page Logic
 * Extracted from inline scripts for CSP compliance
 */

document.body.style.zoom = "90%";

function createSampleData() {
    const sampleData = {
        bin: '41111111'
    };

    const form = document.getElementById('binForm');
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
    document.getElementById('binForm').reset();

    // Hide result section
    document.getElementById('resultSection').classList.remove('show');
}

// Function to save form data to localStorage
function saveFormData() {
    const formData = {};
    const form = document.getElementById('binForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name) {
            formData[element.name] = element.value;
        }
    }

    localStorage.setItem('eximpe_bin_form_data', JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('eximpe_bin_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('binForm');
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
    localStorage.removeItem('eximpe_bin_form_data');
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('binForm');
    const lookupButton = document.getElementById('lookupButton');
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
        modalMessage.innerHTML = message;
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

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        lookupButton.disabled = true;
        btnText.textContent = 'Looking up BIN...';
        resultSection.classList.remove('show');

        try {
            const bin = document.getElementById('bin').value.trim();
            const clientId = getConfigValue('CLIENT_ID');
            const authKey = getConfigValue('AUTH_KEY');

            if (!bin) {
                showModal('error', 'Validation Error', 'Please enter a BIN to lookup.');
                return;
            }

            if (!clientId || !authKey) {
                showModal('error', 'Configuration Error', 'Please fill in all API configuration fields (Client ID, Client Secret).');
                return;
            }

            const response = await fetch(`${window.API_URL}/pg/bin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
                },
                body: JSON.stringify({
                    bin: bin
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success) {
                    const binData = data.data;
                    let message = `<div style="text-align: left; margin-top: 10px;">
                        <strong>Network:</strong> ${binData.network || 'N/A'}<br>
                        <strong>Type:</strong> ${binData.card_type || 'N/A'}<br>
                        <strong>Bank:</strong> ${binData.bank ? binData.bank.toUpperCase() : 'N/A'}<br>
                        <strong>Issuance:</strong> ${binData.is_domestic ? 'Domestic' : 'International'}
                    </div>`;
                    showModal('success', 'BIN Lookup Successful', message);
                } else {
                    showModal('error', 'BIN Lookup Failed', data.message || 'The BIN could not be looked up.');
                }
            } else {
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += 'Validation errors:<br>';
                    for (const [field, errorValue] of Object.entries(data.error.details)) {
                        const errorArray = Array.isArray(errorValue) ? errorValue : [errorValue];
                        errorArray.forEach(err => {
                            errorMsg += `• ${field}: ${err}<br>`;
                        });
                    }
                } else if (data.error && data.error.message) {
                    errorMsg = data.error.message;
                } else {
                    errorMsg = 'An unexpected error occurred. Please try again.';
                }

                showModal('error', data.error?.message || 'Lookup Error', errorMsg);
            }
        } catch (error) {
            console.error('Error looking up BIN:', error);
            showModal('error', 'Network Error', 'Failed to connect to the lookup service. Please try again.');
        } finally {
            lookupButton.disabled = false;
            btnText.textContent = 'Lookup BIN';
        }
    });

    // Allow Enter key to trigger lookup
    document.getElementById('bin').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
});
