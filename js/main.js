new Swiper('#review-swiper', {
  slidesPerView: 1,
  loop: true,
  navigation: {
    nextEl: '#btn-next',
    prevEl: '#btn-prew',
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
