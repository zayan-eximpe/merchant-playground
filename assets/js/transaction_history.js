/**
 * Transaction History Page Logic
 * Displays complete transaction history for a payment link
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

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatCurrency(amount, currency) {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR'
    }).format(amount);
}

function formatText(text) {
    if (!text) return 'N/A';
    return text.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Form submission and transaction history fetching
document.getElementById('transactionHistoryForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const historyCount = document.getElementById('historyCount');

    // Validate inputs
    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Please enter a Payment Link ID');
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/history/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            }
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to fetch transaction history';
            const errorCode = responseData.error?.code || 'UNKNOWN_ERROR';
            showModal('error', `Error (${errorCode})`, errorMessage);
            return;
        }

        const data = responseData.data;
        if (!data) {
            showModal('error', 'Error', 'No data received from the server');
            return;
        }

        // Clear previous results
        resultContent.textContent = '';

        // Get history items - could be in data.results or data.history or data directly as array
        let historyItems = [];
        if (Array.isArray(data)) {
            historyItems = data;
        } else if (data.results && Array.isArray(data.results)) {
            historyItems = data.results;
        } else if (data.history && Array.isArray(data.history)) {
            historyItems = data.history;
        }

        // Update count
        const count = historyItems.length;
        historyCount.textContent = `${count} transaction${count !== 1 ? 's' : ''} found`;

        if (historyItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.style.color = '#718096';
            emptyMessage.innerHTML = `
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block; color: #cbd5e0;"></i>
                <p style="font-size: 16px; margin: 0;">No transaction history found for this payment link</p>
            `;
            resultContent.appendChild(emptyMessage);
        } else {
            // Create timeline view
            const timeline = document.createElement('div');
            timeline.className = 'timeline';

            historyItems.forEach((transaction, index) => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'timeline-item';

                // Timeline dot
                const dot = document.createElement('div');
                dot.className = 'timeline-dot';

                // Timeline line (except for last item)
                if (index < historyItems.length - 1) {
                    const line = document.createElement('div');
                    line.className = 'timeline-line';
                    transactionItem.appendChild(line);
                }

                // Card content
                const card = document.createElement('div');
                card.className = 'result-card';
                card.style.marginTop = '0';

                // Card header with status
                const cardHeader = document.createElement('div');
                cardHeader.className = 'result-header';

                const timestamp = document.createElement('div');
                timestamp.style.color = '#4a5568';
                timestamp.style.fontSize = '14px';
                timestamp.style.fontWeight = '500';
                timestamp.innerHTML = `<i class="fas fa-clock"></i> ${formatDate(transaction.created_at || transaction.timestamp || transaction.date)}`;

                const statusBadge = document.createElement('span');
                const status = (transaction.status || 'unknown').toLowerCase();
                statusBadge.className = `status-badge status-${status}`;
                statusBadge.textContent = formatText(status);

                cardHeader.appendChild(timestamp);
                cardHeader.appendChild(statusBadge);

                // Card details table
                const detailsTable = document.createElement('table');
                detailsTable.className = 'result-table';

                const details = [];

                // Add relevant fields based on what's available
                if (transaction.payment_id) details.push({ label: 'Payment ID', value: transaction.payment_id });
                if (transaction.transaction_id) details.push({ label: 'Transaction ID', value: transaction.transaction_id });
                if (transaction.order_id) details.push({ label: 'Order ID', value: transaction.order_id });
                if (transaction.amount) details.push({ label: 'Amount', value: formatCurrency(transaction.amount, transaction.currency) });
                if (transaction.mop_type || transaction.payment_method) details.push({ label: 'Payment Method', value: formatText(transaction.mop_type || transaction.payment_method) });
                if (transaction.status_message || transaction.message) details.push({ label: 'Message', value: transaction.status_message || transaction.message });

                // Add any additional fields that might be present
                if (transaction.bank_reference) details.push({ label: 'Bank Reference', value: transaction.bank_reference });
                if (transaction.gateway_reference) details.push({ label: 'Gateway Reference', value: transaction.gateway_reference });

                details.forEach(detail => {
                    if (detail.value === null || detail.value === undefined || detail.value === '') return;

                    const row = document.createElement('tr');

                    const labelCell = document.createElement('td');
                    labelCell.className = 'label';
                    labelCell.textContent = detail.label;

                    const valueCell = document.createElement('td');
                    valueCell.className = 'value';
                    valueCell.style.wordBreak = 'break-word';
                    valueCell.textContent = detail.value;

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    detailsTable.appendChild(row);
                });

                card.appendChild(cardHeader);
                if (details.length > 0) {
                    card.appendChild(detailsTable);
                }

                transactionItem.appendChild(dot);
                transactionItem.appendChild(card);
                timeline.appendChild(transactionItem);
            });

            resultContent.appendChild(timeline);
        }

        // Show results
        resultContainer.style.display = 'block';
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while fetching transaction history');
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
        document.getElementById('historyCount').textContent = '';
    });
});
