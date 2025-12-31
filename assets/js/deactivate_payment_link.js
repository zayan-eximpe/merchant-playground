/**
 * Deactivate Payment Link Page Logic
 * Deactivates an active payment link to prevent further payments
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

// Form submission and deactivation logic
document.getElementById('deactivatePaymentLinkForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    // Validate inputs
    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Please enter a Payment Link ID');
        return;
    }

    // Confirm deactivation
    const confirmed = confirm(
        `Are you sure you want to deactivate payment link "${paymentLinkId}"?\n\n` +
        'This action cannot be undone. The payment link will no longer accept payments.'
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/deactivate/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            }
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to deactivate payment link';
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
        successTitle.textContent = 'Payment Link Deactivated';

        const successMessage = document.createElement('p');
        successMessage.style.color = '#4a5568';
        successMessage.style.fontSize = '16px';
        successMessage.style.marginBottom = '20px';
        successMessage.textContent = responseData.message || `Payment link ${paymentLinkId} has been successfully deactivated.`;

        const detailsTable = document.createElement('table');
        detailsTable.className = 'result-table';
        detailsTable.style.maxWidth = '500px';
        detailsTable.style.margin = '20px auto';

        const details = [
            { label: 'Payment Link ID', value: paymentLinkId },
            { label: 'Status', value: 'Deactivated', isStatus: true },
            { label: 'Deactivated At', value: new Date().toLocaleString() }
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
                badge.className = 'status-badge status-deactivated';
                badge.textContent = detail.value;
                valueCell.appendChild(badge);
            } else {
                valueCell.textContent = detail.value;
            }

            row.appendChild(labelCell);
            row.appendChild(valueCell);
            detailsTable.appendChild(row);
        });

        const noteDiv = document.createElement('div');
        noteDiv.style.marginTop = '24px';
        noteDiv.style.padding = '16px';
        noteDiv.style.backgroundColor = '#fff3cd';
        noteDiv.style.borderRadius = '8px';
        noteDiv.style.border = '1px solid #ffeeba';
        noteDiv.style.color = '#856404';
        noteDiv.style.fontSize = '14px';
        noteDiv.innerHTML = '<strong>Note:</strong> This payment link can no longer be used to accept payments. Any attempts to pay using this link will be rejected.';

        successDiv.appendChild(successIcon);
        successDiv.appendChild(successTitle);
        successDiv.appendChild(successMessage);
        successDiv.appendChild(detailsTable);
        successDiv.appendChild(noteDiv);
        resultContent.appendChild(successDiv);

        // Show results
        resultContainer.style.display = 'block';

        // Show success modal
        showModal('success', 'Success', `Payment link ${paymentLinkId} has been deactivated successfully.`);

        // Clear the form
        document.getElementById('paymentLinkId').value = '';
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while deactivating the payment link');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Add sample data functionality
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('paymentLinkId').value = 'PR7265016505';
        });
    }

    // Clear results functionality
    document.getElementById('clearResultsBtn').addEventListener('click', function () {
        document.getElementById('paymentLinkId').value = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';
    });
});
