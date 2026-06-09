// modules/productTabs.js

export function initTabsSwiper() {
  const btnDetails = document.querySelector('.aproduct-section__button__details');
  const btnReviews = document.querySelector('.aproduct-section__button__reviews');
  const contentDetails = document.querySelector('.aproduct-section__details');
  const contentReviews = document.querySelector('.aproduct-section__reviews');

  // Ініціалізація табів (якщо ці елементи є на сторінці)
  if (btnDetails && contentDetails && contentReviews) {
    btnDetails.addEventListener('click', () => {
      btnDetails.classList.add('is-selected');
      if (btnReviews) btnReviews.classList.remove('is-selected');

      contentDetails.classList.add('is-active');
      contentReviews.classList.remove('is-active');
    });
  }

  if (btnReviews && contentDetails && contentReviews) {
    btnReviews.addEventListener('click', () => {
      btnReviews.classList.add('is-selected');
      if (btnDetails) btnDetails.classList.remove('is-selected');

      contentReviews.classList.add('is-active');
      contentDetails.classList.remove('is-active');
    });
  }

  // Ініціалізація Swiper (якщо є контейнер .swiper)
  if (document.querySelector('.swiper')) {
    // Переконайся, що бібліотека Swiper підключена в HTML перед головним js-файлом
    new Swiper('.swiper', {
      direction: 'horizontal',
      loop: true,
      pagination: { el: '.swiper-pagination' },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      scrollbar: { el: '.swiper-scrollbar' },
    });
  }
}