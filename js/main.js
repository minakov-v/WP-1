// Nav on scroll — transparent at the very top, solid bg once scrolled,
// hides on scroll-down and reappears on scroll-up (same logic as the
// GSAP version, just driven by a CSS transition instead of a tween).
const siteNav = document.querySelector('.site-nav');
let showNav = () => {};

if (siteNav) {
  let lastY = window.scrollY;
  let hidden = false;

  showNav = () => {
    if (hidden) {
      siteNav.classList.remove('is-hidden');
      hidden = false;
    }
  };

  const hide = () => {
    if (!hidden) {
      siteNav.classList.add('is-hidden');
      hidden = true;
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      // menu is open (scroll is locked, body.nav-open) — leave the nav alone
      if (document.body.classList.contains('nav-open')) return;

      const curY = Math.max(0, window.scrollY);
      siteNav.classList.toggle('is-scrolled', curY > 10);

      if (curY <= 2) {
        showNav();
      } else if (curY > lastY && !hidden) {
        hide();
      } else if (curY < lastY && hidden) {
        showNav();
      }
      lastY = curY;
    },
    { passive: true }
  );
}

// Nav menu — burger toggles a full-screen menu on any screen size
const navBurger = document.getElementById('nav-burger');
const navMenu = document.getElementById('nav-menu');

function setNavOpen(open) {
  navMenu.classList.toggle('is-open', open);
  navBurger.classList.toggle('is-active', open);
  navBurger.setAttribute('aria-expanded', String(open));
  navBurger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('nav-open', open);

  // always keep the burger/close button reachable while the menu is open
  if (open) showNav();
}

if (navBurger && navMenu) {
  navBurger.addEventListener('click', () => {
    setNavOpen(!navMenu.classList.contains('is-open'));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });
}

// Reviews slider. The rating cell next to it is static markup, so the swiper
// only owns the review cells — 3 across on desktop, like the Figma layout.
new Swiper('#review-swiper', {
  slidesPerView: 1,
  loop: true,
  loopAddBlankSlides: false,
  watchOverflow: true,
  pagination: {
    el: '.reviews-pagination',
    clickable: true,
  },
  breakpoints: {
    768: { slidesPerView: 2 },
    1280: { slidesPerView: 3 },
  },
});

// FAQ tabs
const faqTabs = document.querySelectorAll('.faq-tab');
const faqPanels = document.querySelectorAll('.faq-panel');

faqTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    faqTabs.forEach((t) => t.classList.remove('is-active'));
    faqPanels.forEach((p) => p.classList.remove('is-active'));

    tab.classList.add('is-active');
    document
      .querySelector(`.faq-panel[data-panel="${tab.dataset.tab}"]`)
      .classList.add('is-active');
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach((question) => {
  question.addEventListener('click', () => {
    question.closest('.faq-item').classList.toggle('is-open');
  });
});

// Footer copyright year — always current, no manual updates needed
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Projects stack — position/overlap is pure CSS (sticky + per-card top).
// This only shrinks and dims a card once the next one has covered it.
const projectCards = document.querySelectorAll('.project-card');

function updateProjectsStack() {
  const vh = window.innerHeight;
  const n = projectCards.length;
  if (!n) return;

  const stickyTops = Array.from(projectCards, (c) => parseFloat(getComputedStyle(c).top) || 0);

  // progress[k]: how far card k+1 has advanced toward covering card k (0–1)
  const progress = [];
  for (let k = 0; k < n - 1; k++) {
    const nextTop = projectCards[k + 1].getBoundingClientRect().top;
    const raw = 1 - (nextTop - stickyTops[k + 1]) / vh;
    progress[k] = Math.min(1, Math.max(0, raw));
  }

  projectCards.forEach((card, i) => {
    // depth accumulates every "arrival" of a card ahead of it —
    // the more cards have taken over in front, the smaller/dimmer it gets
    let depth = 0;
    for (let k = i; k < n - 1; k++) depth += progress[k];

    // No opacity on the card itself — that fades its own opaque background
    // too, letting the card behind bleed through the text. Darkening only
    // happens on the image scrim (--dim); text just gets a touch of scale.
    card.style.transform = `scale(${1 - depth * 0.06})`;
    card.style.setProperty('--dim', String(Math.min(0.6, depth * 0.35)));
  });
}

// Hero cards (mobile) — the stacking itself is pure CSS sticky. This only
// publishes the scene's progress as --p on the stage, which the cards turn
// into their fan angle. Progress is read off the STAGE, never off the cards:
// the stage is neither sticky nor rotated, so nothing here can feed back into
// the transform it drives.
const heroStage = document.querySelector('.hero-cards');
const heroCards = document.querySelectorAll('.hero-card');

// Distance the last card travels to land on the pile. offsetTop on a stuck
// element already includes the sticky shift, so measure it out of sticky.
let heroSpan = 0;

function measureHeroSpan() {
  if (!heroStage || heroCards.length < 2) return;
  const saved = Array.from(heroCards, (c) => c.style.position);
  heroCards.forEach((c) => (c.style.position = 'static'));
  heroSpan = heroCards[heroCards.length - 1].offsetTop;
  heroCards.forEach((c, i) => (c.style.position = saved[i]));
}

function updateHeroFan() {
  if (!heroStage || !heroCards.length) return;

  // desktop keeps the fixed fanned layout
  if (getComputedStyle(heroCards[0]).position !== 'sticky') {
    heroStage.style.removeProperty('--p');
    return;
  }

  if (!heroSpan) measureHeroSpan();
  if (!heroSpan) return;

  const stickyTop = parseFloat(getComputedStyle(heroCards[0]).top) || 0;
  const p = (stickyTop - heroStage.getBoundingClientRect().top) / heroSpan;
  heroStage.style.setProperty('--p', String(Math.min(1, Math.max(0, p))));
}

if (projectCards.length || heroCards.length) {
  const update = () => {
    updateProjectsStack();
    updateHeroFan();
  };

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', () => {
    measureHeroSpan();
    update();
  });
  measureHeroSpan();
  update();
}
