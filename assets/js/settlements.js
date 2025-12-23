{
    /**
     * Settlements Page Logic
     * Extracted from inline scripts for CSP compliance
     */

    let currentPage = 1;
    let totalPages = 1;
    let currentFilters = {};

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
    document.getElementById('modalOverlay').addEventListener('click', function (e) {
        if (e.target === document.getElementById('modalOverlay')) hideModal();
    });

    // Format helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatCurrency = (amount, currency) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR'
        }).format(amount);
    };

    const formatText = (text) => {
        if (!text) return 'N/A';
        return text.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // List settlements functionality
    async function listSettlements(page = 1) {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        try {
            let url = `${window.API_URL}/pg/settlements/?page=${page}`;

            // Add date filters if provided
            if (startDate) {
                url += `&settlement_completed_date__gte=${startDate}`;
            }
            if (endDate) {
                url += `&settlement_completed_date__lte=${endDate}`;
            }

            const response = await fetch(url, {
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

            if (!response.ok) {
                const errorMessage = responseData.error?.message || responseData.detail || 'Failed to fetch settlements list';
                const errorCode = responseData.error?.code || 'API_ERROR';
                showModal('error', `Error (${errorCode})`, errorMessage);
                return;
            }

            // Handle Django REST framework pagination response structure
            const settlements = responseData.results || [];
            displaySettlementsList(settlements);
            updatePagination(responseData);

            // Show list container
            document.getElementById('listContainer').style.display = 'block';

        } catch (error) {
            showModal('error', 'Error', error.message || 'An error occurred while fetching settlements list');
        }
    }



    function displaySettlementsList(settlements) {
        const tableBody = document.getElementById('settlementsTableBody');
        const countElement = document.getElementById('settlementCount');

        tableBody.textContent = '';

        if (!settlements || settlements.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.textContent = `
                    <td colspan="5" style="padding: 32px; text-align: center; color: #4a5568; font-style: italic;">
                        No settlements found for the selected criteria
                    </td>
                `;
            tableBody.appendChild(emptyRow);
            countElement.textContent = 'No settlements found';
            return;
        }

        countElement.textContent = `Found ${settlements.length} settlement(s)`;

        settlements.forEach(settlement => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #e2e8f0';
            row.style.transition = 'background-color 0.2s ease';

            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = '#f8fafc';
            });

            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = 'transparent';
            });

            const settlementId = escapeHtml(settlement.settlement_id);
            const utrNumber = escapeHtml(settlement.utr_number || 'N/A');
            const completedDate = formatDate(settlement.settlement_completed_date);

            row.textContent = `
                    <td style="padding: 16px;">
                        <div style="font-weight: 600; color: rgb(38, 168, 135); cursor: pointer;" data-action="viewSettlement" data-settlement-id="${settlementId}">
                            ${settlementId}
                        </div>
                    </td>
                    <td style="padding: 16px; color: #4a5568;">
                        ${utrNumber}
                    </td>
                    <td style="padding: 16px; color: #4a5568;">
                        ${completedDate}
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: 600; color: #2d3748;">
                        ${formatCurrency(settlement.settlement_amount, 'INR')}
                    </td>
                    <td style="padding: 16px; text-align: center;">
                        <button data-action="viewSettlement" data-settlement-id="${settlementId}" class="header-button" style="margin: 0; padding: 6px 12px; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                    </td>
                `;

            tableBody.appendChild(row);
        });
    }

    function updatePagination(paginationData) {
        // Handle Django REST framework pagination structure
        currentPage = paginationData.page || 1;
        const totalCount = paginationData.count || 0;
        const pageSize = paginationData.page_size || 250;
        totalPages = Math.ceil(totalCount / pageSize);

        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        // Update count display with total count
        const countElement = document.getElementById('settlementCount');
        const currentResults = paginationData.results ? paginationData.results.length : 0;
        if (totalCount > 0) {
            countElement.textContent = `Showing ${currentResults} of ${totalCount} settlement(s)`;
        }

        prevBtn.disabled = !paginationData.previous;
        nextBtn.disabled = !paginationData.next;

        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }

        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }

    function viewSettlementDetails(settlementId) {
        // Set the settlement ID in the search field
        document.getElementById('settlementId').value = settlementId;

        // Trigger the settlement details search
        document.getElementById('settlementForm').dispatchEvent(new Event('submit'));

        // Scroll to results
        setTimeout(() => {
            const resultContainer = document.getElementById('resultContainer');
            if (resultContainer.style.display === 'block') {
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    // Event listeners
    document.getElementById('listSettlementsBtn').addEventListener('click', () => {
        currentPage = 1;
        listSettlements(currentPage);
    });
}

document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        listSettlements(currentPage);
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        listSettlements(currentPage);
    }
});

