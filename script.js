const langBtn = document.getElementById("langBtn");
const previewModal = document.getElementById("previewModal");
const previewFrame = document.getElementById("previewFrame");
const previewTitle = document.getElementById("previewTitle");
const previewUrl = document.getElementById("previewUrl");
const previewExternal = document.getElementById("previewExternal");
const previewClose = document.getElementById("previewClose");

const UI = {
  en: {
    title: "Ahmed Mohy — Digital Products That Grow Businesses",
    subtitle: "Websites · Web Applications · Online Stores · Mobile Apps · Digital Marketing",
    lang: "AR"
  },
  ar: {
    title: "أحمد محي — حلول رقمية تساعد نشاطك على النمو",
    subtitle: "مواقع إلكترونية · تطبيقات ويب · متاجر إلكترونية · تطبيقات موبايل · تسويق رقمي",
    lang: "EN"
  }
};

function getLang(){ return localStorage.getItem("lang") || "en"; }

function setLang(lang){
  localStorage.setItem("lang", lang);
  document.body.classList.toggle("rtl", lang === "ar");
  document.documentElement.lang = lang;
  document.getElementById("title").textContent = UI[lang].title;
  document.getElementById("subtitle").textContent = UI[lang].subtitle;
  langBtn.textContent = UI[lang].lang;
}

langBtn.addEventListener("click", () => {
  setLang(getLang() === "en" ? "ar" : "en");
});

function closePreview(){
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  previewFrame.src = "about:blank";
}

function openPreview(card){
  const url = card.dataset.liveUrl;
  if(!url) return;
  const name = card.querySelector("h3")?.textContent?.trim() || "Project Preview";
  previewTitle.textContent = name;
  previewUrl.textContent = new URL(url).hostname;
  previewExternal.href = url;
  previewFrame.src = url;
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.querySelectorAll(".live-preview").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openPreview(button.closest(".work-card"));
  });
});

previewClose?.addEventListener("click", closePreview);
previewModal?.querySelector("[data-close-preview]")?.addEventListener("click", closePreview);
document.addEventListener("keydown", (event) => {
  if(event.key === "Escape" && previewModal.classList.contains("is-open")) closePreview();
});

setLang(getLang());
