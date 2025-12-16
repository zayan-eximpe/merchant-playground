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

// --- Credential injection (per-environment) ---
function getSelectedEnv() {
    const envSwitcher = document.getElementById('env-switcher');
    return localStorage.getItem('selected_env') || (window.Config && window.Config.CURRENT_ENV) || (envSwitcher && envSwitcher.value) || 'production';
}

function isEncryptedString(val) {
    if (typeof val !== 'string') return false;
    try { JSON.parse(val); return false; } catch (_) { return true; }
}

function getConfigValue(key) {
    const env = getSelectedEnv();
    const storedKey = 'eximpe_credentials_' + env;
    const raw = localStorage.getItem(storedKey);

    if (raw && !isEncryptedString(raw)) {
        try {
            const parsed = JSON.parse(raw || '{}');
            if (parsed && parsed[key] !== undefined && parsed[key] !== '') {
                return parsed[key];
            }
        } catch (e) {
            // fall through to other options
        }
    }

    if (window.Config && window.Config[key]) {
        return window.Config[key];
    }

    return null;
}


function loadInjectedConfigs() {
    const env = getSelectedEnv();
    const storedKey = 'eximpe_credentials_' + env;
    const raw = localStorage.getItem(storedKey);

    document.querySelectorAll('[data-inject-config]').forEach(el => {
        const key = el.dataset.injectConfig;
        const suffix = el.dataset.injectSuffix || '';

        // Priority: stored plain credentials > window.Config > leave existing value
        if (raw && !isEncryptedString(raw)) {
            try {
                const parsed = JSON.parse(raw || '{}');
                if (parsed && parsed[key] !== undefined && parsed[key] !== '') {
                    el.value = parsed[key] + suffix;
                    return;
                }
            } catch (e) {
                // fall through to other options
            }
        }

        if (window.Config && window.Config[key]) {
            // only set if element is empty (don't overwrite intentional page values)
            if (!el.value) {
                el.value = window.Config[key] + suffix;
            }
        }
    });

    // Additionally populate commonly-used credential fields by id for compatibility
    if (raw && !isEncryptedString(raw)) {
        try {
            const parsed = JSON.parse(raw || '{}');
            if (parsed.CLIENT_ID || parsed.API_KEY) {
                const cid = parsed.CLIENT_ID || parsed.API_KEY || '';
                const el = document.getElementById('clientId');
                if (el && !el.value) el.value = cid;
            }
            if (parsed.AUTH_KEY || parsed.MERCHANT_SECRET) {
                const sk = parsed.AUTH_KEY || parsed.MERCHANT_SECRET || '';
                const el = document.getElementById('authKey');
                if (el && !el.value) el.value = sk;
            }
            if (parsed.MERCHANT_ID) {
                const el = document.getElementById('merchantId');
                if (el && !el.value) el.value = parsed.MERCHANT_ID;
            }
            // also populate window.Config so legacy pages that read window.Config pick up stored creds
            window.Config = window.Config || {};
            if (!window.Config.CLIENT_ID && (parsed.CLIENT_ID || parsed.API_KEY)) {
                window.Config.CLIENT_ID = parsed.CLIENT_ID || parsed.API_KEY || '';
            }
            if (!window.Config.AUTH_KEY && (parsed.AUTH_KEY || parsed.MERCHANT_SECRET || parsed.CLIENT_SECRET)) {
                window.Config.AUTH_KEY = parsed.AUTH_KEY || parsed.MERCHANT_SECRET || parsed.CLIENT_SECRET || '';
            }
            if (!window.Config.MERCHANT_ID && parsed.MERCHANT_ID) {
                window.Config.MERCHANT_ID = parsed.MERCHANT_ID;
            }
            if (typeof parsed.IS_PSP !== 'undefined') {
                const cb = document.getElementById('isPspCheckbox');
                if (cb) cb.checked = parsed.IS_PSP ? true : false;
                const merchantGroup = document.getElementById('merchantIdGroup');
                if (merchantGroup) merchantGroup.style.display = cb && cb.checked ? 'block' : 'none';
                // reflect to window.Config as well
                window.Config.IS_PSP = parsed.IS_PSP ? true : false;
            }
        } catch (e) {
            // ignore parse errors
        }
    } else if (raw && isEncryptedString(raw)) {
        // If encrypted, don't overwrite fields — user must decrypt explicitly
    } else {
        // fallback to window.Config for common fields
        const cidEl = document.getElementById('clientId');
        if (cidEl && !cidEl.value && window.Config && (window.Config.CLIENT_ID || window.Config.API_KEY)) {
            cidEl.value = window.Config.CLIENT_ID || window.Config.API_KEY || '';
        }
        const skEl = document.getElementById('authKey');
        if (skEl && !skEl.value && window.Config && (window.Config.AUTH_KEY || window.Config.MERCHANT_SECRET || window.Config.CLIENT_SECRET)) {
            skEl.value = window.Config.AUTH_KEY || window.Config.MERCHANT_SECRET || window.Config.CLIENT_SECRET || '';
        }
        const midEl = document.getElementById('merchantId');
        if (midEl && !midEl.value && window.Config && window.Config.MERCHANT_ID) {
            midEl.value = window.Config.MERCHANT_ID;
        }
    }

    // If the stored value is encrypted, do not attempt to overwrite inputs.
    if (raw && isEncryptedString(raw)) {
        console.info('Encrypted credentials present for', env, '- use the playground to decrypt.');
    }
}

// Run after all page scripts have executed so stored credentials can overwrite defaults.
window.addEventListener('load', () => {
    try { loadInjectedConfigs(); } catch (e) { console.error('Failed to load injected configs', e); }
    try { showEncryptedBannerIfNeeded(); } catch (e) { /* ignore */ }
    // retry injection a couple times to handle pages that set inputs after load
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e){} }, 200);
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e){} }, 600);
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e){} }, 1500);
});

// Show a small banner when encrypted credentials exist for the selected env
function showEncryptedBannerIfNeeded() {
    const env = getSelectedEnv();
    const storedKey = 'eximpe_credentials_' + env;
    const raw = localStorage.getItem(storedKey);
    if (!raw || !isEncryptedString(raw)) return;
    if (document.querySelector('.encrypted-creds-banner')) return;

    // inject minimal styles
    const style = document.createElement('style');
    style.textContent = `
    .encrypted-creds-banner { background: linear-gradient(90deg,#fffaf0,#fff2e8); border:1px solid #fde68a; padding:10px 14px; border-radius:8px; margin:12px auto; max-width:1000px; box-shadow:0 4px 12px rgba(44,62,80,0.06); font-size:13px; color:#92400e; }
    .encrypted-creds-banner a{ color:#92400e; font-weight:600; text-decoration:underline; }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.className = 'encrypted-creds-banner';
    banner.innerHTML = `Encrypted credentials are stored for <strong>${env}</strong>. <a href="../index.html">Open playground to decrypt and manage credentials</a>.`;

    // insert before first .container or at top of body
    const container = document.querySelector('.container');
    if (container && container.parentNode) {
        container.parentNode.insertBefore(banner, container);
    } else {
        document.body.insertBefore(banner, document.body.firstChild);
    }
}
