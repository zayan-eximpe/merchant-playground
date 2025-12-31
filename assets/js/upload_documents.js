/**
 * Upload Documents Page Logic for Payment Links
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

document.getElementById('uploadDocumentsForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const uploadButton = document.getElementById('uploadButton');
    const btnText = document.getElementById('btnText');

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const documentType = document.querySelector('input[name="document_type"]:checked').value;
    const documentFile = document.getElementById('documentFile').files[0];
    const identifier = document.getElementById('identifierInput').value.trim();

    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Payment Link ID is required');
        return;
    }

    if (!identifier) {
        showModal('error', 'Validation Error', 'Document identifier is required');
        return;
    }

    if (!documentFile) {
        showModal('error', 'Validation Error', 'Document file is required');
        return;
    }

    uploadButton.disabled = true;
    btnText.textContent = 'Processing...';

    try {
        // Step 1: Fetch Payment Link details to get the internal Order ID
        btnText.textContent = 'Fetching Link Details...';
        const detailsResponse = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            }
        });

        const detailsData = await detailsResponse.json();

        if (!detailsResponse.ok || !detailsData.success) {
            throw new Error(detailsData.error?.message || 'Failed to fetch payment link details');
        }

        const orderId = detailsData.data.order_id; // This is the internal PGOrder UID
        if (!orderId) {
            throw new Error('Could not find associated order for this payment link');
        }

        // Step 2: Upload the document using the Order ID
        btnText.textContent = 'Uploading Document...';
        const formData = new FormData();
        formData.append('identifier', identifier);
        formData.append('document_type', documentType === 'invoice' ? 'invoice' : 'awb');
        formData.append('file', documentFile);

        const uploadResponse = await fetch(`${window.API_URL}/pg/orders/${orderId}/documents/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            },
            body: formData
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok && uploadData.success !== false) {
            showModal('success', 'Success', 'Document has been uploaded successfully!');
            // Clear the form
            document.getElementById('documentFile').value = '';
            document.getElementById('fileName').textContent = 'No file chosen';
        } else {
            showModal('error', 'Upload Failed', uploadData.error?.message || uploadData.message || 'Failed to upload document');
        }
    } catch (error) {
        showModal('error', 'Error', error.message || 'An unexpected error occurred');
    } finally {
        uploadButton.disabled = false;
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
    const identifierLabel = document.getElementById('identifierLabel');
    const identifierHelperText = document.getElementById('identifierHelperText');

    if (documentType === 'invoice') {
        identifierLabel.textContent = 'Invoice Number';
        identifierInput.placeholder = 'Invoice Number';
        identifierHelperText.textContent = 'Enter the Invoice Number';
    } else {
        identifierLabel.textContent = 'AWB Number';
        identifierInput.placeholder = 'AWB Number';
        identifierHelperText.textContent = 'Enter the AWB Number';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Radio button event listeners
    const radioButtons = document.querySelectorAll('[data-update-identifier]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateIdentifierField);
    });

    // File input event listener
    const fileInput = document.querySelector('[data-update-filename]');
    if (fileInput) {
        fileInput.addEventListener('change', updateFileName);
    }

    // Sample data
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('paymentLinkId').value = 'PR7265016505';
            document.getElementById('identifierInput').value = 'INV-' + Math.floor(Math.random() * 10000);
        });
    }
});
