
import { initFilter } from './filter.js';
import { initQuantityButton } from './quantityButton.js';
import { initTabsSwiper } from './tabsSwiper.js';
import { initSearch } from './search.js';
import { initReviewSystem } from './reviewSystem.js';

document.addEventListener('DOMContentLoaded', () => {

  // Запускаємо кожен модуль сайту.
  // Вони самі розберуться, на якій сторінці працювати завдяки внутрішнім перевіркам-захистам.
  initFilter();
  initQuantityButton();
  initTabsSwiper();
  initSearch();
  initReviewSystem();

}); // КІНЕЦЬ DOMContentLoaded