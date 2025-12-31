/**
 * Share Payment Link Page Logic
 * Send payment links via email and SMS to multiple recipients
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

// Dynamic email input management
document.getElementById('addEmailBtn').addEventListener('click', function () {
    const emailContainer = document.getElementById('emailContainer');
    const newEmailGroup = document.createElement('div');
    newEmailGroup.className = 'recipient-input-group';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'email-input';
    emailInput.placeholder = 'recipient@example.com';
    emailInput.style.flex = '1';
    emailInput.style.padding = '12px';
    emailInput.style.border = '2px solid #e2e8f0';
    emailInput.style.borderRadius = '8px';
    emailInput.style.fontSize = '16px';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-recipient-btn remove-email';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', function () {
        emailContainer.removeChild(newEmailGroup);
        updateRemoveButtons('email');
    });

    newEmailGroup.appendChild(emailInput);
    newEmailGroup.appendChild(removeBtn);
    emailContainer.appendChild(newEmailGroup);

    updateRemoveButtons('email');
});

// Dynamic phone input management
document.getElementById('addPhoneBtn').addEventListener('click', function () {
    const phoneContainer = document.getElementById('phoneContainer');
    const newPhoneGroup = document.createElement('div');
    newPhoneGroup.className = 'recipient-input-group';

    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.className = 'phone-input';
    phoneInput.placeholder = '+917736644990';
    phoneInput.style.flex = '1';
    phoneInput.style.padding = '12px';
    phoneInput.style.border = '2px solid #e2e8f0';
    phoneInput.style.borderRadius = '8px';
    phoneInput.style.fontSize = '16px';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-recipient-btn remove-phone';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', function () {
        phoneContainer.removeChild(newPhoneGroup);
        updateRemoveButtons('phone');
    });

    newPhoneGroup.appendChild(phoneInput);
    newPhoneGroup.appendChild(removeBtn);
    phoneContainer.appendChild(newPhoneGroup);

    updateRemoveButtons('phone');
});

// Update visibility of remove buttons
function updateRemoveButtons(type) {
    const container = type === 'email' ? document.getElementById('emailContainer') : document.getElementById('phoneContainer');
    const groups = container.querySelectorAll('.recipient-input-group');
    groups.forEach((group, index) => {
        const removeBtn = group.querySelector(type === 'email' ? '.remove-email' : '.remove-phone');
        if (removeBtn) {
            removeBtn.style.display = groups.length > 1 ? 'block' : 'none';
        }
    });
}

// Form submission
document.getElementById('sharePaymentLinkForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const paymentLinkId = document.getElementById('paymentLinkId').value.trim();
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');

    // Validate payment link ID
    if (!paymentLinkId) {
        showModal('error', 'Validation Error', 'Please enter a Payment Link ID');
        return;
    }

    // Collect email addresses
    const emailInputs = document.querySelectorAll('.email-input');
    const emails = Array.from(emailInputs)
        .map(input => input.value.trim())
        .filter(email => email !== '');

    // Collect phone numbers
    const phoneInputs = document.querySelectorAll('.phone-input');
    const phones = Array.from(phoneInputs)
        .map(input => input.value.trim())
        .filter(phone => phone !== '');

    // Validate at least one recipient
    if (emails.length === 0 && phones.length === 0) {
        showModal('error', 'Validation Error', 'Please add at least one email address or phone number');
        return;
    }

    try {
        const payload = {};
        if (emails.length > 0) {
            payload.email = emails;
        }
        if (phones.length > 0) {
            payload.phone = phones;
        }

        const response = await fetch(`${window.API_URL}/pg/payment-links/${paymentLinkId}/share/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
                ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID') ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') } : {})
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            const errorMessage = responseData.error?.message || 'Failed to share payment link';
            const errorCode = responseData.error?.code || 'UNKNOWN_ERROR';
            showModal('error', `Error (${errorCode})`, errorMessage);
            return;
        }

        // Clear previous results
        resultContent.textContent = '';

        // Display success message
        const successDiv = document.createElement('div');
        successDiv.style.textAlign = 'center';
        successDiv.style.padding = '40px 20px';

        const successIcon = document.createElement('div');
        successIcon.style.fontSize = '48px';
        successIcon.style.marginBottom = '16px';
        successIcon.textContent = '✅';

        const successTitle = document.createElement('h3');
        successTitle.style.color = 'rgb(38, 168, 135)';
        successTitle.style.marginBottom = '12px';
        successTitle.textContent = 'Payment Link Shared Successfully';

        const successMessage = document.createElement('p');
        successMessage.style.color = '#4a5568';
        successMessage.style.fontSize = '16px';
        successMessage.style.marginBottom = '20px';
        successMessage.textContent = responseData.message || `Payment link ${paymentLinkId} has been shared with the specified recipients.`;

        const detailsDiv = document.createElement('div');
        detailsDiv.style.maxWidth = '600px';
        detailsDiv.style.margin = '20px auto';
        detailsDiv.style.textAlign = 'left';

        if (emails.length > 0) {
            const emailSection = document.createElement('div');
            emailSection.style.marginBottom = '20px';
            emailSection.style.padding = '16px';
            emailSection.style.backgroundColor = '#f8f9fa';
            emailSection.style.borderRadius = '8px';
            emailSection.style.border = '1px solid #e9ecef';

            const emailTitle = document.createElement('h4');
            emailTitle.style.color = '#2d3748';
            emailTitle.style.marginBottom = '12px';
            emailTitle.style.fontSize = '16px';
            emailTitle.innerHTML = '<i class="fas fa-envelope"></i> Email Recipients (' + emails.length + ')';

            const emailList = document.createElement('ul');
            emailList.style.margin = '0';
            emailList.style.padding = '0 0 0 20px';
            emailList.style.color = '#4a5568';

            emails.forEach(email => {
                const li = document.createElement('li');
                li.style.marginBottom = '4px';
                li.textContent = email;
                emailList.appendChild(li);
            });

            emailSection.appendChild(emailTitle);
            emailSection.appendChild(emailList);
            detailsDiv.appendChild(emailSection);
        }

        if (phones.length > 0) {
            const phoneSection = document.createElement('div');
            phoneSection.style.marginBottom = '20px';
            phoneSection.style.padding = '16px';
            phoneSection.style.backgroundColor = '#f8f9fa';
            phoneSection.style.borderRadius = '8px';
            phoneSection.style.border = '1px solid #e9ecef';

            const phoneTitle = document.createElement('h4');
            phoneTitle.style.color = '#2d3748';
            phoneTitle.style.marginBottom = '12px';
            phoneTitle.style.fontSize = '16px';
            phoneTitle.innerHTML = '<i class="fas fa-mobile-alt"></i> SMS Recipients (' + phones.length + ')';

            const phoneList = document.createElement('ul');
            phoneList.style.margin = '0';
            phoneList.style.padding = '0 0 0 20px';
            phoneList.style.color = '#4a5568';

            phones.forEach(phone => {
                const li = document.createElement('li');
                li.style.marginBottom = '4px';
                li.textContent = phone;
                phoneList.appendChild(li);
            });

            phoneSection.appendChild(phoneTitle);
            phoneSection.appendChild(phoneList);
            detailsDiv.appendChild(phoneSection);
        }

        successDiv.appendChild(successIcon);
        successDiv.appendChild(successTitle);
        successDiv.appendChild(successMessage);
        successDiv.appendChild(detailsDiv);
        resultContent.appendChild(successDiv);

        // Show results
        resultContainer.style.display = 'block';

        // Show success modal
        showModal('success', 'Success', `Payment link shared successfully to ${emails.length + phones.length} recipient(s).`);
    } catch (error) {
        showModal('error', 'Error', error.message || 'An error occurred while sharing the payment link');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Add sample data functionality
    const setSampleDataBtn = document.getElementById('setSampleDataBtn');
    if (setSampleDataBtn) {
        setSampleDataBtn.addEventListener('click', function () {
            document.getElementById('paymentLinkId').value = 'PR7265016505';
            document.querySelector('.email-input').value = 'zayan@eximpe.com';
            document.querySelector('.phone-input').value = '+917736644990';
        });
    }

    // Clear form functionality
    document.getElementById('clearFormBtn').addEventListener('click', function () {
        document.getElementById('sharePaymentLinkForm').reset();
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('resultContent').textContent = '';

        // Reset to single email and phone input
        const emailContainer = document.getElementById('emailContainer');
        const phoneContainer = document.getElementById('phoneContainer');

        // Clear and reset email inputs
        emailContainer.innerHTML = `
            <div class="recipient-input-group">
                <input type="email" class="email-input" placeholder="recipient@example.com"
                    style="flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px;">
                <button type="button" class="remove-recipient-btn remove-email" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Clear and reset phone inputs
        phoneContainer.innerHTML = `
            <div class="recipient-input-group">
                <input type="tel" class="phone-input" placeholder="+917736644990"
                    style="flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px;">
                <button type="button" class="remove-recipient-btn remove-phone" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    // Initialize remove buttons visibility
    updateRemoveButtons('email');
    updateRemoveButtons('phone');
});