// Original form submission for single settlement search
document.getElementById('settlementForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const settlementId = document.getElementById('settlementId').value;
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    // Validate inputs
    if (!settlementId) {
        showModal('error', 'Validation Error', 'Please enter a Settlement ID');
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/pg/settlements/${settlementId}/`, {
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
            const errorMessage = responseData.error?.message || 'Failed to fetch settlement details';
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

        // Create settlement info section
        const settlementInfoSection = document.createElement('div');
        settlementInfoSection.style.marginBottom = '24px';
        settlementInfoSection.style.padding = '16px';
        settlementInfoSection.style.background = '#f8fafc';
        settlementInfoSection.style.borderRadius = '12px';
        settlementInfoSection.style.border = '1px solid #e2e8f0';

        const settlementInfoTitle = document.createElement('h3');
        settlementInfoTitle.style.margin = '0 0 16px 0';
        settlementInfoTitle.style.color = '#2d3748';
        settlementInfoTitle.style.fontSize = '18px';
        settlementInfoTitle.style.display = 'flex';
        settlementInfoTitle.style.alignItems = 'center';
        settlementInfoTitle.style.gap = '8px';
        TrustedTypes.setInnerHTML(settlementInfoTitle, '<i class="fas fa-info-circle" style="color: rgb(38, 168, 135);"></i> Settlement Overview');
        settlementInfoSection.appendChild(settlementInfoTitle);

        const settlementInfoTable = document.createElement('table');
        settlementInfoTable.style.width = '100%';
        settlementInfoTable.style.borderCollapse = 'collapse';

        const settlementInfo = [
            { label: 'Settlement ID', value: data.settlement_id || 'N/A' },
            { label: 'Settlement Completed Date', value: formatDate(data.settlement_completed_date) }
        ];

        settlementInfo.forEach(info => {
            if (info.value === null || info.value === undefined || info.value === '' || info.value === 'N/A') return;

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #e2e8f0';

            const labelCell = document.createElement('td');
            labelCell.style.padding = '12px';
            labelCell.style.fontWeight = '500';
            labelCell.style.color = '#4a5568';
            labelCell.style.width = '30%';
            labelCell.textContent = info.label;

            const valueCell = document.createElement('td');
            valueCell.style.padding = '12px';
            valueCell.style.fontWeight = '600';
            valueCell.style.color = '#2d3748';
            valueCell.textContent = info.value;

            row.appendChild(labelCell);
            row.appendChild(valueCell);
            settlementInfoTable.appendChild(row);
        });

        settlementInfoSection.appendChild(settlementInfoTable);
        resultContent.appendChild(settlementInfoSection);

        // Create transactions section
        const transactionsSection = document.createElement('div');
        transactionsSection.style.marginBottom = '24px';

        const transactionsTitle = document.createElement('h3');
        transactionsTitle.style.margin = '0 0 16px 0';
        transactionsTitle.style.color = '#2d3748';
        transactionsTitle.style.fontSize = '18px';
        transactionsTitle.style.display = 'flex';
        transactionsTitle.style.alignItems = 'center';
        transactionsTitle.style.gap = '8px';
        TrustedTypes.setInnerHTML(transactionsTitle, '<i class="fas fa-exchange-alt" style="color: rgb(38, 168, 135);"></i> Transactions');
        transactionsSection.appendChild(transactionsTitle);

        // Process each transaction
        data.transactions.forEach((transaction, index) => {
            const transactionCard = document.createElement('div');
            transactionCard.style.marginBottom = '16px';
            transactionCard.style.padding = '16px';
            transactionCard.style.background = '#f8fafc';
            transactionCard.style.borderRadius = '12px';
            transactionCard.style.border = '1px solid #e2e8f0';

            const transactionHeader = document.createElement('div');
            transactionHeader.style.marginBottom = '12px';
            transactionHeader.style.paddingBottom = '12px';
            transactionHeader.style.borderBottom = '1px solid #e2e8f0';
            transactionHeader.style.display = 'flex';
            transactionHeader.style.justifyContent = 'space-between';
            transactionHeader.style.alignItems = 'center';

            const transactionType = document.createElement('span');
            transactionType.style.fontWeight = '600';
            transactionType.style.color = transaction.settlement_type === 'capture' ? '#38a169' : '#e53e3e';
            transactionType.textContent = formatText(transaction.settlement_type);
            transactionHeader.appendChild(transactionType);

            const transactionAmount = document.createElement('span');
            transactionAmount.style.fontWeight = '700';
            transactionAmount.style.fontSize = '18px';
            transactionAmount.textContent = formatCurrency(transaction.transaction_amount, transaction.transaction_currency);
            transactionHeader.appendChild(transactionAmount);

            transactionCard.appendChild(transactionHeader);

            const transactionTable = document.createElement('table');
            transactionTable.style.width = '100%';
            transactionTable.style.borderCollapse = 'collapse';

            const transactionInfo = [
                { label: 'Merchant Transaction ID', value: transaction.merchant_transaction_id || 'N/A' },
                { label: 'Card Type', value: formatText(transaction.card_type) },
                { label: 'Merchant Net Amount', value: formatCurrency(transaction.merchant_net_amount, transaction.transaction_currency) },
                { label: 'Service Fee', value: formatCurrency(transaction.merchant_service_fee, transaction.transaction_currency) },
                { label: 'Service Tax', value: formatCurrency(transaction.merchant_service_tax, transaction.transaction_currency) },
                { label: 'SGST', value: formatCurrency(transaction.sgst, transaction.transaction_currency) },
                { label: 'CGST', value: formatCurrency(transaction.cgst, transaction.transaction_currency) },
                { label: 'IGST', value: formatCurrency(transaction.igst, transaction.transaction_currency) },
                { label: 'Total Processing Fee', value: formatCurrency(transaction.total_processing_fee, transaction.transaction_currency) },
                { label: 'Total Service Tax', value: formatCurrency(transaction.total_service_tax, transaction.transaction_currency) },
                { label: 'Forex Amount', value: formatCurrency(transaction.forex_rate, transaction.transaction_currency) },
                { label: 'Discount', value: formatCurrency(transaction.discount, transaction.transaction_currency) },
                { label: 'Additional TDR Fee', value: formatCurrency(transaction.additional_tdr_fee, transaction.transaction_currency) },
                { label: 'Additional TDR Tax', value: formatCurrency(transaction.additional_tdr_tax, transaction.transaction_currency) }
            ];

            transactionInfo.forEach(info => {
                if (info.value === null || info.value === undefined || info.value === '' || info.value === 'N/A') return;

                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid #e2e8f0';

                const labelCell = document.createElement('td');
                labelCell.style.padding = '12px';
                labelCell.style.fontWeight = '500';
                labelCell.style.color = '#4a5568';
                labelCell.style.width = '30%';
                labelCell.textContent = info.label;

                const valueCell = document.createElement('td');
                valueCell.style.padding = '12px';
                valueCell.style.fontWeight = '600';
                valueCell.style.color = '#2d3748';
                valueCell.textContent = info.value;

                row.appendChild(labelCell);
                row.appendChild(valueCell);
                transactionTable.appendChild(row);
            });

            transactionCard.appendChild(transactionTable);
            transactionsSection.appendChild(transactionCard);
        });

        resultContent.appendChild(transactionsSection);

        // Show results
        resultContainer.style.display = 'block';
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while fetching settlement details');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const settlementIdInput = document.getElementById('settlementId');


    // Load last used settlement ID if available
    const lastUsedSettlementId = localStorage.getItem('last_used_settlement_id');
    if (lastUsedSettlementId) {
        settlementIdInput.value = lastUsedSettlementId;
    }

    // Add clear results functionality
    document.getElementById('clearResultsBtn').addEventListener('click', function () {
        document.getElementById('settlementId').value = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';
        document.getElementById('listContainer').style.display = 'none';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
    });

    // Event delegation for dynamically created buttons (CSP compliant)
    document.body.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'viewSettlement') {
            const settlementId = target.getAttribute('data-settlement-id');
            viewSettlementDetails(settlementId);
        }
    });
});
