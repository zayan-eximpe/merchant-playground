/**
 * Checkout Payment Page JavaScript
 * Handles payment initialization, modal management, and payment status checking
 */

// Log SDK loading status
console.log('Eximpe SDK loaded:', typeof Eximpe !== 'undefined');

// Set page zoom
document.body.style.zoom = "90%";

// Wait for both DOM and SDK to be ready
function initializePayment() {
    if (typeof Eximpe === 'undefined') {
        console.error('Eximpe SDK not loaded');
        return;
    }

    // Mobile quick actions functionality
    const mobileFab = document.getElementById('mobileFab');
    const mobileActionsMenu = document.getElementById('mobileActionsMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    let isMobileMenuOpen = false;

    console.log('Mobile elements found:', {
        mobileFab: !!mobileFab,
        mobileActionsMenu: !!mobileActionsMenu,
        mobileMenuOverlay: !!mobileMenuOverlay
    });

    function toggleMobileMenu() {
        console.log('Toggle mobile menu called, current state:', isMobileMenuOpen);
        isMobileMenuOpen = !isMobileMenuOpen;
        mobileFab.classList.toggle('active', isMobileMenuOpen);
        mobileActionsMenu.classList.toggle('active', isMobileMenuOpen);
        mobileMenuOverlay.classList.toggle('active', isMobileMenuOpen);

        // Update icon based on menu state
        const icon = mobileFab.querySelector('i');
        if (isMobileMenuOpen) {
            icon.className = 'fas fa-plus';
        } else {
            icon.className = 'fas fa-bolt';
        }
        console.log('Menu state after toggle:', isMobileMenuOpen);
    }

    function closeMobileMenu() {
        console.log('Close mobile menu called');
        isMobileMenuOpen = false;
        mobileFab.classList.remove('active');
        mobileActionsMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');

        // Reset icon to bolt when closing
        const icon = mobileFab.querySelector('i');
        icon.className = 'fas fa-bolt';
    }

    if (mobileFab) {
        mobileFab.addEventListener('click', toggleMobileMenu);
        console.log('Mobile FAB event listener added');
    } else {
        console.log('Mobile FAB not found!');
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        console.log('Mobile overlay event listener added');
    } else {
        console.log('Mobile overlay not found!');
    }

    // Close mobile menu when clicking on menu items
    const mobileActionItems = document.querySelectorAll('.mobile-action-item');
    mobileActionItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });
    console.log('Mobile action items found:', mobileActionItems.length);

    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.showModal = function(type, message) {
        modalBox.className = 'modal ' + type;
        modalIcon.textContent = type === 'success'
            ? '✅'
            : '❌';
        modalTitle.style.color = type === 'success' ? '' : 'red';
        TrustedTypes.setInnerHTML(modalMessage, message);
        modalOverlay.classList.add('active');
    }
    window.hideModal = function() {
        modalOverlay.classList.remove('active');
    }
    document.getElementById('modalCloseBtn').addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) hideModal();
    });

    // Get payment details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const mode = urlParams.get('mode') || 'sandbox';
    let redirectTarget = '_self'; // Default to same tab

    // Format amount for display
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Handle option button clicks
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            redirectTarget = btn.dataset.target;
            document.querySelector('.variant-description').textContent = btn.dataset.description;
            // Hide payment container for removed options
            document.getElementById('payment-container').style.display = 'none';
        });
    });

    if (!sessionId) {
        showModal('error', 'Session ID is required');
        document.getElementById('renderBtn').disabled = true;
    } else {
        // Initialize the payment SDK
        const eximpe = new Eximpe({
            apiUrl: window.location.origin,
            mode: mode
        });

        // Set up success handler
        eximpe.onSuccess((response) => {
            console.log('Payment successful:', response);
            showModal('success', 'Payment successful!');
        });

        // Set up error handler
        eximpe.onError((error) => {
            document.getElementById('loading').style.display = 'none';
            console.error('Payment failed:', error);
            showModal('error', error.message || 'An error occurred. Please try again.');
        });

        // Add click handler to the button
        document.getElementById('renderBtn').addEventListener('click', async () => {
            try {
                console.log('Pay Now clicked');
                console.log('Session ID:', sessionId);
                console.log('Redirect Target:', redirectTarget);

                if (redirectTarget === '_self') {
                    console.log('Opening in same tab');
                    document.body.style.background = '#fff';
                    document.getElementById('loading').style.display = 'flex';

                    try {
                        await eximpe.checkout({
                            paymentSessionId: sessionId,
                            redirectTarget: redirectTarget,
                            onFormReady: function(formHtml) {
                                console.log('Form ready callback received');
                                TrustedTypes.setInnerHTML(body, formHtml);
                                var form = document.body.querySelector('form');
                                if (form) {
                                    console.log('Form found, submitting...');
                                    autoCheckPaymentStatus(sessionId, {
                                        onSuccess: (response) => {
                                            console.log('Payment successful:', response);
                                            showModal('success', 'Payment successful!');
                                        },
                                        onFailure: (error) => {
                                            console.error('Payment failed:', error);
                                            showModal('error', error.message || 'Payment failed. Please try again.');
                                        }
                                    });
                                    form.submit();
                                } else {
                                    console.error('Form not found in HTML');
                                    showModal('error', 'Payment form not found. Please try again.');
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Checkout error:', error);
                        document.getElementById('loading').style.display = 'none';
                        showModal('error', error.message || 'Failed to initialize payment. Please try again.');
                    }
                } else {
                    console.log('Opening in new tab');
                    document.getElementById('loading').style.display = 'flex';

                    try {
                        await eximpe.checkout({
                            paymentSessionId: sessionId,
                            redirectTarget: redirectTarget
                        });

                        autoCheckPaymentStatus(sessionId, {
                            onSuccess: (response) => {
                                document.getElementById('loading').style.display = 'none';
                                console.log('Payment successful:', response);
                                showModal('success', 'Payment successful!');
                            },
                            onFailure: (error) => {
                                document.getElementById('loading').style.display = 'none';
                                console.error('Payment failed:', error);
                                showModal('error', error.message || 'Payment failed. Please try again.');
                            }
                        });
                    } catch (error) {
                        console.error('Checkout error:', error);
                        document.getElementById('loading').style.display = 'none';
                        showModal('error', error.message || 'Failed to initialize payment. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                document.getElementById('loading').style.display = 'none';
                showModal('error', 'An unexpected error occurred. Please try again.');
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
        Eximpe.checkPaymentStatus(sessionId, function(data) {
            if (data.data?.status === 'CAPTURED' && data.data?.return_url) {
                if (lastStatus !== 'CAPTURED') {
                    Eximpe._showToast('Payment completed successfully!', 'success');
                }
                lastStatus = 'CAPTURED';
                polling = false;
                if (typeof onSuccess === 'function') onSuccess(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, 'Payment completed successfully');
            } else if (data.data?.status === 'FAILED' && data.data?.return_url) {
                if (lastStatus !== 'FAILED') {
                    Eximpe._showToast(data.data?.message || 'Payment failed', 'error');
                }
                lastStatus = 'FAILED';
                polling = false;
                if (typeof onFailure === 'function') onFailure(data);
                Eximpe._submitReturnForm(data.data.return_url, lastStatus, data.data?.message);
            } else if (data.data?.status === 'FAILED') {
                if (lastStatus !== 'FAILED') {
                    Eximpe._showToast(data.data?.message || 'Payment failed', 'error');
                }
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
