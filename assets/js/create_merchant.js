/**
 * Create Merchant Page Logic
 * Extracted from inline scripts for CSP compliance
 */

function createSampleData() {
            const sampleData = {
                legal_name: 'Acme Corporation Pvt Ltd',
                company_type: 'Private Limited',
                registration_number: 'U12345MH2020PTC123456',
                tax_id: '27AAECS1234F1Z2',
                address: '1234 Business Park Avenue, Suite 501',
                country: 'India',
                email: 'contact@acmecorp.com',
                phone: '9876543905',
                business_category: 'IT & ITES',
                purpose_code: 'P0806',
                commodity: 'Software',
                payment_terms: 'Net 30',
                website: 'https://www.acmecorp.com',
                account_number: '123456789012',
                name: 'HDFC Bank',
                bank_address: 'HDFC Bank, MG Road Branch, Mumbai'
            };

            const form = document.getElementById('merchantForm');
            const formElements = form.elements;

            for (let element of formElements) {
                if (element.name && sampleData[element.name] !== undefined) {
                    element.value = sampleData[element.name];
                }
            }

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
                    if (element.type === 'file') {
                        continue;
                    }
                    formData[element.name] = element.value;
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
                        element.value = formData[element.name];
                    }
                }
            }
        }

        function clearCache() {
            localStorage.removeItem('eximpe_merchant_form_data');
            document.getElementById('merchantForm').reset();
        }

        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('merchantForm');
            const submitButton = document.getElementById('createButton');
            const btnText = document.getElementById('btnText');
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
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) hideModal();
            });

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                hideModal();
                submitButton.disabled = true;
                btnText.textContent = 'Creating...';

                try {
                    const apiUrl = `${window.API_URL}/merchants/`;

                    // Create FormData object
                    const formData = new FormData();

                    // Add all form fields to FormData
                    // Company Details
                    const companyDetails = {
                        legal_name: document.getElementById('legalName').value,
                        company_type: document.getElementById('companyType').value,
                        registration_number: document.getElementById('registrationNumber').value,
                        tax_id: document.getElementById('taxId').value,
                        address: document.getElementById('address').value,
                        country: document.getElementById('country').value
                    };
                    formData.append('company', JSON.stringify(companyDetails));

                    // Contact Details
                    const contactDetails = {
                        email: document.getElementById('email').value,
                        phone: '+91' + document.getElementById('phone').value
                    };
                    formData.append('contact', JSON.stringify(contactDetails));

                    // Business Details
                    const businessDetails = {
                        business_category: document.getElementById('businessCategory').value,
                        purpose_code: document.getElementById('purposeCode').value,
                        commodity: document.getElementById('commodity').value,
                        payment_terms: document.getElementById('paymentTerms').value,
                        website: document.getElementById('website').value
                    };
                    formData.append('business', JSON.stringify(businessDetails));

                    // Bank Details
                    const bankDetails = {
                        account_number: document.getElementById('accountNumber').value,
                        name: document.getElementById('bankName').value,
                        address: document.getElementById('bankAddress').value
                    };
                    formData.append('bank', JSON.stringify(bankDetails));

                    // Add files
                    const registrationDocs = document.getElementById('registrationDocuments').files;
                    const businessLicenses = document.getElementById('businessLicenses').files;
                    const otherDocs = document.getElementById('otherDocuments').files;

                    for (let i = 0; i < registrationDocs.length; i++) {
                        formData.append('registration_documents[]', registrationDocs[i]);
                    }
                    for (let i = 0; i < businessLicenses.length; i++) {
                        formData.append('business_licenses[]', businessLicenses[i]);
                    }
                    for (let i = 0; i < otherDocs.length; i++) {
                        formData.append('other_documents[]', otherDocs[i]);
                    }

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'X-Client-Secret': getConfigValue('AUTH_KEY'),
                            'X-Client-ID': getConfigValue('CLIENT_ID'),
                        },
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        showModal('success', 'Merchant Created', `Merchant account created successfully!\n\nMerchant ID: ${data.data.merchant_id}`);
                    } else {
                        // Build error message with validation errors if present
                        let errorMsg = '';
                        if (data.error && data.error.details) {
                            errorMsg += 'Validation errors:\n';

                            function processErrors(errors, prefix = '') {
                                for (const [field, errorValue] of Object.entries(errors)) {
                                    if (typeof errorValue === 'object' && !Array.isArray(errorValue)) {
                                        // Handle nested objects
                                        processErrors(errorValue, `${prefix}${field}.`);
                                    } else {
                                        // Handle array of errors or single error
                                        const errors = Array.isArray(errorValue) ? errorValue : [errorValue];
                                        errors.forEach(err => {
                                            const fieldName = toTitleCaseField(field.replace(/\./g, ' '));
                                            errorMsg += `• ${fieldName}: ${err}\n`;
                                        });
                                    }
                                }
                            }

                            processErrors(data.error.details);
                        }
                        showModal('error', data.error?.message || 'Validation Error', errorMsg);
                    }
                } catch (error) {
                    showModal('error', 'Error', error.message);
                } finally {
                    submitButton.disabled = false;
                    btnText.textContent = 'Create Merchant';
                }
            });
        });
