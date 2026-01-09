/**
 * PureWeb AdBlocker - Background Orchestrator v3.0 (1nk.xyz)
 * Gestão determinística de regras, proteção de fluxos críticos e automação adaptativa.
 */

const WATERMARK = '(1nk.xyz)';

const DEFAULT_SETTINGS = {
    enabled: true,
    blockTrackers: true,
    blockSocial: false,
    blockCosmetic: true,
    profile: 'balanced', // basic, balanced, aggressive
    whitelist: [],
    autoRelax: true,
    stats: {
        blockedAds: 0,
        blockedTrackers: 0,
        hiddenElements: 0
    }
};

/**
 * Matriz de Compatibilidade (Auto-Relax) (1nk.xyz)
 * Domínios onde a funcionalidade deve ser preservada acima do bloqueio.
 */
const RELAX_MATRIX = {
    STREAMING: ['netflix.com', 'primevideo.com', 'disneyplus.com', 'hbo.com', 'youtube.com'],
    FINANCE: ['paypal.com', 'stripe.com', 'checkout.', 'pagseguro.', 'mercadopago.'],
    IDENTITY: ['accounts.google.', 'login.microsoftonline.', 'appleid.apple.'],
    GOV: ['gov.br', 'gov.uk', 'usa.gov']
};

chrome.runtime.onInstalled.addListener(async () => {
    const { settings } = await chrome.storage.local.get('settings');
    if (!settings) {
        await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    }

    // Registro de Normalização em MAIN World (1nk.xyz)
    try {
        const scripts = await chrome.scripting.getRegisteredContentScripts();
        if (!scripts.some(s => s.id === 'pureweb-core-normalization')) {
            await chrome.scripting.registerContentScripts([{
                id: 'pureweb-core-normalization',
                js: ['inject.js'],
                matches: ['<all_urls>'],
                world: 'MAIN',
                runAt: 'document_start',
                allFrames: true
            }]);
        }
    } catch (err) {
        console.debug(`${WATERMARK} Registro de script: ${err.message}`);
    }

    refreshEngine();
});

// Orquestrador de Mudanças (1nk.xyz)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_SETTINGS') {
        updateEngineState(message.settings);
        sendResponse({ status: 'committed' });
    } else if (message.type === 'TOGGLE_WHITELIST') {
        handleWhitelistToggle(message.domain);
        sendResponse({ status: 'committed' });
    }
    return true;
});

async function updateEngineState(newSettings) {
    await chrome.storage.local.set({ settings: newSettings });
    refreshEngine();
}

async function refreshEngine() {
    const { settings } = await chrome.storage.local.get('settings');

    // 1. Gerenciamento de Rulesets Estáticos (1nk.xyz)
    const activeRulesets = ['rules_ads'];
    if (settings.blockTrackers) activeRulesets.push('rules_trackers');
    if (settings.blockSocial) activeRulesets.push('rules_social');

    const currentRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    const toDisable = currentRulesets.filter(id => !activeRulesets.includes(id));

    await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: toDisable,
        enableRulesetIds: activeRulesets
    });

    // 2. Aplicação de Regras Dinâmicas (Whitelist + Relax) (1nk.xyz)
    applyDynamicOrchestration(settings);
}

async function applyDynamicOrchestration(settings) {
    const rules = [];
    let ruleIdCounter = 10000;

    // Whitelist Manual (Prioridade Máxima) (1nk.xyz)
    (settings.whitelist || []).forEach(domain => {
        rules.push({
            id: ruleIdCounter++,
            priority: 10,
            action: { type: 'allow' },
            condition: { urlFilter: domain, resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"] }
        });
    });

    // Auto-Relax Determinístico (1nk.xyz)
    if (settings.autoRelax) {
        Object.values(RELAX_MATRIX).flat().forEach(domain => {
            rules.push({
                id: ruleIdCounter++,
                priority: 5, // Abaixo da whitelist mas acima dos blocos
                action: { type: 'allow' },
                condition: { urlFilter: domain, resourceTypes: ["script", "xmlhttprequest"] }
            });
        });
    }

    // Sincronização de Regras Dinâmicas (1nk.xyz)
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const idsToRemove = existingRules.map(r => r.id).filter(id => id >= 10000);

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: idsToRemove,
        addRules: rules
    });
}

async function handleWhitelistToggle(domain) {
    const { settings } = await chrome.storage.local.get('settings');
    const index = settings.whitelist.indexOf(domain);
    if (index > -1) settings.whitelist.splice(index, 1);
    else settings.whitelist.push(domain);
    updateEngineState(settings);
}

// Telemetria Local e Auditável (1nk.xyz)
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
    commitStats(info.rule.ruleId);
});

async function commitStats(ruleId) {
    const { settings } = await chrome.storage.local.get('settings');
    if (ruleId < 2000) settings.stats.blockedAds++;
    else if (ruleId < 3000) settings.stats.blockedTrackers++;
    await chrome.storage.local.set({ settings });
}
