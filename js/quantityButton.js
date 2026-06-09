export function initQuantityButton() {
  const quantityItems = document.querySelectorAll(".product__quantity__selected");

  // Якщо на цій сторінці немає кнопок зміни кількості, просто виходимо
  if (quantityItems.length === 0) return;

  for (let item of quantityItems) {
    const btnMinus = item.querySelector('.button-minus');
    const quantityInput = item.querySelector('.js-quantity-input');
    const btnPlus = item.querySelector('.button-plus');

    // Перевірка, чи всі три елементи є всередині поточного блоку
    if (!btnMinus || !quantityInput || !btnPlus) continue;

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