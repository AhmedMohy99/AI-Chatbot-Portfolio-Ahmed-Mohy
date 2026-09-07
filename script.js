const langBtn = document.getElementById("langBtn");
const previewModal = document.getElementById("previewModal");
const previewClose = document.getElementById("previewClose");

const WHATSAPP_URL = "https://wa.me/201016286261";

const PROJECTS = [
  { name: "LARO Cosmetics", url: "https://laro-cosmetics.com/", category: "Beauty · Shopify", image: "assets/projects/laro.png", theme: "beauty", preview: "fallback" },
  { name: "Saffa Fashion", url: "https://www.saffafashion.shop/", category: "Fashion · E-commerce", image: "assets/projects/saffa.png", theme: "fashion" },
  { name: "SWAY Maverick", url: "https://swaymaverick.com/", category: "Fashion · Brand experience", image: "assets/projects/swaymaverick.png", theme: "streetwear", preview: "fallback" },
  { name: "Ucypta", url: "https://ucypta-fs.myshopify.com/", category: "E-commerce · Shopify", image: "assets/projects/ucypta.png", theme: "commerce", preview: "fallback" },
  { name: "Royal Watch", url: "https://royalwatch.art/en", category: "Luxury · E-commerce", image: "assets/projects/royalwatch.png", theme: "luxury" },
  { name: "ZREX", url: "https://zrexeg.com/", category: "Fashion · Commerce", image: "assets/projects/zrexeg.png", theme: "commerce" },
  { name: "Elprof10", url: "https://elprof10.com/", category: "Digital experience", image: "assets/projects/elprof10.png", theme: "digital" },
  { name: "We Wave Agency", url: "https://we-wave-agency.vercel.app/", category: "Agency · Portfolio", image: "assets/projects/we-wave-agency.png", theme: "agency" },
  { name: "IRIS Contemporary Womenswear", url: "https://iriseg.net/", category: "Luxury fashion · E-commerce", image: "assets/projects/iris.jpg", theme: "iris" }
];

const UI = {
  en: {
    title: "Ahmed Mohy — Digital Products That Grow Businesses",
    subtitle: "Websites · Web Applications · Online Stores · Mobile Apps · Digital Marketing",
    lang: "AR",
    workIntro: "Real live websites presented inside immersive browser previews. Open any project to enter the original site."
  },
  ar: {
    title: "أحمد محي — حلول رقمية تساعد نشاطك على النمو",
    subtitle: "مواقع إلكترونية · تطبيقات ويب · متاجر إلكترونية · تطبيقات موبايل · تسويق رقمي",
    lang: "EN",
    workIntro: "مواقع حقيقية مباشرة معروضة داخل معاينات تفاعلية. افتح أي مشروع للدخول إلى الموقع الأصلي."
  }
};

function getLang(){ return localStorage.getItem("lang") || "en"; }

function setLang(lang){
  localStorage.setItem("lang", lang);
  document.body.classList.toggle("rtl", lang === "ar");
  document.documentElement.lang = lang;
  document.getElementById("title").textContent = UI[lang].title;
  document.getElementById("subtitle").textContent = UI[lang].subtitle;
  const workIntro = document.getElementById("workIntro");
  if(workIntro) workIntro.textContent = UI[lang].workIntro;
  if(langBtn) langBtn.textContent = UI[lang].lang;
}

