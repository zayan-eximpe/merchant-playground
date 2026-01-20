/**
 * Merchant Details Page Logic
 * Extracted from inline scripts for CSP compliance
 */

function createDetailItem(label, value) {
    const div = document.createElement('div');
    div.className = 'detail-item';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'detail-label';
    labelDiv.textContent = label;

    const valueDiv = document.createElement('div');
    valueDiv.className = 'detail-value';
    valueDiv.textContent = value || 'N/A';

    div.appendChild(labelDiv);
    div.appendChild(valueDiv);
    return div;
}

function createStatusBadge(status) {
    const statusMap = {
        'active': { class: 'active', icon: 'check-circle' },
        'pending': { class: 'pending', icon: 'clock' },
        'inactive': { class: 'inactive', icon: 'times-circle' }
    };
    const statusInfo = statusMap[status.toLowerCase()] || statusMap.pending;
    return `
                <div class="status-badge ${statusInfo.class}">
                    <i class="fas fa-${statusInfo.icon}"></i>
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            `;
}

function createDocumentLink(name, url) {
    return `
                <div class="detail-item">
                    <div class="detail-label">${name}</div>
                    <div class="detail-value">
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="header-button" style="padding: 8px 16px; font-size: 14px;">
                            <i class="fas fa-download"></i>
                            Download
                        </a>
                    </div>
                </div>
            `;
}

async function loadMerchantDetails() {
    const merchantId = document.getElementById('merchantIdInput').value.trim();
    if (!merchantId) {
        alert('Please enter a merchant ID');
        return;
    }

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('merchantDetails').style.display = 'none';

    try {
        const response = await fetch(`${window.API_URL}/partners/merchants/${merchantId}/`, {
            headers: {
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch merchant details');
        }

        const responseData = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to fetch merchant details');
        }

        const data = responseData.data;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('merchantDetails').style.display = 'block';

        // Populate Company Details
        const companyDetails = document.getElementById('companyDetails');
        companyDetails.textContent = '';
        companyDetails.appendChild(createDetailItem('Legal Name', data.company?.legal_name));
        companyDetails.appendChild(createDetailItem('Company Type', data.company?.company_type));
        companyDetails.appendChild(createDetailItem('Registration Number', data.company?.registration_number));
        companyDetails.appendChild(createDetailItem('Tax ID', data.company?.tax_id));
        companyDetails.appendChild(createDetailItem('Address', data.company?.address));
        companyDetails.appendChild(createDetailItem('Country', data.company?.country));

        // Populate Contact Details
        const contactDetails = document.getElementById('contactDetails');
        contactDetails.textContent = '';
        contactDetails.appendChild(createDetailItem('Email', data.contact?.email));
        contactDetails.appendChild(createDetailItem('Phone', data.contact?.phone_number));

        // Populate Business Details
        const businessDetails = document.getElementById('businessDetails');
        businessDetails.textContent = '';
        businessDetails.appendChild(createDetailItem('Business Category', data.business?.business_category));
        businessDetails.appendChild(createDetailItem('Purpose Code', data.business?.purpose_code));
        businessDetails.appendChild(createDetailItem('Commodity', data.business?.commodity));
        businessDetails.appendChild(createDetailItem('Payment Terms', data.business?.payment_terms));
        businessDetails.appendChild(createDetailItem('Website', data.business?.website));

        // Populate Bank Details
        const bankDetails = document.getElementById('bankDetails');
        bankDetails.textContent = '';
        bankDetails.appendChild(createDetailItem('Account Number', data.bank?.bank_account_number));
        bankDetails.appendChild(createDetailItem('Bank Name', data.bank?.bank_name));
        bankDetails.appendChild(createDetailItem('Bank Address', data.bank?.bank_address));

        // Populate Documents
        const documentDetails = document.getElementById('documentDetails');
        let documentsHtml = '';

        if (data.registration_documents?.length) {
            data.registration_documents.forEach((doc) => {
                documentsHtml += createDocumentLink(doc.name, doc.uploaded_file);
            });
        }

        if (data.business_licenses?.length) {
            data.business_licenses.forEach((doc) => {
                documentsHtml += createDocumentLink(doc.name, doc.uploaded_file);
            });
        }

        if (data.other_documents?.length) {
            data.other_documents.forEach((doc) => {
                documentsHtml += createDocumentLink(doc.name, doc.uploaded_file);
            });
        }

        if (documentsHtml) {
            TrustedTypes.setInnerHTML(documentDetails, documentsHtml);
        } else {
            documentDetails.textContent = '';
            documentDetails.appendChild(createDetailItem('Documents', 'No documents available'));
        }

        // Add KYC Status
        const kycStatus = document.createElement('div');
        kycStatus.className = 'details-section';

        const kycTitle = document.createElement('h2');
        kycTitle.className = 'section-title';
        TrustedTypes.setInnerHTML(kycTitle, '<i class="fas fa-shield-alt"></i> KYC Status');

        const kycGrid = document.createElement('div');
        kycGrid.className = 'details-grid';
        kycGrid.appendChild(createDetailItem('Status', data.kyc_status));
        kycGrid.appendChild(createDetailItem('Created At', new Date(data.created_at).toLocaleString()));

        kycStatus.appendChild(kycTitle);
        kycStatus.appendChild(kycGrid);
        document.getElementById('merchantDetails').appendChild(kycStatus);

    } catch (error) {
        console.error('Error loading merchant details:', error);
        TrustedTypes.setInnerHTML(document.getElementById('loading'), `
                    <div style="color: #e53e3e; text-align: center;">
                        <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                        <p style="margin-top: 16px;">${error.message}</p>
                    </div>
                `);
    }
}
