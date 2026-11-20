const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menuBtn.classList.toggle('active', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.classList.remove('active');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Открыть меню');
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach(el => revealObserver.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

const guideAccordion = document.getElementById('guideAccordion');
document.querySelectorAll('[data-open-guide], a[href="#guide"]').forEach(link => {
  link.addEventListener('click', () => {
    if (guideAccordion) guideAccordion.open = true;
  });
});

const glow = document.querySelector('.cursor-glow');
if (glow && matchMedia('(pointer:fine)').matches) {
  glow.style.opacity = '1';
  window.addEventListener('pointermove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, { passive: true });
}

function buildDots(container, count, onSelect, labelPrefix) {
  if (!container) return [];
  container.innerHTML = '';
  return Array.from({ length: count }, (_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `${labelPrefix} ${index + 1}`);
    dot.addEventListener('click', () => onSelect(index));
    container.appendChild(dot);
    return dot;
  });
}

function setDotsActive(dots, index) {
  dots.forEach((dot, i) => {
    const active = i === index;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

const schemes = {
  basic: {
    title: 'Основная схема подключения ПТФ',
    lead: 'Классическая схема подключения противотуманных фар через реле, предохранитель, кнопку и АКБ.',
    image: 'assets/scheme-basic.png',
    alt: 'Схема подключения противотуманных фар: реле, предохранитель, кнопка и аккумулятор',
    points: [
      'Питание идёт от АКБ через реле и предохранитель.',
      'Управление осуществляется кнопкой включения ПТФ.',
      'Правая и левая ПТФ получают питание по отдельным веткам от общего плюса.'
    ],
    tags: ['РЕЛЕ', 'ПРЕДОХРАНИТЕЛЬ', 'КНОПКА', '12 В']
  },
  highbeam: {
    title: 'ПТФ + подключение от дальнего света',
    lead: 'Отдельный жгут из двух плюсовых проводов заводится в гофру и подключается через предохранители дальнего света.',
    image: 'assets/scheme-highbeam.png',
    alt: 'Схема подключения ПТФ от дальнего света через отдельный жгут и разветвители предохранителей',
    points: [
      'Делаем новый жгут из двух проводов: по одному плюсу на каждую ПТФ.',
      'Жгут прокладывается в гофре до блока предохранителей.',
      'Каждая ПТФ подключается через разветвитель предохранителя к левому и правому предохранителям дальнего света.'
    ],
    tags: ['ДАЛЬНИЙ СВЕТ', 'РАЗВЕТВИТЕЛЬ', '2 ПРОВОДА', 'БЕЗ РЕЗКИ']
  }
};

const schemeOrder = ['basic', 'highbeam'];
const schemeMainImage = document.getElementById('schemeMainImage');
const schemeTitle = document.getElementById('schemeTitle');
const schemeLead = document.getElementById('schemeLead');
const schemePoints = document.getElementById('schemePoints');
const schemeTags = document.getElementById('schemeTags');
const schemeTabs = [...document.querySelectorAll('.scheme-tab')];
const schemeSwipeZone = document.getElementById('schemeSwipeZone');
const schemePrev = document.getElementById('schemePrev');
const schemeNext = document.getElementById('schemeNext');
const schemeDotsContainer = document.getElementById('schemeDots');
const schemeCounter = document.getElementById('schemeCounter');
let currentScheme = 'basic';
let schemeSuppressClick = false;

const schemeDots = buildDots(
  schemeDotsContainer,
  schemeOrder.length,
  index => renderScheme(schemeOrder[index]),
  'Показать схему'
);

function renderScheme(key, { animate = true } = {}) {
  const data = schemes[key];
  if (!data || !schemeMainImage) return;
  currentScheme = key;
  const index = schemeOrder.indexOf(key);

  if (animate) {
    schemeMainImage.classList.remove('scheme-image-enter');
    void schemeMainImage.offsetWidth;
    schemeMainImage.classList.add('scheme-image-enter');
  }

  schemeMainImage.src = data.image;
  schemeMainImage.alt = data.alt;
  if (schemeTitle) schemeTitle.textContent = data.title;
  if (schemeLead) schemeLead.textContent = data.lead;
  if (schemePoints) schemePoints.innerHTML = data.points.map(item => `<li>${item}</li>`).join('');
  if (schemeTags) schemeTags.innerHTML = data.tags.map(item => `<span>${item}</span>`).join('');

  schemeTabs.forEach(btn => {
    const active = btn.dataset.scheme === key;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  setDotsActive(schemeDots, index);
  if (schemeCounter) schemeCounter.textContent = `${index + 1} / ${schemeOrder.length}`;
  if (schemePrev) schemePrev.disabled = index === 0;
  if (schemeNext) schemeNext.disabled = index === schemeOrder.length - 1;
}

function moveScheme(delta) {
  const index = schemeOrder.indexOf(currentScheme);
  const nextIndex = Math.max(0, Math.min(schemeOrder.length - 1, index + delta));
  if (nextIndex !== index) renderScheme(schemeOrder[nextIndex]);
}

schemeTabs.forEach(btn => btn.addEventListener('click', () => renderScheme(btn.dataset.scheme)));
schemePrev?.addEventListener('click', () => moveScheme(-1));
schemeNext?.addEventListener('click', () => moveScheme(1));

let schemePointer = null;
schemeSwipeZone?.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  schemePointer = { id: e.pointerId, x: e.clientX, y: e.clientY, type: e.pointerType };
  if (e.pointerType === 'mouse') {
    schemeSwipeZone.setPointerCapture?.(e.pointerId);
    schemeSwipeZone.classList.add('is-dragging');
  }
});

schemeSwipeZone?.addEventListener('pointerup', e => {
  if (!schemePointer || schemePointer.id !== e.pointerId) return;
  const dx = e.clientX - schemePointer.x;
  const dy = e.clientY - schemePointer.y;
  const swiped = Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.15;
  schemeSwipeZone.classList.remove('is-dragging');
  if (swiped) {
    schemeSuppressClick = true;
    moveScheme(dx < 0 ? 1 : -1);
    window.setTimeout(() => { schemeSuppressClick = false; }, 250);
  }
  schemePointer = null;
});

schemeSwipeZone?.addEventListener('pointercancel', () => {
  schemeSwipeZone.classList.remove('is-dragging');
  schemePointer = null;
});

const adjustmentTrack = document.getElementById('adjustmentTrack');
const adjustmentCards = adjustmentTrack ? [...adjustmentTrack.querySelectorAll('.adjustment-step-card')] : [];
const adjustmentPrev = document.getElementById('adjustmentPrev');
const adjustmentNext = document.getElementById('adjustmentNext');
const adjustmentDotsContainer = document.getElementById('adjustmentDots');
const adjustmentCounter = document.getElementById('adjustmentCounter');
let currentAdjustment = 0;
let adjustmentClickSuppressed = false;

const adjustmentDots = buildDots(
  adjustmentDotsContainer,
  adjustmentCards.length,
  index => scrollToAdjustment(index),
  'Показать шаг регулировки'
);

function updateAdjustmentUI(index) {
  currentAdjustment = Math.max(0, Math.min(adjustmentCards.length - 1, index));
  setDotsActive(adjustmentDots, currentAdjustment);
  if (adjustmentCounter) adjustmentCounter.textContent = `${currentAdjustment + 1} / ${adjustmentCards.length}`;
  if (adjustmentPrev) adjustmentPrev.disabled = currentAdjustment === 0;
  if (adjustmentNext) adjustmentNext.disabled = currentAdjustment === adjustmentCards.length - 1;
}

function cardScrollLeft(index) {
  const card = adjustmentCards[index];
  if (!adjustmentTrack || !card) return 0;
  return card.offsetLeft - (adjustmentTrack.clientWidth - card.offsetWidth) / 2;
}

function scrollToAdjustment(index, behavior = 'smooth') {
  if (!adjustmentTrack || !adjustmentCards.length) return;
  const safeIndex = Math.max(0, Math.min(adjustmentCards.length - 1, index));
  adjustmentTrack.scrollTo({ left: cardScrollLeft(safeIndex), behavior });
  updateAdjustmentUI(safeIndex);
}

function nearestAdjustmentIndex() {
  if (!adjustmentTrack || !adjustmentCards.length) return 0;
  const viewportCenter = adjustmentTrack.scrollLeft + adjustmentTrack.clientWidth / 2;
  let bestIndex = 0;
  let bestDistance = Infinity;
  adjustmentCards.forEach((card, index) => {
    const center = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(center - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

adjustmentPrev?.addEventListener('click', () => scrollToAdjustment(currentAdjustment - 1));
adjustmentNext?.addEventListener('click', () => scrollToAdjustment(currentAdjustment + 1));

let adjustmentScrollRaf = 0;
adjustmentTrack?.addEventListener('scroll', () => {
  cancelAnimationFrame(adjustmentScrollRaf);
  adjustmentScrollRaf = requestAnimationFrame(() => updateAdjustmentUI(nearestAdjustmentIndex()));
}, { passive: true });

let dragState = null;
adjustmentTrack?.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  dragState = { id: e.pointerId, startX: e.clientX, startScroll: adjustmentTrack.scrollLeft, moved: false };
  adjustmentTrack.setPointerCapture?.(e.pointerId);
});

adjustmentTrack?.addEventListener('pointermove', e => {
  if (!dragState || dragState.id !== e.pointerId) return;
  const dx = e.clientX - dragState.startX;
  if (Math.abs(dx) > 5) {
    dragState.moved = true;
    adjustmentTrack.classList.add('is-dragging');
    adjustmentTrack.scrollLeft = dragState.startScroll - dx;
  }
});

function finishAdjustmentDrag() {
  if (!dragState) return;
  if (dragState.moved) {
    adjustmentClickSuppressed = true;
    scrollToAdjustment(nearestAdjustmentIndex());
    window.setTimeout(() => { adjustmentClickSuppressed = false; }, 250);
  }
  adjustmentTrack?.classList.remove('is-dragging');
  dragState = null;
}

adjustmentTrack?.addEventListener('pointerup', finishAdjustmentDrag);
adjustmentTrack?.addEventListener('pointercancel', finishAdjustmentDrag);
adjustmentTrack?.addEventListener('click', e => {
  if (adjustmentClickSuppressed) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

const modal = document.getElementById('schemeModal');
const modalContent = modal?.querySelector('.modal-scheme-content');
const modalClose = document.getElementById('modalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalCounter = document.getElementById('modalCounter');
const modalSchemeImage = document.getElementById('modalSchemeImage');
const modalSchemeTitle = document.getElementById('modalSchemeTitle');
const modalSchemeKicker = document.getElementById('modalSchemeKicker');
const expand = document.getElementById('schemeExpand');
const heroSchemeOpen = document.getElementById('heroSchemeOpen');
const schemeImageOpen = document.getElementById('schemeImageOpen');
let modalGallery = [];
let modalGalleryIndex = 0;
let modalGalleryType = 'single';

function setModal(open) {
  if (!modal) return;
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (!open) {
    modalGallery = [];
    modalGalleryIndex = 0;
    modalGalleryType = 'single';
  }
}

function renderModalItem(index) {
  if (!modalGallery.length || !modalSchemeImage) return;
  modalGalleryIndex = Math.max(0, Math.min(modalGallery.length - 1, index));
  const item = modalGallery[modalGalleryIndex];
  modalSchemeImage.src = item.image;
  modalSchemeImage.alt = item.alt || item.title;
  if (modalSchemeTitle) modalSchemeTitle.textContent = item.title;
  if (modalSchemeKicker) modalSchemeKicker.textContent = item.kicker || 'ПРОСМОТР ИЗОБРАЖЕНИЯ';

  const multi = modalGallery.length > 1;
  modalPrev?.classList.toggle('is-hidden', !multi);
  modalNext?.classList.toggle('is-hidden', !multi);
  if (modalPrev) modalPrev.disabled = modalGalleryIndex === 0;
  if (modalNext) modalNext.disabled = modalGalleryIndex === modalGallery.length - 1;
  if (modalCounter) {
    modalCounter.textContent = multi ? `${modalGalleryIndex + 1} / ${modalGallery.length}` : '';
    modalCounter.classList.toggle('is-hidden', !multi);
  }

  if (modalGalleryType === 'scheme' && item.key) renderScheme(item.key, { animate: false });
  if (modalGalleryType === 'adjustment') {
    scrollToAdjustment(modalGalleryIndex);
  }
}

function openImageModal({ gallery, index = 0, type = 'single' }) {
  modalGallery = gallery;
  modalGalleryType = type;
  renderModalItem(index);
  setModal(true);
}

const schemeGallery = schemeOrder.map(key => ({
  key,
  ...schemes[key],
  kicker: 'СХЕМА ПОДКЛЮЧЕНИЯ'
}));

const adjustmentButtons = [...document.querySelectorAll('[data-adjustment-image]')];
const adjustmentGallery = adjustmentButtons.map((button, index) => ({
  image: button.dataset.adjustmentImage,
  title: button.dataset.adjustmentTitle || `Шаг ${index + 1} — Регулировка ПТФ`,
  alt: button.querySelector('img')?.alt || 'Регулировка ПТФ',
  kicker: 'РЕГУЛИРОВКА ПТФ'
}));

function openCurrentSchemeModal() {
  openImageModal({
    gallery: schemeGallery,
    index: schemeOrder.indexOf(currentScheme),
    type: 'scheme'
  });
}

expand?.addEventListener('click', openCurrentSchemeModal);
schemeImageOpen?.addEventListener('click', e => {
  if (schemeSuppressClick) {
    e.preventDefault();
    return;
  }
  openCurrentSchemeModal();
});

heroSchemeOpen?.addEventListener('click', () => {
  openImageModal({
    gallery: [{
      image: 'assets/hero-install-h11.png',
      title: 'Пошаговая схема установки через штатную фишку H11',
      alt: 'Пошаговая установка ПТФ через штатную фишку H11',
      kicker: 'ИНСТРУКЦИЯ ПО УСТАНОВКЕ'
    }]
  });
});

adjustmentButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (adjustmentClickSuppressed) return;
    openImageModal({ gallery: adjustmentGallery, index, type: 'adjustment' });
  });
});

modalPrev?.addEventListener('click', () => renderModalItem(modalGalleryIndex - 1));
modalNext?.addEventListener('click', () => renderModalItem(modalGalleryIndex + 1));
modalClose?.addEventListener('click', () => setModal(false));
modal?.addEventListener('click', e => {
  if (e.target === modal) setModal(false);
});

let modalPointer = null;
modalContent?.addEventListener('pointerdown', e => {
  if (e.target.closest('.modal-nav, .modal-close')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  modalPointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
  if (e.pointerType === 'mouse') modalContent.setPointerCapture?.(e.pointerId);
});

modalContent?.addEventListener('pointerup', e => {
  if (!modalPointer || modalPointer.id !== e.pointerId) return;
  const dx = e.clientX - modalPointer.x;
  const dy = e.clientY - modalPointer.y;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.15) {
    renderModalItem(modalGalleryIndex + (dx < 0 ? 1 : -1));
  }
  modalPointer = null;
});

modalContent?.addEventListener('pointercancel', () => { modalPointer = null; });

document.addEventListener('keydown', e => {
  if (!modal?.classList.contains('open')) return;
  if (e.key === 'Escape') setModal(false);
  if (e.key === 'ArrowLeft') renderModalItem(modalGalleryIndex - 1);
  if (e.key === 'ArrowRight') renderModalItem(modalGalleryIndex + 1);
});

window.addEventListener('resize', () => {
  if (adjustmentCards.length) scrollToAdjustment(currentAdjustment, 'auto');
});

renderScheme(currentScheme, { animate: false });
updateAdjustmentUI(0);
