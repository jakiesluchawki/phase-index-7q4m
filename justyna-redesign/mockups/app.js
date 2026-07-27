const artworks = window.JUSTYNA_ARTWORKS || [];
const body = document.body;
const grid = document.querySelector(".art-grid");
const filters = document.querySelector(".filters");
const visibleCount = document.querySelector("#visible-count");
const caption = document.querySelector(".direction-caption");
const viewer = document.querySelector(".viewer");
const viewerImage = document.querySelector(".viewer-image");
const viewerTitle = document.querySelector("#viewer-title");
const viewerCategory = document.querySelector(".viewer-category");
const galleryPrevious = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
const galleryProgress = document.querySelector(".gallery-progress");
const categories = ["All", "Food", "Fruits & vegetables", "Meat", "Drinks", "Cakes", "Things"];
const copy = {
  pl: {
    skip: "Przejdź do galerii",
    topLabel: "Cute Cut, początek strony", languageLabel: "Język", openingLabel: "Ekran otwierający Cute Cut", enter: "Wejdź",
    navAbout: "O mnie", navGallery: "Galeria", navContact: "Kontakt", heroEyebrow: "Artystka kolażu · Warszawa",
    heroNote: "Papier, kolor i codzienność.", heroLink: "Zobacz archiwum", aboutTitle: "O mnie",
    aboutOne: "Justyna Mahboob, urodzona w 1978 roku, jest artystką i edukatorką. Ukończyła Akademię Sztuk Pięknych w Warszawie, gdzie zajmowała się malarstwem i ilustracją książkową. Prowadzi warsztaty artystyczne dla młodych ludzi.",
    aboutTwo: "Obok malarstwa i ilustracji tworzy serię kolaży inspirowanych gotowaniem oraz kulturą kulinarną. Jej kuchenne wycinanki wydobywają estetykę materiałów opakowaniowych i łączą sztukę z codziennością.",
    archiveEyebrow: "Pełne archiwum", galleryTitle: "Galeria", worksLabel: "prac", contactEyebrow: "Kontakt",
    contactTitle: "Zróbmy coś<br />razem.", openArtwork: "Otwórz", close: "Zamknij", previous: "Poprzednia praca", next: "Następna praca",
    filtersLabel: "Filtruj prace według kategorii", galleryNavigation: "Nawigacja galerii", galleryHint: "Przeciągnij galerię lub użyj strzałek", galleryPrevious: "Poprzednie prace", galleryNext: "Następne prace",
    directionCaption: "Barwny indeks, w którym każda kategoria otwiera własną papierową przestrzeń.",
  },
  en: {
    skip: "Skip to gallery",
    topLabel: "Cute Cut, top of page", languageLabel: "Language", openingLabel: "Cute Cut opening screen", enter: "Enter",
    navAbout: "About", navGallery: "Gallery", navContact: "Contact", heroEyebrow: "Collage artist · Warsaw",
    heroNote: "Paper, colour and everyday things.", heroLink: "See the archive", aboutTitle: "About",
    aboutOne: "Justyna Mahboob, born in 1978, is an artist and educator with a degree from the Academy of Fine Arts in Warsaw, where she focused on painting and book illustration. She provides art workshops for young people.",
    aboutTwo: "Alongside painting and illustration, she has created a series of collages inspired by moments spent cooking and the popular culture of culinary arts. Her kitchen-themed collages highlight the aesthetic appeal of packaging materials, bringing art and everyday life together.",
    archiveEyebrow: "Complete archive", galleryTitle: "Gallery", worksLabel: "works", contactEyebrow: "Contact",
    contactTitle: "Let’s make<br />something.", openArtwork: "Open", close: "Close", previous: "Previous artwork", next: "Next artwork",
    filtersLabel: "Filter works by category", galleryNavigation: "Gallery navigation", galleryHint: "Drag the gallery or use the arrows", galleryPrevious: "Previous works", galleryNext: "Next works",
    directionCaption: "A vivid index where every category opens its own paper room.",
  },
};
const categoryNames = {
  pl: { All: "Wszystkie", Food: "Jedzenie", "Fruits & vegetables": "Owoce i warzywa", Meat: "Mięso", Drinks: "Napoje", Cakes: "Ciasta", Things: "Przedmioty" },
  en: { All: "All", Food: "Food", "Fruits & vegetables": "Fruits & vegetables", Meat: "Meat", Drinks: "Drinks", Cakes: "Cakes", Things: "Things" },
};
const categoryColours = {
  All: "oklch(0.72 0.15 245)",
  Food: "oklch(0.82 0.16 352)",
  "Fruits & vegetables": "oklch(0.79 0.17 102)",
  Meat: "oklch(0.75 0.14 28)",
  Drinks: "oklch(0.72 0.14 235)",
  Cakes: "oklch(0.84 0.13 73)",
  Things: "oklch(0.72 0.12 307)",
};
let activeCategory = "All";
let visibleWorks = [];
let viewerIndex = 0;
let activeLanguage = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "pl";

