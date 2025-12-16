/**
 * Refund Details Page Logic
 * Extracted from inline scripts for CSP compliance
 */

// --- Modal logic ---
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
            TrustedTypes.setInnerHTML(modalMessage, message);
            modalOverlay.classList.add('active');
        }

        function hideModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === document.getElementById('modalOverlay')) hideModal();
        });

        // --- Load API config from localStorage ---
        document.addEventListener('DOMContentLoaded', function() {
            const clientIdInput = document.getElementById('clientId');
            const authKeyInput = document.getElementById('authKey');
            const savedClientId = localStorage.getItem('eximpe_client_id');
            const savedAuthKey = localStorage.getItem('eximpe_auth_key');
            if (savedClientId) clientIdInput.value = savedClientId;
            if (savedAuthKey) authKeyInput.value = savedAuthKey;

            clientIdInput.addEventListener('change', function() {
                if (this.value) localStorage.setItem('eximpe_client_id', this.value);
                else localStorage.removeItem('eximpe_client_id');
            });
            authKeyInput.addEventListener('change', function() {
                if (this.value) localStorage.setItem('eximpe_auth_key', this.value);
                else localStorage.removeItem('eximpe_auth_key');
            });
        });

        // --- Copy cURL function ---
        function copyCurl() {
            const curlContent = document.getElementById('curlContent').textContent;
            navigator.clipboard.writeText(curlContent).then(function() {
                showModal('success', 'Copied!', 'cURL command copied to clipboard');
            }, function() {
                showModal('error', 'Error', 'Failed to copy to clipboard');
            });
        }

        // --- Clear form function ---
        function clearForm() {
            // Store current auth credentials
            const currentAuthKey = document.getElementById('authKey').value;
            const currentClientId = document.getElementById('clientId').value;

            // Reset form
            document.getElementById('refundDetailsForm').reset();

            // Restore auth credentials
            document.getElementById('authKey').value = currentAuthKey;
            document.getElementById('clientId').value = currentClientId;

            // Hide response areas
            document.getElementById('responseArea').classList.remove('show');
            document.getElementById('refundDetailsDisplay').classList.remove('show');
        }

        // --- Show response function ---
        function showResponse(data) {
            const responseArea = document.getElementById('responseArea');
            const responseContent = document.getElementById('responseContent');
            responseContent.textContent = JSON.stringify(data, null, 2);
            responseArea.classList.add('show');
        }

        // --- Display refund details ---
        function displayRefundDetails(data) {
            if (!data.success || !data.data) return;

            const refundData = data.data;
            const detailsGrid = document.getElementById('detailsGrid');
            const refundDetailsDisplay = document.getElementById('refundDetailsDisplay');

            // Map status to badge class
            const getStatusClass = (status) => {
                switch(status?.toLowerCase()) {
                    case 'completed': case 'refunded': return 'completed';
                    case 'pending': case 'refund_pending': return 'pending';
                    case 'failed': case 'refund_failed': return 'failed';
                    case 'initiated': return 'initiated';
                    default: return 'pending';
                }
            };

            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // Format amount
            const formatAmount = (amount) => {
                if (!amount) return 'N/A';
                return typeof amount === 'number' ? `₹${amount.toFixed(2)}` : amount;
            };

            const refundId = escapeHtml(refundData.refund_id || 'N/A');
            const transactionId = escapeHtml(refundData.transaction_id || 'N/A');
            const refundStatus = escapeHtml(refundData.refund_status || 'Unknown');
            const statusClass = getStatusClass(refundData.refund_status);
            const bankRefNum = escapeHtml(refundData.bank_ref_num || 'N/A');
            const refundMode = escapeHtml(refundData.refund_mode || 'N/A');
            const requestId = escapeHtml(refundData.request_id || 'N/A');
            const statusMessage = escapeHtml(refundData.status_message || 'N/A');

            TrustedTypes.setInnerHTML(detailsGrid, `
                <div class="detail-item">
                    <div class="detail-label">Refund ID</div>
                    <div class="detail-value">${refundId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Transaction ID</div>
                    <div class="detail-value">${transactionId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="status-badge ${statusClass}">
                            ${refundStatus}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Refund Amount</div>
                    <div class="detail-value">${formatAmount(refundData.refund_amount)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Bank Reference</div>
                    <div class="detail-value">${bankRefNum}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Refund Mode</div>
                    <div class="detail-value">${refundMode}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Request ID</div>
                    <div class="detail-value">${requestId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status Message</div>
                    <div class="detail-value">${statusMessage}</div>
                </div>
            `);

            refundDetailsDisplay.classList.add('show');
        }

        // --- Form submission ---
        document.getElementById('refundDetailsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            hideModal();

            const clientId = document.getElementById('clientId').value;
            const authKey = document.getElementById('authKey').value;
            const refundId = document.getElementById('refundId').value;

            if (!clientId || !authKey || !refundId) {
                showModal('error', 'Validation Error', 'Please fill in Client ID, Client Secret, and Refund ID.');
                return;
            }

            const getDetailsButton = document.getElementById('getDetailsButton');
            const btnText = document.getElementById('btnText');
            getDetailsButton.disabled = true;
            btnText.textContent = 'Getting Details...';

            try {
                const response = await fetch(`/pg/refunds/${refundId}/`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Client-Secret': authKey,
                        'X-Client-ID': clientId
                    }
                });

                const data = await response.json();
                showResponse(data);

                if (data.success) {
                    displayRefundDetails(data);
                    showModal('success', 'Details Retrieved', 'Refund details retrieved successfully!');
                } else {
                    let errorMsg = '';
                    if (data.error && data.error.details) {
                        errorMsg += '<ul style="text-align:left; margin: 10px 0 0 0; padding-left: 18px;">';
                        function processErrors(errors, prefix = '') {
                            for (const [field, errorValue] of Object.entries(errors)) {
                                if (typeof errorValue === 'object' && !Array.isArray(errorValue)) {
                                    processErrors(errorValue, `${prefix}${field}.`);
                                } else {
                                    const errors = Array.isArray(errorValue) ? errorValue : [errorValue];
                                    errors.forEach(err => {
                                        errorMsg += `<li><strong>${field.replace(/\./g, ' ')}:</strong> ${err}</li>`;
                                    });
                                }
                            }
                        }
                        processErrors(data.error.details);
                        errorMsg += '</ul>';
                    }
                    showModal('error', data.error?.message || 'Request Failed', errorMsg);
                }
            } catch (error) {
                showModal('error', 'Error', error.message);
                showResponse({ error: error.message });
            } finally {
                getDetailsButton.disabled = false;
                btnText.textContent = 'Get Refund Details';
            }
        });
