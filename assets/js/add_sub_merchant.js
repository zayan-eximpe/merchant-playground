/**
 * Add Sub Merchant Page Logic
 * Extracted from inline scripts for CSP compliance
 */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('subMerchantForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    // Convert form data to nested JSON structure
    const data = {};
    for (const [key, value] of formData.entries()) {
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!data[parent]) data[parent] = {};
            if (child === 'hs_codes') {
                data[parent][child] = value.split(',').map(s => s.trim());
            } else if (child === 'same_as_registered_address') {
                data[parent][child] = value === 'true';
            } else if (!isNaN(value) && value !== '') {
                data[parent][child] = Number(value);
            } else {
                data[parent][child] = value;
            }
        } else {
            if (!isNaN(value) && value !== '') {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        }
    }
    // POST to API
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Submitting...';
    try {
        const response = await fetch('/merchant/sub_merchants/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Is-Testing': 'True',
                'X-Client-Secret': getConfigValue('AUTH_KEY'),
                'X-Client-ID': getConfigValue('CLIENT_ID'),
            },
            body: JSON.stringify(data)
        });
        const respData = await response.json();
        if (response.ok) {
            const sanitizedData = escapeHtml(JSON.stringify(respData, null, 2));
            TrustedTypes.setInnerHTML(resultDiv, '<span style="color:green;">Sub Merchant created successfully!</span><br><pre>' + sanitizedData + '</pre>');
        } else {
            const errorMessage = escapeHtml(respData.message || response.statusText);
            const sanitizedData = escapeHtml(JSON.stringify(respData, null, 2));
            TrustedTypes.setInnerHTML(resultDiv, '<span style="color:red;">Error: ' + errorMessage + '</span><br><pre>' + sanitizedData + '</pre>');
        }
    } catch (err) {
        TrustedTypes.setInnerHTML(resultDiv, '<span style="color:red;">Error: Failed to create sub merchant. Please try again.</span>');
    }
});
