/**
 * List PG Forms Page Logic
 * Lists all PG forms via /pg/forms/ with pagination.
 */

let pgFormCurrentPage = 1;
let pgFormCurrentPageSize = 10;

function pgFormListEscapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function pgFormListShowModal(type, title, message) {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');
    modalBox.className = 'modal ' + type;
    modalIcon.textContent = type === 'success' ? '✅' : '❌';
    modalTitle.textContent = title;
    modalTitle.style.color = type === 'success' ? 'rgb(38, 168, 135)' : 'red';
    TrustedTypes.setInnerHTML(modalMessage, pgFormListEscapeHtml(message));
    modalOverlay.classList.add('active');
}

function pgFormListHideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalCloseBtn').addEventListener('click', pgFormListHideModal);
document
    .getElementById('modalOverlay')
    .addEventListener('click', function (e) {
        if (e.target === document.getElementById('modalOverlay'))
            pgFormListHideModal();
    });

function pgFormListFormatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function pgFormListFormatCurrency(amount) {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

function pgFormListFormatText(text) {
    if (!text) return 'N/A';
    return text.toString().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function fetchPgForms(page = 1, pageSize = 10) {
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });

        const response = await fetch(
            `${window.API_URL}/pg/forms/?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID')
                        ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') }
                        : {}),
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            let message = 'Failed to fetch forms';
            if (data && typeof data === 'object') {
                if (data.detail) {
                    message = data.detail;
                } else if (data.error?.message) {
                    message = data.error.message;
                }
            }
            pgFormListShowModal('error', 'Error', message);
            return;
        }

        // DRF pagination format: {count, next, previous, results}
        if (!data || !Array.isArray(data.results)) {
            pgFormListShowModal(
                'error',
                'Error',
                'Unexpected response format from server.'
            );
            return;
        }

        pgFormCurrentPage = page;
        pgFormCurrentPageSize = pageSize;

        const totalCount = data.count || 0;
        const startIndex = (page - 1) * pageSize + 1;
        const endIndex = Math.min(page * pageSize, totalCount);

        resultContent.textContent = '';

        if (totalCount === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.style.color = '#718096';
            emptyMessage.textContent = 'No payment forms found';
            resultContent.appendChild(emptyMessage);
        } else {
            paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalCount} forms`;

            data.results.forEach((form) => {
                const card = document.createElement('div');
                card.className = 'result-card';
                card.style.marginTop = '0';
                card.style.marginBottom = '16px';

                const header = document.createElement('div');
                header.className = 'result-header';

                const title = document.createElement('h4');
                title.className = 'result-title';
                title.innerHTML = `<i class="fas fa-file-invoice"></i> ${form.payment_for || 'N/A'}`;

                const statusBadge = document.createElement('span');
                const status = form.is_valid ? 'active' : 'inactive';
                statusBadge.className = `status-badge status-${status}`;
                statusBadge.textContent = form.is_valid ? 'Valid' : 'Not Valid';

                header.appendChild(title);
                header.appendChild(statusBadge);

                const table = document.createElement('table');
                table.className = 'result-table';

                const rows = [
                    { label: 'Form ID', value: form.form_id },
                    { label: 'URL Slug', value: form.url_slug },
                    {
                        label: 'Amount',
                        value:
                            form.is_fixed_amount && form.amount != null
                                ? pgFormListFormatCurrency(form.amount)
                                : 'Variable',
                    },
                    { label: 'Currency', value: form.currency },
                    { label: 'Active', value: form.is_active ? 'Yes' : 'No' },
                    {
                        label: 'Total Payments',
                        value: form.total_payments_received,
                    },
                    {
                        label: 'Total Collected',
                        value:
                            form.total_amount_collected != null
                                ? pgFormListFormatCurrency(
                                      form.total_amount_collected
                                  )
                                : 'N/A',
                    },
                    {
                        label: 'Created At',
                        value: pgFormListFormatDate(form.created_at),
                    },
                    {
                        label: 'Last Updated',
                        value: pgFormListFormatDate(form.last_updated_at),
                    },
                    {
                        label: 'Public URL',
                        value: form.form_url || null,
                        isLink: true,
                    },
                ];

                rows.forEach((item) => {
                    if (
                        item.value === null ||
                        item.value === undefined ||
                        item.value === ''
                    )
                        return;

                    const row = document.createElement('tr');

                    const labelCell = document.createElement('td');
                    labelCell.className = 'label';
                    labelCell.textContent = item.label;

                    const valueCell = document.createElement('td');
                    valueCell.className = 'value';

                    if (item.isLink && item.value) {
                        const a = document.createElement('a');
                        a.href = item.value;
                        a.textContent = item.value;
                        a.target = '_blank';
                        a.className = 'result-link';
                        a.style.wordBreak = 'break-all';
                        valueCell.appendChild(a);
                    } else {
                        valueCell.textContent = item.value;
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    table.appendChild(row);
                });

                card.appendChild(header);
                card.appendChild(table);
                resultContent.appendChild(card);
            });
        }

        // Pagination controls
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.getElementById('pageIndicator');

        prevBtn.disabled = page <= 1;
        nextBtn.disabled = endIndex >= totalCount;
        pageIndicator.textContent = `Page ${page}`;

        paginationControls.className = 'pagination-controls';
        paginationControls.style.display = 'flex';

        resultContainer.style.display = 'block';
    } catch (error) {
        pgFormListShowModal(
            'error',
            'Error',
            error.message || 'An error occurred while fetching forms'
        );
    }
}

document
    .getElementById('listPgFormsForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault();
        const pageNumber =
            parseInt(document.getElementById('pageNumber').value, 10) || 1;
        const pageSize =
            parseInt(document.getElementById('pageSize').value, 10) || 10;
        await fetchPgForms(pageNumber, pageSize);
    });

document.addEventListener('DOMContentLoaded', function () {
    document
        .getElementById('prevPageBtn')
        .addEventListener('click', function () {
            if (pgFormCurrentPage > 1) {
                fetchPgForms(pgFormCurrentPage - 1, pgFormCurrentPageSize);
            }
        });

    document
        .getElementById('nextPageBtn')
        .addEventListener('click', function () {
            fetchPgForms(pgFormCurrentPage + 1, pgFormCurrentPageSize);
        });

    document
        .getElementById('refreshBtn')
        .addEventListener('click', function () {
            fetchPgForms(pgFormCurrentPage, pgFormCurrentPageSize);
        });

    document
        .getElementById('clearResultsBtn')
        .addEventListener('click', function () {
            document.getElementById('pageNumber').value = '';
            document.getElementById('pageSize').value = '';
            document.getElementById('resultContainer').style.display = 'none';
            document.getElementById('resultContent').textContent = '';
            document.getElementById('paginationControls').style.display = 'none';
            pgFormCurrentPage = 1;
            pgFormCurrentPageSize = 10;
        });
});

