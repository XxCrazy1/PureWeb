/**
 * PureWeb AdBlocker - Popup JS (1nk.xyz)
 * Dashboard de controle com indicadores de status de compatibilidade.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const masterToggle = document.getElementById('master-toggle');
    const currentDomainEl = document.getElementById('current-domain');
    const whitelistBtn = document.getElementById('whitelist-btn');
    const whitelistText = document.getElementById('whitelist-text');

    const countAdsEl = document.getElementById('count-ads');
    const countTrackersEl = document.getElementById('count-trackers');
    const countHiddenEl = document.getElementById('count-hidden');

    const profileBtns = document.querySelectorAll('.profile-btn');
    const toggleTrackers = document.getElementById('toggle-trackers');
    const toggleSocial = document.getElementById('toggle-social');

    const aboutPrivacy = document.getElementById('about-privacy');
    const privacyModal = document.getElementById('privacy-modal');
    const closeModal = document.getElementById('close-modal');

    let currentDomain = '';

    // Carrega estado inicial (1nk.xyz)
    const { settings } = await chrome.storage.local.get('settings');
    updateUI(settings);

    // Obtém o domínio da aba atual (1nk.xyz)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        try {
            currentDomain = new URL(tab.url).hostname;
            currentDomainEl.textContent = currentDomain;
            checkProtectionStatus(settings, currentDomain);
        } catch (e) {
            currentDomainEl.textContent = "Navegador";
            whitelistBtn.style.display = 'none';
        }
    }

    // Eventos de Interface (1nk.xyz)
    masterToggle.addEventListener('change', () => {
        settings.enabled = masterToggle.checked;
        saveSettings();
    });

    toggleTrackers.addEventListener('change', () => {
        settings.blockTrackers = toggleTrackers.checked;
        saveSettings();
    });

    toggleSocial.addEventListener('change', () => {
        settings.blockSocial = toggleSocial.checked;
        saveSettings();
    });

    profileBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            profileBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.profile = btn.dataset.profile;
            saveSettings();
        });
    });

    whitelistBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'TOGGLE_WHITELIST',
            domain: currentDomain
        }, () => window.location.reload());
    });

    aboutPrivacy.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => privacyModal.style.display = 'none');

    // Funções de UI (1nk.xyz)
    function updateUI(s) {
        masterToggle.checked = s.enabled;
        toggleTrackers.checked = s.blockTrackers;
        toggleSocial.checked = s.blockSocial;

        countAdsEl.textContent = formatStat(s.stats.blockedAds);
        countTrackersEl.textContent = formatStat(s.stats.blockedTrackers);
        countHiddenEl.textContent = formatStat(s.stats.hiddenElements);

        profileBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.profile === s.profile);
        });
    }

    function checkProtectionStatus(s, domain) {
        const isWhitelisted = s.whitelist.some(d => domain.includes(d));
        const isRelaxed = isWhitelisted ? false : checkRelaxMatrix(domain);

        if (isWhitelisted) {
            whitelistBtn.classList.add('is-whitelisted');
            whitelistText.textContent = "Pausado (Whitelist)";
            whitelistBtn.querySelector('.btn-icon').textContent = "⚪";
        } else if (isRelaxed && s.autoRelax) {
            whitelistBtn.classList.remove('is-whitelisted');
            whitelistText.textContent = "Modo Compatibilidade";
            whitelistBtn.querySelector('.btn-icon').textContent = "🪄";
            whitelistBtn.style.borderColor = "#00D1FF";
            whitelistBtn.style.color = "#00D1FF";
        } else {
            whitelistBtn.classList.remove('is-whitelisted');
            whitelistText.textContent = "Proteção Ativa";
            whitelistBtn.querySelector('.btn-icon').textContent = "🛡️";
        }
    }

    // Simula a lógica de relaxamento para feedback visual no popup (1nk.xyz)
    function checkRelaxMatrix(domain) {
        const matrix = ['netflix.', 'primevideo.', 'disneyplus.', 'hbo.', 'youtube.', 'paypal.', 'stripe.', 'checkout.', 'accounts.google.', 'login.'];
        return matrix.some(p => domain.includes(p));
    }

    function formatStat(num) {
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
    }

    function saveSettings() {
        chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: settings });
    }
});
