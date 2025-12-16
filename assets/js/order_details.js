/**
 * Order Details Page Logic
 * Extracted from inline scripts for CSP compliance
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
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === document.getElementById('modalOverlay')) hideModal();
        });

        // Form submission and data handling
        document.getElementById('orderDetailsForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const orderId = document.getElementById('orderId').value;
            const clientId = document.getElementById('clientId').value;
            const authKey = document.getElementById('authKey').value;
            const resultContainer = document.getElementById('resultContainer');
            const resultContent = document.getElementById('resultContent');

            // Validate inputs
            if (!orderId) {
                showModal('error', 'Validation Error', 'Please enter an Order ID');
                return;
            }
            if (!clientId || !authKey) {
                showModal('error', 'Validation Error', 'Please enter both Client ID and Client Secret');
                return;
            }

            // Save to localStorage for convenience
            if (clientId) localStorage.setItem('eximpe_client_id', clientId);
            if (authKey) localStorage.setItem('eximpe_auth_key', authKey);
            if (orderId) localStorage.setItem('last_used_order_id', orderId);
            try {
                const response = await fetch(`/pg/orders/${orderId}/`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': authKey,
                        'X-Client-ID': clientId
                    }
                });
                const responseData = await response.json();

                if (!response.ok || !responseData.success) {
                    const errorMessage = responseData.error?.message || 'Failed to fetch order details';
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

                // Add basic order information
                const basicInfo = [
                    { label: 'Order ID', value: data.order_id || 'N/A' },
                    { label: 'Reference ID', value: data.reference_id || 'N/A' },
                    { label: 'Amount', value: formatCurrency(data.amount, data.currency) },
                    { label: 'Currency', value: data.currency || 'N/A' },
                    { label: 'Payment Method', value: data.mop_type || 'N/A' },
                    { label: 'Status', value: formatText(data.status) },
                    { label: 'Status Message', value: data.status_message || 'N/A' },
                    { label: 'Created At', value: formatDate(data.created_at) },
                ];

                // Create main table
                const mainTable = document.createElement('table');
                mainTable.style.width = '100%';
                mainTable.style.borderCollapse = 'collapse';
                mainTable.style.marginBottom = '20px';

                basicInfo.forEach(info => {
                    const row = document.createElement('tr');
                    row.style.borderBottom = '1px solid #e2e8f0';

                    const labelCell = document.createElement('td');
                    labelCell.style.padding = '12px';
                    labelCell.style.fontWeight = '500';
                    labelCell.style.color = '#4a5568';
                    labelCell.style.width = '30%';
                    labelCell.textContent = info.label;

                    const valueCell = document.createElement('td');
                    valueCell.style.padding = '12px';
                    valueCell.style.fontWeight = '600';
                    valueCell.style.color = '#2d3748';
                    valueCell.textContent = info.value;

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    mainTable.appendChild(row);
                });

                resultContent.appendChild(mainTable);

                // Add sections for customer, product, invoice, and payment details
                const sections = [];

                // Buyer Details
                if (data.buyer) {
                    const buyerData = {};
                    buyerData['Name'] = data.buyer.name;
                    buyerData['Email'] = data.buyer.email;
                    buyerData['Phone'] = data.buyer.phone;
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
                        'Type of Goods': data.product.type_of_goods
                    };
                    sections.push({ title: 'Product Details', data: productData });
                }

                // Invoice Details
                if (data.invoice) {
                    const invoiceData = {
                        'Number': data.invoice.number,
                        'Date': data.invoice.date,
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
                            if (value === null || value === undefined || value === '') return; // Skip empty values

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

                // Payment Requests Section
                if (data.payments && data.payments.length > 0) {
                    const paymentSection = document.createElement('div');
                    paymentSection.style.marginBottom = '20px';

                    const paymentTitle = document.createElement('h3');
                    paymentTitle.style.color = '#2d3748';
                    paymentTitle.style.marginBottom = '12px';
                    paymentTitle.textContent = 'Payment Requests';

                    data.payments.forEach((payment, index) => {
                        if (!payment) return;

                        const paymentDiv = document.createElement('div');
                        paymentDiv.style.marginBottom = '16px';
                        paymentDiv.style.padding = '16px';
                        paymentDiv.style.backgroundColor = '#f8f9fa';
                        paymentDiv.style.borderRadius = '8px';
                        paymentDiv.style.border = '1px solid #e9ecef';

                        const paymentSubTitle = document.createElement('h4');
                        paymentSubTitle.style.color = '#2d3748';
                        paymentSubTitle.style.marginBottom = '12px';
                        paymentSubTitle.style.fontSize = '16px';
                        paymentSubTitle.textContent = `Payment Request ${index + 1}`;

                        const paymentTable = document.createElement('table');
                        paymentTable.style.width = '100%';
                        paymentTable.style.borderCollapse = 'collapse';

                        const paymentData = [
                            { label: 'Payment ID', value: payment.payment_id },
                            { label: 'Status', value: formatText(payment.status) },
                            { label: 'Payment Method', value: payment.mop_type },
                            { label: 'Status Message', value: payment.status_message },
                            { label: 'Settlement Status', value: payment.settlement ? formatText(payment.settlement.status) : 'N/A' },
                            { label: 'Settlement Message', value: payment.settlement ? payment.settlement.message : 'N/A' },
                            { label: 'Created At', value: formatDate(payment.created_at) }
                        ];

                        paymentData.forEach(item => {
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
                            valueCell.textContent = item.value;

                            row.appendChild(labelCell);
                            row.appendChild(valueCell);
                            paymentTable.appendChild(row);
                        });

                        paymentDiv.appendChild(paymentSubTitle);
                        paymentDiv.appendChild(paymentTable);

                        // Settlement Details Sub-section
                        if (payment.settlement && payment.settlement.settlement_details) {
                            const settlementDiv = document.createElement('div');
                            settlementDiv.style.marginTop = '16px';
                            settlementDiv.style.padding = '12px';
                            settlementDiv.style.backgroundColor = '#ffffff';
                            settlementDiv.style.borderRadius = '6px';
                            settlementDiv.style.border = '1px solid #dee2e6';

                            const settlementSubTitle = document.createElement('h5');
                            settlementSubTitle.style.color = '#2d3748';
                            settlementSubTitle.style.marginBottom = '8px';
                            settlementSubTitle.style.fontSize = '14px';
                            settlementSubTitle.style.fontWeight = '600';
                            settlementSubTitle.textContent = 'Settlement Details';

                            const settlementTable = document.createElement('table');
                            settlementTable.style.width = '100%';
                            settlementTable.style.borderCollapse = 'collapse';

                            const settlement = payment.settlement.settlement_details;
                            const settlementData = [
                                { label: 'Settlement ID', value: settlement.settlement_id },
                                { label: 'Settlement Date', value: settlement.settlement_completed_date ? formatDate(settlement.settlement_completed_date) : 'N/A' },
                                { label: 'Transaction Amount', value: formatCurrency(settlement.transaction_amount, settlement.transaction_currency) },
                                { label: 'Merchant Net Amount', value: formatCurrency(settlement.merchant_net_amount, settlement.settlement_currency) },
                                { label: 'Service Fee', value: formatCurrency(settlement.merchant_service_fee_cents / 100, settlement.settlement_currency) },
                                { label: 'Service Tax', value: formatCurrency(settlement.merchant_service_tax_cents / 100, settlement.settlement_currency) },
                                { label: 'SGST', value: formatCurrency(settlement.sgst, settlement.settlement_currency) },
                                { label: 'CGST', value: formatCurrency(settlement.cgst, settlement.settlement_currency) },
                                { label: 'IGST', value: formatCurrency(settlement.igst, settlement.settlement_currency) },
                                { label: 'Total Processing Fee', value: formatCurrency(settlement.total_processing_fee, settlement.settlement_currency) },
                                { label: 'Total Service Tax', value: formatCurrency(settlement.total_service_tax, settlement.settlement_currency) },
                                { label: 'Card Type', value: settlement.card_type },
                                { label: 'Merchant Transaction ID', value: settlement.merchant_transaction_id },
                                { label: 'Forex Amount', value: settlement.forex_rate ? formatCurrency(settlement.forex_rate, settlement.settlement_currency) : 'N/A' },
                                { label: 'Discount', value: formatCurrency(settlement.discount, settlement.settlement_currency) },
                                { label: 'Additional TDR Fee', value: formatCurrency(settlement.additional_tdr_fee, settlement.settlement_currency) },
                                { label: 'Additional TDR Tax', value: formatCurrency(settlement.additional_tdr_tax, settlement.settlement_currency) }
                            ];

                            settlementData.forEach(item => {
                                if (item.value === null || item.value === undefined || item.value === '' || item.value === 'N/A') return;

                                const row = document.createElement('tr');
                                row.style.borderBottom = '1px solid #f1f3f4';

                                const labelCell = document.createElement('td');
                                labelCell.style.padding = '6px 8px';
                                labelCell.style.fontWeight = '500';
                                labelCell.style.color = '#6c757d';
                                labelCell.style.width = '45%';
                                labelCell.style.fontSize = '13px';
                                labelCell.textContent = item.label;

                                const valueCell = document.createElement('td');
                                valueCell.style.padding = '6px 8px';
                                valueCell.style.fontWeight = '600';
                                valueCell.style.color = '#495057';
                                valueCell.style.fontSize = '13px';
                                valueCell.textContent = item.value;

                                row.appendChild(labelCell);
                                row.appendChild(valueCell);
                                settlementTable.appendChild(row);
                            });

                            settlementDiv.appendChild(settlementSubTitle);
                            settlementDiv.appendChild(settlementTable);
                            paymentDiv.appendChild(settlementDiv);
                        }

                        paymentSection.appendChild(paymentDiv);
                    });

                    paymentSection.insertBefore(paymentTitle, paymentSection.firstChild);
                    resultContent.appendChild(paymentSection);
                }

                // Show results
                resultContainer.style.display = 'block';
            } catch (error) {
                showModal('error', 'Error', error.message || 'An error occurred while fetching order details');
            }
        });
        document.addEventListener('DOMContentLoaded', function() {
            const clientIdInput = document.getElementById('clientId');
            const authKeyInput = document.getElementById('authKey');
            const orderIdInput = document.getElementById('orderId');

            // Load saved API credentials
            const savedClientId = localStorage.getItem('eximpe_client_id');
            const savedAuthKey = localStorage.getItem('eximpe_auth_key');
            if (savedClientId) clientIdInput.value = savedClientId;
            if (savedAuthKey) authKeyInput.value = savedAuthKey;

            // Load last used order ID if available
            const lastUsedOrderId = localStorage.getItem('last_used_order_id');
            if (lastUsedOrderId) {
                orderIdInput.value = lastUsedOrderId;
                localStorage.setItem('last_used_order_id_in_order_details', lastUsedOrderId);
            }

            // Add clear results functionality
            document.getElementById('clearResultsBtn').addEventListener('click', function() {
                document.getElementById('orderId').value = '';
                document.getElementById('resultContainer').style.display = 'none';
                document.getElementById('resultContent').textContent = '';
            });
        });
