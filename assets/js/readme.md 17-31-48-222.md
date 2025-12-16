# Eximpe Payment SDK

## JavaScript SDK

The Eximpe Payment SDK provides a simple way to integrate payment processing into your web applications.

### Features
- Secure payment form submission
- Payment status checking
- Error handling and callbacks
- Multiple redirect targets support
- **Environment mode selection (sandbox/production)**

## Environment Mode

The SDK supports a `mode` option to control the environment:
- `'sandbox'` (default) — for testing
- `'production'` — for live payments

**You should set the mode when creating a payment session and pass it through to the payment page.**

### Example Usage

```javascript
// Initialize the SDK with mode (recommended to pass from session creation)
const eximpe = new Eximpe({
    mode: 'sandbox', // or 'production'
    apiUrl: 'https://api.eximpe.com' // or your custom endpoint
});

await eximpe.checkout({
    paymentSessionId: 'your-session-id'
});
```

## redirectTarget

The `redirectTarget` parameter controls where the payment form submission will redirect the user:

- `'_self'` (default) - Redirects in the same window/tab
- `'_blank'` - Opens payment page in a new tab/window

### Usage

```javascript
// Initialize the SDK
const eximpe = new Eximpe({ mode: 'sandbox' });

await eximpe.checkout({
    paymentSessionId: 'your-session-id',
    redirectTarget: '_blank' // or '_self'
});
```

## Notes
- The `mode` option is validated and must be either `'sandbox'` or `'production'`.
- Always ensure the correct mode is set for your environment.
- The mode should be selected at session creation and passed as a URL parameter to the hosted payment page.

## kt on the SDK
lasted changes once tested are manually updated to cdn
apiUrl needs to be updated in every push to cdn based on env
rename the sdk to point to https://cdn.eximpe.com/sdk/eximpe-sdk.min.js
