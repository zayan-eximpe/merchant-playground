/**
 * Payment Settlements Page Logic
 * Extracted from inline scripts for CSP compliance
 */

// Load saved credentials on page load
        document.addEventListener('DOMContentLoaded', function() {
            const savedClientId = localStorage.getItem('eximpe_client_id');
            const savedClientSecret = localStorage.getItem('eximpe_auth_key');

            if (savedClientId) {
                document.getElementById('clientId').value = savedClientId;
            }
            if (savedClientSecret) {
                document.getElementById('clientSecret').value = savedClientSecret;
            }

            // Add event listeners to save credentials when they change
            document.getElementById('clientId').addEventListener('change', function() {
                if (this.value.trim()) {
                    localStorage.setItem('eximpe_client_id', this.value);
                }
            });

            document.getElementById('clientSecret').addEventListener('change', function() {
                if (this.value.trim()) {
                    localStorage.setItem('eximpe_auth_key', this.value);
                }
            });
        });

        document.getElementById('paymentSettlementForm').addEventListener('submit', function(e) {
            e.preventDefault();
            searchPaymentSettlements();
        });

        async function searchPaymentSettlements() {
            const orderId = document.getElementById('orderId').value;
            const clientId = document.getElementById('clientId').value;
            const clientSecret = document.getElementById('clientSecret').value;

            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            const resultsSection = document.getElementById('resultsSection');
            const summaryCards = document.getElementById('summaryCards');

            // Validate required fields
            if (!orderId.trim()) {
                errorMessage.textContent = 'Payment ID is required.';
                errorMessage.classList.add('active');
                return;
            }
            if (!clientId.trim() || !clientSecret.trim()) {
                errorMessage.textContent = 'Client ID and Client Secret are required.';
                errorMessage.classList.add('active');
                return;
            }

            // Save to localStorage for convenience
            localStorage.setItem('eximpe_client_id', clientId);
            localStorage.setItem('eximpe_auth_key', clientSecret);

            // Show loading
            loading.classList.add('active');
            errorMessage.classList.remove('active');
            resultsSection.classList.remove('active');
            summaryCards.style.display = 'none';

            try {
                const url = `${window.API_URL}/pg/payments/${orderId}/settlement/`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': clientSecret,
                        'X-Client-ID': clientId
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                if (data.success) {
                    displayPaymentSettlements(data.data);
                    updateSummary(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch settlement details');
                }

            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = `Failed to fetch payment settlements: ${error.message}`;
                errorMessage.classList.add('active');
            } finally {
                loading.classList.remove('active');
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function displayPaymentSettlements(settlementData) {
            const tableBody = document.getElementById('paymentSettlementsTable');
            const resultsSection = document.getElementById('resultsSection');

            tableBody.textContent = '';

            if (!settlementData || !settlementData.settlement_details) {
                TrustedTypes.setInnerHTML(tableBody, `
                    <tr>
                        <td colspan="7" style="text-align: center); padding: 20px; color: #4a5568;">
                            No settlement details found for the specified payment.
                        </td>
                    </tr>
                `);
            } else {
                const details = settlementData.settlement_details;
                const row = document.createElement('tr');
                const settlementId = escapeHtml(details.settlement_id || 'N/A');
                const merchantTransactionId = escapeHtml(details.merchant_transaction_id || 'N/A');
                const netAmount = details.merchant_net_amount ? parseFloat(details.merchant_net_amount).toFixed(2) : '0.00';
                const completedDate = details.settlement_completed_date ? new Date(details.settlement_completed_date).toLocaleString() : 'N/A';
                const settlementStatus = escapeHtml(settlementData.settlement_status || 'Unknown');
                const statusClass = escapeHtml(settlementData.settlement_status.toLowerCase());

                TrustedTypes.setInnerHTML(row, `
                    <td>${settlementId}</td>
                    <td>${merchantTransactionId}</td>
                    <td>₹${netAmount}</td>
                    <td>${merchantTransactionId}</td>
                    <td>${completedDate}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${settlementStatus}
                        </span>
                    </td>
                    <td>${settlementId}</td>
                `);
                tableBody.appendChild(row);
            }

            resultsSection.classList.add('active');
        }

        function updateSummary(settlementData) {
            const summaryCards = document.getElementById('summaryCards');

            if (!settlementData || !settlementData.settlement_details) {
                summaryCards.style.display = 'none';
                return;
            }

            const details = settlementData.settlement_details;
            const totalAmount = parseFloat(details.merchant_net_amount) || 0;
            const completedCount = settlementData.settlement_status === 'SETTLED' ? 1 : 0;
            const pendingCount = settlementData.settlement_status !== 'SETTLED' ? 1 : 0;

            document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
            document.getElementById('totalCount').textContent = '1';
            document.getElementById('completedCount').textContent = completedCount;
            document.getElementById('pendingCount').textContent = pendingCount;

            summaryCards.style.display = 'grid';
        }

        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
