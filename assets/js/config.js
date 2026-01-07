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

    // Inject Environment Header on sub-pages (not on index.html)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectEnvHeader);
    } else {
        injectEnvHeader();
    }

    function injectEnvHeader() {
        // Don't show on the main index page (it has its own switcher)
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            // Check if it's actually the root index by looking for specific elements
            if (document.querySelector('.header-hero')) return;
        }

        const envName = selectedEnv.charAt(0).toUpperCase() + selectedEnv.slice(1);
        const header = document.createElement('div');
        header.id = 'env-header-badge';

        const dotColor = selectedEnv === 'production' ? '#ef4444' : (selectedEnv === 'staging' ? '#f59e0b' : '#22c55e');

        header.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: rgba(30, 41, 59, 0.9);
            backdrop-filter: blur(8px);
            color: white;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid rgba(255,255,255,0.1);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            pointer-events: auto;
        `;

        header.innerHTML = `
            <span style="display:inline-block; width:8px; height:8px; background:${dotColor}; border-radius:50%; box-shadow: 0 0 8px ${dotColor};"></span>
            <span>${envName}</span>
            <a href="/" style="margin-left: 4px; color: #94a3b8; text-decoration: none; font-weight: 400; font-size: 11px; border-left: 1px solid #475569; padding-left: 10px;">Change</a>
        `;

        document.body.appendChild(header);
    }
})();
