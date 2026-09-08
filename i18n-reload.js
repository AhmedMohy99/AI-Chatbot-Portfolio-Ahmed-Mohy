/* Reload after a language selection so every generated section starts from its canonical source language. */
(function () {
  "use strict";
  document.addEventListener("click", function (event) {
    const button = event.target.closest("#langBtn,[data-ai-lang]");
    if (!button) return;
    const current = localStorage.getItem("lang") === "ar" ? "ar" : "en";
    const next = button.id === "langBtn" ? (current === "ar" ? "en" : "ar") : button.dataset.aiLang;
    if (next !== "ar" && next !== "en") return;
    localStorage.setItem("lang", next);
    window.setTimeout(function () { window.location.reload(); }, 0);
  });
})();
