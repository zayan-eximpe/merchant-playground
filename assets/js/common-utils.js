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
    show: function (type, title, message) {
        const overlay = document.getElementById('modalOverlay');
        const box = document.getElementById('modalBox');
        const icon = document.getElementById('modalIcon');
        const titleElem = document.getElementById('modalTitle');
        const messageElem = document.getElementById('modalMessage');

        if (box) box.className = 'modal ' + type;

        if (icon) {
            if (type === 'minimal') {
                icon.style.display = 'none';
            } else {
                icon.style.display = 'flex';
                icon.textContent = type === 'success' ? '✅' : '❌';
            }
        }

        if (titleElem) {
            titleElem.textContent = title;
            if (type === 'minimal' || !title) {
                titleElem.style.display = 'none';
            } else {
                titleElem.style.display = 'block';
            }
        }

        if (messageElem) {
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(messageElem, message);
            } else {
                messageElem.innerHTML = message;
            }
        }
        if (overlay) overlay.classList.add('active');
    },

    hide: function () {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('active');
    },

    init: function () {
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

// UPI Utilities for Intent handling
const UPIUtils = {
    isAndroid: function () {
        return /Android/i.test(navigator.userAgent);
    },

    isIOS: function () {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    isDesktop: function () {
        return !this.isAndroid() && !this.isIOS();
    },

    /**
     * Generates a QR code URL for the given text using a public API
     */
    getQRCodeUrl: function (text, size = 200) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    },

    // App configurations for Android (package names and fallback URLs)
    androidApps: {
        'bhim': { package: 'in.org.npci.upiapp', playStoreUrl: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp' },
        'paytm': { package: 'net.one97.paytm', playStoreUrl: 'https://play.google.com/store/apps/details?id=net.one97.paytm' },
        'phonepe': { package: 'com.phonepe.app', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.phonepe.app' },
        'gpay': { package: 'com.google.android.apps.nbu.paisa.user', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user' },
        'amazonpay': { package: 'in.amazon.mShop.android.shopping', playStoreUrl: 'https://play.google.com/store/apps/details?id=in.amazon.mShop.android.shopping' },
        'whatsapp': { package: 'com.whatsapp', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp' },
        'fimoney': { package: 'com.fi.money', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.fi.money' },
        'jupiter': { package: 'money.jupiter', playStoreUrl: 'https://play.google.com/store/apps/details?id=money.jupiter.app' },
        'slice': { package: 'indwin.c3.shareapp', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sliceit.app' },
        'cred': { package: 'com.dreamplug.androidapp', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dreamplug.androidapp' },
        'supermoney': { package: 'money.super.payments', playStoreUrl: 'https://play.google.com/store/apps/details?id=money.super.payments' },
        'generalintent': { package: 'com.google.android.apps.nbu.paisa.user', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user' },
        'generalupi': { package: 'in.org.npci.upiapp', playStoreUrl: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp' }
    },

    // App prefixes for iOS
    iosPrefixes: {
        'bhim': 'bhim://upi/pay?',
        'paytm': 'paytmmp://upi/pay?',
        'phonepe': 'phonepe://upi/pay?',
        'gpay': 'gpay://upi/pay?',
        'amazonpay': 'amazonpay://upi/pay?',
        'whatsapp': 'whatsapp://upi/pay?',
        'fimoney': 'fi://upi/pay?',
        'jupiter': 'jupiter://upi/pay?',
        'slice': 'slice://upi/pay?',
        'cred': 'credpay://upi/pay?',
        'supermoney': 'super://pay?',
        'generalupi': 'upi://pay?',
        'generalintent': 'intent://pay?'
    },

    /**
     * Constructs the final UPI intent URL based on platform and app type
     */
    constructUrl: function (intentUri, appType) {
        let cleanedParams = intentUri;
        if (cleanedParams.includes('upi://pay?')) {
            cleanedParams = cleanedParams.split('upi://pay?')[1];
        } else if (cleanedParams.includes('?')) {
            cleanedParams = cleanedParams.split('?')[1];
        }

        // For general UPI and general Intent, or on non-Android platforms, use direct URI
        if (appType === 'generalupi' || appType === 'generalintent' || !this.isAndroid()) {
            const prefix = this.iosPrefixes[appType] || 'upi://pay?';
            return prefix + cleanedParams;
        }

        // Specific Android Intent for known apps
        const config = this.androidApps[appType] || this.androidApps['generalupi'];
        return `intent://pay?${cleanedParams}#Intent;scheme=upi;package=${config.package};S.browser_fallback_url=${encodeURIComponent(config.playStoreUrl)};end;`;
    },

    /**
     * Opens the UPI app with the given intent URI
     */
    openApp: function (intentUri, appType, button) {
        const originalContent = button ? button.innerHTML : '';
        const url = this.constructUrl(intentUri, appType);

        console.log(`[UPIUtils] Platform: ${this.isAndroid() ? 'Android' : 'iOS/Other'}, App: ${appType}, URL: ${url}`);

        try {
            if (this.isAndroid()) {
                window.location.href = url;
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            if (button) {
                const successHtml = `
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <span style="font-size: 12px; font-weight: 500; color: #374151;">Launched!</span>
                `;
                if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                    window.TrustedTypes.setInnerHTML(button, successHtml);
                } else {
                    button.innerHTML = successHtml;
                }
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                        window.TrustedTypes.setInnerHTML(button, originalContent);
                    } else {
                        button.innerHTML = originalContent;
                    }
                    button.style.transform = 'scale(1)';
                }, 2000);
            }
        } catch (err) {
            console.error('[UPIUtils] Failed to open UPI app:', err);
            if (button) {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(intentUri).then(() => {
                    const copiedHtml = `
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #4f46e5); display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                        </div>
                        <span style="font-size: 12px; font-weight: 500; color: #374151;">Copied!</span>
                    `;
                    if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                        window.TrustedTypes.setInnerHTML(button, copiedHtml);
                    } else {
                        button.innerHTML = copiedHtml;
                    }
                    setTimeout(() => {
                        if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                            window.TrustedTypes.setInnerHTML(button, originalContent);
                        } else {
                            button.innerHTML = originalContent;
                        }
                    }, 3000);
                });
            }
        }
    }
};

// Event handler utilities - replaces inline onclick handlers
function setupEventHandlers() {
    // Handle navigation actions
    document.querySelectorAll('[data-action="navigate-home"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/index.html';
        });
    });

    document.querySelectorAll('[data-action="navigate-create-session"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const apiUrl = window.origin || '';
            window.location.href = `${apiUrl}/checkout/create_session.html`;
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
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e) { } }, 200);
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e) { } }, 600);
    setTimeout(() => { try { loadInjectedConfigs(); } catch (e) { } }, 1500);
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
