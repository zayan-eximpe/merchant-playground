/**
 * Common Utility Functions
 * Shared across all payment integration pages
 */

// HTML escape function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal management utilities
const ModalUtils = {
    show: function(type, title, message) {
        const overlay = document.getElementById('modalOverlay');
        const box = document.getElementById('modalBox');
        const icon = document.getElementById('modalIcon');
        const titleElem = document.getElementById('modalTitle');
        const messageElem = document.getElementById('modalMessage');

        if (box) box.className = 'modal ' + type;
        if (icon) icon.textContent = type === 'success' ? '✅' : '❌';
        if (titleElem) {
            titleElem.textContent = title;
            titleElem.style.color = type === 'success' ? '' : 'red';
        }
        if (messageElem) {
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(messageElem, message);
            } else {
                console.error('TrustedTypes.setInnerHTML is not available');
                messageElem.textContent = message; // Fallback to textContent
            }
        }
        if (overlay) overlay.classList.add('active');
    },

    hide: function() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('active');
    },

    init: function() {
        const closeBtn = document.getElementById('modalCloseBtn');
        const overlay = document.getElementById('modalOverlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hide();
            });
        }
    }
};

// API request helper
async function makeApiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Date formatting helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Currency formatting helper
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Event handler utilities - replaces inline onclick handlers
function setupEventHandlers() {
    // Handle navigation actions
    document.querySelectorAll('[data-action="navigate-home"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/sample-integration/';
        });
    });

    document.querySelectorAll('[data-action="navigate-create-session"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const apiUrl = window.API_URL || '';
            window.location.href = `${apiUrl}/sample-integration/create-session/`;
        });
    });

    // Handle sample data creation (if function exists on page)
    document.querySelectorAll('[data-action="create-sample-data"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof createSampleData === 'function') {
                createSampleData();
            }
        });
    });

    // Handle cache clearing (if function exists on page)
    document.querySelectorAll('[data-action="clear-cache"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof clearCache === 'function') {
                clearCache();
            }
        });
    });

    // Handle form clearing (if function exists on page)
    document.querySelectorAll('[data-action="clear-form"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof clearForm === 'function') {
                clearForm();
            }
        });
    });

    // Handle merchant details loading (if function exists on page)
    document.querySelectorAll('[data-action="load-merchant-details"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof loadMerchantDetails === 'function') {
                loadMerchantDetails();
            }
        });
    });

    // Mobile menu toggle
    const mobileFab = document.getElementById('mobileFab');
    const mobileActionsMenu = document.getElementById('mobileActionsMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (mobileFab && mobileActionsMenu && mobileOverlay) {
        mobileFab.addEventListener('click', () => {
            mobileFab.classList.toggle('active');
            mobileActionsMenu.style.display = mobileActionsMenu.style.display === 'block' ? 'none' : 'block';
            mobileOverlay.classList.toggle('active');
        });

        mobileOverlay.addEventListener('click', () => {
            mobileFab.classList.remove('active');
            mobileActionsMenu.style.display = 'none';
            mobileOverlay.classList.remove('active');
        });
    }
}

// Initialize modal utilities and event handlers on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ModalUtils.init();
        setupEventHandlers();
    });
} else {
    ModalUtils.init();
    setupEventHandlers();
}
