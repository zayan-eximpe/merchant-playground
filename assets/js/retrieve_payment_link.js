/**
 * Retrieve Payment Link Page Logic
 * Fetches detailed information about a specific payment link by ID
 */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showModal(type, title, message) {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');
    modalBox.className = 'modal ' + type;
    modalIcon.textContent = type === 'success' ? '✅' : '❌';
    modalTitle.textContent = title;
    modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
    TrustedTypes.setInnerHTML(modalMessage, escapeHtml(message));
    modalOverlay.classList.add('active');
}

function hideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('modalOverlay')) hideModal();
});

// Form submission and data handling
document.getElementById('retrievePaymentLinkForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    // Validate inputs
    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Please enter a Payment Link ID');
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            }
        });
        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to fetch payment link details';
            const errorCode = responseData.error?.code || 'UNKNOWN_ERROR';
            showModal('error', `Error (${errorCode})`, errorMessage);
            return;
        }

        const data = responseData.data;
        if (!data) {
            showModal('error', 'Error', 'No data received from the server');
            return;
        }

        // Clear previous results
        resultContent.textContent = '';

        // Format helpers
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        };
        const formatCurrency = (amount, currency) => {
            if (!amount) return 'N/A';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency || 'INR'
            }).format(amount);
        };
        const formatText = (text) => {
            if (!text) return 'N/A';
            return text.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // Add basic payment link information
        const basicInfo = [
            { label: 'Payment ID', value: data.payment_id || 'N/A' },
            { label: 'Reference ID', value: data.reference_id || 'N/A' },
            { label: 'Amount', value: data.amount ? formatCurrency(data.amount, data.currency) : 'N/A' },
            { label: 'Currency', value: data.currency || 'N/A' },
            { label: 'Payment Link', value: data.payment_link || 'N/A', isLink: true },
            { label: 'Payment Method', value: data.mop_type || 'N/A' },
            { label: 'Status', value: formatText(data.status), isStatus: true, statusValue: data.status },
            { label: 'Status Message', value: data.status_message || 'N/A' },
            { label: 'Created At', value: formatDate(data.created_at) },
        ];

        // Create main table
        const mainTable = document.createElement('table');
        mainTable.className = 'result-table';
        mainTable.style.marginBottom = '20px';

        basicInfo.forEach(info => {
            const row = document.createElement('tr');

            const labelCell = document.createElement('td');
            labelCell.className = 'label';
            labelCell.textContent = info.label;

            const valueCell = document.createElement('td');
            valueCell.className = 'value';

            if (info.isStatus) {
                const badge = document.createElement('span');
                badge.className = `status-badge status-${(info.statusValue || 'unknown').toLowerCase()}`;
                badge.textContent = info.value;
                valueCell.appendChild(badge);
            } else if (info.isLink && info.value !== 'N/A') {
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

        // Add sections for buyer, product, invoice, settlement
        const sections = [];

        // Settlement Details
        if (data.settlement) {
            const settlementData = {
                'Status': formatText(data.settlement.status),
                'Message': data.settlement.message
            };
            sections.push({ title: 'Settlement Information', data: settlementData });
        }

        // Buyer Details
        if (data.buyer) {
            const buyerData = {};
            buyerData['Name'] = data.buyer.name;
            buyerData['Email'] = data.buyer.email;
            buyerData['Phone'] = data.buyer.phone;
            buyerData['PAN Number'] = data.buyer.pan_number;
            buyerData['Date of Birth'] = data.buyer.dob;
            if (data.buyer.address) {
                buyerData['Address Line 1'] = data.buyer.address.line_1;
                buyerData['Address Line 2'] = data.buyer.address.line_2;
                buyerData['City'] = data.buyer.address.city;
                buyerData['State'] = data.buyer.address.state;
                buyerData['Postal Code'] = data.buyer.address.postal_code;
            }
            sections.push({ title: 'Buyer Details', data: buyerData });
        }

        // Product Details
        if (data.product) {
            const productData = {
                'Name': data.product.name,
                'Description': data.product.description,
                'HS Code': data.product.hs_code,
                'HS Code Description': data.product.hs_code_description,
                'Type of Goods': formatText(data.product.type_of_goods)
            };
            sections.push({ title: 'Product Details', data: productData });
        }

        // Invoice Details
        if (data.invoice) {
            const invoiceData = {
                'Number': data.invoice.number,
                'Date': data.invoice.date ? formatDate(data.invoice.date) : 'N/A',
            };
            if (data.invoice.file) {
                invoiceData['Document'] = data.invoice.file;
            }
            sections.push({ title: 'Invoice Details', data: invoiceData });
        }

        sections.forEach(section => {
            if (section.data) {
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

                    if (key === 'Document' && value) {
                        const link = document.createElement('a');
                        link.href = value;
                        link.textContent = 'View Document';
                        link.target = '_blank';
                        link.style.color = 'rgb(38, 168, 135)';
                        link.style.textDecoration = 'none';
                        valueCell.appendChild(link);
                    } else {
                        valueCell.textContent = value || 'N/A';
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    sectionTable.appendChild(row);
                });

                sectionDiv.appendChild(sectionTitle);
                sectionDiv.appendChild(sectionTable);
                resultContent.appendChild(sectionDiv);
            }
        });

        // AWB Details Section
        if (data.air_waybills && data.air_waybills.length > 0) {
            const awbSection = document.createElement('div');
            awbSection.style.marginBottom = '20px';

            const awbTitle = document.createElement('h3');
            awbTitle.style.color = '#2d3748';
            awbTitle.style.marginBottom = '12px';
            awbTitle.textContent = 'AWB Details';

            data.air_waybills.forEach((awb, index) => {
                const awbDiv = document.createElement('div');
                awbDiv.style.marginBottom = '16px';
                awbDiv.style.padding = '16px';
                awbDiv.style.backgroundColor = '#f8f9fa';
                awbDiv.style.borderRadius = '8px';
                awbDiv.style.border = '1px solid #e9ecef';

                const awbSubTitle = document.createElement('h4');
                awbSubTitle.style.color = '#2d3748';
                awbSubTitle.style.marginBottom = '8px';
                awbSubTitle.style.fontSize = '16px';
                awbSubTitle.textContent = `AWB ${index + 1}`;

                const awbTable = document.createElement('table');
                awbTable.style.width = '100%';
                awbTable.style.borderCollapse = 'collapse';

                const awbData = [
                    { label: 'AWB Number', value: awb.number },
                ];

                if (awb.file) {
                    awbData.push({ label: 'Document', value: awb.file, isFile: true });
                }

                awbData.forEach(item => {
                    if (item.value === null || item.value === undefined || item.value === '') return;

                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #e2e8f0';

                    const labelCell = document.createElement('td');
                    labelCell.style.padding = '8px 12px';
                    labelCell.style.fontWeight = '500';
                    labelCell.style.color = '#4a5568';
                    labelCell.style.width = '40%';
                    labelCell.textContent = item.label;

                    const valueCell = document.createElement('td');
                    valueCell.style.padding = '8px 12px';
                    valueCell.style.fontWeight = '600';
                    valueCell.style.color = '#2d3748';

                    if (item.isFile && item.value) {
                        const link = document.createElement('a');
                        link.href = item.value;
                        link.textContent = 'View AWB Document';
                        link.target = '_blank';
                        link.style.color = 'rgb(38, 168, 135)';
                        link.style.textDecoration = 'none';
                        valueCell.appendChild(link);
                    } else {
                        valueCell.textContent = item.value;
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    awbTable.appendChild(row);
                });

                awbDiv.appendChild(awbSubTitle);
                awbDiv.appendChild(awbTable);
                awbSection.appendChild(awbDiv);
            });

            awbSection.insertBefore(awbTitle, awbSection.firstChild);
            resultContent.appendChild(awbSection);
        }

        // Show results
        resultContainer.style.display = 'block';
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while fetching payment link details');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Add sample data functionality
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('paymentLinkId').value = 'PR7265016505';
        });
    }

    // Add clear results functionality
    document.getElementById('clearResultsBtn').addEventListener('click', function () {
        document.getElementById('paymentLinkId').value = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';
    });
});