function load3DStyles(){
  if(document.querySelector('link[data-3d-styles]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "3d.css";
  link.dataset["3dStyles"] = "true";
  document.head.appendChild(link);
}

function createGlobal3D(){
  if(document.querySelector(".global-3d-world")) return;
  const world = document.createElement("div");
  world.className = "global-3d-world";
  world.setAttribute("aria-hidden", "true");
  world.innerHTML = `
    <div class="global-grid"></div>
    <div class="global-orb global-orb-a"></div>
    <div class="global-orb global-orb-b"></div>
    <div class="global-ring global-ring-a"></div>
    <div class="global-ring global-ring-b"></div>
    <div class="global-cube global-cube-a"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="global-cube global-cube-b"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="global-wire global-wire-a"></div>
    <div class="global-wire global-wire-b"></div>
  `;
  document.body.prepend(world);
}

function create3DScene(theme, index){
  const scene = document.createElement("div");
  scene.className = `project-3d-scene theme-${theme}`;
  scene.setAttribute("aria-hidden", "true");

  const core = document.createElement("div");
  core.className = "scene-core";
  scene.appendChild(core);

  const orbit = document.createElement("div");
  orbit.className = "scene-orbit";
  const orbitDot = document.createElement("i");
  orbitDot.className = "scene-dot";
  orbit.appendChild(orbitDot);
  scene.appendChild(orbit);

  const ring = document.createElement("div");
  ring.className = "scene-ring";
  scene.appendChild(ring);

  const cube = document.createElement("div");
  cube.className = "scene-cube";
  cube.innerHTML = "<span></span><span></span><span></span><span></span><span></span><span></span>";
  scene.appendChild(cube);

  const label = document.createElement("div");
  label.className = "scene-label";
  label.textContent = String(index + 1).padStart(2, "0");
  scene.appendChild(label);

  return scene;
}

function createLivePreview(project, index){
  const wrap = document.createElement("div");
  wrap.className = `live-preview-wrap preview-${project.preview === "fallback" ? "fallback" : "live"}`;
  wrap.setAttribute("aria-label", `${project.name} website preview`);

  if(project.preview === "fallback"){
    const previewImage = document.createElement("img");
    previewImage.className = "preview-fallback-image";
    previewImage.src = project.image;
    previewImage.alt = `${project.name} website preview`;
    previewImage.loading = index < 2 ? "eager" : "lazy";
    wrap.appendChild(previewImage);

    const overlay = document.createElement("div");
    overlay.className = "preview-fallback-overlay";
    overlay.innerHTML = `<span>LIVE SITE · OPEN WEBSITE</span>`;
    wrap.appendChild(overlay);
    return wrap;
  }

  const iframe = document.createElement("iframe");
  iframe.className = "live-site-frame";
  iframe.src = project.url;
  iframe.title = `${project.name} live website`;
  iframe.loading = index < 2 ? "eager" : "lazy";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("allow", "fullscreen");

  const badge = document.createElement("span");
  badge.className = "live-preview-badge";
  badge.textContent = "LIVE · ORIGINAL SITE";

  wrap.appendChild(iframe);
  wrap.appendChild(badge);
  return wrap;
}

function normalizeProject(card, project, index){
  card.dataset.category = project.category;
  card.dataset.liveUrl = project.url;
  card.dataset.theme = project.theme;
  card.classList.remove("work-card-large", "featured-project");
  card.classList.add("work-card-unified");
  card.style.gridColumn = "auto";

  const image = card.querySelector(".work-image");
  const img = image?.querySelector("img");
  image?.querySelectorAll("iframe.live-site-frame, .live-preview-wrap, .project-3d-scene").forEach(node => node.remove());

  if(image){
    image.prepend(create3DScene(project.theme, index));
    image.appendChild(createLivePreview(project, index));
    image.classList.add("has-3d-scene");
  }

  if(img){
    img.src = project.image;
    img.alt = `${project.name} website preview`;
    img.loading = index < 2 ? "eager" : "lazy";
  }

  const hostname = (() => {
    try { return new URL(project.url).hostname.replace(/^www\./, ""); }
    catch { return project.url; }
  })();
  const browserLabel = card.querySelector(".browser-bar small");
  if(browserLabel) browserLabel.textContent = hostname;

  card.querySelectorAll(".live-preview").forEach(button => button.remove());

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
    link.textContent = "ENTER WEBSITE ↗";
    link.setAttribute("aria-label", `Enter ${project.name} website`);

    const title = info.querySelector("h3");
    if(title) title.textContent = project.name;
    info.querySelectorAll("p").forEach(description => description.remove());
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
}

function closePreview(){
  if(!previewModal) return;
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

langBtn?.addEventListener("click", () => setLang(getLang() === "en" ? "ar" : "en"));
previewClose?.addEventListener("click", closePreview);
previewModal?.querySelector("[data-close-preview]")?.addEventListener("click", closePreview);
document.addEventListener("keydown", event => {
  if(event.key === "Escape" && previewModal?.classList.contains("is-open")) closePreview();
});

load3DStyles();
createGlobal3D();
buildWorkLayout();
setLang(getLang());

document.addEventListener("click", event => {
  const target = event.target.closest("a, button");
  if(!target) return;
  if(target.matches(".project-link")) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const label = (target.textContent || target.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
  const message = label ? `Hello Ahmed, I clicked "${label}" on your portfolio and would like to discuss a project.` : "Hello Ahmed, I would like to discuss a project.";
  const url = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}, true);
