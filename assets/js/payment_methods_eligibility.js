/**
 * Payment Methods Eligibility Page Logic
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('eligibilityForm');
    const checkBtn = document.getElementById('checkEligibilityButton');
    const btnText = document.getElementById('btnText');
    const resultContainer = document.getElementById('eligibilityResult');
    const copyBtn = document.getElementById('copyResultBtn');
    let lastResultJson = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    /**
     * Renders eligibility data as a checkout-style UI: cards, netbanking grid, UPI apps.
     */
    function renderCheckoutStyle(data) {
        if (!data || typeof data !== 'object') {
            return '<p class="checkout-empty">No eligibility data available.</p>';
        }

        const parts = ['<div class="checkout-result">'];

        // ----- Cards -----
        const card = data.card;
        if (card && typeof card === 'object') {
            parts.push('<section class="checkout-section checkout-cards">');
            parts.push('<h3 class="checkout-section-title"><i class="fas fa-credit-card"></i> Card</h3>');

            ['credit', 'debit'].forEach((type) => {
                const sub = card[type];
                if (!sub || !sub.eligible) return;
                const label = type.charAt(0).toUpperCase() + type.slice(1);
                const logos = sub.network_logos || {};
                const networks = sub.eligible_networks || Object.keys(logos);
                if (networks.length === 0) return;

                parts.push(`<div class="checkout-card-type"><span class="checkout-card-type-label">${escapeHtml(label)}</span>`);
                parts.push('<div class="checkout-network-logos">');
                networks.forEach((net) => {
                    const url = logos[net];
                    const name = escapeHtml(String(net));
                    if (url) {
                        parts.push(`<span class="checkout-network-item" title="${name}"><img src="${escapeHtml(url)}" alt="${name}" class="checkout-network-img"></span>`);
                    } else {
                        parts.push(`<span class="checkout-network-item checkout-network-name">${name}</span>`);
                    }
                });
                parts.push('</div></div>');
            });
            parts.push('</section>');
        }

        // ----- UPI -----
        const upi = data.upi;
        if (upi && typeof upi === 'object' && upi.eligible) {
            const displayName = upi.display_name || 'UPI';
            const appConfigs = upi.app_configs || {};
            const supportedApps = Array.isArray(upi.supported_apps) ? upi.supported_apps : Object.keys(appConfigs);

            parts.push('<section class="checkout-section checkout-upi">');
            parts.push(`<h3 class="checkout-section-title"><i class="fas fa-mobile-alt"></i> ${escapeHtml(displayName)}</h3>`);
            parts.push('<div class="checkout-upi-apps">');
            supportedApps.forEach((appKey) => {
                const cfg = appConfigs[appKey] || {};
                const logoUrl = cfg.logo || (upi.app_logos && upi.app_logos[appKey]);
                const label = escapeHtml(String(appKey));
                if (logoUrl) {
                    parts.push(`<span class="checkout-upi-app" title="${label}"><img src="${escapeHtml(logoUrl)}" alt="${label}" class="checkout-upi-app-img"></span>`);
                } else {
                    parts.push(`<span class="checkout-upi-app checkout-upi-app-name">${label}</span>`);
                }
            });
            parts.push('</div></section>');
        }

        // ----- EMI (arrays) -----
        const emi = data.emi;
        if (emi && typeof emi === 'object') {
            const creditEmi = Array.isArray(emi.credit_card_emi) ? emi.credit_card_emi : [];
            const debitEmi = Array.isArray(emi.debit_card_emi) ? emi.debit_card_emi : [];
            const cardlessEmi = Array.isArray(emi.cardless_emi) ? emi.cardless_emi : [];
            const hasAnyEmi = creditEmi.length || debitEmi.length || cardlessEmi.length;

            if (hasAnyEmi) {
                parts.push('<section class="checkout-section checkout-emi">');
                parts.push('<h3 class="checkout-section-title"><i class="fas fa-calendar-alt"></i> EMI</h3>');

                function renderEmiGroup(items, title) {
                    if (!Array.isArray(items) || items.length === 0) return;
                    const visibleItems = items.filter((m) => m.eligible !== false);
                    if (!visibleItems.length) return;

                    parts.push('<div class="checkout-emi-group">');
                    parts.push(
                        `<div class="checkout-emi-group-header"><span class="checkout-emi-group-title">${escapeHtml(
                            title
                        )}</span><span class="checkout-emi-group-count">${visibleItems.length
                        } options</span></div>`
                    );
                    parts.push('<div class="checkout-emi-list">');

                    visibleItems.forEach((m) => {
                        const name = escapeHtml(m.display_name || m.issuer || m.bank_code || '');
                        const logo = m.logo;
                        const tenures = Array.isArray(m.tenures) ? m.tenures : [];
                        const tenureMonths = Array.from(
                            new Set(
                                tenures
                                    .map((t) => t && t.tenure_months)
                                    .filter((v) => Number.isFinite(v))
                            )
                        ).sort((a, b) => a - b);

                        // Derive a simple "from X% p.a." label if interest data is present
                        const interestRates = tenures
                            .map((t) => t && t.annual_interest_rate)
                            .filter((v) => typeof v === 'number');
                        const minRate =
                            interestRates.length > 0
                                ? Math.min.apply(null, interestRates)
                                : null;

                        parts.push('<div class="checkout-emi-row">');

                        // Left: logo
                        parts.push('<div class="checkout-emi-logo-wrap">');
                        if (logo) {
                            parts.push(
                                `<img src="${escapeHtml(logo)}" alt="${name}" class="checkout-emi-logo">`
                            );
                        } else {
                            parts.push(
                                '<div class="checkout-emi-logo checkout-bank-logo-placeholder">—</div>'
                            );
                        }
                        parts.push('</div>');

                        // Middle: name + meta
                        parts.push('<div class="checkout-emi-main">');
                        parts.push(`<div class="checkout-emi-name">${name}</div>`);
                        if (minRate != null) {
                            parts.push(
                                `<div class="checkout-emi-meta">From ${escapeHtml(
                                    String(minRate)
                                )}% p.a.</div>`
                            );
                        }
                        parts.push('</div>');

                        // Right: tenure chips
                        parts.push('<div class="checkout-emi-right">');
                        if (tenureMonths.length > 0) {
                            parts.push('<div class="checkout-emi-tenures">');
                            tenureMonths.forEach((mth) => {
                                parts.push(
                                    `<span class="checkout-emi-tenure-chip">${escapeHtml(
                                        String(mth)
                                    )}m</span>`
                                );
                            });
                            parts.push('</div>');
                        } else {
                            parts.push(
                                '<div class="checkout-emi-tenures checkout-emi-tenures-empty">Tenure details not available</div>'
                            );
                        }
                        parts.push('</div>'); // right

                        parts.push('</div>'); // row
                    });

                    parts.push('</div></div>'); // list + group
                }

                renderEmiGroup(creditEmi, 'Credit Card EMI');
                renderEmiGroup(debitEmi, 'Debit Card EMI');
                renderEmiGroup(cardlessEmi, 'Cardless EMI');

                parts.push('</section>');
            }
        }

        // ----- Net Banking (array) -----
        const netbanking = data.netbanking;
        if (Array.isArray(netbanking) && netbanking.length > 0) {
            parts.push('<section class="checkout-section checkout-netbanking">');
            parts.push('<h3 class="checkout-section-title"><i class="fas fa-university"></i> Net Banking</h3>');
            parts.push('<div class="checkout-bank-grid">');
            netbanking.filter((b) => b.eligible !== false).forEach((bank) => {
                const name = escapeHtml(bank.display_name || bank.bank_name || bank.bank_code || '');
                const logo = bank.logo;
                parts.push('<div class="checkout-bank-item">');
                if (logo) {
                    parts.push(`<img src="${escapeHtml(logo)}" alt="${name}" class="checkout-bank-logo">`);
                } else {
                    parts.push('<div class="checkout-bank-logo checkout-bank-logo-placeholder">—</div>');
                }
                parts.push(`<span class="checkout-bank-name">${name}</span>`);
                parts.push('</div>');
            });
            parts.push('</div></section>');
        }

        // ----- Wallet (array) -----
        const wallet = data.wallet;
        if (Array.isArray(wallet) && wallet.length > 0) {
            parts.push('<section class="checkout-section checkout-wallet">');
            parts.push('<h3 class="checkout-section-title"><i class="fas fa-wallet"></i> Wallet</h3>');
            parts.push('<div class="checkout-bank-grid">');
            wallet.filter((w) => w.eligible !== false).forEach((w) => {
                const name = escapeHtml(w.display_name || w.issuer || w.bank_code || '');
                const logo = w.logo;
                parts.push('<div class="checkout-bank-item">');
                if (logo) {
                    parts.push(`<img src="${escapeHtml(logo)}" alt="${name}" class="checkout-bank-logo">`);
                } else {
                    parts.push('<div class="checkout-bank-logo checkout-bank-logo-placeholder">—</div>');
                }
                parts.push(`<span class="checkout-bank-name">${name}</span>`);
                parts.push('</div>');
            });
            parts.push('</div></section>');
        }

        if (parts.length === 1) {
            parts.push('<p class="checkout-empty">No eligible payment methods returned.</p>');
        }
        parts.push('</div>');
        return parts.join('');
    }

    function updateCopyButtonState() {
        if (copyBtn && resultContainer) {
            const hasContent = resultContainer.textContent.trim().length > 0;
            if (hasContent) {
                copyBtn.disabled = false;
                copyBtn.style.opacity = '1';
                copyBtn.style.pointerEvents = 'auto';
            } else {
                copyBtn.disabled = true;
                copyBtn.style.opacity = '0.5';
                copyBtn.style.pointerEvents = 'none';
            }
        }
    }

    if (copyBtn && resultContainer) {
        // Initialize button state
        updateCopyButtonState();

        copyBtn.addEventListener('click', function () {
            const text = lastResultJson || resultContainer.textContent || '';
            if (!text) return;
            copyToClipboard(text);
            if (copyBtn.dataset.originalLabel === undefined) {
                copyBtn.dataset.originalLabel = copyBtn.innerHTML;
            }
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                    window.TrustedTypes.setInnerHTML(copyBtn, copyBtn.dataset.originalLabel);
                } else {
                    copyBtn.innerHTML = copyBtn.dataset.originalLabel;
                }
            }, 1500);
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const amountRaw = (document.getElementById('amount').value || '').trim();
        const mobileRaw = (document.getElementById('customerMobile').value || '').trim();

        if (!amountRaw) {
            showModal('error', 'Missing Amount', '<p>Please enter an amount in INR.</p>');
            return;
        }

        const amountNumber = Number(amountRaw);
        if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
            showModal('error', 'Invalid Amount', '<p>Amount must be a positive number.</p>');
            return;
        }

        const payload = {
            amount: Math.round(amountNumber),
        };
        if (mobileRaw) {
            payload.customer_mobile = '+91' + mobileRaw;
        }

        const apiUrl = `${window.API_URL}/pg/eligibility/payment-methods/`;

        checkBtn.disabled = true;
        btnText.textContent = 'Checking...';
        lastResultJson = '';
        if (resultContainer) {
            if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                window.TrustedTypes.setInnerHTML(resultContainer, '');
            } else {
                resultContainer.innerHTML = '';
            }
        }
        updateCopyButtonState();

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Client-Secret': getConfigValue('AUTH_KEY'),
                    'X-Client-ID': getConfigValue('CLIENT_ID'),
                    ...(getConfigValue('IS_PSP') && getConfigValue('MERCHANT_ID')
                        ? { 'X-Merchant-ID': getConfigValue('MERCHANT_ID') }
                        : {}),
                },
                body: JSON.stringify(payload),
            });

            const json = await response.json();

            if (!response.ok) {
                const errMsg =
                    (json && json.error && json.error.message) ||
                    `HTTP error! status: ${response.status}`;
                throw new Error(errMsg);
            }

            const data = json && typeof json === 'object' && 'data' in json ? json.data : json;
            const pretty = JSON.stringify(data, null, 2);
            lastResultJson = pretty;

            const htmlCheckout = renderCheckoutStyle(data);
            if (resultContainer) {
                if (window.TrustedTypes && typeof window.TrustedTypes.setInnerHTML === 'function') {
                    window.TrustedTypes.setInnerHTML(resultContainer, htmlCheckout);
                } else {
                    resultContainer.innerHTML = htmlCheckout;
                }
            }
            updateCopyButtonState();

            const message = `<div class="checkout-modal-wrap">${htmlCheckout}</div>`;
            showModal('success', 'Eligibility Result', message);
        } catch (err) {
            console.error('Eligibility request failed:', err);
            const msg = escapeHtml(err.message || 'Failed to fetch eligibility. Please check console for details.');
            showModal('error', 'Eligibility Failed', `<p>${msg}</p>`);
            updateCopyButtonState();
        } finally {
            checkBtn.disabled = false;
            btnText.textContent = 'Check Eligibility';
        }
    });
});

// -------- Sample Data & Reset Helpers (used by common quick actions) --------

function createSampleData() {
    const amountEl = document.getElementById('amount');
    const mobileEl = document.getElementById('customerMobile');

    if (amountEl) amountEl.value = '10000';
    if (mobileEl) mobileEl.value = '9876543210';
}

function clearCache() {
    const form = document.getElementById('eligibilityForm');
    if (form) {
        form.reset();
    }
}
