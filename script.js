document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // БЛОК А. ФІЛЬТРАЦІЯ ТА КАТАЛОГ (Для сторінки categories.html)
  // ==========================================

  // 1. ГОЛОВНІ ЕЛЕМЕНТИ (Винесені наверх, щоб усі функції їх бачили)
  const minSlider = document.getElementById('slider-min');
  const maxSlider = document.getElementById('slider-max');
  const filtersContainer = document.getElementById('applied-filters-container');
  const inputMin = document.getElementById('input-min');
  const inputMax = document.getElementById('input-max');
  
  const productList = document.querySelector('.section__list');
  const productCards = document.querySelectorAll('.section__list__li');
  const sortOptions = document.querySelectorAll('#sort-options .dropdown-menu__item');

  // ГОЛОВНИЙ ЗАХИСТ: Якщо базових елементів каталогу немає, весь блок фільтрації та сортування ігнорується
  if (minSlider && maxSlider && productList) {

    const progress = document.getElementById('slider-progress');

    // Ваговий словник для сортування розмірів
    const sizeWeight = {
      'size_s': 1,
      'size_m': 2,
      'size_l': 3,
      'size_xl': 4,
      'size_xxl': 5
    };

    const prettyNames = {
      'semantic-blue': 'Blue',
      'semantic-yellow': 'Yellow',
      'semantic-green': 'Green',
      'primary-blue': 'Dark Blue',
      'primary-brown': 'Brown',
      'primary-dark': 'Black',
      'primary-white': 'White',
      'size_s': 'S',
      'size_m': 'M',
      'size_l': 'L',
      'size_xl': 'XL',
      'size_xxl': 'XXL'
    };

    // 1. ГОЛОВНА ФУНКЦІЯ СОРТУВАННЯ
    function sortProducts(sortType) {
      if (productCards.length === 0) return;

      const cardsArray = Array.from(productCards);

      cardsArray.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price')) || 0;
        const priceB = parseFloat(b.getAttribute('data-price')) || 0;
        const catA = a.getAttribute('data-category') || '';
        const catB = b.getAttribute('data-category') || '';
        const sizeA = a.getAttribute('data-size') || '';
        const sizeB = b.getAttribute('data-size') || '';

        switch (sortType) {
          case 'price-low':  return priceA - priceB;
          case 'price-high': return priceB - priceA;
          case 'category':   return catA.localeCompare(catB);
          case 'size':       return (sizeWeight[sizeA] || 0) - (sizeWeight[sizeB] || 0);
          default:           return 0;
        }
      });

      productList.innerHTML = '';
      cardsArray.forEach(card => productList.appendChild(card));
    }

    // 2. ФУНКЦІЯ ФІЛЬТРАЦІЇ
    function filterProducts() {
      if (productCards.length === 0) return;

      const activeCategories = Array.from(document.querySelectorAll('.left-bar__categories__input:checked')).map(el => el.getAttribute('data-value'));
      const activeColors = Array.from(document.querySelectorAll('.left-bar__color__checkbox:checked')).map(el => el.getAttribute('data-value'));
      const activeSizes = Array.from(document.querySelectorAll('.left-bar__size__checkbox:checked')).map(el => el.getAttribute('data-value'));

      const minPrice = parseFloat(minSlider.value);
      const maxPrice = parseFloat(maxSlider.value);

      let visibleCount = 0;

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardColor = card.getAttribute('data-color');
        const cardSize = card.getAttribute('data-size');
        const cardPrice = parseFloat(card.getAttribute('data-price')) || 0;

        const matchCategory = activeCategories.length === 0 || activeCategories.includes(cardCategory);
        const matchColor = activeColors.length === 0 || activeColors.includes(cardColor);
        const matchSize = activeSizes.length === 0 || activeSizes.includes(cardSize);
        const matchPrice = cardPrice >= minPrice && cardPrice <= maxPrice;

        if (matchCategory && matchColor && matchSize && matchPrice) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const totalCountSpan = document.querySelector('.filters-container__sorted p span:nth-child(2)');
      if (totalCountSpan) {
        totalCountSpan.textContent = visibleCount;
      }

      renderBadges(activeCategories, activeColors, activeSizes);
    }

    // 3. РЕНДЕР ПЛАШОК
    function renderBadges(categories, colors, sizes) {
      if (!filtersContainer) return;
      filtersContainer.innerHTML = '';

      const badgesData = [
        ...categories.map(v => ({ selectorClass: '.left-bar__categories__input', value: v })),
        ...colors.map(v => ({ selectorClass: '.left-bar__color__checkbox', value: v })),
        ...sizes.map(v => ({ selectorClass: '.left-bar__size__checkbox', value: v }))
      ];

      badgesData.forEach(item => {
        const badgeBtn = document.createElement('button');
        badgeBtn.className = 'filters__button';
        badgeBtn.type = 'button';

        const displayName = prettyNames[item.value] || item.value;

        badgeBtn.innerHTML = `
          ${displayName}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;

        badgeBtn.addEventListener('click', () => {
          const checkbox = document.querySelector(`${item.selectorClass}[data-value="${item.value}"]`);
          if (checkbox) {
            checkbox.checked = false;
          }
          filterProducts();
        });

        filtersContainer.appendChild(badgeBtn);
      });
    }

    // 4. ФУНКЦІЯ ОБРОБКИ ВВЕДЕННЯ ЦІНИ В ПОЛЯ РУКАМИ
    function handleTextInput() {
      let minPrice = parseInt(inputMin.value);
      let maxPrice = parseInt(inputMax.value);

      if (isNaN(minPrice)) minPrice = 0;
      if (isNaN(maxPrice)) maxPrice = parseInt(maxSlider.max);

      // Валідація меж
      if (minPrice < 0) {
        minPrice = 0;
        inputMin.value = 0;
      }
      if (minPrice > parseInt(minSlider.max)) {
        minPrice = parseInt(minSlider.max);
        inputMin.value = minSlider.max;
      }
      if (maxPrice < 0) {
        maxPrice = 0;
        inputMax.value = 0;
      }
      if (maxPrice > 1000) { 
        maxPrice = 1000;         
        inputMax.value = 1000;   
      }

      // Захист від перехрещення
      if (maxPrice - minPrice < 10) {
        if (document.activeElement === inputMin) {
          minPrice = maxPrice - 10;
          if (minPrice < 0) minPrice = 0;
        } else {
          maxPrice = minPrice + 10;
          if (maxPrice > 1000) maxPrice = 1000;
        }
      }

      minSlider.value = minPrice;
      maxSlider.value = maxPrice;

      updateSlider();
    }

    // 5. ЛОГІКА ПОЛЗУНКА ЦІНИ
    function updateSlider(e) {
      let minVal = parseInt(minSlider.value);
      let maxVal = parseInt(maxSlider.value);

      if (maxVal - minVal < 10) {
        if (e && e.target === minSlider) {
          minSlider.value = maxVal - 10;
          minVal = maxVal - 10;
        } else {
          maxSlider.value = minVal + 10;
          maxVal = minVal + 10;
        }
      }

      const minPercent = (minVal / minSlider.max) * 100;
      const maxPercent = (maxVal / maxSlider.max) * 100;

      if (progress) {
        progress.style.left = `${minPercent}%`;
        progress.style.width = `${maxPercent - minPercent}%`;
      }

      if (inputMin && inputMax) {
        if (document.activeElement !== inputMin) inputMin.value = minVal;
        if (document.activeElement !== inputMax) inputMax.value = maxVal;
      }

      filterProducts();
    }

    // === НАЛАШТУВАННЯ СЛУХАЧІВ ДЛЯ БЛОКУ А ===
    sortOptions.forEach(option => {
      option.addEventListener('click', () => {
        const sortType = option.getAttribute('data-sort');
        sortProducts(sortType);
        
        const textSpan = document.querySelector('.dropdown-menu__text p');
        if (textSpan) {
          textSpan.textContent = option.textContent.toUpperCase();
        }
      });
    });

    minSlider.addEventListener('input', (e) => {
      minSlider.style.zIndex = "5";
      maxSlider.style.zIndex = "4";
      updateSlider(e);
    });

    maxSlider.addEventListener('input', (e) => {
      maxSlider.style.zIndex = "5";
      minSlider.style.zIndex = "4";
      updateSlider(e);
    });

    if (inputMin && inputMax) {
      inputMin.addEventListener('input', handleTextInput);
      inputMax.addEventListener('input', handleTextInput);
    }

    const allFilterCheckboxes = document.querySelectorAll('.left-bar input[type="checkbox"]');
    allFilterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', filterProducts);
    });

    // Первинний запуск логіки
    updateSlider();
    if (productCards.length > 0) {
      filterProducts();
    }
  }

  // ==========================================
  // ВИНІС ОДНОГО ПРОДУКТУ: ЛОГІКА КІЛЬКОСТІ (QUANTITY)
  // ==========================================
  const btnMinus = document.querySelector('.button-minus');
  const btnPlus = document.querySelector('.button-plus');
  const quantityInput = document.querySelector('.js-quantity-input');

  if (btnMinus && btnPlus && quantityInput) {
    btnMinus.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    btnPlus.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value) || 1;
      let maxLimit = parseInt(quantityInput.getAttribute('max')) || 99;
      if (currentValue < maxLimit) {
        quantityInput.value = currentValue + 1;
      }
    });

    quantityInput.addEventListener('blur', () => {
      let value = parseInt(quantityInput.value);
      let minLimit = parseInt(quantityInput.getAttribute('min')) || 1;
      let maxLimit = parseInt(quantityInput.getAttribute('max')) || 99;

      if (isNaN(value) || value < minLimit) {
        quantityInput.value = minLimit;
      } else if (value > maxLimit) {
        quantityInput.value = maxLimit;
      }
    });
  }

  // ==========================================
  // БЛОК Б. ЛОГІКА ТАБІВ (Для сторінки продукту)
  // ==========================================
  const btnDetails = document.querySelector('.aproduct-section__button__details');
  const btnReviews = document.querySelector('.aproduct-section__button__reviews');
  const contentDetails = document.querySelector('.aproduct-section__details');
  const contentReviews = document.querySelector('.aproduct-section__reviews');

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

  // Ініціалізація Swiper
  if (document.querySelector('.swiper')) {
    const swiper = new Swiper('.swiper', {
      direction: 'horizontal',
      loop: true,
      pagination: { el: '.swiper-pagination' },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      scrollbar: { el: '.swiper-scrollbar' },
    });
  }

}); // КІНЕЦЬ DOMContentLoaded