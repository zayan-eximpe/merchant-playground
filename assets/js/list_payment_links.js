/**
 * List Payment Links Page Logic
 * Displays all payment links with pagination support
 */

let currentPage = 1;
let currentPageSize = 10;
let nextPageUrl = null;
let prevPageUrl = null;

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
    return date.toLocaleString();
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

async function fetchPaymentLinks(page = 1, pageSize = 10) {
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString()
        });

        const response = await fetch(`${window.API_URL}/pg/payment-links/?${params}`, {
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
            const errorMessage = responseData.error?.message || 'Failed to fetch payment links';
            const errorCode = responseData.error?.code || 'UNKNOWN_ERROR';
            showModal('error', `Error (${errorCode})`, errorMessage);
            return;
        }

        const data = responseData.data;
        if (!data || !data.results) {
            showModal('error', 'Error', 'No data received from the server');
            return;
        }

        // Update pagination state
        currentPage = page;
        currentPageSize = pageSize;
        nextPageUrl = data.next;
        prevPageUrl = data.previous;

        // Clear previous results
        resultContent.textContent = '';

        // Update pagination info
        const totalCount = data.count || 0;
        const startIndex = (page - 1) * pageSize + 1;
        const endIndex = Math.min(page * pageSize, totalCount);
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalCount} payment links`;

        // Display payment links
        if (data.results.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.style.color = '#718096';
            emptyMessage.textContent = 'No payment links found';
            resultContent.appendChild(emptyMessage);
        } else {
            data.results.forEach((link, index) => {
                const linkCard = document.createElement('div');
                linkCard.className = 'result-card';
                linkCard.style.marginTop = '0';
                linkCard.style.marginBottom = '16px';

                const linkHeader = document.createElement('div');
                linkHeader.className = 'result-header';

                const linkId = document.createElement('h4');
                linkId.className = 'result-title';
                linkId.innerHTML = `<i class="fas fa-link"></i> ${link.payment_id || 'N/A'}`;

                const statusBadge = document.createElement('span');
                const status = (link.status || 'unknown').toLowerCase();
                statusBadge.className = `status-badge status-${status}`;
                statusBadge.textContent = formatText(status);

                linkHeader.appendChild(linkId);
                linkHeader.appendChild(statusBadge);

                const linkTable = document.createElement('table');
                linkTable.className = 'result-table';

                const linkData = [
                    { label: 'Reference ID', value: link.reference_id },
                    { label: 'Amount', value: link.amount ? formatCurrency(link.amount, link.currency) : 'N/A' },
                    { label: 'Buyer Name', value: link.buyer?.name },
                    { label: 'Buyer Email', value: link.buyer?.email },
                    { label: 'Payment Link', value: link.payment_link, isLink: true },
                    { label: 'Created At', value: formatDate(link.created_at) }
                ];

                linkData.forEach(item => {
                    if (item.value === null || item.value === undefined || item.value === '') return;

                    const row = document.createElement('tr');

                    const labelCell = document.createElement('td');
                    labelCell.className = 'label';
                    labelCell.textContent = item.label;

                    const valueCell = document.createElement('td');
                    valueCell.className = 'value';

                    if (item.isLink && item.value !== 'N/A') {
                        const link = document.createElement('a');
                        link.href = item.value;
                        link.textContent = 'Open Link';
                        link.target = '_blank';
                        link.className = 'result-link';
                        valueCell.appendChild(link);
                    } else {
                        valueCell.textContent = item.value;
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    linkTable.appendChild(row);
                });

                linkCard.appendChild(linkHeader);
                linkCard.appendChild(linkTable);
                resultContent.appendChild(linkCard);
            });
        }

        // Update pagination controls
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.getElementById('pageIndicator');
        const paginationControls = document.getElementById('paginationControls');

        prevBtn.disabled = !prevPageUrl;
        nextBtn.disabled = !nextPageUrl;
        pageIndicator.textContent = `Page ${page}`;
        paginationControls.className = 'pagination-controls';
        paginationControls.style.display = 'flex';

        // Show results
        resultContainer.style.display = 'block';
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while fetching payment links');
    }
}

// Form submission
document.getElementById('listPaymentLinksForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const pageNumber = parseInt(document.getElementById('pageNumber').value) || 1;
    const pageSize = parseInt(document.getElementById('pageSize').value) || 10;

    await fetchPaymentLinks(pageNumber, pageSize);
});

document.addEventListener('DOMContentLoaded', function () {
    // Pagination controls
    document.getElementById('prevPageBtn').addEventListener('click', function () {
        if (prevPageUrl) {
            fetchPaymentLinks(currentPage - 1, currentPageSize);
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', function () {
        if (nextPageUrl) {
            fetchPaymentLinks(currentPage + 1, currentPageSize);
        }
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', function () {
        fetchPaymentLinks(currentPage, currentPageSize);
    });

    // Clear results
    document.getElementById('clearResultsBtn').addEventListener('click', function () {
        document.getElementById('pageNumber').value = '';
        document.getElementById('pageSize').value = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';
        document.getElementById('paginationControls').style.display = 'none';
        currentPage = 1;
        currentPageSize = 10;
    });
});