function cleanTitle(title) {
  return title.replace(/\s+pol$/i, "").replace(/&#\d+;/g, "").trim();
}

function renderFilters() {
  filters.replaceChildren(...categories.map((category) => {
    const button = document.createElement("button");
    button.className = `filter${category === activeCategory ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = categoryNames[activeLanguage][category];
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      body.style.setProperty("--category-colour", categoryColours[category]);
      renderFilters();
      renderGallery();
    });
    return button;
  }));
}

function renderGallery() {
  visibleWorks = artworks.filter((item) => item.category !== "Archive" && (activeCategory === "All" || item.category === activeCategory));
  visibleCount.textContent = String(visibleWorks.length);
  grid.replaceChildren(...visibleWorks.map((item, index) => {
    const button = document.createElement("button");
    button.className = "artwork";
    button.type = "button";
    button.style.setProperty("--tilt", `${((item.id % 5) - 2) * 0.45}deg`);
    button.setAttribute("aria-label", `${copy[activeLanguage].openArtwork}: ${cleanTitle(item.title)}, ${categoryNames[activeLanguage][item.category]}`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = index < 8 ? "eager" : "lazy";
    image.decoding = "async";
    if (item.width) image.width = item.width;
    if (item.height) image.height = item.height;

    const label = document.createElement("span");
    label.innerHTML = `<span>${cleanTitle(item.title)}</span><span>${categoryNames[activeLanguage][item.category]}</span>`;
    button.append(image, label);
    button.addEventListener("click", () => openViewer(index));
    return button;
  }));
  requestAnimationFrame(() => {
    grid.scrollLeft = 0;
    updateGalleryNavigation();
  });
}

function updateGalleryNavigation() {
  const maximum = Math.max(0, grid.scrollWidth - grid.clientWidth);
  const progress = maximum > 0 ? Math.min(1, Math.max(0, grid.scrollLeft / maximum)) : 1;
  galleryProgress.style.setProperty("--gallery-progress", String(progress));
  galleryPrevious.disabled = grid.scrollLeft <= 2;
  galleryNext.disabled = grid.scrollLeft >= maximum - 2 || maximum === 0;
}

function scrollGallery(direction) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  grid.scrollBy({
    left: direction * Math.max(280, grid.clientWidth * 0.82),
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

galleryPrevious.addEventListener("click", () => scrollGallery(-1));
galleryNext.addEventListener("click", () => scrollGallery(1));
grid.addEventListener("scroll", updateGalleryNavigation, { passive: true });
window.addEventListener("resize", updateGalleryNavigation);

let dragStartX = 0;
let dragStartScroll = 0;
let galleryWasDragged = false;
let suppressGalleryClick = false;

grid.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  dragStartX = event.clientX;
  dragStartScroll = grid.scrollLeft;
  galleryWasDragged = false;
  grid.setPointerCapture(event.pointerId);
});

grid.addEventListener("pointermove", (event) => {
  if (!grid.hasPointerCapture(event.pointerId)) return;
  const distance = event.clientX - dragStartX;
  if (Math.abs(distance) > 6) {
    galleryWasDragged = true;
    grid.classList.add("is-dragging");
    grid.scrollLeft = dragStartScroll - distance;
    event.preventDefault();
  }
});

grid.addEventListener("pointerup", (event) => {
  if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId);
  grid.classList.remove("is-dragging");
  if (galleryWasDragged) {
    suppressGalleryClick = true;
    setTimeout(() => { suppressGalleryClick = false; }, 0);
  }
});
grid.addEventListener("pointercancel", () => grid.classList.remove("is-dragging"));

grid.addEventListener("click", (event) => {
  if (!suppressGalleryClick) return;
  event.preventDefault();
  event.stopPropagation();
}, true);

function showViewerItem(index) {
  viewerIndex = (index + visibleWorks.length) % visibleWorks.length;
  const item = visibleWorks[viewerIndex];
  viewerImage.src = item.src;
  viewerImage.alt = item.alt;
  viewerTitle.textContent = cleanTitle(item.title);
  viewerCategory.textContent = categoryNames[activeLanguage][item.category];
}

function openViewer(index) {
  showViewerItem(index);
  viewer.showModal();
}

document.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
document.querySelector(".viewer-prev").addEventListener("click", () => showViewerItem(viewerIndex - 1));
document.querySelector(".viewer-next").addEventListener("click", () => showViewerItem(viewerIndex + 1));
viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showViewerItem(viewerIndex - 1);
  if (event.key === "ArrowRight") showViewerItem(viewerIndex + 1);
});

function updateUrl() {
  const params = new URLSearchParams(location.search);
  params.delete("direction");
  params.set("lang", activeLanguage);
  history.replaceState(null, "", `${location.pathname}?${params}`);
}

function setLanguage(language) {
  activeLanguage = language;
  document.documentElement.lang = language;
  document.title = language === "pl" ? "Cute Cut — Justyna Mahboob" : "Cute Cut — Justyna Mahboob";
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = copy[language][element.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => { element.innerHTML = copy[language][element.dataset.i18nHtml]; });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", copy[language][element.dataset.i18nAria]); });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector(".viewer-close").textContent = copy[language].close;
  document.querySelector(".viewer-close").setAttribute("aria-label", copy[language].close);
  document.querySelector(".viewer-prev").setAttribute("aria-label", copy[language].previous);
  document.querySelector(".viewer-next").setAttribute("aria-label", copy[language].next);
  galleryPrevious.setAttribute("aria-label", copy[language].galleryPrevious);
  galleryNext.setAttribute("aria-label", copy[language].galleryNext);
  caption.textContent = copy[language].directionCaption;
  renderFilters();
  renderGallery();
  updateUrl();
}

document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));

body.style.setProperty("--category-colour", categoryColours.All);
setLanguage(activeLanguage);

const requestedSection = new URLSearchParams(location.search).get("section");
if (["portfolio", "gallery"].includes(requestedSection)) {
  requestAnimationFrame(() => document.querySelector(`#${requestedSection}`).scrollIntoView());
}
