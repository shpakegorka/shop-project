// modules/reviewSystem.js

export function initReviewSystem() {
  // Змінна для контролю кількості видимих відгуків
  let quantityFeedback = 3;

  // 1. ГОЛОВНА ФУНКЦІЯ ПІДРАХУНКУ СЕРЕДНЬОГО БАЛУ (Оновлена й безпечна)
  function updateReviewsAverageRate() {
    let quantityFeedbacks = document.querySelectorAll(".feedback").length;
    
    const quantityElement = document.querySelector('.aproduct-section__reviews__quantity');
    if (quantityElement) quantityElement.textContent = quantityFeedbacks;

    // Захист: якщо відгуків взагалі немає
    if (quantityFeedbacks === 0) {
      const rateElement = document.querySelector('.aproduct-section__reviews__rate');
      if (rateElement) rateElement.textContent = "0.0";
      return;
    }

    let totalRatingPoints = 0;

    // Рахуємо активні зірочки СТРОГО всередині кожної окремої картки відгуку
    document.querySelectorAll(".feedback").forEach((card) => {
      let starsInThisCard = card.querySelectorAll('.rate-active').length;
      totalRatingPoints += starsInThisCard;
    });

    let averageRate = totalRatingPoints / quantityFeedbacks;

    const rateElement = document.querySelector('.aproduct-section__reviews__rate');
    if (rateElement) {
      rateElement.textContent = averageRate.toFixed(1);
    }
  }

  // 2. ФУНКЦІЯ КЕРУВАННЯ ВИДИМІСТЮ ВІДГУКІВ (3 або 10)
  function updateReviewsVisibility() {
    if (document.querySelector(".feedback__container")) { 
      updateReviewsAverageRate(); // Перераховуємо рейтинг при будь-якій зміні списку
      
      document.querySelectorAll(".feedback").forEach((item, index) => {
        if (index < quantityFeedback) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }    
      });
    }
  }

  // Ініціалізуємо видимість відгуків, які вже є в HTML при завантаженні сторінки
  updateReviewsVisibility();

  // Слухачі для кнопок "Показати більше / менше"
  const moreFeedbacksBtn = document.querySelector('#more-feedbacks-btn');
  const lessFeedbacksBtn = document.querySelector('#less-feedbacks-btn');

  if (moreFeedbacksBtn && lessFeedbacksBtn) {
    moreFeedbacksBtn.addEventListener('click', () => {
      quantityFeedback = 10;
      moreFeedbacksBtn.style.display = "none";
      lessFeedbacksBtn.style.display = "flex";
      updateReviewsVisibility();
    });

    lessFeedbacksBtn.addEventListener('click', () => {
      quantityFeedback = 3;
      lessFeedbacksBtn.style.display = "none";
      moreFeedbacksBtn.style.display = "flex";
      updateReviewsVisibility();
    });
  }

  // 3. ЛОГІКА ВИСТАВЛЕННЯ ОЦІНКИ (ЗІРОЧКИ У ФОРМІ)
  if (document.querySelector("#review-button-add")) {
    
    // Відкриття форми додавання відгуку
    document.querySelector("#review-button-add").addEventListener('click', () => {
      document.querySelector(".aproduct-section__reviews__button").style.display = 'none';
      document.querySelector(".aproduct-section__reviews__add").style.display = 'block';
    });

    let selectedRating = 0;
    let stars = document.querySelectorAll('.rate__star');
    let starsContainer = document.querySelector('.rate__container__stars');

    if (stars.length > 0 && starsContainer) {
      // Ефект наведення мишки (mouseenter)
      stars.forEach((rate) => {
        rate.addEventListener('mouseenter', (e) => {
          let rateNumber = Number(e.currentTarget.dataset.value);
          stars.forEach((star) => {
            if (Number(star.dataset.value) <= rateNumber) {
              star.classList.add('rate-active');
            } else {
              star.classList.remove('rate-active');
            }
          });
        });
      });

      // Мишка йде з контейнера зірок (mouseleave)
      starsContainer.addEventListener('mouseleave', () => {
        stars.forEach((star) => {
          if (Number(star.dataset.value) <= selectedRating) {
            star.classList.add('rate-active');
          } else {
            star.classList.remove('rate-active');
          }
        });
      });

      // Клік по зірочці (фіксація оцінки)
      stars.forEach((rate) => {
        rate.addEventListener('click', (e) => {
          let rateNumber = Number(e.currentTarget.dataset.value);
          if (selectedRating === rateNumber) {
            selectedRating = 0; // Скидання, якщо клікнули вдруге на ту саму зірку
          } else {
            selectedRating = rateNumber;
            stars.forEach((star) => {
              if (Number(star.dataset.value) <= rateNumber) {
                star.classList.add('rate-active');
              } else {
                star.classList.remove('rate-active');
              }
            });
          }
        });
      });
    }

    // 4. КНОПКА НАДСИЛАННЯ ВІДГУКУ (ДОДАВАННЯ В DOM)
    let buttonAdd = document.querySelector('#review-button-added');
    
    if (buttonAdd) {
      buttonAdd.addEventListener('click', () => {
        let userText = document.querySelector('#user-text').value.trim();
        let userRate = selectedRating;

        // ВАРІАНТ А: Успішне заповнення полів
        if (userText && userRate) {
          let reviewContainer = document.querySelector('.aproduct-section__review__container');

          if (reviewContainer) {
            let newReview = document.createElement('div');
            newReview.classList.add('aproduct-section__review', 'feedback');

            newReview.innerHTML = `
              <img width="48" height="48" src="../images/Avatar.png" alt="Avatar">
              <div class="aproduct-section__review__text">
                <h4 class="aproduct-section__review__text__heading">Yehor Shpak</h4>
                <p class="aproduct-section__review__text__paragraph"><span>NOW</span><span></span></p>
                <p>${userText}</p>
              </div>
              <div class="aproduct-section__review__rate">
                ${generateStarsHTML(userRate)}
              </div>
            `;

            reviewContainer.prepend(newReview);
          }

          // Оновлюємо лічильники та видимість відгуків на сторінці
          updateReviewsVisibility();
          updateReviewsAverageRate();

          // Очищуємо та скидаємо форму до початкового стану
          document.querySelector('#user-text').style.borderColor = '';
          document.querySelector('#user-text').value = '';
          document.querySelector('#user-text').placeholder = "";
          document.querySelector('.rate__container__stars').style.border = '';
          
          document.querySelectorAll('.rate__star').forEach((star) => {
            star.classList.remove('rate-active');
          });
          selectedRating = 0; // Скидаємо збережену оцінку
        } 
        // ВАРІАНТ Б: Текст є, але оцінку зірочками забули поставити
        else if (userText && !userRate) {
          document.querySelector('.rate__container__stars').style.border = '1px solid var(--color-semantic-red-r800)';
        } 
        // ВАРІАНТ В: Будь-які інші випадки помилок (немає тексту)
        else {
          document.querySelector('#user-text').style.borderColor = 'var(--color-semantic-red-r800)';
          document.querySelector('#user-text').value = '';
          document.querySelector('#user-text').placeholder = "*please, enter your feedback";
          if (!userRate) {
            document.querySelector('.rate__container__stars').style.border = '1px solid var(--color-semantic-red-r800)';
          }
        }
      });
    }

    // Допоміжна функція генерації SVG-зірочок всередині нового відгуку
    function generateStarsHTML(rating) {
      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          starsHTML += `
            <svg class="aproduct-section__review__rate__image rate-active" width="16" height="16">
              <use href="../images/svg/icons.svg#icon-Empty-Star"></use>
            </svg>`; 
        } else {
          starsHTML += `
            <svg class="aproduct-section__review__rate__image" width="16" height="16">
              <use href="../images/svg/icons.svg#icon-Empty-Star"></use>
            </svg>`;
        }
      }
      return starsHTML;
    }
  }
}