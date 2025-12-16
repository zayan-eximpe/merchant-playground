/**
 * Subscription Management Page Logic
 * Fetch subscription details by Subscription ID using Partner API
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

    if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
        window.TrustedTypes.setInnerHTML(modalMessage, escapeHtml(message));
    } else {
        modalMessage.textContent = message;
    }

    modalOverlay.classList.add('active');
}

function hideModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('modalOverlay')) hideModal();
});

// Prefill API configuration and last used subscription ID from localStorage
document.addEventListener('DOMContentLoaded', function () {
    const subscriptionIdInput = document.getElementById('subscriptionId');

    const lastSubscriptionId = localStorage.getItem('last_used_subscription_id');

    if (lastSubscriptionId && subscriptionIdInput) {
        subscriptionIdInput.value = lastSubscriptionId;
    }

    // No PSP / merchant config required for subscription lookup; reuse global client ID and auth key.
});

// Clear results helper
const clearResultsBtn = document.getElementById('clearResultsBtn');
if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', function () {
        const resultContent = document.getElementById('resultContent');
        const resultContainer = document.getElementById('resultContainer');
        const updateMandatePanel = document.getElementById('updateMandatePanel');
        const preDebitPanel = document.getElementById('preDebitPanel');
        const recurringPanel = document.getElementById('recurringPanel');
        if (resultContent) {
            resultContent.textContent = '';
        }
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
        if (updateMandatePanel) {
            updateMandatePanel.style.display = 'none';
        }
        if (preDebitPanel) {
            preDebitPanel.style.display = 'none';
        }
        if (recurringPanel) {
            recurringPanel.style.display = 'none';
        }
    });
}

async function fetchSubscriptionDetails() {
    const subscriptionId = document.getElementById('subscriptionId').value;
    const resultContent = document.getElementById('resultContent');
    const resultContainer = document.getElementById('resultContainer');

    // Validate inputs
    if (!subscriptionId) {
        showModal('error', 'Validation Error', 'Please enter a Subscription ID');
        return;
    }
    if (subscriptionId) localStorage.setItem('last_used_subscription_id', subscriptionId);

    try {
        const response = await fetch(`${window.API_URL}/pg/subscriptions/${subscriptionId}/`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
            },
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage =
                responseData.error?.message || 'Failed to fetch subscription details';
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

        const formatText = (text) => {
            if (!text) return 'N/A';
            return text.toString().replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        };

        const basicInfo = [
            { label: 'Order ID', value: data.order_id || 'N/A' },
            { label: 'Reference ID', value: data.reference_id || 'N/A' },
            { label: 'Amount', value: data.amount || 'N/A' },
            { label: 'Currency', value: data.currency || 'N/A' },
            { label: 'Status', value: formatText(data.status) },
            { label: 'Subscription Type', value: data.subscription_type || 'N/A' },
        ];

        const mainTable = document.createElement('table');
        mainTable.style.width = '100%';
        mainTable.style.borderCollapse = 'collapse';
        mainTable.style.marginBottom = '20px';

        basicInfo.forEach((info) => {
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
            mainTable.appendChild(row);
        });

        resultContent.appendChild(mainTable);

        // Show subscription details card only after successful fetch
        if (resultContainer) {
            resultContainer.style.display = 'block';
        }
    } catch (error) {
        showModal(
            'error',
            'Error',
            error && error.message
                ? error.message
                : 'An unexpected error occurred. Please try again.'
        );
    }
}

// Form submission and data handling
document
    .getElementById('subscriptionManagementForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault();
        await fetchSubscriptionDetails();
    });

// Action buttons: Get Status, Update Mandate, Recurring, Pre-Debit, Cancel Mandate
const btnGetStatus = document.getElementById('btnGetStatus');
const btnUpdateMandate = document.getElementById('btnUpdateMandate');
const btnRecurringPayment = document.getElementById('btnRecurringPayment');
const btnPreDebit = document.getElementById('btnPreDebit');
const btnCancelMandate = document.getElementById('btnCancelMandate');
const updateMandatePanel = document.getElementById('updateMandatePanel');
const btnSubmitUpdateMandate = document.getElementById('btnSubmitUpdateMandate');
const btnCloseUpdateMandate = document.getElementById('btnCloseUpdateMandate');
const updateMandateAmountInput = document.getElementById('updateMandateAmount');
const updateMandateEndDateInput = document.getElementById('updateMandateEndDate');
const preDebitPanel = document.getElementById('preDebitPanel');
const btnClosePreDebit = document.getElementById('btnClosePreDebit');
const btnSubmitPreDebit = document.getElementById('btnSubmitPreDebit');
const preDebitAmountInput = document.getElementById('preDebitAmount');
const preDebitDateInput = document.getElementById('preDebitDate');
const recurringPanel = document.getElementById('recurringPanel');
const btnCloseRecurring = document.getElementById('btnCloseRecurring');
const btnSubmitRecurring = document.getElementById('btnSubmitRecurring');
const recurringAmountInput = document.getElementById('recurringAmount');
const recurringInvoiceDisplayNumberInput = document.getElementById('recurringInvoiceDisplayNumber');

if (btnGetStatus) {
    btnGetStatus.addEventListener('click', async function () {
        const subscriptionId = document.getElementById('subscriptionId').value;

        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        try {
            const response = await fetch(
                `${window.API_URL}/pg/subscriptions/${subscriptionId}/mandate_status/`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    },
                }
            );
            const data = await response.json();
            const body = data.data || data.error || data;
            showModal(
                response.ok && data.success ? 'success' : 'error',
                'Mandate Status',
                JSON.stringify(body, null, 2)
            );
        } catch (error) {
            showModal(
                'error',
                'Error',
                error && error.message
                    ? error.message
                    : 'An unexpected error occurred while fetching mandate status.'
            );
        }
    });
}

// Show the inline Update Mandate panel when clicking the main button
if (btnUpdateMandate && updateMandatePanel) {
    btnUpdateMandate.addEventListener('click', function () {
        const subscriptionId = document.getElementById('subscriptionId').value;
        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        // Reset panel fields
        if (updateMandateAmountInput) updateMandateAmountInput.value = '';
        if (updateMandateEndDateInput) updateMandateEndDateInput.value = '';

        updateMandatePanel.style.display = 'block';
    });
}

// Hide the panel
if (btnCloseUpdateMandate && updateMandatePanel) {
    btnCloseUpdateMandate.addEventListener('click', function () {
        updateMandatePanel.style.display = 'none';
    });
}

// Apply mandate changes using values from the panel
if (btnSubmitUpdateMandate && updateMandatePanel) {
    btnSubmitUpdateMandate.addEventListener('click', async function () {
        const subscriptionId = document.getElementById('subscriptionId').value;

        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        const amount = updateMandateAmountInput ? updateMandateAmountInput.value.trim() : '';
        const endDate = updateMandateEndDateInput ? updateMandateEndDateInput.value.trim() : '';

        if (!amount && !endDate) {
            showModal(
                'error',
                'Validation Error',
                'You must provide at least amount or end date to update mandate.'
            );
            return;
        }

        try {
            const payload = {};
            if (amount) payload.amount = amount;
            if (endDate) payload.end_date = endDate;

            const response = await fetch(
                `${window.API_URL}/pg/subscriptions/${subscriptionId}/modify_mandate/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();
            const body = data.data || data.error || data;

            showModal(
                response.ok && data.success ? 'success' : 'error',
                'Update Mandate',
                JSON.stringify(body, null, 2)
            );

            if (response.ok && data.success) {
                // Hide panel after successful update
                updateMandatePanel.style.display = 'none';
            }
        } catch (error) {
            showModal(
                'error',
                'Error',
                error && error.message
                    ? error.message
                    : 'An unexpected error occurred while updating mandate.'
            );
        }
    });
}

// Show the inline Pre-Debit panel when clicking the button
if (btnPreDebit && preDebitPanel) {
    btnPreDebit.addEventListener('click', function () {
        const subscriptionId = document.getElementById('subscriptionId').value;
        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        // Reset fields
        if (preDebitAmountInput) preDebitAmountInput.value = '';
        if (preDebitDateInput) preDebitDateInput.value = '';

        preDebitPanel.style.display = 'block';
    });
}

// Hide Pre-Debit panel
if (btnClosePreDebit && preDebitPanel) {
    btnClosePreDebit.addEventListener('click', function () {
        preDebitPanel.style.display = 'none';
    });
}

// Submit Pre-Debit notification
if (btnSubmitPreDebit && preDebitPanel) {
    btnSubmitPreDebit.addEventListener('click', async function () {
        const subscriptionId = document.getElementById('subscriptionId').value;

        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        const debitDate = preDebitDateInput ? preDebitDateInput.value.trim() : '';
        const amount = preDebitAmountInput ? preDebitAmountInput.value.trim() : '';

        if (!debitDate) {
            showModal(
                'error',
                'Validation Error',
                'Debit Date is required to send pre-debit notification.'
            );
            return;
        }

        try {
            const payload = {
                debit_date: debitDate,
            };
            if (amount) {
                payload.amount = amount;
            }

            const response = await fetch(
                `${window.API_URL}/pg/subscriptions/${subscriptionId}/pre_debit_notification/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();
            const body = data.data || data.error || data;

            showModal(
                response.ok && data.success ? 'success' : 'error',
                'Pre-Debit Notification',
                JSON.stringify(body, null, 2)
            );

            if (response.ok && data.success) {
                preDebitPanel.style.display = 'none';
            }
        } catch (error) {
            showModal(
                'error',
                'Error',
                error && error.message
                    ? error.message
                    : 'An unexpected error occurred while sending pre-debit notification.'
            );
        }
    });
}

// Show Recurring Payment panel
if (btnRecurringPayment && recurringPanel) {
    btnRecurringPayment.addEventListener('click', function () {
        const subscriptionId = document.getElementById('subscriptionId').value;
        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        if (recurringAmountInput) recurringAmountInput.value = '';
        if (recurringInvoiceDisplayNumberInput) recurringInvoiceDisplayNumberInput.value = '';

        recurringPanel.style.display = 'block';
    });
}

// Hide Recurring Payment panel
if (btnCloseRecurring && recurringPanel) {
    btnCloseRecurring.addEventListener('click', function () {
        recurringPanel.style.display = 'none';
    });
}

// Submit Recurring Payment
if (btnSubmitRecurring && recurringPanel) {
    btnSubmitRecurring.addEventListener('click', async function () {
        const subscriptionId = document.getElementById('subscriptionId').value;

        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        const amount = recurringAmountInput ? recurringAmountInput.value.trim() : '';
        const invoiceDisplayNumber = recurringInvoiceDisplayNumberInput ? recurringInvoiceDisplayNumberInput.value.trim() : '';

        if (!invoiceDisplayNumber) {
            showModal('error', 'Validation Error', 'Invoice Display Number is required for recurring payments');
            return;
        }

        // Build payload - invoice_display_number is mandatory for all recurring payments
        const payload = {
            invoice_display_number: invoiceDisplayNumber,
        };

        // Add amount only if provided (optional field)
        if (amount) {
            payload.amount = amount;
        }

        // Transaction ID is auto-generated server-side; no need to send from sample UI.

        try {
            // Log payload for debugging (can be removed in production)
            console.log('Recurring payment payload:', payload);

            const response = await fetch(
                `${window.API_URL}/pg/subscriptions/${subscriptionId}/recurring_payment/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();
            const body = data.data || data.error || data;

            showModal(
                response.ok && data.success ? 'success' : 'error',
                'Recurring Payment',
                JSON.stringify(body, null, 2)
            );

            if (response.ok && data.success) {
                recurringPanel.style.display = 'none';
            }
        } catch (error) {
            showModal(
                'error',
                'Error',
                error && error.message
                    ? error.message
                    : 'An unexpected error occurred while triggering recurring payment.'
            );
        }
    });
}

if (btnCancelMandate) {
    btnCancelMandate.addEventListener('click', async function () {
        const subscriptionId = document.getElementById('subscriptionId').value;

        if (!subscriptionId) {
            showModal('error', 'Validation Error', 'Please enter a Subscription ID');
            return;
        }

        if (!confirm('Are you sure you want to cancel this mandate? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(
                `${window.API_URL}/pg/subscriptions/${subscriptionId}/cancel_mandate/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'X-Client-Secret': getConfigValue('AUTH_KEY'),
                        'X-Client-ID': getConfigValue('CLIENT_ID'),
                    },
                }
            );
            const data = await response.json();
            const body = data.data || data.error || data;
            showModal(
                response.ok && data.success ? 'success' : 'error',
                'Cancel Mandate',
                JSON.stringify(body, null, 2)
            );
        } catch (error) {
            showModal(
                'error',
                'Error',
                error && error.message
                    ? error.message
                    : 'An unexpected error occurred while cancelling mandate.'
            );
        }
    });
}
