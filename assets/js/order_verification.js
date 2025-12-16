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

                const response = await fetch(`${window.API_URL}/pg/orders/${orderId}/documents/`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
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
