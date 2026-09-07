const langBtn = document.getElementById("langBtn");
const previewModal = document.getElementById("previewModal");
const previewFrame = document.getElementById("previewFrame");
const previewTitle = document.getElementById("previewTitle");
const previewUrl = document.getElementById("previewUrl");
const previewExternal = document.getElementById("previewExternal");
const previewClose = document.getElementById("previewClose");

const PROJECTS = {
  "Saffa Fashion": { url: "https://saffafashion.shop/", category: "Fashion · Web", selected: true },
  "SWAY Maverick": { url: "https://swaymaverick.com/", category: "Fashion · Brand experience", selected: true },
  "Ucypta": { url: null, category: "Shopify · Storefront", selected: true },
  "Elprof10": { url: "https://elprof10.com/", category: "Digital experience", selected: true },
  "Royal Watch": { url: "https://www.officialroyalwatch.com/", category: "Luxury · Product presentation", selected: true },
  "LARO Cosmetics": { url: "https://laro-cosmetics.com/", category: "Beauty · Shopify", selected: false },
  "IRIS Contemporary Womenswear": { url: "https://iris-eg.net/", category: "Luxury fashion · E-commerce", selected: false },
  "ZREX": { url: "https://zrexeg.com/", category: "Fashion · Commerce", selected: false },
  "We Wave Agency": { url: "https://we-wave-agency.vercel.app/", category: "Agency · Portfolio", selected: false }
};

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

function normalizeProject(card){
  const name = card.querySelector("h3")?.textContent?.trim();
  const project = PROJECTS[name];
  if(!project) return { card, name: name || "Project", project: {} };

  card.dataset.category = project.category;
  card.dataset.selected = String(project.selected);

  const image = card.querySelector(".work-image");
  const img = image?.querySelector("img");
  if(project.url && image && !image.querySelector("iframe.live-site-frame")){
    const iframe = document.createElement("iframe");
    iframe.className = "live-site-frame";
    iframe.src = project.url;
    iframe.title = `${name} live website preview`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("aria-hidden", "true");
    image.classList.add("has-live-site");
    image.prepend(iframe);
    if(img) img.classList.add("preview-fallback");
  }

  const info = card.querySelector(".work-info");
  if(info){
    let topline = info.querySelector(".project-topline");
    if(!topline){
      const label = info.querySelector("span");
      topline = document.createElement("div");
      topline.className = "project-topline";
      if(label) topline.appendChild(label);
      info.prepend(topline);
    }
    const label = topline.querySelector("span");
    if(label) label.textContent = `${project.category}`;
    if(project.url && !topline.querySelector(".project-link")){
      const link = document.createElement("a");
      link.className = "project-link";
      link.href = project.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View case study ↗";
      topline.appendChild(link);
    }
  }
  return { card, name, project };
}

function buildWorkLayout(){
  const grid = document.querySelector(".work-grid");
  if(!grid) return;
  const cards = [...grid.querySelectorAll(".work-card")].map(normalizeProject);
  const selected = cards.filter(item => item.project.selected);
  const archived = cards.filter(item => item.project.selected === false);

  grid.innerHTML = "";
  selected.forEach(item => grid.appendChild(item.card));

  const archiveLabel = document.createElement("div");
  archiveLabel.className = "archive-heading";
  archiveLabel.innerHTML = '<div class="eyebrow">ARCHIVED WORK</div><h3>Earlier projects, preserved as case studies and live homepage previews.</h3><p>These projects remain part of the work history while the selected work above stays focused on the strongest current examples.</p>';
  grid.parentNode.insertBefore(archiveLabel, grid.nextSibling);

  const archiveGrid = document.createElement("div");
  archiveGrid.className = "work-grid archive-grid";
  archived.forEach(item => archiveGrid.appendChild(item.card));
  archiveLabel.after(archiveGrid);

  document.querySelectorAll(".live-preview").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      openPreview(button.closest(".work-card"));
    });
  });
}

function closePreview(){
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  previewFrame.src = "about:blank";
}

function openPreview(card){
  const name = card.querySelector("h3")?.textContent?.trim() || "Project Preview";
  const url = PROJECTS[name]?.url || card.dataset.liveUrl;
  if(!url) return;
  previewTitle.textContent = name;
  previewUrl.textContent = new URL(url).hostname;
  previewExternal.href = url;
  previewFrame.src = url;
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

langBtn?.addEventListener("click", () => setLang(getLang() === "en" ? "ar" : "en"));
previewClose?.addEventListener("click", closePreview);
previewModal?.querySelector("[data-close-preview]")?.addEventListener("click", closePreview);
document.addEventListener("keydown", event => {
  if(event.key === "Escape" && previewModal.classList.contains("is-open")) closePreview();
});

buildWorkLayout();
setLang(getLang());
