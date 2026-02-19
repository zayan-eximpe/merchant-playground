/**
 * Retrieve PG Form Page Logic
 * Fetches detailed configuration for a specific PG form by ID.
 */

function pgFormRetrieveEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function pgFormRetrieveShowModal(type, title, message) {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');
    modalBox.className = 'modal ' + type;
    modalIcon.textContent = type === 'success' ? '✅' : '❌';
    modalTitle.textContent = title;
    modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
    TrustedTypes.setInnerHTML(
        modalMessage,
        pgFormRetrieveEscapeHtml(message)
    );
    modalOverlay.classList.add('active');
}

function pgFormRetrieveHideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document
    .getElementById('modalCloseBtn')
    .addEventListener('click', pgFormRetrieveHideModal);
document
    .getElementById('modalOverlay')
    .addEventListener('click', function (e) {
        if (e.target === document.getElementById('modalOverlay'))
            pgFormRetrieveHideModal();
    });

function pgFormRetrieveFormatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function pgFormRetrieveFormatCurrency(amount) {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

function pgFormRetrieveFormatText(text) {
    if (!text) return 'N/A';
    return text.toString().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

document
    .getElementById('retrievePgFormForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault();

        const formId = document.getElementById('formId').value.trim();
        const resultContainer = document.getElementById('resultContainer');
        const resultContent = document.getElementById('resultContent');

        if (!formId) {
            pgFormRetrieveShowModal(
                'error',
                'Validation Error',
                'Please enter a Form ID'
            );
            return;
        }

        try {
            const response = await fetch(`${window.API_URL}/pg/forms/${formId}/`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID')
                        ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') }
                        : {}),
                },
            });
            const data = await response.json();
            const payload = (data && typeof data.data !== 'undefined') ? data.data : data;

            if (!response.ok) {
                let errorMessage = 'Failed to fetch form details';
                if (data && typeof data === 'object') {
                    if (data.error?.message) {
                        errorMessage = data.error.message;
                    } else if (data.detail) {
                        errorMessage = data.detail;
                    }
                }
                pgFormRetrieveShowModal('error', 'Error', errorMessage);
                return;
            }

            // payload is PGFormDetailSerializer payload
            resultContent.textContent = '';

            if (data.message && typeof data.message === 'string' && data.message.trim()) {
                const msgEl = document.createElement('p');
                msgEl.className = 'result-message';
                msgEl.style.marginBottom = '12px';
                msgEl.style.color = 'var(--success-color, #26a887)';
                msgEl.textContent = data.message;
                resultContent.appendChild(msgEl);
            }

            const mainTable = document.createElement('table');
            mainTable.className = 'result-table';
            mainTable.style.marginBottom = '20px';

            const basicInfo = [
                { label: 'Form ID', value: payload.form_id || 'N/A' },
                { label: 'URL Slug', value: payload.url_slug || 'N/A' },
                { label: 'Form URL', value: payload.form_url || null, isLink: true },
                { label: 'Payment For', value: payload.payment_for || 'N/A' },
                {
                    label: 'Amount',
                    value:
                        payload.is_fixed_amount && payload.amount != null
                            ? pgFormRetrieveFormatCurrency(payload.amount)
                            : 'Variable',
                },
                { label: 'Currency', value: payload.currency || 'N/A' },
                { label: 'Amount Title', value: payload.amount_title || 'N/A' },
                {
                    label: 'GST %',
                    value:
                        payload.gst_percentage != null
                            ? `${payload.gst_percentage}%`
                            : 'N/A',
                },
                {
                    label: 'Service Charge %',
                    value:
                        payload.service_charge_percentage != null
                            ? `${payload.service_charge_percentage}%`
                            : 'N/A',
                },
                {
                    label: 'Fixed Amount',
                    value: payload.is_fixed_amount ? 'Yes' : 'No',
                },
                {
                    label: 'Active',
                    value: payload.is_active ? 'Yes' : 'No',
                },
                {
                    label: 'Valid Now',
                    value: payload.is_valid ? 'Yes' : 'No',
                },
                {
                    label: 'Created At',
                    value: pgFormRetrieveFormatDate(payload.created_at),
                },
                {
                    label: 'Last Updated',
                    value: pgFormRetrieveFormatDate(payload.last_updated_at),
                },
            ];

            basicInfo.forEach((info) => {
                const row = document.createElement('tr');

                const labelCell = document.createElement('td');
                labelCell.className = 'label';
                labelCell.textContent = info.label;

                const valueCell = document.createElement('td');
                valueCell.className = 'value';

                if (info.isLink && info.value) {
                    const link = document.createElement('a');
                    link.href = info.value;
                    link.textContent = info.value;
                    link.target = '_blank';
                    link.className = 'result-link';
                    link.style.wordBreak = 'break-all';
                    valueCell.appendChild(link);
                } else {
                    valueCell.textContent = info.value;
                }

                row.appendChild(labelCell);
                row.appendChild(valueCell);
                mainTable.appendChild(row);
            });

            resultContent.appendChild(mainTable);

            // Additional sections
            const sections = [];

            // Product / Service
            const productData = {
                Description: payload.description,
                'Type of Goods': pgFormRetrieveFormatText(payload.type_of_goods),
                'Preferred Payment Method': pgFormRetrieveFormatText(
                    payload.preferred_mop_type
                ),
            };
            sections.push({ title: 'Product / Service', data: productData });

            // Form Settings
            const settingsData = {
                'Redirect URL': payload.redirect_url,
                'Thank You Message': payload.thank_you_message,
                'Valid From': pgFormRetrieveFormatDate(payload.valid_from),
                'Valid Until': pgFormRetrieveFormatDate(payload.valid_until),
            };
            sections.push({ title: 'Form Settings', data: settingsData });

            // Customer Data Collection
            const customerData = {
                'Collect Name': payload.collect_name ? 'Yes' : 'No',
                'Collect Email': payload.collect_email ? 'Yes' : 'No',
                'Collect Phone': payload.collect_phone ? 'Yes' : 'No',
                'Collect Address': payload.collect_address ? 'Yes' : 'No',
                'Collect PAN': payload.collect_pan ? 'Yes' : 'No',
                'Collect DOB': payload.collect_dob ? 'Yes' : 'No',
                'Auto-generate Invoice': payload.auto_generate_invoice
                    ? 'Yes'
                    : 'No',
            };
            sections.push({
                title: 'Customer Data Collection',
                data: customerData,
            });

            // Terms & Contact
            const termsData = {
                'Terms & Conditions': payload.terms_and_conditions,
                'Contact Email': payload.contact_email,
                'Contact Phone': payload.contact_phone,
                'Website URL': payload.website_url,
                'Support URL': payload.support_url,
            };
            sections.push({ title: 'Terms & Contact', data: termsData });

            // Social & Branding
            const brandingData = {
                'Twitter URL': payload.twitter_url,
                'Instagram URL': payload.instagram_url,
                'Facebook URL': payload.facebook_url,
                'LinkedIn URL': payload.linkedin_url,
                'Logo URL': payload.logo_url,
                'Primary Color': payload.primary_color,
            };
            sections.push({ title: 'Branding & Social', data: brandingData });

            sections.forEach((section) => {
                if (!section.data) return;
                const sectionDiv = document.createElement('div');
                sectionDiv.style.marginBottom = '20px';

                const sectionTitle = document.createElement('h3');
                sectionTitle.style.color = '#2d3748';
                sectionTitle.style.marginBottom = '12px';
                sectionTitle.textContent = section.title;

                const sectionTable = document.createElement('table');
                sectionTable.style.width = '100%';
                sectionTable.style.borderCollapse = 'collapse';

                Object.entries(section.data).forEach(([key, value]) => {
                    if (value === null || value === undefined || value === '') return;

                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #e2e8f0';

                    const labelCell = document.createElement('td');
                    labelCell.style.padding = '12px';
                    labelCell.style.fontWeight = '500';
                    labelCell.style.color = '#4a5568';
                    labelCell.style.width = '30%';
                    labelCell.textContent = key;

                    const valueCell = document.createElement('td');
                    valueCell.style.padding = '12px';
                    valueCell.style.fontWeight = '600';
                    valueCell.style.color = '#2d3748';

                    if (
                        (key.toLowerCase().includes('url') ||
                            key.toLowerCase().includes('link')) &&
                        typeof value === 'string'
                    ) {
                        const link = document.createElement('a');
                        link.href = value;
                        link.textContent = value;
                        link.target = '_blank';
                        link.style.color = 'rgb(38, 168, 135)';
                        link.style.textDecoration = 'none';
                        valueCell.appendChild(link);
                    } else {
                        valueCell.textContent = value;
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    sectionTable.appendChild(row);
                });

                sectionDiv.appendChild(sectionTitle);
                sectionDiv.appendChild(sectionTable);
                resultContent.appendChild(sectionDiv);
            });

            resultContainer.style.display = 'block';
        } catch (error) {
            pgFormRetrieveShowModal(
                'error',
                'Error',
                error.message || 'An error occurred while fetching form details'
            );
        }
    });

document.addEventListener('DOMContentLoaded', function () {
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('formId').value = 'PF1234567890';
        });
    }

    document
        .getElementById('clearResultsBtn')
        .addEventListener('click', function () {
            document.getElementById('formId').value = '';
            document.getElementById('resultContainer').style.display = 'none';
            document.getElementById('resultContent').textContent = '';
        });
});

