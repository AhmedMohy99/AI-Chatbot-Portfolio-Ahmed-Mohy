/* Production integrations for the portfolio.
 * HubSpot tracking uses the public portal ID.
 * CloseBot's Sales Intelligence Pixel is source-specific, so the exact script must be supplied from CloseBot > Source > Setup.
 */
(function () {
  'use strict';

  const HUBSPOT_PORTAL_ID = '149287248';

  function loadHubSpot() {
    if (document.querySelector('script[data-ahmed-hubspot]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://js.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`;
    script.dataset.ahmedHubspot = 'true';
    document.head.appendChild(script);
  }

  function injectCloseBotPixel() {
    /*
     * CloseBot generates a unique Sales Intelligence Pixel for each connected source.
     * Paste that exact script into closebot-config.js as window.CLOSEBOT_PIXEL_SCRIPT.
     * The pixel is intentionally NOT guessed or replaced with a generic script.
     */
    const source = window.CLOSEBOT_PIXEL_SCRIPT;
    if (!source || typeof source !== 'string' || !source.trim()) return false;
    if (document.querySelector('script[data-ahmed-closebot]')) return true;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = source.trim();
    const scripts = wrapper.querySelectorAll('script');
    scripts.forEach((original) => {
      const script = document.createElement('script');
      Array.from(original.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      if (original.src) script.src = original.src;
      else script.textContent = original.textContent || '';
      script.dataset.ahmedClosebot = 'true';
      document.head.appendChild(script);
    });
    return true;
  }

  function addLiveAgentSection() {
    if (document.getElementById('closebot-live-agent')) return;
    const hero = document.querySelector('.hero-card');
    if (!hero) return;

    const section = document.createElement('section');
    section.id = 'closebot-live-agent';
    section.className = 'ai-growth closebot-live-section';
    section.innerHTML = `
      <div class="ai-panel closebot-live-panel">
        <div>
          <div class="eyebrow">LIVE · CLOSEBOT + HUBSPOT</div>
          <h2>Talk to the real AI sales agent.</h2>
          <p>This is the production conversation layer. CloseBot handles the conversation, qualification and booking workflow while HubSpot keeps the lead record and CRM context.</p>
          <div class="ai-actions">
            <a class="ai-primary" href="#cb-widget-container">Start the live conversation</a>
            <a class="ai-secondary" href="https://app.closebot.com/" target="_blank" rel="noopener noreferrer">Open CloseBot</a>
          </div>
        </div>
        <div id="cb-widget-container" class="closebot-embed" aria-label="CloseBot AI sales agent"></div>
      </div>`;
    hero.after(section);
  }

  function addStyles() {
    if (document.getElementById('closebot-integration-styles')) return;
    const style = document.createElement('style');
    style.id = 'closebot-integration-styles';
    style.textContent = `
      .closebot-live-section{margin-top:18px}
      .closebot-live-panel{display:grid;grid-template-columns:minmax(0,.85fr) minmax(320px,1.15fr);gap:22px;align-items:stretch}
      .closebot-embed{min-height:520px;height:520px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.025)}
      @media(max-width:760px){.closebot-live-panel{grid-template-columns:1fr}.closebot-embed{height:620px;min-height:620px}}
    `;
    document.head.appendChild(style);
  }

  loadHubSpot();
  addStyles();
  addLiveAgentSection();
  injectCloseBotPixel();
})();
