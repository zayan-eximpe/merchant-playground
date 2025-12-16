/**
 * Create Payment Link Page Logic
 * Simplified workflow that mirrors the checkout experience.
 */

let currentPaymentLink = '';

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatAmountDisplay(value) {
    const amount = parseFloat(value);
    if (Number.isNaN(amount) || amount <= 0) {
        return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}

function updateSummaryCard() {
    const amountEl = document.getElementById('summaryAmount');
    const descriptionEl = document.getElementById('summaryDescription');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');

    if (amountEl && amountInput) {
        amountEl.textContent = formatAmountDisplay(amountInput.value);
    }

    if (descriptionEl && descriptionInput) {
        const text = descriptionInput.value.trim();
        descriptionEl.textContent = text
            ? text
            : 'Add a short description to help your customer understand what this payment link is for.';
    }
}

function saveFormData() {
    const data = {
        amount: document.getElementById('amount')?.value || '',
        description: document.getElementById('description')?.value || '',
    };
    localStorage.setItem('payment_link_form_data', JSON.stringify(data));
}

function loadFormData() {
    const savedData = localStorage.getItem('payment_link_form_data');
    if (!savedData) {
        return;
    }

    try {
        const formData = JSON.parse(savedData);
        Object.entries(formData).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element !== null && typeof value === 'string') {
                element.value = value;
            }
        });
    } catch (error) {
        console.error('Error loading saved form data:', error);
        localStorage.removeItem('payment_link_form_data');
    }
}

function createSampleData() {
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');

    if (amountInput) {
        amountInput.value = '1250.00';
    }
    if (descriptionInput) {
        descriptionInput.value = 'Advance payment for sample order ' + Math.floor(Math.random() * 90000000000);
    }

    saveFormData();
    updateSummaryCard();
}

function clearCache() {
    const form = document.getElementById('linkForm');
    if (!form) {
        return;
    }
    const currentAuthKey = document.getElementById('authKey')?.value || '';
    const currentClientId = document.getElementById('clientId')?.value || '';

    localStorage.removeItem('payment_link_form_data');
    form.reset();

    if (document.getElementById('authKey')) {
        document.getElementById('authKey').value = currentAuthKey;
    }
    if (document.getElementById('clientId')) {
        document.getElementById('clientId').value = currentClientId;
    }

    updateSummaryCard();
}

function copyModalLink() {
    navigator.clipboard
        .writeText(currentPaymentLink)
        .then(() => {
            showModal('success', 'Copied!', 'Payment link copied to clipboard');
        })
        .catch(() => {
            showModal('error', 'Failed to copy link. Please try again.');
        });
}

function openPaymentLink() {
    window.open(currentPaymentLink, '_blank', 'noopener,noreferrer');
}

function showModal(type, title, message, paymentLink = '') {
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOverlay = document.getElementById('modalOverlay');

    if (!modalBox || !modalOverlay) {
        return;
    }

    modalBox.className = 'modal ' + type;
    if (modalIcon) {
        modalIcon.textContent = type === 'success' ? '✅' : '❌';
    }
    if (modalTitle) {
        modalTitle.textContent = title;
        modalTitle.style.color = type === 'success' ? '' : 'red';
    }

    if (modalMessage) {
        if (type === 'success' && paymentLink) {
            currentPaymentLink = paymentLink;
            TrustedTypes.setInnerHTML(
                modalMessage,
                `
                <div>${escapeHtml(message)}</div>
                <div class="modal-link">${escapeHtml(paymentLink)}</div>
                <div class="modal-actions">
                    <button class="modal-button secondary" data-action="copyModalLink">
                        📋 Copy Link
                    </button>
                    <button class="modal-button primary" data-action="openPaymentLink">
                        🔗 Open Link
                    </button>
                </div>
            `
            );

            setTimeout(() => {
                const copyBtn = modalMessage.querySelector('[data-action="copyModalLink"]');
                const openBtn = modalMessage.querySelector('[data-action="openPaymentLink"]');

                copyBtn?.addEventListener('click', copyModalLink);
                openBtn?.addEventListener('click', openPaymentLink);
            }, 0);
        } else {
            modalMessage.textContent = message;
        }
    }

    modalOverlay.classList.add('active');
}

function hideModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay?.classList.remove('active');
}

function toTitleCaseField(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('linkForm');
    const createButton = document.getElementById('createButton');
    const btnText = document.getElementById('btnText');
    const authKeyInput = document.getElementById('authKey');
    const clientIdInput = document.getElementById('clientId');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    const savedAuthKey = localStorage.getItem('eximpe_auth_key');
    if (savedAuthKey && authKeyInput) {
        authKeyInput.value = savedAuthKey;
    }
    const savedClientId = localStorage.getItem('eximpe_client_id');
    if (savedClientId && clientIdInput) {
        clientIdInput.value = savedClientId;
    }

    loadFormData();
    updateSummaryCard();

    amountInput?.addEventListener('input', () => {
        saveFormData();
        updateSummaryCard();
    });
    descriptionInput?.addEventListener('input', () => {
        saveFormData();
        updateSummaryCard();
    });

    authKeyInput?.addEventListener('change', function () {
        if (this.value) {
            localStorage.setItem('eximpe_auth_key', this.value);
        } else {
            localStorage.removeItem('eximpe_auth_key');
        }
    });

    clientIdInput?.addEventListener('change', function () {
        if (this.value) {
            localStorage.setItem('eximpe_client_id', this.value);
        } else {
            localStorage.removeItem('eximpe_client_id');
        }
    });

    modalCloseBtn?.addEventListener('click', hideModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideModal();

            const amountValue = parseFloat(amountInput?.value || '');
            const descriptionValue = (descriptionInput?.value || '').trim();
            const authKey = authKeyInput?.value.trim();
            const clientId = clientIdInput?.value.trim();

            if (Number.isNaN(amountValue) || amountValue <= 0) {
                showModal('error', 'Invalid Amount', 'Please enter a valid amount greater than zero.');
                return;
            }
            if (!descriptionValue) {
                showModal('error', 'Description Missing', 'Please add a short description for the payment link.');
                return;
            }
            if (!authKey || !clientId) {
                showModal('error', 'Missing Credentials', 'Client ID and Client Secret are required.');
                return;
            }

            createButton.disabled = true;
            btnText.textContent = 'Generating...';
            referenceIdValue = Math.random().toString(36).substring(2, 15);

            try {
                const response = await fetch(`${window.API_URL}/pg/payment-links/`, {
                    method: 'POST',
                    headers: {
                        'X-Client-Secret': authKey,
                        'X-Client-ID': clientId,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amountValue.toFixed(2),
                        description: descriptionValue,
                        reference_id: referenceIdValue,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.data?.payment_link) {
                    showModal('success', 'Link Generated', 'Payment link generated successfully!', data.data.payment_link);
                    return;
                }

                let errorMsg = 'Failed to generate payment link';
                if (data.error?.details) {
                    errorMsg = '<ul class="error-list">';
                    Object.entries(data.error.details).forEach(([field, errors]) => {
                        const fieldName = toTitleCaseField(field.replace(/\./g, ' '));
                        errors.forEach((err) => {
                            errorMsg += `
                                <li>
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span><strong>${fieldName}:</strong> ${err}</span>
                                </li>
                            `;
                        });
                    });
                    errorMsg += '</ul>';
                } else if (data.error?.message) {
                    errorMsg = data.error.message;
                }
                showModal('error', 'Validation Error', errorMsg);
            } catch (error) {
                showModal('error', 'Error', error.message || 'Something went wrong.');
            } finally {
                createButton.disabled = false;
                btnText.textContent = 'Generate Payment Link';
            }
        });
    }
});
