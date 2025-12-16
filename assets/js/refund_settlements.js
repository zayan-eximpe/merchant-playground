/**
 * Refund Settlements Page Logic
 * Extracted from inline scripts for CSP compliance
 */


        document.getElementById('refundSettlementForm').addEventListener('submit', function(e) {
            e.preventDefault();
            searchRefundSettlements();
        });

        async function searchRefundSettlements() {
            const refundId = document.getElementById('refundId').value;

            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            const resultsSection = document.getElementById('resultsSection');
            const summaryCards = document.getElementById('summaryCards');

            // Validate required fields
            if (!refundId.trim()) {
                errorMessage.textContent = 'Refund ID is required.';
                errorMessage.classList.add('active');
                return;
            }

            // Show loading
            loading.classList.add('active');
            errorMessage.classList.remove('active');
            resultsSection.classList.remove('active');
            summaryCards.style.display = 'none';

            try {
                const url = `${window.API_URL}/pg/refunds/${refundId}/settlement/`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                if (data.success) {
                    displayRefundSettlements(data.data);
                    updateSummary(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch settlement details');
                }

            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = `Failed to fetch refund settlements: ${error.message}`;
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

        function displayRefundSettlements(settlementData) {
            const tableBody = document.getElementById('refundSettlementsTable');
            const resultsSection = document.getElementById('resultsSection');

            tableBody.textContent = '';

            if (!settlementData || !settlementData.settlement_details) {
                TrustedTypes.setInnerHTML(tableBody, `
                    <tr>
                        <td colspan="7" style="text-align: center); padding: 20px; color: #4a5568;">
                            No settlement details found for the specified refund.
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
