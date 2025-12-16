/**
 * Edit Order Page Logic
 * Extracted from inline scripts for CSP compliance
 */

// --- Modal logic (reuse from create_session.html) ---
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
            modalMessage.textContent = message;
            modalOverlay.classList.add('active');
        }
        function hideModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }
        document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === document.getElementById('modalOverlay')) hideModal();
        });

        // --- Fetch and populate order details for editable fields only ---
        async function fetchAndPopulateOrder() {
            const orderId = document.getElementById('orderIdInput').value.trim();
            if (!orderId) {
                showModal('error', 'Validation Error', 'Please enter Order ID');
                return;
            }
            try {
                const response = await fetch(`/pg/orders/${orderId}/`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID')
                    }
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    showModal('error', 'Error', data.error?.message || 'Failed to fetch order details');
                    return;
                }
                const order = data.data;

                // Populate buyer PAN number if available
                if (order.buyer && order.buyer.pan_number) {
                    document.getElementById('buyerPan').value = order.buyer.pan_number;
                }

                // Populate buyer DOB if available
                if (order.buyer && order.buyer.dob) {
                    document.getElementById('buyerDob').value = order.buyer.dob;
                }

                // Populate invoice details if available
                if (order.invoice) {
                    if (order.invoice.number) {
                        document.getElementById('invoiceNumber').value = order.invoice.number;
                    }
                    if (order.invoice.date) {
                        document.getElementById('invoiceDate').value = order.invoice.date;
                    }
                }
                // Store current orderId for PATCH
                window.currentEditOrderId = orderId;
            } catch (error) {
                showModal('error', 'Error', error.message || 'Failed to fetch order details');
            }
        }

        document.getElementById('fetchOrderBtn').addEventListener('click', fetchAndPopulateOrder);

        // --- PATCH on submit using the entered Order ID ---
        document.getElementById('editOrderForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            hideModal();
            const orderId = document.getElementById('orderIdInput').value.trim();
            if (!orderId) {
                showModal('error', 'Validation Error', 'Please enter Order ID.');
                return;
            }
            const updateButton = document.getElementById('updateButton');
            const btnText = document.getElementById('btnText');
            updateButton.disabled = true;
            btnText.textContent = 'Updating...';
            try {
                const requestData = {};

                // Buyer details
                const buyerPanValue = document.getElementById('buyerPan').value;
                const buyerDobValue = document.getElementById('buyerDob').value;
                if (buyerPanValue || buyerDobValue) {
                    requestData.buyer = {};
                    if (buyerPanValue) requestData.buyer.pan_number = buyerPanValue;
                    if (buyerDobValue) requestData.buyer.dob = buyerDobValue;
                }

                // Invoice details
                const invoiceNumber = document.getElementById('invoiceNumber').value;
                const invoiceDate = document.getElementById('invoiceDate').value;
                if (invoiceNumber || invoiceDate) {
                    requestData.invoice = {};
                    if (invoiceNumber) requestData.invoice.number = invoiceNumber;
                    if (invoiceDate) requestData.invoice.date = invoiceDate;
                }

                // PATCH request with JSON data
                const response = await fetch(`/pg/orders/${orderId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID')
                    },
                    body: JSON.stringify(requestData)
                });
                const data = await response.json();
                if (data.success) {
                    showModal('success', 'Order Updated', 'Order updated successfully!');
                } else {
                    let errorMsg = '';
                    if (data.error && data.error.details) {
                        errorMsg += 'Validation errors:\n';
                        function processErrors(errors, prefix = '') {
                            for (const [field, errorValue] of Object.entries(errors)) {
                                if (typeof errorValue === 'object' && !Array.isArray(errorValue)) {
                                    processErrors(errorValue, `${prefix}${field}.`);
                                } else {
                                    const errors = Array.isArray(errorValue) ? errorValue : [errorValue];
                                    errors.forEach(err => {
                                        errorMsg += `• ${field.replace(/\./g, ' ')}: ${err}\n`;
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
                updateButton.disabled = false;
                btnText.textContent = 'Update Order';
            }
        });

        function clearCache() {
            // Store current Client Secret, client ID, and order ID
            const currentOrderId = document.getElementById('orderIdInput').value;
            // Reset form
            document.getElementById('editOrderForm').reset();
            document.getElementById('orderIdInput').value = currentOrderId;
        }

// Event listeners for CSP compliance (no inline event handlers)
document.addEventListener('DOMContentLoaded', function() {
    // Clear cache button
    const clearCacheButton = document.querySelector('[data-action="clearCache"]');
    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', function(e) {
            e.preventDefault();
            clearCache();
        });
    }
});
