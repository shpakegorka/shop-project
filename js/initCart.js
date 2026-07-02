// 1. Підтягуємо масив кошика з пам'яті
let cart = JSON.parse(localStorage.getItem('devcut_cart')) || [];

export function initCart() {
  // Перевіряємо, чи ми дійсно на сторінці кошика
  if (!document.body.classList.contains('page-cart')) return;

  const cartContainer = document.querySelector('.cart-list__container');
  if (!cartContainer) return;

  // Головна編функція рендеру кошика
  function renderCart() {
    // Залишаємо тільки заголовок h4 "Your cart", а старі статичні товари видаляємо
    const heading = cartContainer.querySelector('.cart-list__container__heading');
    cartContainer.innerHTML = '';
    cartContainer.appendChild(heading);

    // Якщо кошик порожній
    if (cart.length === 0) {
        cartContainer.insertAdjacentHTML('beforeend', '<p style="padding: 30px 0; color: #8c8c8c;">Your cart is currently empty.</p>');
        updateSummary(0);
        return;
    }

    let subtotal = 0;

    // Циклом проходимо по кожному товару з пам'яті і збираємо HTML
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity; // ОЦЕЙ ПІДРАХУНОК ЦІНИ ЗА КІЛЬКІСТЬ ТОВАРУ
        subtotal += itemTotal;

        let imgSrc = item.img;
        if (imgSrc.startsWith('../')) {
            imgSrc = imgSrc.replace('../', './');
        }

        const itemHTML = `
            <div class="cart-list__item" data-index="${index}">
              <div class="cart-list__item__image__container">
                <img height="100%" src="${imgSrc}" alt="${item.name}">
              </div>
              <div class="cart-list__item__text">
                <h6 class="cart-list__item__text__heading">${item.name}</h6>
                <p class="cart-list__item__text__paragraph">Color: <span class="cart-list__item__text__color" style="background-color: var(${item.color})"></span> – Size: <span>${item.size}</span></p>
              </div>
              <div class="visible__container">
                <h6 class="cart-list__item__text__price">$${itemTotal.toFixed(2)}</h6>
                <div class="cart-list__item__quantity"></div>
                <div class="product__quantity__selected">
                  <button class="product__quantity__selected__button js-cart-minus" type="button">
                    <svg height="20px" width="20px"><use href="./images/svg/icons.svg#icon-Minus"></use></svg>
                  </button>
                  <input class="product__quantity__input js-quantity-input" type="number" value="${item.quantity}" readonly>
                  <button class="product__quantity__selected__button js-cart-plus" type="button">
                    <svg height="20px" width="20px"><use href="./images/svg/icons.svg#icon-Add"></use></svg>
                  </button>
                </div>
                <button class="cart-list__button__close js-cart-remove">
                  <svg width="20" height="20"><use href="./images/svg/icons.svg#icon-close"></use></svg>
                </button>
              </div>
            </div>
        `;
      
      
      
        cartContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    updateSummary(subtotal);
  }

  // Функція підрахунку сум в Order Summary
  function updateSummary(subtotal) {
    const tax = subtotal > 0 ? 3.00 : 0.00;
    const total = subtotal + tax;

    const subtotalEl = document.querySelector('.js-subtotal');
    const taxEl = document.querySelector('.js-tax');
    const totalEl = document.querySelector('.js-total');

    if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$ ${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$ ${total.toFixed(2)}`;
  }

  // Слухач кліків на кнопки (Плюс, Мінус, Видалити)
  cartContainer.addEventListener('click', function(e) {
    const itemRow = e.target.closest('.cart-list__item');
    if (!itemRow) return;
    
    const index = parseInt(itemRow.dataset.index);

    if (e.target.closest('.js-cart-plus')) {
        cart[index].quantity += 1;
        saveAndReload();
    }

    if (e.target.closest('.js-cart-minus')) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            saveAndReload();
        }
    }

    if (e.target.closest('.js-cart-remove')) {
        cart.splice(index, 1);
        saveAndReload();
    }
  });

  function saveAndReload() {
    localStorage.setItem('devcut_cart', JSON.stringify(cart));
    renderCart();
  }

  // Перший запуск рендеру
  renderCart();

  // =========================================================
  // ОФОРМЛЕННЯ ЗАМОВЛЕННЯ В ТЕЛЕГРАМ-БОТ + АЛЕРТ
  // =========================================================
  const checkoutBtn = document.querySelector('.sum-list__container__button');
  if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
          if (cart.length === 0) {
              alert('Ваш кошик порожній!');
              return;
          }

          const botToken = '8934222963:AAEppHvoRyd7yuBt4Tqd3d9PEYM70U9ghec';
          const chatId = '771248383';

          let text = `🛍 <b>НОВЕ ЗАМОВЛЕННЯ З МАГАЗИНУ DEVCUT!</b>\n\n`;
          text += `📦 <b>Склад замовлення:</b>\n`;
          
          let totalSum = 0;
          cart.forEach((item, i) => {
              const sum = item.price * item.quantity;
              totalSum += sum;
              text += `${i + 1}. <b>${item.name}</b>\n   🔹 Розмір: ${item.size} | Колір: ${item.color}\n   🔹 Кількість: ${item.quantity} шт. × $${item.price} = $${sum.toFixed(2)}\n\n`;
          });

          text += `💰 <b>Разом до сплати (з податком):</b> $${(totalSum + 3).toFixed(2)}`;

          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
          })
          .then(res => {
              if (res.ok) {
                  alert('Покупка оформлена, очікуйте з вами звʼяжеться наш менеджер!');
                  cart = []; 
                  saveAndReload(); 
              } else {
                  alert('Помилка відправки. Спробуй ще раз.');
              }
          })
          .catch(err => {
              console.error('Error:', err);
              alert('Помилка мережі. Перевірте з’єднання.');
          });
      });
  }
}