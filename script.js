document.addEventListener('DOMContentLoaded', () => {
  // Елементи інтерфейсу слайдера ціни
  const minSlider = document.getElementById('slider-min');
  const maxSlider = document.getElementById('slider-max');
  const progress = document.getElementById('slider-progress');
  const tooltip = document.getElementById('price-tooltip');

  // Контейнери для результатів та плашок
  const filtersContainer = document.getElementById('applied-filters-container');
  const productCards = document.querySelectorAll('.section__list__li');

  // Карта для відображення красивих назв на плашках замість технічних id/класів
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

  // ==========================================
  // 1. ОСНОВНА ФУНКЦІЯ ФІЛЬТРАЦІЇ ТА РЕНДЕРУ ПЛАШОК
  // ==========================================
  function filterProducts() {
    // Збираємо масиви активних значень з усіх чекбоксів наживо
    const activeCategories = Array.from(document.querySelectorAll('.left-bar__categories__input:checked')).map(el => el.getAttribute('data-value'));
    const activeColors = Array.from(document.querySelectorAll('.left-bar__color__checkbox:checked')).map(el => el.getAttribute('data-value'));
    const activeSizes = Array.from(document.querySelectorAll('.left-bar__size__checkbox:checked')).map(el => el.getAttribute('data-value'));

    const minPrice = minSlider ? parseFloat(minSlider.value) : 0;
    const maxPrice = maxSlider ? parseFloat(maxSlider.value) : 1000;

    let visibleCount = 0;

    // Проходимо по кожній картці товару
    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardColor = card.getAttribute('data-color');
      const cardSize = card.getAttribute('data-size');
      const cardPrice = parseFloat(card.getAttribute('data-price'));

      // Перевірка відповідності фільтрам
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

    // Оновлюємо текст лічильника "Showing 1 - 9..."
    const totalCountSpan = document.querySelector('.filters-container__sorted p span:nth-child(2)');
    if (totalCountSpan) {
      totalCountSpan.textContent = visibleCount;
    }

    // Рендеримо плашки
    renderBadges(activeCategories, activeColors, activeSizes);
  }

  // ==========================================
  // 2. ДИНАМІЧНИЙ РЕНДЕР ПЛАШОК (BADGES) ЗВЕРХУ
  // ==========================================
  function renderBadges(categories, colors, sizes) {
    if (!filtersContainer) return;
    filtersContainer.innerHTML = ''; // Очищуємо старі плашки

    // Збираємо все до одного масиву
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

      // Якщо клікнули на хрестик плашки — знімаємо галочку, і воно САМЕ миттєво перефільтрує
      badgeBtn.addEventListener('click', () => {
        const checkbox = document.querySelector(`${item.selectorClass}[data-value="${item.value}"]`);
        if (checkbox) {
          checkbox.checked = false;
        }
        filterProducts(); // Автоматичний перерахунок
      });

      filtersContainer.appendChild(badgeBtn);
    });
  }

  // ==========================================
  // 3. ЛОГІКА ПОДВІЙНОГО ПОЛЗУНКА ЦІНИ
  // ==========================================
  function updateSlider(e) {
    if (!minSlider || !maxSlider) return;

    let minVal = parseInt(minSlider.value);
    let maxVal = parseInt(maxSlider.value);

    if (maxVal - minVal < 40) {
      if (e && e.target === minSlider) {
        minSlider.value = maxVal - 40;
        minVal = maxVal - 40;
      } else {
        maxSlider.value = minVal + 40;
        maxVal = minVal + 40;
      }
    }

    const minPercent = (minVal / minSlider.max) * 100;
    const maxPercent = (maxVal / maxSlider.max) * 100;

    if (progress) {
      progress.style.left = `${minPercent}%`;
      progress.style.width = `${maxPercent - minPercent}%`;
    }

    if (tooltip) {
      tooltip.textContent = `$ ${minVal.toFixed(2)} - $ ${maxVal.toFixed(2)}`;
      const centerPercent = minPercent + (maxPercent - minPercent) / 2;
      tooltip.style.left = `${centerPercent}%`;
    }

    // ТУТ МАГІЯ: фільтруємо картки прямо під час руху повзунка ціни!
    filterProducts();
  }

  // Навішуємо події руху на обидва повзунки ціни
  if (minSlider && maxSlider) {
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

    updateSlider(); // Стартовий запуск слайдера при завантаженні
  }

  // ==========================================
  // 4. ДОДАВАННЯ ЖИВИХ СЛУХАЧІВ НА ВСІ ЧЕКБОКСИ
  // ==========================================
  // Знаходимо взагалі всі чекбокси в нашому блоці aside і вішаємо на них миттєву подію 'change'
  const allFilterCheckboxes = document.querySelectorAll('.left-bar input[type="checkbox"]');
  
  allFilterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
  });

  // Первинний виклик фільтрації (щоб сховати зайве, якщо щось було вибрано за замовчуванням)
  filterProducts();
});