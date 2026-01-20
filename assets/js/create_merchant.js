/**
 * Create Merchant Page Logic
 * Extracted from inline scripts for CSP compliance
 */

function createSampleData() {
    const sampleData = {
        legal_name: "InnovateTech Solutions Private Limited",
        brand_name: "InnovateTech",
        registration_number: "US-CORP-2024-IT789456",
        international_org_type: "Private Limited Company",
        tax_id: "94-8765432",
        website: "https://www.innovatetech.com",
        monthly_avg_transaction_volume: "485",
        registered_address: "1455 Market Street, Suite 1600",
        registered_city: "San Francisco",
        registered_state: "CA",
        registered_country: "United States",
        registered_pincode: "94103",
        same_as_registered_address: false,
        communication_address: "Suite 1200, 101 California Street",
        communication_city: "San Francisco",
        communication_state: "CA",
        communication_country: "United States",
        communication_pincode: "94111",
        business_category: "goods_merchant",
        business_mode: "b2b",
        hs_codes: "85234910, 84715000",
        category: "Enterprise Software and Cloud Services",
        description_of_products_and_services: "InnovateTech provides cutting-edge cloud computing solutions, artificial intelligence platforms, and enterprise software systems. We specialize in machine learning algorithms, data analytics, and scalable cloud infrastructure for Fortune 500 companies.",
        agreement_details: "Master Service Agreement for Cloud Solutions dated 2024-03-15",
        bank_account_number: "6789123450987654",
        bank_account_name: "InnovateTech Solutions Private Limited",
        bank_swift_code: "CHASINUS33XXX",
        bank_name: "JPMorgan Chase Bank",
        bank_branch_name: "Financial District Branch",
        bank_address: "270 Park Avenue, New York",
        bank_city: "New York",
        bank_state: "NY",
        bank_country: "United States",
        bank_pincode: "10017",
        routing_number: "021000021"
    };

    const form = document.getElementById('merchantForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name && sampleData[element.name] !== undefined) {
            if (element.type === 'checkbox') {
                element.checked = sampleData[element.name];
            } else {
                element.value = sampleData[element.name];
            }
        }
    }

    // Trigger change event for checkbox logic
    document.getElementById('sameAsRegisteredAddress').dispatchEvent(new Event('change'));
    saveFormData();
}

function toTitleCaseField(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function saveFormData() {
    const formData = {};
    const form = document.getElementById('merchantForm');
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name) {
            if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }

    localStorage.setItem('eximpe_merchant_form_data', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('eximpe_merchant_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.getElementById('merchantForm');
        const formElements = form.elements;

        for (let element of formElements) {
            if (element.name && formData[element.name] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = formData[element.name];
                } else {
                    element.value = formData[element.name];
                }
            }
        }
    }
}

