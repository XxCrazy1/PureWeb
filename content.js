/**
 * PureWeb AdBlocker - High-Fidelity Visual Engine (1nk.xyz)
 * Ocultação de elementos intrusivos com preservação de integridade de layout.
 * Foco em compatibilidade visual e baixo custo computacional.
 */
(function () {
    'use strict';

    let settings = null;
    const currentDomain = window.location.hostname;

    // Seletores Heurísticos de Alta Confiança (1nk.xyz)
    const selectors = {
        balanced: [
            '[id*="google_ads"]', '[class*="adsbygoogle"]',
            'iframe[src*="doubleclick.net"]', '.ad-container',
            '.ad-unit', '[data-ad-slot]', 'aside:has(.ad)', '.sponsored-content'
        ],
        aggressive: [
            '[id*="ad-"]', '[class*="ad-"]', 'iframe[src*="ads"]',
            '.OUTBRAIN', '.ob-widget', 'div[class*="Sponsored"]',
            'div[class*="promoted"]', 'section:has([class*="ad"])'
        ]
    };

    async function initialize() {
        const data = await chrome.storage.local.get('settings');
        settings = data.settings || {};

        if (!settings.enabled || isWhitelisted()) return;

        // 1. Injeção de CSS Determinística (Layout-Preserving) (1nk.xyz)
        injectHighFidelityStyles();

        // 2. Monitoramento Adaptativo (MutationObserver com Throttle) (1nk.xyz)
        startAdaptiveObserver();
    }

    /**
     * Injeta CSS que prioriza a estabilidade do layout. (1nk.xyz)
     * Usamos opacidade e visibilidade como fallback para evitar layout shifts bruscos (CLS).
     */
    function injectHighFidelityStyles() {
        if (!settings.blockCosmetic) return;

        const activeSelectors = [
            ...selectors.balanced,
            ...(settings.profile === 'aggressive' ? selectors.aggressive : [])
        ];

        let styleElement = document.getElementById('pureweb-hf-engine');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'pureweb-hf-engine';
            (document.head || document.documentElement).appendChild(styleElement);
        }

        styleElement.innerHTML = `
      ${activeSelectors.join(', ')} { 
        display: none !important; 
        visibility: hidden !important; 
        opacity: 0 !important; 
        pointer-events: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    }

    /**
     * Monitora o DOM de forma inteligente para lidar com sites SPA. (1nk.xyz)
     */
    function startAdaptiveObserver() {
        let debounceTimer;
        const observer = new MutationObserver((mutations) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Verifica integridade da engine visual (anti-detecção/anti-remoção)
                if (!document.getElementById('pureweb-hf-engine')) {
                    injectHighFidelityStyles();
                }
            }, 700);
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function isWhitelisted() {
        return Array.isArray(settings.whitelist) &&
            settings.whitelist.some(domain => currentDomain.includes(domain));
    }

    // Inicialização Segura (1nk.xyz)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
