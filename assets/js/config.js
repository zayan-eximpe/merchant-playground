(function () {
    const ENV_CONFIG = {
        'production': {
            API_URL: 'https://api-pacb.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com',
            MERCHANT_PWA_URL: 'https://merchant.eximpe.com'
        },
        'staging': {
            API_URL: 'https://api-pacb-staging.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com', // Assuming CDN is same or not specified, keeping default
            MERCHANT_PWA_URL: 'https://merchant-staging.eximpe.com'
        },
        'uat': {
            API_URL: 'https://api-pacb-uat.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com', // Assuming CDN is same or not specified, keeping default
            MERCHANT_PWA_URL: 'https://merchant-uat.eximpe.com'
        }
    };

    const selectedEnv = localStorage.getItem('selected_env') || 'uat';
    window.Config = ENV_CONFIG[selectedEnv] || ENV_CONFIG['uat'];

    // Expose current env for UI to use
    window.Config.CURRENT_ENV = selectedEnv;
})();
