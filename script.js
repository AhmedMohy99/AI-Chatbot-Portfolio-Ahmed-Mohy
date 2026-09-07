const langBtn = document.getElementById("langBtn");
const previewModal = document.getElementById("previewModal");
const previewFrame = document.getElementById("previewFrame");
const previewTitle = document.getElementById("previewTitle");
const previewUrl = document.getElementById("previewUrl");
const previewExternal = document.getElementById("previewExternal");
const previewClose = document.getElementById("previewClose");

// Canonical WORK list shared with the main Ahmed Mohy portfolio.
const PROJECTS = [
  {
    name: "Saffa Fashion",
    url: "https://www.saffafashion.shop/",
    category: "Fashion · Web",
    description: "A fashion storefront built product-first, with responsive galleries and a cart experience designed for mobile shoppers.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://www.saffafashion.shop/"
  },
  {
    name: "SWAY Maverick",
    url: "https://swaymaverick.com/",
    category: "Fashion · Brand experience",
    description: "A fashion commerce experience that ties brand storytelling directly to the product grid, so browsing feels like reading a lookbook.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://swaymaverick.com/"
  },
  {
    name: "UCYPTA",
    url: "https://ucypta-fs.myshopify.com/",
    category: "Shopify · Storefront",
    description: "A Shopify storefront foundation with product-led navigation and a streamlined shopping interface.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://ucypta-fs.myshopify.com/"
  },
  {
    name: "Elprof10",
    url: "https://elprof10.com/",
    category: "Digital experience",
    description: "Digital product and web experience work focused on usability, presentation and a modern responsive interface.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://elprof10.com/"
  },
  {
    name: "Royal Watch",
    url: "http://royalwatch.art/",
    category: "Luxury · Product presentation",
    description: "Luxury watch presentation and commerce, built around premium product storytelling and visual hierarchy.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/http://royalwatch.art/"
  },
  {
    name: "We Wave Agency",
    url: "https://we-wave-agency.vercel.app/",
    category: "Agency · Portfolio",
    description: "A brand experience and agency portfolio designed to present work with a stronger visual hierarchy and a more confident digital identity.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://we-wave-agency.vercel.app/"
  },
  {
    name: "LARO Cosmetics",
    url: "https://laro-cosmetics.com/",
    category: "Beauty · Shopify",
    description: "A beauty commerce storefront rebuilt around product clarity — cleaner navigation, faster browsing and a shopping journey that respects the product.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://laro-cosmetics.com/"
  },
  {
    name: "IRIS Contemporary Womenswear",
    url: "https://iriseg.net/",
    category: "Luxury fashion · E-commerce",
    description: "A quiet-luxury womenswear experience reshaped around premium presentation, clearer navigation and a stronger path to checkout.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://iriseg.net/"
  },
  {
    name: "ZREX",
    url: "https://zrexeg.com/",
    category: "Fashion · Commerce",
    description: "Fashion commerce and product experience work focused on a clear path from discovery to purchase.",
    image: "https://image.thum.io/get/width/1200/crop/675/noanimate/maxAge/168/https://zrexeg.com/"
  }
];

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

function normalizeProject(card, project, index){
  card.dataset.category = project.category;
  card.dataset.liveUrl = project.url;
  card.classList.remove("work-card-large", "featured-project");
  card.classList.add("work-card-unified");
  card.style.gridColumn = "auto";

  const image = card.querySelector(".work-image");
  const img = image?.querySelector("img");
  image?.querySelectorAll("iframe.live-site-frame").forEach(frame => frame.remove());
  image?.classList.remove("has-live-site");
  img?.classList.remove("preview-fallback");
  if(img){
    img.src = project.image;
    img.alt = `Live homepage preview of ${project.name}`;
    img.loading = index < 2 ? "eager" : "lazy";
  }

  const hostname = (() => {
    try { return new URL(project.url).hostname.replace(/^www\./, ""); }
    catch { return project.url; }
  })();
  const browserLabel = card.querySelector(".browser-bar small");
  if(browserLabel) browserLabel.textContent = hostname;

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
    if(label) label.textContent = `${String(index + 1).padStart(2, "0")} · ${project.category}`;

    let link = topline.querySelector(".project-link");
    if(!link){
      link = document.createElement("a");
      link.className = "project-link";
      topline.appendChild(link);
    }
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Website ↗";

    const title = info.querySelector("h3");
    if(title) title.textContent = project.name;

    let description = info.querySelector("p");
    if(!description){
      description = document.createElement("p");
      info.appendChild(description);
    }
    description.textContent = project.description;
  }

  let number = card.querySelector(".work-number");
  if(!number){
    number = document.createElement("span");
    number.className = "work-number";
    card.querySelector(".browser-frame")?.appendChild(number);
  }
  number.textContent = String(index + 1).padStart(2, "0");

  return card;
}

function buildWorkLayout(){
  const grid = document.querySelector(".work-grid");
  if(!grid) return;

  const cardsByName = new Map(
    [...grid.querySelectorAll(".work-card")].map(card => [
      card.querySelector("h3")?.textContent?.trim(),
      card
    ])
  );

  grid.innerHTML = "";
  PROJECTS.forEach((project, index) => {
    const card = cardsByName.get(project.name) || [...cardsByName.entries()].find(([name]) =>
      name?.toLowerCase() === project.name.toLowerCase()
    )?.[1];
    if(card) grid.appendChild(normalizeProject(card, project, index));
  });

  document.querySelectorAll(".archive-heading, .archive-grid").forEach(node => node.remove());

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
  const project = PROJECTS.find(item => item.name.toLowerCase() === name.toLowerCase());
  const url = project?.url || card.dataset.liveUrl;
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
