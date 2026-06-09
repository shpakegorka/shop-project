// modules/search.js

export function initSearch() {
  const searchContainer = document.querySelector(".user-search");
  
  // Якщо на сторінці немає блоку пошуку, просто виходимо
  if (!searchContainer) return;

  const searchInput = searchContainer.querySelector('.user__searcher');
  const resultsContainer = searchContainer.querySelector('.user-search__results');

  // Перевіряємо, чи є інпут та контейнер результатів
  if (!searchInput || !resultsContainer) return;

  // Твоя база даних товарів для пошуку
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

  // Слухач введення тексту
  searchInput.addEventListener("input", (e) => {
    let text = e.target.value.trim().toLowerCase();
    
    if (text.length === 0) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = "";
    } else {
      let filteredAllProduct = allProduct.filter(product => 
        product.name.toLowerCase().includes(text) || 
        product.alt.toLowerCase().includes(text)
      );
      
      let limitedProduct = filteredAllProduct.slice(0, 4);
      
      if (limitedProduct.length > 0) {
        resultsContainer.innerHTML = "";
        resultsContainer.style.display = 'flex';
        
        limitedProduct.forEach(product => {
          resultsContainer.innerHTML += `
            <div class="user-search__result">
              <div class="user-search__result__image">
                <img class="user-search__result__img" src="${product.img}" alt="${product.alt}">
              </div>
              <div class="user-search__result__text">
                <div class="user-search__result__heading">
                  <h6 class="user-search__result__text__heading">${product.name}</h6>
                </div>
                <div class="user-search__result__price">
                  <h6 class="user-search__result__text__price">${product.price}</h6>
                </div>
              </div>
            </div>`;
        });
      } else {
        resultsContainer.innerHTML = "";
        resultsContainer.style.display = 'none';
      }
    }
  });

  // Перехід на сторінку категорій при натисканні Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      window.location.href = `/categories.html`;
    }
  });
}