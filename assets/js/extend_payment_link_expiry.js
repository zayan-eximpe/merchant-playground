/**
 * Extend Payment Link Expiry Page Logic
 * Extends the expiry date of an active payment link
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

// Form submission and extension logic
document.getElementById('extendExpiryForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const expiryDate = document.getElementById('expiryDate').value;
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    // Validate inputs
    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Please enter a Payment Link ID');
        return;
    }
    if (!expiryDate) {
        showModal('error', 'Validation Error', 'Please select a new expiry date');
        return;
    }

    // Convert local time to ISO string (UTC) for the API
    const isoExpiryDate = new Date(expiryDate).toISOString();

    try {
        const response = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/extend_expiry/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            },
            body: JSON.stringify({
                expiry_date: isoExpiryDate
            })
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to extend payment link expiry';
            const errorCode = responseData.error?.code || 'UNKNOWN_ERROR';
            showModal('error', `Error (${errorCode})`, errorMessage);
            return;
        }

        // Clear previous results
        resultContent.textContent = '';

        // Display success message
        const successDiv = document.createElement('div');
        successDiv.style.textAlign = 'center';
        successDiv.style.padding = '20px';

        const successIcon = document.createElement('div');
        successIcon.style.fontSize = '48px';
        successIcon.style.marginBottom = '16px';
        successIcon.textContent = '✅';

        const successTitle = document.createElement('h3');
        successTitle.style.color = 'rgb(38, 168, 135)';
        successTitle.style.marginBottom = '12px';
        successTitle.textContent = 'Expiry Date Extended';

        const successMessage = document.createElement('p');
        successMessage.style.color = '#4a5568';
        successMessage.style.fontSize = '16px';
        successMessage.style.marginBottom = '20px';
        successMessage.textContent = responseData.message || `The expiry date for payment link ${paymentLinkId} has been successfully updated.`;

        const detailsTable = document.createElement('table');
        detailsTable.className = 'result-table';
        detailsTable.style.maxWidth = '500px';
        detailsTable.style.margin = '20px auto';

        const details = [
            { label: 'Payment Link ID', value: paymentLinkId },
            { label: 'New Expiry Date', value: new Date(expiryDate).toLocaleString() },
            { label: 'Status', value: 'Active', isStatus: true }
        ];

        details.forEach(detail => {
            const row = document.createElement('tr');

            const labelCell = document.createElement('td');
            labelCell.className = 'label';
            labelCell.textContent = detail.label;

            const valueCell = document.createElement('td');
            valueCell.className = 'value';

            if (detail.isStatus) {
                const badge = document.createElement('span');
                badge.className = 'status-badge status-active';
                badge.textContent = detail.value;
                valueCell.appendChild(badge);
            } else {
                valueCell.textContent = detail.value;
            }

            row.appendChild(labelCell);
            row.appendChild(valueCell);
            detailsTable.appendChild(row);
        });

        successDiv.appendChild(successIcon);
        successDiv.appendChild(successTitle);
        successDiv.appendChild(successMessage);
        successDiv.appendChild(detailsTable);
        resultContent.appendChild(successDiv);

        // Show results
        resultContainer.style.display = 'block';

        // Show success modal
        showModal('success', 'Success', `Payment link ${paymentLinkId} expiry has been extended successfully.`);

    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while extending the payment link expiry');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Add sample data functionality
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('paymentLinkId').value = 'PR7265016505';

            // Set expiry to 7 days from now
            const now = new Date();
            now.setDate(now.getDate() + 7);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('expiryDate').value = now.toISOString().slice(0, 16);
        });
    }

    // Clear results functionality
    document.getElementById('clearResultsBtn').addEventListener('click', function () {
        document.getElementById('paymentLinkId').value = '';
        document.getElementById('expiryDate').value = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';
    });
});
