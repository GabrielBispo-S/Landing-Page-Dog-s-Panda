const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const views = [...document.querySelectorAll('[data-view]')];
const pageLinks = [...document.querySelectorAll('[data-page]')];
const hashToPage = {
  '#inicio': 'home',
  '#servicos': 'services',
  '#duvidas': 'questions',
  '#servico-daycare': 'services',
  '#servico-banho': 'services',
  '#servico-adestramento': 'services',
};

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 36);
}

function showPage(page, { updateHistory = false, targetId = null, scrollToTop = true } = {}) {
  const availablePages = new Set(views.map((view) => view.dataset.view));
  const nextPage = availablePages.has(page) ? page : 'home';
  views.forEach((view) => { view.hidden = view.dataset.view !== nextPage; });

  document.querySelectorAll('.main-nav a[data-page]').forEach((link) => {
    if (link.dataset.page === nextPage) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (updateHistory) {
    const hash = targetId ? `#${targetId}` : ({ home: '#inicio', services: '#servicos', questions: '#duvidas' }[nextPage]);
    history.pushState({ page: nextPage, targetId }, '', hash);
  }

  if (targetId) {
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateHeader();
    }, 80);
  } else if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  updateHeader();
}

window.addEventListener('scroll', updateHeader, { passive: true });
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
});

pageLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.page, {
      updateHistory: true,
      targetId: link.dataset.service || null,
    });
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('popstate', () => {
  const hash = window.location.hash;
  showPage(hashToPage[hash] || 'home', {
    targetId: hash.startsWith('#servico-') ? hash.slice(1) : null,
    scrollToTop: false,
  });
});

const track = document.querySelector('.service-track');
const cards = [...track.querySelectorAll('.service-card')];
const dots = [...document.querySelectorAll('.carousel-dots button')];
let activeIndex = 1;
let pointerStart = null;
let suppressClick = false;

function renderCarousel() {
  cards.forEach((card, index) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    const positionClass = position === 0 ? 'position-center' : position === 1 ? 'position-right' : 'position-left';
    const singleCardMode = window.matchMedia('(max-width: 650px)').matches;
    card.classList.remove('position-left', 'position-center', 'position-right');
    card.classList.add(positionClass);
    card.classList.toggle('is-active', position === 0);
    card.setAttribute('aria-current', position === 0 ? 'true' : 'false');
    card.setAttribute('aria-hidden', String(singleCardMode && position !== 0));
    if (singleCardMode && position !== 0) card.tabIndex = -1;
    else card.removeAttribute('tabindex');
  });
  dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
}

function moveCarousel(direction) {
  activeIndex = (activeIndex + direction + cards.length) % cards.length;
  renderCarousel();
}

document.querySelector('.carousel-prev').addEventListener('click', () => moveCarousel(-1));
document.querySelector('.carousel-next').addEventListener('click', () => moveCarousel(1));
dots.forEach((dot, index) => dot.addEventListener('click', () => {
  activeIndex = index;
  renderCarousel();
}));

track.addEventListener('pointerdown', (event) => {
  if (event.button !== undefined && event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY };
});
window.addEventListener('pointerup', (event) => {
  if (!pointerStart) return;
  const distanceX = event.clientX - pointerStart.x;
  const distanceY = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(distanceX) > 42 && Math.abs(distanceX) > Math.abs(distanceY)) {
    suppressClick = true;
    moveCarousel(distanceX < 0 ? 1 : -1);
    window.setTimeout(() => { suppressClick = false; }, 300);
  }
});
window.addEventListener('pointercancel', () => { pointerStart = null; });
track.addEventListener('click', (event) => {
  if (!suppressClick) return;
  event.preventDefault();
  event.stopPropagation();
}, true);

renderCarousel();
window.matchMedia('(max-width: 650px)').addEventListener('change', renderCarousel);
const initialHash = window.location.hash;
showPage(hashToPage[initialHash] || 'home', {
  targetId: initialHash.startsWith('#servico-') ? initialHash.slice(1) : null,
  scrollToTop: false,
});
window.scrollTo(0, 0);
updateHeader();
