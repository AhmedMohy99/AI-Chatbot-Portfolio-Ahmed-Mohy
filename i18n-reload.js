/* Persist the selected locale and localize dynamically injected integration copy. */
(function () {
  "use strict";
  const integrationAr = {
    "LIVE · CLOSEBOT + HUBSPOT": "مباشر · CLOSEBOT + HUBSPOT",
    "Talk to the real AI sales agent.": "تحدث مع وكيل المبيعات الحقيقي بالذكاء الاصطناعي.",
    "This is the production conversation layer. CloseBot handles the conversation, qualification and booking workflow while HubSpot keeps the lead record and CRM context.": "هذه هي طبقة المحادثة الإنتاجية. يتولى CloseBot المحادثة وتأهيل العملاء ومسار الحجز، بينما يحتفظ HubSpot بسجل العميل المحتمل وسياق CRM.",
    "Start the live conversation": "ابدأ المحادثة المباشرة",
    "Open CloseBot": "فتح CloseBot",
    "CloseBot AI sales agent": "وكيل مبيعات CloseBot بالذكاء الاصطناعي"
  };
  const current = () => localStorage.getItem("lang") === "ar" ? "ar" : "en";
  const applyIntegrationLocale = () => {
    if (current() !== "ar") return;
    const section = document.getElementById("closebot-live-agent");
    if (!section) return;
    section.querySelectorAll("*").forEach((el) => {
      if (el.children.length === 0) {
        const source = el.getAttribute("data-i18n-integration-source") || el.textContent.trim();
        el.setAttribute("data-i18n-integration-source", source);
        if (integrationAr[source]) el.textContent = integrationAr[source];
      }
      ["aria-label", "title", "placeholder"].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const sourceKey = `data-i18n-integration-${attr}`;
        const source = el.getAttribute(sourceKey) || el.getAttribute(attr);
        el.setAttribute(sourceKey, source);
        if (integrationAr[source]) el.setAttribute(attr, integrationAr[source]);
      });
    });
  };

  document.addEventListener("click", function (event) {
    const button = event.target.closest("#langBtn,[data-ai-lang]");
    if (!button) return;
    const locale = current();
    const next = button.id === "langBtn" ? (locale === "ar" ? "en" : "ar") : button.dataset.aiLang;
    if (next !== "ar" && next !== "en") return;
    localStorage.setItem("lang", next);
    window.setTimeout(function () { window.location.reload(); }, 0);
  });

  new MutationObserver(applyIntegrationLocale).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyIntegrationLocale, { once: true });
  else applyIntegrationLocale();
})();
