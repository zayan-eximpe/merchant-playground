/**
 * Refund Page Logic
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

            // Reset form
            document.getElementById('refundForm').reset();

            // Hide response area
            document.getElementById('responseArea').classList.remove('show');
        }

        // --- Show response function ---
        function showResponse(data) {
            const responseArea = document.getElementById('responseArea');
            const responseContent = document.getElementById('responseContent');
            responseContent.textContent = JSON.stringify(data, null, 2);
            responseArea.classList.add('show');
        }

        // --- Form submission ---
        document.getElementById('refundForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            hideModal();
            const paymentId = document.getElementById('paymentId').value;

            if (!paymentId) {
                showModal('error', 'Validation Error', 'Please fill in Payment ID.');
                return;
            }

            const refundButton = document.getElementById('refundButton');
            const btnText = document.getElementById('btnText');
            refundButton.disabled = true;
            btnText.textContent = 'Processing...';

            try {
                const requestBody = {
                    payment_id: paymentId
                };

                // Add optional fields if provided
                const refundAmount = document.getElementById('refundAmount').value;
                const callbackUrl = document.getElementById('callbackUrl').value;

                if (refundAmount) requestBody.refund_amount = refundAmount;
                if (callbackUrl) requestBody.callback_url = callbackUrl;

                const response = await fetch('/pg/refunds/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                        ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                showResponse(data);

                if (data.success) {
                    showModal('success', 'Refund Processed', 'Refund request has been processed successfully!');
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
                    showModal('error', data.error?.message || 'Refund Failed', errorMsg);
                }
            } catch (error) {
                showModal('error', 'Error', error.message);
                showResponse({ error: error.message });
            } finally {
                refundButton.disabled = false;
                btnText.textContent = 'Process Refund';
            }
        });
