(function () {
    const ENV_CONFIG = {
        'production': {
            API_URL: 'https://api-pacb.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com',
            MERCHANT_PWA_URL: 'https://merchant.eximpe.com',
            VERSION: '1.0.1'
        },
        'staging': {
            API_URL: 'https://api-pacb-staging.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com',
            MERCHANT_PWA_URL: 'https://merchant-staging.eximpe.com',
            VERSION: '1.0.1'
        },
        'uat': {
            API_URL: 'https://api-pacb-uat.eximpe.com',
            CDN_URL: 'https://cdn.eximpe.com',
            MERCHANT_PWA_URL: 'https://merchant-uat.eximpe.com',
            VERSION: '1.0.1'
        },
        'development': {
            API_URL: 'http://localhost:8000',
            CDN_URL: 'https://cdn.eximpe.com',
            MERCHANT_PWA_URL: 'http://localhost:5173',
            VERSION: '1.0.1'
        }
    };

    const selectedEnv = localStorage.getItem('selected_env') || 'uat';
    window.Config = ENV_CONFIG[selectedEnv] || ENV_CONFIG['uat'];
    window.Config.CURRENT_ENV = selectedEnv;

    // Helper to get version (prioritizes localStorage like getConfigValue)
    window.getVersion = function () {
        const env = localStorage.getItem('selected_env') || 'uat';
        const storedKey = 'eximpe_credentials_' + env;
        const raw = localStorage.getItem(storedKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.VERSION) return parsed.VERSION;
            } catch (e) { }
        }
        return window.Config.VERSION || '1.0.1';
    };

    // Dynamic loaders
    window.loadJS = function (path) {
        const v = window.getVersion();
        document.write('<script src="' + path + '?v=' + v + '"><\/script>');
    };

    window.loadCSS = function (path) {
        const v = window.getVersion();
        document.write('<link rel="stylesheet" href="' + path + '?v=' + v + '">');
    };
})();
