/**
 * Virtual Bank Account (VBA) Creation Page Logic
 */

document.addEventListener('DOMContentLoaded', function () {
    const fetchForm = document.getElementById('vbaFetchForm');
    const fetchButton = document.getElementById('fetchButton');
    const vbaIdInput = document.getElementById('vbaId');
    const quickCreateVbaButton = document.getElementById('quickCreateVbaButton');
    const vbaResultContainer = document.getElementById('vbaResultContainer');
    const vbaResultContent = document.getElementById('vbaResultContent');
    const vbaEditForm = document.getElementById('vbaEditForm');
    const vbaEditToggleButton = document.getElementById('vbaEditToggleButton');
    const vbaStatusToggleButton = document.getElementById('vbaStatusToggleButton');
    const vbaAccountNameInput = document.getElementById('vbaAccountName');
    const vbaAccountEmailInput = document.getElementById('vbaAccountEmail');
    const vbaAccountPhoneInput = document.getElementById('vbaAccountPhone');
    const editButton = document.getElementById('editButton');
    const vbaPaymentsButton = document.getElementById('vbaPaymentsButton');
    const vbaPaymentUtrToggleButton = document.getElementById('vbaPaymentUtrToggleButton');
    const vbaPaymentsContainer = document.getElementById('vbaPaymentsContainer');
    const vbaPaymentsContent = document.getElementById('vbaPaymentsContent');
    const vbaPaymentUtrRow = document.getElementById('vbaPaymentUtrRow');
    const vbaPaymentUtrInput = document.getElementById('vbaPaymentUtr');
    const vbaPaymentUtrButton = document.getElementById('vbaPaymentUtrButton');
    const verificationModalOverlay = document.getElementById('verificationModalOverlay');
    const verificationModalBox = document.getElementById('verificationModalBox');
    const verificationModalCloseBtn = document.getElementById('verificationModalCloseBtn');
    const verificationModalCancelBtn = document.getElementById('verificationModalCancelBtn');
    const verificationModalPaymentIdEl = document.getElementById('verificationModalPaymentId');
    const verificationDetailsForm = document.getElementById('verificationDetailsForm');
    const verifTypeOfGoods = document.getElementById('verifTypeOfGoods');
    const verifHsCode = document.getElementById('verifHsCode');
    const verifHsCodeGroup = document.getElementById('verifHsCodeGroup');
    const verifHsCodeRequired = document.getElementById('verifHsCodeRequired');
    const verificationModalSubmitBtn = document.getElementById('verificationModalSubmitBtn');
    const verificationModalAutoFillBtn = document.getElementById('verificationModalAutoFillBtn');
    const verificationModalResponse = document.getElementById('verificationModalResponse');

    // Track the latest fetched/created VBA to support editing
    let currentVba = null;
    let currentVerificationPaymentUid = null;

    function showError(message) {
        if (typeof ModalUtils !== 'undefined') {
            ModalUtils.show('error', 'Error', escapeHtml(message || 'An unexpected error occurred.'));
        } else {
            alert(message || 'An unexpected error occurred.');
        }
    }

    function showVbaDetails(title, vba) {
        if (!vbaResultContainer || !vbaResultContent) {
            console.warn('VBA result container not found in DOM.');
            return;
        }

        if (!vba) {
            vbaResultContent.textContent = 'Virtual Bank Account details retrieved successfully, but no data was returned.';
            vbaResultContainer.style.display = 'block';
            if (vbaEditForm) vbaEditForm.style.display = 'none';
            if (vbaEditToggleButton) vbaEditToggleButton.style.display = 'none';
            if (vbaStatusToggleButton) vbaStatusToggleButton.style.display = 'none';
            if (vbaPaymentsButton) vbaPaymentsButton.style.display = 'none';
            if (vbaPaymentUtrToggleButton) vbaPaymentUtrToggleButton.style.display = 'none';
            if (vbaPaymentsContainer) vbaPaymentsContainer.style.display = 'none';
            if (vbaPaymentUtrRow) vbaPaymentUtrRow.style.display = 'none';
            return;
        }

        const detailsHtml = `
            <div style="text-align: left; margin: 4px 0;">
                <div style="margin-bottom: 12px;">
                    <div style="color: #10b981; font-size: 16px; font-weight: 600; margin-bottom: 4px;">
                        ${escapeHtml(title)}
                    </div>
                    <div style="color: #6b7280; font-size: 13px;">
                        Use the details below for Virtual Bank Account transactions.
                    </div>
                </div>
                <div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 2fr; row-gap: 8px; column-gap: 12px; font-size: 14px; color: #374151;">
                        <div style="font-weight: 600;">VBA ID</div>
                        <div style="font-family: monospace;">${escapeHtml(vba.virtual_account_id || 'N/A')}</div>

                        <div style="font-weight: 600;">Name</div>
                        <div>${escapeHtml(
                            (vba.virtual_account_details && vba.virtual_account_details.virtual_account_name) ||
                            vba.vba_account_name ||
                            'N/A'
                        )}</div>

                        ${vba.virtual_account_details ? `
                        <div style="font-weight: 600;">Email</div>
                        <div>${escapeHtml(vba.virtual_account_details.virtual_account_email || 'N/A')}</div>

                        <div style="font-weight: 600;">Phone</div>
                        <div>${escapeHtml(vba.virtual_account_details.virtual_account_phone || 'N/A')}</div>
                        ` : ''}

                        <div style="font-weight: 600;">Bank Code</div>
                        <div>${escapeHtml(vba.vba_bank_code || 'N/A')}</div>

                        <div style="font-weight: 600;">Account Number</div>
                        <div style="font-family: monospace;">${escapeHtml(vba.vba_account_number || 'N/A')}</div>

                        <div style="font-weight: 600;">IFSC</div>
                        <div style="font-family: monospace;">${escapeHtml(vba.vba_ifsc || 'N/A')}</div>

                        <div style="font-weight: 600;">Status</div>
                        <div>${escapeHtml(vba.vba_status || 'N/A')}</div>

                        ${vba.vba_created_on ? `
                        <div style="font-weight: 600;">Created On</div>
                        <div>${escapeHtml(vba.vba_created_on)}</div>
                        ` : ''}

                        ${vba.vba_last_updated_on ? `
                        <div style="font-weight: 600;">Last Updated</div>
                        <div>${escapeHtml(vba.vba_last_updated_on)}</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        vbaResultContent.innerHTML = detailsHtml;
        vbaResultContainer.style.display = 'block';

        // Remember the latest VBA and prefill edit form (but keep it hidden until user clicks Edit)
        currentVba = vba;
        if (vbaEditForm) {
            if (vbaAccountNameInput) {
                vbaAccountNameInput.value =
                    (vba.virtual_account_details && vba.virtual_account_details.virtual_account_name) ||
                    vba.vba_account_name ||
                    '';
            }
            if (vbaAccountEmailInput) {
                vbaAccountEmailInput.value =
                    (vba.virtual_account_details && vba.virtual_account_details.virtual_account_email) ||
                    '';
            }
            if (vbaAccountPhoneInput) {
                vbaAccountPhoneInput.value =
                    (vba.virtual_account_details && vba.virtual_account_details.virtual_account_phone) ||
                    '';
            }
            vbaEditForm.style.display = 'none';
        }
        if (vbaEditToggleButton) {
            vbaEditToggleButton.style.display = 'inline-flex';
        }
        if (vbaStatusToggleButton) {
            const status = (vba.vba_status || '').toUpperCase();
            const isActive = status === 'ACTIVE';
            const label = isActive ? 'Deactivate VBA' : 'Activate VBA';
            const icon = isActive ? 'fa-toggle-off' : 'fa-toggle-on';
            vbaStatusToggleButton.style.display = 'inline-flex';
            const iconEl = vbaStatusToggleButton.querySelector('i');
            const spanEl = vbaStatusToggleButton.querySelector('span');
            if (iconEl) {
                iconEl.className = `fas ${icon}`;
            }
            if (spanEl) {
                spanEl.textContent = label;
            }
        }
        if (vbaPaymentsButton) {
            vbaPaymentsButton.style.display = 'inline-flex';
        }
        if (vbaPaymentUtrToggleButton) {
            vbaPaymentUtrToggleButton.style.display = 'inline-flex';
        }
        if (vbaPaymentsContainer) {
            vbaPaymentsContainer.style.display = 'none';
        }
        if (vbaPaymentUtrRow) {
            vbaPaymentUtrRow.style.display = 'none';
        }
    }

    // Fetch payments for this VBA using GET /pg/vba/{virtual_account_id}/payments/
    async function fetchVbaPayments(urlOverride) {
        const virtualAccountId =
            (!urlOverride && currentVba && currentVba.virtual_account_id) ||
            (!urlOverride && vbaIdInput && vbaIdInput.value.trim());

        let url = urlOverride;
        if (!url) {
            if (!virtualAccountId) {
                showError('Virtual Account ID is required to fetch payments.');
                return;
            }
            url = `${window.API_URL}/pg/vba/${encodeURIComponent(virtualAccountId)}/payments/`;
        }

        if (vbaPaymentsContainer) {
            vbaPaymentsContainer.style.display = 'block';
        }
        if (vbaPaymentsContent) {
            vbaPaymentsContent.innerHTML = 'Loading payments...';
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorDetails = data.error?.details;
                const validationError = errorDetails && errorDetails.error;

                const errorMessage =
                    validationError ||
                    data.error?.message ||
                    data.message ||
                    'Failed to fetch payments for this Virtual Bank Account.';
                showError(errorMessage);
                if (vbaPaymentsContent) vbaPaymentsContent.innerHTML = escapeHtml(errorMessage);
                return;
            }

            const payload = data.data || {};
            const results = payload.results || [];
            const count = typeof payload.count === 'number' ? payload.count : results.length;
            const page = payload.page || null;
            const pageSize = payload.page_size || null;
            const next = payload.next || null;
            const previous = payload.previous || null;

            let html = '';

            html += `<div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                        <strong>Total payments:</strong> ${count}`;
            if (page && pageSize) {
                html += ` &nbsp; | &nbsp; <strong>Page:</strong> ${page} (size ${pageSize})`;
            }
            html += `</div>`;

            if (!results.length) {
                html += `<div style="font-size: 13px; color: #6b7280;">No payments found for this Virtual Bank Account.</div>`;
            } else {
                html += `<div style="overflow-x:auto; margin-top: 8px;">
                            <table style="width:100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background:#f1f5f9;">
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Payment ID</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Order ID</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Status</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Payment UTR</th>
                                        <th style="text-align:right; padding:8px; border-bottom:1px solid #e2e8f0;">Amount</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Created At</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>`;

                results.forEach((payment) => {
                    const amountCents = payment.amount ?? payment.amount_cents ?? 0;
                    const amount = amountCents;
                    const paymentUid = escapeHtml(payment.payment_id || '');
                    html += `
                        <tr>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${paymentUid}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${escapeHtml(payment.order_id || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">${escapeHtml(payment.status || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${escapeHtml(payment.payment_utr || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; text-align:right;">₹${amount}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">${escapeHtml(payment.created_at || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">
                                <button type="button" class="secondary-btn vba-upload-verification-btn" data-payment-uid="${paymentUid}" style="padding:6px 10px; font-size:12px; white-space:nowrap;">
                                    <i class="fas fa-file-upload"></i><span>Populate Payment Details</span>
                                </button>
                            </td>
                        </tr>`;
                });

                html += `        </tbody>
                            </table>
                        </div>`;
            }

            // Pagination controls
            if (next || previous) {
                html += `<div style="margin-top: 12px; display:flex; justify-content:flex-end; gap:8px;">`;
                if (previous) {
                    html += `<button type="button" class="secondary-btn vba-payments-page-btn" data-url="${escapeHtml(previous)}">
                                <i class="fas fa-arrow-left"></i><span>Previous</span>
                             </button>`;
                }
                if (next) {
                    html += `<button type="button" class="secondary-btn vba-payments-page-btn" data-url="${escapeHtml(next)}">
                                <span>Next</span><i class="fas fa-arrow-right"></i>
                             </button>`;
                }
                html += `</div>`;
            }

            if (vbaPaymentsContent) {
                vbaPaymentsContent.innerHTML = html;

                // Attach handlers to pagination buttons (if any)
                vbaPaymentsContent.querySelectorAll('.vba-payments-page-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const targetUrl = e.currentTarget.getAttribute('data-url');
                        if (targetUrl) {
                            await fetchVbaPayments(targetUrl);
                        }
                    });
                });
                // Upload verification buttons are handled via delegation on vbaPaymentsContent
            }
        } catch (error) {
            console.error('Error fetching VBA payments:', error);
            const msg = error && error.message
                ? error.message
                : 'An unexpected error occurred while fetching VBA payments.';
            showError(msg);
            if (vbaPaymentsContent) vbaPaymentsContent.innerHTML = escapeHtml(msg);
        }
    }

    // Fetch a single payment by UTR using GET /pg/vba/{virtual_account_id}/payment-by-utr/?utr=...
    async function fetchVbaPaymentByUtr() {
        const virtualAccountId =
            (currentVba && currentVba.virtual_account_id) ||
            (vbaIdInput && vbaIdInput.value.trim());

        const utr = vbaPaymentUtrInput ? vbaPaymentUtrInput.value.trim() : '';

        if (!virtualAccountId) {
            showError('Virtual Account ID is required to search payments by UTR.');
            return;
        }
        if (!utr) {
            showError('Please enter a UTR to search for a payment.');
            return;
        }

        if (vbaPaymentsContainer) {
            vbaPaymentsContainer.style.display = 'block';
        }
        if (vbaPaymentUtrRow) {
            vbaPaymentUtrRow.style.display = 'grid';
        }
        if (vbaPaymentsContent) {
            vbaPaymentsContent.innerHTML = 'Searching for payment by UTR...';
        }

        try {
            const url = `${window.API_URL}/pg/vba/${encodeURIComponent(virtualAccountId)}/payment-by-utr/?utr=${encodeURIComponent(utr)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorDetails = data.error?.details;
                const validationError = errorDetails && errorDetails.error;

                const errorMessage =
                    validationError ||
                    data.error?.message ||
                    data.message ||
                    'Failed to fetch payment by UTR for this Virtual Bank Account.';
                showError(errorMessage);
                if (vbaPaymentsContent) vbaPaymentsContent.innerHTML = escapeHtml(errorMessage);
                return;
            }

            const payment = data.data || {};
            const results = payment ? [payment] : [];

            let html = '';
            html += `<div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                        <strong>Search result:</strong> ${results.length ? '1 payment found' : 'No payment found'}
                     </div>`;

            if (!results.length) {
                html += `<div style="font-size: 13px; color: #6b7280;">No payment found for the provided UTR and VBA.</div>`;
            } else {
                html += `<div style="overflow-x:auto; margin-top: 8px;">
                            <table style="width:100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background:#f1f5f9;">
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Payment ID</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Order ID</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Status</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Payment UTR</th>
                                        <th style="text-align:right; padding:8px; border-bottom:1px solid #e2e8f0;">Amount</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Created At</th>
                                        <th style="text-align:left; padding:8px; border-bottom:1px solid #e2e8f0;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>`;

                const p = payment;
                const amountCents = p.amount ?? p.amount_cents ?? 0;
                const amount = amountCents;
                const paymentUidSingle = escapeHtml(p.payment_id || '');
                html += `
                        <tr>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${paymentUidSingle}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${escapeHtml(p.order_id || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">${escapeHtml(p.status || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; font-family:monospace;">${escapeHtml(p.payment_utr || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9; text-align:right;">₹${amount}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">${escapeHtml(p.created_at || '')}</td>
                            <td style="padding:8px; border-bottom:1px solid #f1f5f9;">
                                <button type="button" class="secondary-btn vba-upload-verification-btn" data-payment-uid="${paymentUidSingle}" style="padding:6px 10px; font-size:12px; white-space:nowrap;">
                                    <i class="fas fa-file-upload"></i><span>Populate Payment Details</span>
                                </button>
                            </td>
                        </tr>`;

                html += `        </tbody>
                            </table>
                        </div>`;
            }

            if (vbaPaymentsContent) {
                vbaPaymentsContent.innerHTML = html;
            }

        } catch (error) {
            console.error('Error fetching VBA payment by UTR:', error);
            const msg = error && error.message
                ? error.message
                : 'An unexpected error occurred while fetching payment by UTR.';
            showError(msg);
            if (vbaPaymentsContent) vbaPaymentsContent.innerHTML = escapeHtml(msg);
        }
    }

    function openVerificationModal(paymentUid) {
        currentVerificationPaymentUid = paymentUid;
        if (verificationModalPaymentIdEl) verificationModalPaymentIdEl.textContent = paymentUid || '';
        if (verificationDetailsForm) verificationDetailsForm.reset();
        updateVerificationHsCodeVisibility();
        showVerificationResponse(null);
        if (verificationModalOverlay) verificationModalOverlay.style.display = 'flex';
    }

    function showVerificationResponse(success, message, data) {
        if (!verificationModalResponse) return;
        if (success === null) {
            verificationModalResponse.style.display = 'none';
            verificationModalResponse.innerHTML = '';
            return;
        }
        verificationModalResponse.style.display = 'block';
        const isSuccess = success === true;
        const title = isSuccess ? 'Response' : 'Error';
        const borderColor = isSuccess ? '#10b981' : '#ef4444';
        const titleColor = isSuccess ? '#059669' : '#dc2626';
        let html = `<div style="font-size: 13px;"><div style="font-weight: 600; color: ${titleColor}; margin-bottom: 8px;">${escapeHtml(title)}</div>`;
        if (message) html += `<div style="margin-bottom: 8px; color: #374151;">${escapeHtml(message)}</div>`;
        if (data !== undefined && data !== null) {
            html += `<pre style="margin: 0; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">${escapeHtml(typeof data === 'string' ? data : JSON.stringify(data, null, 2))}</pre>`;
        }
        html += '</div>';
        verificationModalResponse.style.borderColor = borderColor;
        verificationModalResponse.innerHTML = html;
        verificationModalResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Sample data matching payment creation forms (create_session / upi_collection / etc.)
    function fillVerificationFormWithSampleData() {
        const currentEnv = getSelectedEnv();
        const isProduction = currentEnv === 'production';
        
        const sampleData = {
            buyer_name: isProduction ? 'John Doe' : 'John',
            type_of_goods: 'PHYSICAL_GOODS',
            product_description: isProduction ? 'This is a sample product description' : 'This is a test product for test purpose',
            buyer_address: '123 Main Street, Apt 4B, City, State',
            invoice_number: 'INV' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            buyer_postal_code: isProduction ? '123456' : '560034',
            hs_code: '98051000'
        };
        const buyerNameEl = document.getElementById('verifBuyerName');
        const productDescEl = document.getElementById('verifProductDescription');
        const buyerAddressEl = document.getElementById('verifBuyerAddress');
        const invoiceNumberEl = document.getElementById('verifInvoiceNumber');
        const buyerPostalEl = document.getElementById('verifBuyerPostalCode');
        if (buyerNameEl) buyerNameEl.value = sampleData.buyer_name;
        if (verifTypeOfGoods) verifTypeOfGoods.value = sampleData.type_of_goods;
        if (productDescEl) productDescEl.value = sampleData.product_description;
        if (buyerAddressEl) buyerAddressEl.value = sampleData.buyer_address;
        if (invoiceNumberEl) invoiceNumberEl.value = sampleData.invoice_number;
        if (buyerPostalEl) buyerPostalEl.value = sampleData.buyer_postal_code;
        if (verifHsCode) verifHsCode.value = sampleData.hs_code;
        updateVerificationHsCodeVisibility();
    }

    function closeVerificationModal() {
        currentVerificationPaymentUid = null;
        if (verificationModalOverlay) verificationModalOverlay.style.display = 'none';
    }

    function updateVerificationHsCodeVisibility() {
        const type = verifTypeOfGoods ? verifTypeOfGoods.value : '';
        const needsHsCode = type === 'PHYSICAL_GOODS';
        if (verifHsCode) verifHsCode.required = needsHsCode;
        if (verifHsCodeRequired) verifHsCodeRequired.style.visibility = needsHsCode ? 'visible' : 'hidden';
    }

    async function uploadVerificationDetails() {
        const paymentUid = currentVerificationPaymentUid;
        if (!paymentUid) {
            showVerificationResponse(false, 'Payment UID is missing.', null);
            return;
        }

        const buyerName = document.getElementById('verifBuyerName') && document.getElementById('verifBuyerName').value.trim();
        const typeOfGoods = verifTypeOfGoods && verifTypeOfGoods.value;
        const productDescription = document.getElementById('verifProductDescription') && document.getElementById('verifProductDescription').value.trim();
        const buyerAddress = document.getElementById('verifBuyerAddress') && document.getElementById('verifBuyerAddress').value.trim();
        const invoiceNumber = document.getElementById('verifInvoiceNumber') && document.getElementById('verifInvoiceNumber').value.trim();
        const buyerPostalCode = document.getElementById('verifBuyerPostalCode') && document.getElementById('verifBuyerPostalCode').value.trim();
        const hsCode = verifHsCode && verifHsCode.value.trim();

        if (!typeOfGoods || !productDescription || !buyerAddress || !invoiceNumber || !buyerPostalCode) {
            showVerificationResponse(false, 'Please fill all required fields.', null);
            return;
        }

        const needsHsCode = typeOfGoods === 'PHYSICAL_GOODS';
        if (needsHsCode && !hsCode) {
            showVerificationResponse(false, 'HS code is required when type of goods is PHYSICAL_GOODS.', null);
            return;
        }

        const payload = {
            type_of_goods: typeOfGoods,
            product_description: productDescription,
            buyer_address: buyerAddress,
            invoice_number: invoiceNumber,
            buyer_postal_code: buyerPostalCode
        };
        if (buyerName) payload.buyer_name = buyerName;
        if (hsCode) payload.hs_code = hsCode;

        if (verificationModalSubmitBtn) {
            verificationModalSubmitBtn.disabled = true;
            verificationModalSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }
        showVerificationResponse(null);

        try {
            const response = await fetch(`${window.API_URL}/pg/payments/${encodeURIComponent(paymentUid)}/upload-verification-details/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || (data.error_details && (typeof data.error_details === 'string' ? data.error_details : JSON.stringify(data.error_details))) || (data.error && data.error.details && (typeof data.error.details === 'string' ? data.error.details : JSON.stringify(data.error.details))) || 'Failed to upload payment verification details.';
                showVerificationResponse(false, errorMessage, data);
                return;
            }

            showVerificationResponse(true, data.message || 'Payment verification details uploaded successfully.', data);
        } catch (error) {
            console.error('Error uploading verification details:', error);
            const msg = error && error.message ? error.message : 'An unexpected error occurred while uploading verification details.';
            showVerificationResponse(false, msg, null);
        } finally {
            if (verificationModalSubmitBtn) {
                verificationModalSubmitBtn.disabled = false;
                verificationModalSubmitBtn.innerHTML = '<i class="fas fa-upload"></i><span>Upload</span>';
            }
        }
    }

    function storeLastVbaId(virtualAccountId) {
        if (virtualAccountId) {
            localStorage.setItem('eximpe_last_vba_id', virtualAccountId);
            if (vbaIdInput && !vbaIdInput.value) {
                vbaIdInput.value = virtualAccountId;
            }
        }
    }

    function getHeaders() {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'X-Client-Secret': getConfigValue('AUTH_KEY'),
            'X-Client-ID': getConfigValue('CLIENT_ID'),
        };

        const isPsp = getConfigValue('IS_PSP');
        const merchantId = getConfigValue('MERCHANT_ID');
        const isPspEnabled = isPsp === true || isPsp === 'true' || isPsp === 1 ||
            (window.Config && (window.Config.IS_PSP === true || window.Config.IS_PSP === 'true'));
        const finalMerchantId = merchantId || (window.Config && window.Config.MERCHANT_ID);

        if (isPspEnabled && finalMerchantId) {
            headers['X-Merchant-ID'] = finalMerchantId;
        }

        return headers;
    }

    // Create a VBA without sending any email or additional payload fields
    async function createVba(triggerButton) {
        const btn = triggerButton || quickCreateVbaButton;
        let originalLabel = '';
        if (btn) {
            btn.disabled = true;
            originalLabel = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening VBA...';
        }

        try {
            const response = await fetch(`${window.API_URL}/pg/vba/`, {
                method: 'POST',
                headers: getHeaders(),
                // Do not send any request body fields as per latest requirement
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage =
                    data.error?.message ||
                    data.message ||
                    'Failed to create Virtual Bank Account. Please check your inputs and try again.';
                showError(errorMessage);
                return;
            }

            const vbaArray = data.data || [];
            const vba = Array.isArray(vbaArray) && vbaArray.length ? vbaArray[0] : null;
            if (vba && vba.virtual_account_id) {
                storeLastVbaId(vba.virtual_account_id);
            }
            showVbaDetails('VBA Created Successfully', vba);
        } catch (error) {
            console.error('Error creating VBA:', error);
            showError(error && error.message
                ? error.message
                : 'An unexpected error occurred while creating the Virtual Bank Account.');
        } finally {
            if (btn) {
                btn.disabled = false;
                if (originalLabel) {
                    btn.innerHTML = originalLabel;
                }
            }
        }
    }

    async function fetchVbaDetails(virtualAccountId) {
        if (!virtualAccountId) {
            showError('Please enter a Virtual Account ID.');
            return;
        }

        fetchButton.disabled = true;

        try {
            const response = await fetch(`${window.API_URL}/pg/vba/${encodeURIComponent(virtualAccountId)}/`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorDetails = data.error?.details;
                const validationError = errorDetails && errorDetails.error;

                const errorMessage =
                    validationError ||
                    data.error?.message ||
                    data.message ||
                    'Failed to fetch Virtual Bank Account details.';
                showError(errorMessage);
                return;
            }

            // Response shapes we support:
            // 1) { "success": true, "data": { ...single VBA object... } }
            // 2) { "virtual_bank_accounts": [ { ... } ] }
            // 3) { "data": { "virtual_bank_accounts": [ { ... } ] } }
            let vba = null;
            if (data && data.data && !Array.isArray(data.data) && !data.virtual_bank_accounts) {
                // Shape 1: single object under data
                vba = data.data;
            } else {
                // Shapes with arrays
                const accounts = (data.virtual_bank_accounts) ||
                    (data.data && data.data.virtual_bank_accounts) ||
                    data.data ||
                    [];
                vba = Array.isArray(accounts) && accounts.length ? accounts[0] : null;
            }

            if (vba && vba.virtual_account_id) {
                storeLastVbaId(vba.virtual_account_id);
            }

            showVbaDetails('VBA Details', vba);
        } catch (error) {
            console.error('Error fetching VBA details:', error);
            showError(error && error.message
                ? error.message
                : 'An unexpected error occurred while fetching Virtual Bank Account details.');
        } finally {
            fetchButton.disabled = false;
        }
    }

    // Edit VBA details using PUT /pg/vba/{virtual_account_id}/
    async function updateVbaDetails() {
        const virtualAccountId =
            (currentVba && currentVba.virtual_account_id) ||
            (vbaIdInput && vbaIdInput.value.trim());

        if (!virtualAccountId) {
            showError('Virtual Account ID is required to update VBA details.');
            return;
        }

        const name = vbaAccountNameInput ? vbaAccountNameInput.value.trim() : '';
        const email = vbaAccountEmailInput ? vbaAccountEmailInput.value.trim() : '';
        const phone = vbaAccountPhoneInput ? vbaAccountPhoneInput.value.trim() : '';

        const payload = {};
        if (name) payload.virtual_account_name = name;
        if (email) payload.virtual_account_email = email;
        if (phone) payload.virtual_account_phone = phone;

        if (Object.keys(payload).length === 0) {
            showError('Please provide at least one field (name, email, or phone) to update.');
            return;
        }

        if (editButton) editButton.disabled = true;

        try {
            const response = await fetch(`${window.API_URL}/pg/vba/${encodeURIComponent(virtualAccountId)}/`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorDetails = data.error?.details;
                const validationError = errorDetails && errorDetails.error;

                const errorMessage =
                    validationError ||
                    data.error?.message ||
                    data.message ||
                    'Failed to update Virtual Bank Account details.';
                showError(errorMessage);
                return;
            }

            // On success, re-fetch latest VBA details using the GET endpoint
            await fetchVbaDetails(virtualAccountId);
        } catch (error) {
            console.error('Error updating VBA details:', error);
            showError(error && error.message
                ? error.message
                : 'An unexpected error occurred while updating Virtual Bank Account details.');
        } finally {
            if (editButton) editButton.disabled = false;
        }
    }

    // Change VBA status using PATCH /pg/vba/{virtual_account_id}/
    async function toggleVbaStatus() {
        const virtualAccountId =
            (currentVba && currentVba.virtual_account_id) ||
            (vbaIdInput && vbaIdInput.value.trim());

        if (!virtualAccountId) {
            showError('Virtual Account ID is required to change VBA status.');
            return;
        }

        const currentStatus = (currentVba && currentVba.vba_status) ? currentVba.vba_status.toUpperCase() : 'ACTIVE';
        const targetStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        if (vbaStatusToggleButton) vbaStatusToggleButton.disabled = true;

        try {
            const response = await fetch(`${window.API_URL}/pg/vba/${encodeURIComponent(virtualAccountId)}/`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: targetStatus })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorDetails = data.error?.details;
                const validationError = errorDetails && errorDetails.error;

                const errorMessage =
                    validationError ||
                    data.error?.message ||
                    data.message ||
                    'Failed to update Virtual Bank Account status.';
                showError(errorMessage);
                return;
            }

            // On success, re-fetch latest VBA details using the GET endpoint
            await fetchVbaDetails(virtualAccountId);
        } catch (error) {
            console.error('Error updating VBA status:', error);
            showError(error && error.message
                ? error.message
                : 'An unexpected error occurred while updating Virtual Bank Account status.');
        } finally {
            if (vbaStatusToggleButton) vbaStatusToggleButton.disabled = false;
        }
    }

    // Fetch VBA details via second form
    if (fetchForm && fetchButton) {
        fetchForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const id = vbaIdInput ? vbaIdInput.value.trim() : '';
            await fetchVbaDetails(id);
        });
    }

    // Edit VBA details form submit
    if (vbaEditForm && editButton) {
        vbaEditForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await updateVbaDetails();
        });
    }

    // Toggle Edit form visibility when Edit button is clicked
    if (vbaEditToggleButton && vbaEditForm) {
        vbaEditToggleButton.addEventListener('click', function () {
            if (!currentVba) return;
            const isVisible = vbaEditForm.style.display === 'block';
            vbaEditForm.style.display = isVisible ? 'none' : 'block';
        });
    }

    // Toggle VBA status when status button is clicked
    if (vbaStatusToggleButton) {
        vbaStatusToggleButton.addEventListener('click', async function () {
            if (!currentVba && (!vbaIdInput || !vbaIdInput.value.trim())) return;
            await toggleVbaStatus();
        });
    }

    // Quick create/open VBA with a sample email (no input needed)
    if (quickCreateVbaButton) {
        quickCreateVbaButton.addEventListener('click', async function () {
            await createVba(quickCreateVbaButton);
        });
    }

    // Fetch payments for this VBA when payments button is clicked
    if (vbaPaymentsButton) {
        vbaPaymentsButton.addEventListener('click', async function () {
            if (!currentVba && (!vbaIdInput || !vbaIdInput.value.trim())) {
                showError('Please fetch or create a VBA first, then view payments.');
                return;
            }
            if (vbaPaymentsContainer) {
                vbaPaymentsContainer.style.display = 'block';
            }
            if (vbaPaymentUtrRow) {
                vbaPaymentUtrRow.style.display = 'none';
            }
            await fetchVbaPayments();
        });
    }

    // Show the UTR search row when the toggle button next to "View Payments" is clicked
    if (vbaPaymentUtrToggleButton) {
        vbaPaymentUtrToggleButton.addEventListener('click', function () {
            if (!currentVba && (!vbaIdInput || !vbaIdInput.value.trim())) {
                showError('Please fetch or create a VBA first, then search by UTR.');
                return;
            }
            if (vbaPaymentsContainer) {
                vbaPaymentsContainer.style.display = 'block';
            }
            if (vbaPaymentUtrRow) {
                vbaPaymentUtrRow.style.display = 'grid';
            }
            if (vbaPaymentUtrInput) {
                vbaPaymentUtrInput.focus();
            }
        });
    }

    // Search a single payment by UTR when UTR button is clicked
    if (vbaPaymentUtrButton) {
        vbaPaymentUtrButton.addEventListener('click', async function () {
            if (!currentVba && (!vbaIdInput || !vbaIdInput.value.trim())) {
                showError('Please fetch or create a VBA first, then search by UTR.');
                return;
            }
            await fetchVbaPaymentByUtr();
        });
    }

    // Delegated click: Populate Payment Details button in payment list
    if (vbaPaymentsContent) {
        vbaPaymentsContent.addEventListener('click', function (e) {
            const btn = e.target && e.target.closest('.vba-upload-verification-btn');
            if (!btn) return;
            const paymentUid = btn.getAttribute('data-payment-uid');
            if (paymentUid) openVerificationModal(paymentUid);
        });
    }

    // Verification details modal: close buttons and overlay
    if (verificationModalCloseBtn) {
        verificationModalCloseBtn.addEventListener('click', closeVerificationModal);
    }
    if (verificationModalCancelBtn) {
        verificationModalCancelBtn.addEventListener('click', closeVerificationModal);
    }
    if (verificationModalOverlay) {
        verificationModalOverlay.addEventListener('click', function (e) {
            if (e.target === verificationModalOverlay) closeVerificationModal();
        });
    }
    if (verificationModalBox) {
        verificationModalBox.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    // Type of goods change: HS code required for GOODS / PHYSICAL_GOODS / DIGITAL_GOODS
    if (verifTypeOfGoods) {
        verifTypeOfGoods.addEventListener('change', updateVerificationHsCodeVisibility);
    }

    // Verification details form submit
    if (verificationDetailsForm) {
        verificationDetailsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            uploadVerificationDetails();
        });
    }

    // Auto fill verification form with same sample data as payment creation forms
    if (verificationModalAutoFillBtn) {
        verificationModalAutoFillBtn.addEventListener('click', fillVerificationFormWithSampleData);
    }

    // Pre-populate VBA ID field from localStorage if available
    try {
        const lastVbaId = localStorage.getItem('eximpe_last_vba_id');
        if (lastVbaId && vbaIdInput) {
            vbaIdInput.value = lastVbaId;
        }
    } catch (e) {
        console.warn('Unable to read last VBA ID from localStorage:', e);
    }
});

