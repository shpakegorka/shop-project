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
          case 'price-low': return priceA - priceB;
          case 'price-high': return priceB - priceA;
          case 'category': return catA.localeCompare(catB);
          case 'size': return (sizeWeight[sizeA] || 0) - (sizeWeight[sizeB] || 0);
          default: return 0;
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
  // ЛОГІКА КІЛЬКОСТІ (QUANTITY) ДОДАВАННЯ Й ВІДНІМАННЯ ТОВАРУ
  // ==========================================
  const quantityItems = document.querySelectorAll(".product__quantity__selected");

  if (quantityItems.length > 0) {
    for (let item of quantityItems) {
      const btnMinus = item.querySelector('.button-minus')
      const quantityInput = item.querySelector('.js-quantity-input');
      const btnPlus = item.querySelector('.button-plus')
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

  // ==========================================
  // РЕАЛІЗАЦІЯ МОЖЛИВОСТІ ПОШУКУ ТОВАРІВ
  // ==========================================

  if (document.querySelector(".user-search")) {
    const searchInput = document.querySelector('.user-search .user__searcher');
    const resultsContainer = document.querySelector('.user-search__results')
    const allProduct = [
      { id: 0, name: "Classic Monohrome Tees", img: "./images/blue-t-shirt.png", price: "$35.00", alt: "t-shirt black" },
      { id: 1, name: "Monohromatic Wardrobe", img: "./images/brown-t-shirt.png", price: "$27.00", alt: "t-shirt brown" },
      { id: 2, name: "Essential Neutrals", img: "./images/white-t-shirt.png", price: "$22.00", alt: "t-shirt white" },
      { id: 3, name: "UTRAANET Black", img: "./images/utraanet-black-t-shirt.png", price: "$43.00", alt: "t-shirt black" },
      { id: 4, name: "Elegant Ebony Sweatshirts", img: "./images/sweater-black.png", price: "$35.00", alt: "sweater black" },
      { id: 5, name: "Sleek and Cozy Black", img: "./images/khudi-black.png", price: "$57.00", alt: "khudi black" },
      { id: 6, name: "Raw Black Tees", img: "./images/t-shirt-gray.png", price: "$19.00", alt: "t-shirt gray" },
      { id: 7, name: "MOCKUP Black", img: "./images/t-shirt-black.png", price: "$30.00", alt: "t-shirt black" },
      { id: 8, name: "Classic Monohrome Tees", img: "./images/athletic-shirt.png", price: "$35.00", alt: "t-shirt athletic" }
    ];

    searchInput.addEventListener("input", (e) => {
      let text = e.target.value.trim().toLowerCase();
      if (text.length === 0) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = "";
      } else {
        let filteredAllProduct = allProduct.filter(product => product.name.toLowerCase().includes(text) || product.alt.toLowerCase().includes(text));
        let limitedProduct = filteredAllProduct.slice(0, 4);
        if (limitedProduct.length > 0) {
          resultsContainer.innerHTML = "";
          resultsContainer.style.display = 'flex';
          limitedProduct.forEach(product => {
            resultsContainer.innerHTML += `
            <div class="user-search__result">
              <div class="user-search__result__image"><img class="user-search__result__img" src="${product.img}" alt="${product.alt}"></div>
                <div class="user-search__result__text">
                  <div class="user-search__result__heading"><h6 class="user-search__result__text__heading">${product.name}</h6></div>
                  <div class="user-search__result__price"><h6 class="user-search__result__text__price">${product.price}</h6></div>
                </div>
              </div>`;
          });
        } else {
          resultsContainer.innerHTML = "";
          resultsContainer.style.display = 'none';
        };
      };
    })
    searchInput.addEventListener('keydown', (e) => {
      if (e.key == "Enter") {
        window.location.href = `/categories.html`
      };
    });
  };

  // ==========================================
  // РЕАЛІЗАЦІЯ ВІДГУКІВ
  // ==========================================
  let quantityFeedback = 3;
  
  function updateReviewsAverageRate() {
    let quantityFeedbacks = document.querySelectorAll(".feedback").length;
    document.querySelector('.aproduct-section__reviews__quantity').textContent = quantityFeedbacks;
    let qyantityRates = document.querySelectorAll(".rate-active").length; 
    document.querySelector('.aproduct-section__reviews__rate').textContent = (Number(qyantityRates) / Number(quantityFeedbacks)).toFixed(1);

  }

  function updateReviewsVisibility() {
    if (document.querySelector(".feedback__container")) { 
    updateReviewsAverageRate()
    document.querySelectorAll(".feedback").forEach((item, index) => {
      if (index < quantityFeedback) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }    
    });
  }
  }
  updateReviewsVisibility();

  document.querySelector('#more-feedbacks-btn').addEventListener('click', () => {
    quantityFeedback = 10;
    document.querySelector('#more-feedbacks-btn').style.display = "none";
    document.querySelector('#less-feedbacks-btn').style.display = "flex";
    updateReviewsVisibility();
  })

  document.querySelector('#less-feedbacks-btn').addEventListener('click', () => {
    quantityFeedback = 3;
    document.querySelector('#less-feedbacks-btn').style.display = "none";
    document.querySelector('#more-feedbacks-btn').style.display = "flex";
    updateReviewsVisibility();
  })


  // Виставлення оцінки
  if (document.querySelector("#review-button-add")) {
    document.querySelector("#review-button-add").addEventListener('click', () => {
      document.querySelector(".aproduct-section__reviews__button").style.display = 'none';
      document.querySelector(".aproduct-section__reviews__add").style.display = 'block';
    })

    let selectedRating = 0;
    let stars = document.querySelectorAll('.rate__star');
    let starsContainer = document.querySelector('.rate__container__stars');
    stars.forEach((rate) => {
      rate.addEventListener('mouseenter', (e) => {
        let rateNumber = Number(e.currentTarget.dataset.value);
        stars.forEach((star) => {
          if (Number(star.dataset.value) <= rateNumber) {
            star.classList.add('rate-active');
          } else (star.classList.remove('rate-active'));
        })
    })
    })
    starsContainer.addEventListener('mouseleave', (e) => {
      stars.forEach((star) => {
          if (Number(star.dataset.value) <= selectedRating) {
            star.classList.add('rate-active');
          } else (star.classList.remove('rate-active'));
        })
    });
    stars.forEach((rate) => {
      rate.addEventListener('click', (e) => {
        let rateNumber = Number(e.currentTarget.dataset.value);
        if (selectedRating == rateNumber) {
          selectedRating = 0;
        } else {
          selectedRating = rateNumber;
          stars.forEach((star) => {
            if (Number(star.dataset.value) <= rateNumber) {
              star.classList.add('rate-active');
            } else {
              star.classList.remove('rate-active')
            };
        })}
    })
    })

    // Кнопка додавання відгуків
    let buttonAdd = document.querySelector('#review-button-added');
    buttonAdd.addEventListener('click', () => {
      let userText = document.querySelector('#user-text').value.trim();
      let userRate = selectedRating;
      if (userText && userRate) {
        let reviewContainer = document.querySelector('.aproduct-section__review__container');

      // 2. Створюємо новий елемент div для нашого відгуку
      let newReview = document.createElement('div');
        newReview.classList.add('aproduct-section__review');
        newReview.classList.add('feedback');

      // 3. Наповнюємо цей div HTML-кодом
        newReview.innerHTML = `
          <img width="48" height="48" src="../images/Avatar.png" alt="">
          <div class="aproduct-section__review__text">
                  <h4 class="aproduct-section__review__text__heading">Yehor Shpak</h4>
                  <p class="aproduct-section__review__text__paragraph"><span>NOW</span><span></span></p>
                  <p>${userText}</p>
                </div>
                <div class="aproduct-section__review__rate">
                  ${generateStarsHTML(userRate)}
                </div>
              </div>`;

      // 4. Додаємо новий відгук на початок списку контейнера
      reviewContainer.prepend(newReview);
      } if (userText && !userRate) {
        document.querySelector('.rate__container__stars').style.border = '1px solid var(--color-semantic-red-r800)';
      } else if (!userText && userRate) {
        document.querySelector('#user-text').style.borderColor = 'var(--color-semantic-red-r800)';
        document.querySelector('#user-text').value = '';
        document.querySelector('#user-text').placeholder = "*please, enter your feedback";
      } else if (!userText && !userRate) {
        document.querySelector('#user-text').style.borderColor = 'var(--color-semantic-red-r800)';
        document.querySelector('#user-text').value = '';
        document.querySelector('#user-text').placeholder = "*please, enter your feedback";
        document.querySelector('.rate__container__stars').style.border = '1px solid var(--color-semantic-red-r800)';
      } else {
        document.querySelector('#user-text').style.borderColor = '';
        document.querySelector('#user-text').value = '';
        document.querySelector('#user-text').placeholder = "";
        document.querySelector('.rate__container__stars').style.border = '';
        document.querySelectorAll('.user__star').forEach((star) => {
          star.classList.remove('rate-active');
        })
        }
      


      function generateStarsHTML(rating) {
      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          // Зафарбована зірочка (додаємо твій клас активності)
          starsHTML += `<svg class="aproduct-section__review__rate__image rate-active" width="16" height="16">
                    <use href="../images/svg/icons.svg#icon-Empty-Star"></use>
                  </svg>`; 
        } else {
          // Порожня зірочка
          starsHTML += `<svg class="aproduct-section__review__rate__image" width="16" height="16">
                    <use href="../images/svg/icons.svg#icon-Empty-Star"></use>
                  </svg>`;
        }
      }
      return starsHTML;
      }

      updateReviewsVisibility();
      updateReviewsAverageRate();
    })
  };
}); // КІНЕЦЬ DOMContentLoaded