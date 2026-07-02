// 1. Ініціалізуємо масив кошика з LocalStorage поза функцією
let cart = JSON.parse(localStorage.getItem('devcut_cart')) || [];

// 2. Допоміжна функція для обробки та збереження масиву в пам'ять браузера
function saveProductToStorage(newItem) {
    const existingItem = cart.find(item => 
        item.id === newItem.id && 
        item.color === newItem.color && 
        item.size === newItem.size
    );

    if (existingItem) {
        existingItem.quantity += newItem.quantity;
    } else {
        cart.push(newItem);
    }

    localStorage.setItem('devcut_cart', JSON.stringify(cart));
}

// 3. Головна функція, яка відпрацьовує на сторінці товару
export function addedCart() {
  if (document.body.classList.contains('page-product')) {

    const colorCheckboxes = document.querySelectorAll('.left-bar__color__checkbox');
    
    // Обмежуємо вибір кольору (поведінка як у радіо-кнопок)
    colorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                colorCheckboxes.forEach(cb => { if (cb !== this) cb.checked = false; });
            }
        });
    });

    // Головна кнопка "Add to cart" з жорсткою ПЕРЕВІРКОЮ
    const addToCartBtn = document.querySelector('.product__button__add');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            
            // --- СТРОГА ПЕРЕВІРКА КОЛЬОРУ ---
            const checkedColorInput = document.querySelector('.left-bar__color__checkbox:checked');
            let pColor = '';
            
            if (checkedColorInput) {
                const colorValue = checkedColorInput.dataset.value; 
                pColor = colorValue; 
            } else {
                alert('❌ Помилка: Будь ласка, оберіть колір товару перед додаванням до кошика!');
                return; 
            }

            // --- СТРОГА ПЕРЕВІРКА РОЗМІРУ ---
            const checkedSizeInput = document.querySelector('.left-bar__size__checkbox:checked');
            let pSize = '';
            
            if (checkedSizeInput) {
                pSize = document.querySelector(`label[for="${checkedSizeInput.id}"]`).innerText;
            } else {
                alert('❌ Помилка: Будь ласка, оберіть розмір (S, M, L, XL...) перед додаванням до кошика!');
                return; 
            }

            // --- ЗБИРАЄМО ДАНІ ТОВАРУ ---
            const pId = "101"; 
            const pName = document.querySelector('.product__description__heading').innerText;
            const pPriceText = document.querySelector('.product__description h4').innerText;
            const pPrice = parseFloat(pPriceText.replace('$', '')) || 0.00;
            const pImg = document.querySelector('.product__photo-slider__image')?.getAttribute('src') || '../images/black-t-shirt.png';
            
            const qtyInput = document.querySelector('.js-quantity-input');
            const pQty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

            const productItem = {
                id: pId,
                name: pName,
                price: pPrice,
                img: pImg,
                color: pColor,
                size: pSize,
                quantity: pQty
            };
          
            // Викликаємо функцію збереження в LocalStorage
            saveProductToStorage(productItem);

            alert('Ви успішно додали товар до кошика!');

            // =========================================================
            // 🆕 БЛОК ОБНУЛЕННЯ ОБРАНИХ КЛІЄНТОМ ЗНАЧЕНЬ (RESET FORM)
            // =========================================================
            
            // 1. Знімаємо галочку з обраного кольору
            colorCheckboxes.forEach(cb => cb.checked = false);
            
            // 2. Знімаємо вибір з усіх радіо-кнопок розмірів
            const sizeRadios = document.querySelectorAll('.left-bar__size__checkbox');
            sizeRadios.forEach(radio => radio.checked = false);
            
            // 3. Скидаємо інпут кількості назад на одиницю (1)
            if (qtyInput) {
                qtyInput.value = 1;
            }
            
        });
    }
  }
}