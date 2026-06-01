const minSlider = document.getElementById('slider-min');
const maxSlider = document.getElementById('slider-max');
const progress = document.getElementById('slider-progress');
const tooltip = document.getElementById('price-tooltip');

function updateSlider(e) {
  let minVal = parseInt(minSlider.value);
  let maxVal = parseInt(maxSlider.value);

  // 1. Захист: не даємо ручкам повністю зійтися чи перетнутися (мінімальний крок 40 одиниць)
  if (maxVal - minVal < 40) {
    if (e && e.target === minSlider) {
      minSlider.value = maxVal - 40;
      minVal = maxVal - 40;
    } else {
      maxSlider.value = minVal + 40;
      maxVal = minVal + 40;
    }
  }

  // 2. Розрахунок відсотків для доріжки
  const minPercent = (minVal / minSlider.max) * 100;
  const maxPercent = (maxVal / maxSlider.max) * 100;

  progress.style.left = `${minPercent}%`;
  progress.style.width = `${maxPercent - minPercent}%`;

  // 3. Оновлюємо текст тултипу: показуємо обидві ціни від і до!
  tooltip.textContent = `$ ${minVal.toFixed(2)} - $ ${maxVal.toFixed(2)}`;
  
  // 4. Позиціонуємо тултип чітко по центру між двома ручками
  const centerPercent = minPercent + (maxPercent - minPercent) / 2;
  tooltip.style.left = `${centerPercent}%`;
}

// 5. ДИНАМІЧНИЙ Z-INDEX: Хто активніший, той і зверху
// Це на 100% прибирає баг, коли одна ручка «з'їдала» іншу і та провалювалася
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

// Первинна ініціалізація сайту
updateSlider();