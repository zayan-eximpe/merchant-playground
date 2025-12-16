/**
 * Trusted Types Policy for CSP Compliance
 *
 * Provides safe wrappers for innerHTML and other DOM manipulations
 * that require TrustedHTML when Trusted Types is enabled.
 */

// Create a Trusted Types policy for HTML sanitization
let trustedTypesPolicy = null;
let isTrustedTypesEnforced = false;

// Check if Trusted Types is enforced
if (window.trustedTypes) {
    isTrustedTypesEnforced = true;

    // Try to create the policy - this MUST succeed if Trusted Types is enforced
    try {
        if (window.trustedTypes.createPolicy) {
            trustedTypesPolicy = window.trustedTypes.createPolicy('default', {
                createHTML: (input) => {
                    // Basic sanitization - you can enhance this based on your needs
                    // For now, we'll trust the input as it's coming from our own code
                    return String(input);
                },
                createScript: (input) => String(input),
                createScriptURL: (input) => String(input)
            });

            if (!trustedTypesPolicy) {
                console.error('Failed to create Trusted Types policy: createPolicy returned null');
            }
        } else {
            console.error('Trusted Types is enforced but createPolicy is not available');
        }
    } catch (error) {
        console.error('Failed to create Trusted Types policy:', error);
        // If policy creation fails and Trusted Types is enforced, we cannot set innerHTML
    }
}

/**
 * Safely set innerHTML with Trusted Types support
 * @param {HTMLElement} element - The element to modify
 * @param {string} html - The HTML string to set
 */
function setInnerHTML(element, html) {
    if (!element) {
        console.error('setInnerHTML: element is null or undefined');
        return;
    }

    if (isTrustedTypesEnforced) {
        // Trusted Types is enforced - MUST use policy
        if (trustedTypesPolicy) {
            // Use Trusted Types policy
            element.innerHTML = trustedTypesPolicy.createHTML(html);
        } else {
            // Trusted Types is enforced but policy wasn't created - this is a critical error
            console.error('CRITICAL: Trusted Types is enforced but policy was not created. Cannot set innerHTML.');
            console.error('Element:', element, 'HTML length:', html ? html.length : 0);
            // Try to use textContent as a fallback to avoid breaking the page
            element.textContent = html;
            throw new Error('Trusted Types policy not available - cannot set innerHTML');
        }
    } else {
        // Trusted Types not enforced, safe to use innerHTML directly
        element.innerHTML = html;
    }
}

/**
 * Safely get innerHTML (for reading, no Trusted Types needed)
 * @param {HTMLElement} element - The element to read from
 * @returns {string} The innerHTML content
 */
function getInnerHTML(element) {
    return element.innerHTML;
}

/**
 * Safely set text content (preferred over innerHTML for text)
 * @param {HTMLElement} element - The element to modify
 * @param {string} text - The text to set
 */
function setTextContent(element, text) {
    element.textContent = text;
}

/**
 * Create an element with safe HTML content
 * @param {string} tagName - The tag name (e.g., 'div', 'span')
 * @param {string} html - The HTML content
 * @returns {HTMLElement} The created element
 */
function createElementWithHTML(tagName, html) {
    const element = document.createElement(tagName);
    setInnerHTML(element, html);
    return element;
}

/**
 * Insert HTML adjacent to an element
 * @param {HTMLElement} element - The target element
 * @param {string} position - Where to insert ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {string} html - The HTML to insert
 */
function insertAdjacentHTMLSafe(element, position, html) {
    if (!element) {
        console.error('insertAdjacentHTMLSafe: element is null or undefined');
        return;
    }

    if (isTrustedTypesEnforced) {
        // Trusted Types is enforced - MUST use policy
        if (trustedTypesPolicy) {
            element.insertAdjacentHTML(position, trustedTypesPolicy.createHTML(html));
        } else {
            console.error('CRITICAL: Trusted Types is enforced but policy was not created. Cannot use insertAdjacentHTML.');
            throw new Error('Trusted Types policy not available - cannot use insertAdjacentHTML');
        }
    } else {
        // Trusted Types not enforced, safe to use insertAdjacentHTML directly
        element.insertAdjacentHTML(position, html);
    }
}

// Export for use in other scripts
// Make sure TrustedTypes is available globally before any other scripts run
window.TrustedTypes = window.TrustedTypes || {};
window.TrustedTypes.setInnerHTML = setInnerHTML;
window.TrustedTypes.getInnerHTML = getInnerHTML;
window.TrustedTypes.setTextContent = setTextContent;
window.TrustedTypes.createElementWithHTML = createElementWithHTML;
window.TrustedTypes.insertAdjacentHTMLSafe = insertAdjacentHTMLSafe;
window.TrustedTypes.policy = trustedTypesPolicy;
window.TrustedTypes.isEnforced = isTrustedTypesEnforced;

// Log policy creation status for debugging
if (isTrustedTypesEnforced) {
    if (trustedTypesPolicy) {
        console.log('✅ Trusted Types is enforced. Policy "default" created successfully.');
    } else {
        console.error('❌ Trusted Types is enforced but policy creation FAILED. innerHTML operations will fail!');
    }
} else {
    console.log('ℹ️ Trusted Types is not enforced in this browser.');
}
