/**
 * Order Verification Page Logic
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

        // Load saved credentials on page load
        document.addEventListener('DOMContentLoaded', function() {
            const clientIdInput = document.getElementById('clientId');
            const authKeyInput = document.getElementById('authKey');
            const orderIdInput = document.getElementById('orderIdInput');

            // Load saved API credentials
            const savedClientId = localStorage.getItem('eximpe_client_id');
            const savedAuthKey = localStorage.getItem('eximpe_auth_key');
            if (savedClientId) clientIdInput.value = savedClientId;
            if (savedAuthKey) authKeyInput.value = savedAuthKey;

            // Load last used order ID if available
            const lastUsedOrderId = localStorage.getItem('last_used_order_id');
            if (lastUsedOrderId) {
                orderIdInput.value = lastUsedOrderId;
            }
        });

        document.getElementById('verificationForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const verifyButton = document.getElementById('verifyButton');
            const btnText = document.getElementById('btnText');

            verifyButton.disabled = true;
            btnText.textContent = 'Uploading Document...';

            try {
                const orderId = document.getElementById('orderIdInput').value;
                if (orderId) localStorage.setItem('last_used_order_id', orderId);
                const documentType = document.querySelector('input[name="document_type"]:checked').value;
                const documentFile = document.getElementById('documentFile').files[0];
                const identifier = document.getElementById('identifierInput').value;

                if (!orderId) {
                    throw new Error('Order ID is required');
                }

                if (!identifier) {
                    throw new Error('Document identifier is required');
                }

                if (!documentFile) {
                    throw new Error('Document file is required');
                }

                const formData = new FormData();
                formData.append('identifier', identifier);
                formData.append('document_type', documentType === 'invoice' ? 'invoice' : 'awb');
                formData.append('file', documentFile);

                const clientId = document.getElementById('clientId').value;
                const authKey = document.getElementById('authKey').value;

                // Save credentials to localStorage
                if (clientId) localStorage.setItem('eximpe_client_id', clientId);
                if (authKey) localStorage.setItem('eximpe_auth_key', authKey);

                const response = await fetch(`${window.API_URL}/pg/orders/${orderId}/documents/`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': authKey,
                        'X-Client-ID': clientId,
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.success !== false) {
                    showModal('success', 'Document Uploaded Successfully', 'Document has been uploaded to the order successfully!');
                    // Clear the form after successful upload
                    document.getElementById('documentFile').value = '';
                    document.getElementById('fileName').textContent = 'No file chosen';
                } else {
                    showModal('error', 'Upload Failed', data.error?.message || data.message || 'Failed to upload document. Please try again.');
                }
            } catch (error) {
                showModal('error', 'Error', error.message || 'An unexpected error occurred. Please try again.');
            } finally {
                verifyButton.disabled = false;
                btnText.textContent = 'Upload Document';
            }
        });

        function updateFileName() {
            const fileInput = document.getElementById('documentFile');
            const fileName = document.getElementById('fileName');
            fileName.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
        }

        function updateIdentifierField() {
            const documentType = document.querySelector('input[name="document_type"]:checked').value;
            const identifierInput = document.getElementById('identifierInput');
            const identifierHelperText = document.getElementById('identifierHelperText');

            if (documentType === 'invoice') {
                identifierInput.placeholder = 'Invoice Number';
                identifierHelperText.textContent = 'Enter the Invoice Number';
            } else if (documentType === 'shipping') {
                identifierInput.placeholder = 'AWB Number';
                identifierHelperText.textContent = 'Enter the AWB Number';
            }
        }

// Event listeners for CSP compliance (no inline event handlers)
document.addEventListener('DOMContentLoaded', function() {
    // Radio button event listeners for document type
    const radioButtons = document.querySelectorAll('[data-update-identifier]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateIdentifierField);
    });

    // File input event listener
    const fileInput = document.querySelector('[data-update-filename]');
    if (fileInput) {
        fileInput.addEventListener('change', updateFileName);
    }
});
