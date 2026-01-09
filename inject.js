/**
 * PureWeb AdBlocker - Enterprise Resilience Layer (1nk.xyz)
 * Camada de normalização de ambiente JavaScript (MAIN World).
 * Foco em compatibilidade, silenciamento de detecção e estabilidade do DOM.
 */
(function () {
    'use strict';

    const watermark = '(1nk.xyz)';
    const noop = function () { };

    // Utilitário para criar funções "nativas" falsas (1nk.xyz)
    const makeNativeNoop = (name) => {
        const f = { [name]: function () { } }[name];
        Object.defineProperty(f, 'name', { value: name, configurable: true });
        return f;
    };

    /**
     * Mocking Engine Avançado (1nk.xyz)
     * Usa Proxies para garantir que objetos de ads/trackers existam sem funcionalidade,
     * prevenindo erros de referência e detecções anti-adblock via 'undefined'.
     */
    const createSecureMock = (baseName) => {
        const handler = {
            get: (target, prop) => {
                if (prop === Symbol.toPrimitive) return () => `[object ${baseName}]`;
                if (prop === 'toString') return () => `function ${baseName}() { [native code] }`;
                const val = target[prop];
                if (typeof val === 'function') return val;
                if (typeof val === 'object' && val !== null) return new Proxy(val, handler);
                return val;
            },
            apply: () => undefined,
            construct: () => new Proxy({}, handler)
        };
        const target = typeof window[baseName] === 'function' ? makeNativeNoop(baseName) : {};
        return new Proxy(target, handler);
    };

    // Objetos globais críticos para normalização (1nk.xyz)
    const criticalGlobals = [
        'adsbygoogle', 'ga', 'fbq', 'AdUnit', 'aclib', 'Adsco',
        'prm_unit', '_gaq', '__gaTracker', 'google_ad_client'
    ];

    criticalGlobals.forEach(name => {
        if (!(name in window)) {
            try {
                Object.defineProperty(window, name, {
                    value: createSecureMock(name),
                    writable: true,
                    configurable: true,
                    enumerable: false
                });
            } catch (e) { }
        }
    });

    /**
     * Silenciamento Seletivo de Console (1nk.xyz)
     * Filtra ruídos técnicos causados por recursos bloqueados sem interferir no workflow do dev.
     */
    const noisePatterns = [
        'WebGL', 'fallback', 'software', 'preload', 'AdUnit',
        'aclib', 'Adsco', 'crbug', 'ERR_BLOCKED_BY_ADBLOCKER'
    ];

    const wrapConsole = (method) => {
        const original = console[method];
        console[method] = function (...args) {
            const logString = args.join(' ').toLowerCase();
            if (noisePatterns.some(pattern => logString.includes(pattern.toLowerCase()))) {
                return;
            }
            return original.apply(this, args);
        };
    };

    ['log', 'warn', 'error', 'debug'].forEach(wrapConsole);

    /**
     * Normalização de Proteção WebGL (1nk.xyz)
     * Evita falhas de renderização e avisos de segurança ao ocultar detalhes do hardware.
     */
    const normalizeWebGL = (proto) => {
        if (!proto) return;
        const original = proto.getParameter;
        proto.getParameter = function (param) {
            const mocks = {
                37445: 'WebKit', // VENDOR
                37446: 'Intel Inc.', // UNMASKED_VENDOR
                37447: 'Intel(R) UHD Graphics 620' // UNMASKED_RENDERER
            };
            return mocks[param] || original.apply(this, arguments);
        };
    };

    [window.WebGLRenderingContext, window.WebGL2RenderingContext].forEach(ctx => {
        if (ctx) normalizeWebGL(ctx.prototype);
    });

    // Proteção contra detecção de propriedades de visibilidade (1nk.xyz)
    if (!('google_ad_status' in window)) {
        window.google_ad_status = 1;
    }

    // Prevenção de quebra em chamadas de Beacon (comum em trackers) (1nk.xyz)
    if (window.navigator && window.navigator.sendBeacon) {
        const originalBeacon = window.navigator.sendBeacon;
        window.navigator.sendBeacon = function () {
            try {
                return originalBeacon.apply(this, arguments);
            } catch (e) {
                return true;
            }
        };
    }

    // PureWeb Integrity Check Signoff (1nk.xyz)
})();