function clearCache() {
    localStorage.removeItem('eximpe_merchant_form_data');
    document.getElementById('merchantForm').reset();
    document.getElementById('sameAsRegisteredAddress').dispatchEvent(new Event('change'));
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('merchantForm');
    const submitButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    const sameAsRegisteredCheckbox = document.getElementById('sameAsRegisteredAddress');
    const commAddressFields = ['communicationAddress', 'communicationCity', 'communicationState', 'communicationCountry', 'communicationPincode'];
    const regAddressFields = ['registeredAddress', 'registeredCity', 'registeredState', 'registeredCountry', 'registeredPincode'];

    sameAsRegisteredCheckbox.addEventListener('change', function () {
        const isChecked = this.checked;
        commAddressFields.forEach((id, index) => {
            const commField = document.getElementById(id);
            const regField = document.getElementById(regAddressFields[index]);
            if (isChecked) {
                commField.value = regField.value;
                commField.readOnly = true;
                commField.style.backgroundColor = '#f1f5f9';
            } else {
                commField.readOnly = false;
                commField.style.backgroundColor = '#fff';
            }
        });
    });

    // Update communication fields when registered fields change if checkbox is checked
    regAddressFields.forEach((id, index) => {
        document.getElementById(id).addEventListener('input', function () {
            if (sameAsRegisteredCheckbox.checked) {
                document.getElementById(commAddressFields[index]).value = this.value;
            }
        });
    });

    // Load saved form data
    loadFormData();
    sameAsRegisteredCheckbox.dispatchEvent(new Event('change'));

    // Add event listeners to save form data on input changes
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            element.addEventListener('input', saveFormData);
            element.addEventListener('change', saveFormData);
        }
    }

    function showModal(type, title, message) {
        modalBox.className = 'modal ' + type;
        modalIcon.textContent = type === 'success' ? '✅' : '❌';
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
        modalMessage.textContent = message;
        modalOverlay.classList.add('active');
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
    }

    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) hideModal();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideModal();
        submitButton.disabled = true;
        btnText.textContent = 'Creating...';

        try {
            const apiUrl = `${window.API_URL}/partners/merchants/`;

            const payload = {
                settlement_details: {
                    bank_account_number: document.getElementById('bankAccountNumber').value,
                    bank_account_name: document.getElementById('bankAccountName').value,
                    bank_swift_code: document.getElementById('bankSwiftCode').value,
                    bank_name: document.getElementById('bankName').value,
                    bank_branch_name: document.getElementById('bankBranchName').value,
                    bank_address: document.getElementById('bankAddress').value,
                    bank_city: document.getElementById('bankCity').value,
                    bank_state: document.getElementById('bankState').value,
                    bank_country: document.getElementById('bankCountry').value,
                    bank_pincode: document.getElementById('bankPincode').value,
                    routing_number: document.getElementById('routingNumber').value
                },
                company_details: {
                    legal_name: document.getElementById('legalName').value,
                    brand_name: document.getElementById('brandName').value,
                    registration_number: document.getElementById('registrationNumber').value,
                    international_org_type: document.getElementById('internationalOrgType').value,
                    tax_id: document.getElementById('taxId').value,
                    website: document.getElementById('website').value,
                    monthly_avg_transaction_volume: document.getElementById('monthlyAvgTransactionVolume').value,
                    communication_address: document.getElementById('communicationAddress').value,
                    communication_city: document.getElementById('communicationCity').value,
                    communication_state: document.getElementById('communicationState').value,
                    communication_country: document.getElementById('communicationCountry').value,
                    communication_pincode: document.getElementById('communicationPincode').value,
                    same_as_registered_address: document.getElementById('sameAsRegisteredAddress').checked,
                    registered_address: document.getElementById('registeredAddress').value,
                    registered_city: document.getElementById('registeredCity').value,
                    registered_state: document.getElementById('registeredState').value,
                    registered_country: document.getElementById('registeredCountry').value,
                    registered_pincode: document.getElementById('registeredPincode').value,
                    business_category: document.getElementById('businessCategory').value,
                    business_mode: document.getElementById('businessMode').value,
                    hs_codes: document.getElementById('hsCodes').value.split(',').map(s => s.trim()).filter(s => s !== ''),
                    category: document.getElementById('category').value,
                    description_of_products_and_services: document.getElementById('descriptionOfProductsAndServices').value,
                    agreement_details: document.getElementById('agreementDetails').value
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showModal('success', 'Merchant Created', `Merchant account created successfully!\n\nMerchant ID: ${data.merchant_id || data.id || 'N/A'}`);
            } else {
                let errorMsg = '';
                if (data.error && data.error.details) {
                    errorMsg += 'Validation errors:\n';
                    function processErrors(errors, prefix = '') {
                        for (const [field, errorValue] of Object.entries(errors)) {
                            if (typeof errorValue === 'object' && !Array.isArray(errorValue)) {
                                processErrors(errorValue, `${prefix}${field}.`);
                            } else {
                                const errs = Array.isArray(errorValue) ? errorValue : [errorValue];
                                errs.forEach(err => {
                                    const fieldName = toTitleCaseField(field.replace(/\./g, ' '));
                                    errorMsg += `• ${fieldName}: ${err}\n`;
                                });
                            }
                        }
                    }
                    processErrors(data.error.details);
                } else if (data.message) {
                    errorMsg = data.message;
                } else if (typeof data === 'string') {
                    errorMsg = data;
                } else {
                    errorMsg = JSON.stringify(data);
                }
                showModal('error', data.error?.message || 'Error', errorMsg);
            }
        } catch (error) {
            showModal('error', 'Error', error.message);
        } finally {
            submitButton.disabled = false;
            btnText.textContent = 'Create Merchant';
        }
    });
});

