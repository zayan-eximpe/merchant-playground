/**
 * Checkout Payment Page JavaScript
 * Handles payment initialization, modal management, and payment status checking
 */

// Log SDK loading status
console.log('Eximpe SDK loaded:', typeof Eximpe !== 'undefined');

// Wait for both DOM and SDK to be ready
function initializePayment() {
    if (typeof Eximpe === 'undefined') {
        console.error('Eximpe SDK not loaded');
        return;
    }

    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    window.showModal = function (type, message) {
        modalBox.className = 'modal ' + type;
        modalIcon.innerHTML = type === 'success'
            ? '<i class="fas fa-check-circle" style="color: #26A887;"></i>'
            : '<i class="fas fa-times-circle" style="color: #ef4444;"></i>';

        modalTitle.textContent = type === 'success' ? 'Payment Successful' : 'Payment Failed';
        TrustedTypes.setInnerHTML(modalMessage, message);
        modalOverlay.classList.add('active');
    }

    window.hideModal = function () {
        modalOverlay.classList.remove('active');
    }

    document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) hideModal();
    });

    // Get payment details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const mode = urlParams.get('mode') || 'sandbox';
    let redirectTarget = '_self';

    if (!sessionId) {
        showModal('error', 'Session ID is missing. Please initiate a checkout from the playground.');
        document.getElementById('renderBtn').disabled = true;
    } else {
        // Initialize the payment SDK
        const eximpe = new Eximpe({
            apiUrl: window.API_URL,
            mode: mode
        });

        // Set up success handler
        eximpe.onSuccess((response) => {
            console.log('Payment successful:', response);
            showModal('success', 'Your payment has been processed successfully. Redirecting...');
        });

        // Set up error handler
        eximpe.onError((error) => {
            document.getElementById('loading').style.display = 'none';
            console.error('Payment failed:', error);
            showModal('error', error.message || 'An error occurred while processing your payment.');
        });

        // Add click handler to the button
        document.getElementById('renderBtn').addEventListener('click', async () => {
            try {
                console.log('Initiating checkout for session:', sessionId);
                document.getElementById('loading').style.display = 'flex';

                await eximpe.checkout({
                    paymentSessionId: sessionId,
                    redirectTarget: redirectTarget,
                    onFormReady: function (formHtml) {
                        console.log('Form ready, submitting...');
                        // We don't change the background here anymore to preserve the premium look
                        TrustedTypes.setInnerHTML(document.body, formHtml);
                        const form = document.body.querySelector('form');
                        if (form) {
                            autoCheckPaymentStatus(sessionId, {
                                onSuccess: (response) => {
                                    showModal('success', 'Payment successful!');
                                },
                                onFailure: (error) => {
                                    showModal('error', error.message || 'Payment failed.');
                                }
                            });
                            form.submit();
                        } else {
                            document.getElementById('loading').style.display = 'none';
                            showModal('error', 'Could not generate payment form.');
                        }
                    }
                });
            } catch (error) {
                console.error('Checkout error:', error);
                document.getElementById('loading').style.display = 'none';
                showModal('error', error.message || 'Failed to initialize payment.');
            }
        });

        // Enable the pay button after initialization
        document.getElementById('renderBtn').disabled = false;
    }
}

// Check if SDK is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePayment);
} else {
    initializePayment();
}

// Function to auto check payment status
function autoCheckPaymentStatus(sessionId, options = {}) {
    let lastStatus = null;
    let polling = true;
    const onSuccess = options.onSuccess;
    const onFailure = options.onFailure;

    const poll = () => {
        if (!polling || lastStatus) return;
        Eximpe.checkPaymentStatus(sessionId, function (data) {
            if (data.data?.status === 'CAPTURED' && data.data?.return_url) {
                lastStatus = 'CAPTURED';
                polling = false;
                if (typeof onSuccess === 'function') onSuccess(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, 'Payment completed successfully');
            } else if (data.data?.status === 'FAILED' && data.data?.return_url) {
                lastStatus = 'FAILED';
                polling = false;
                if (typeof onFailure === 'function') onFailure(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, data.data?.message);
            } else if (data.data?.status === 'FAILED') {
                lastStatus = 'FAILED';
                polling = false;
                if (typeof onFailure === 'function') onFailure(data);
            } else if (!lastStatus) {
                setTimeout(poll, 3000);
            }
        });
    };
    poll();
    return () => { polling = false; };
}
