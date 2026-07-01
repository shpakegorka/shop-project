export function burgerMenu() { 
  const burgerBtn = document.querySelector('.burger-button');
  const menuList = document.querySelector('.header__container__list');
  if (!burgerBtn || !menuList) return;

  burgerBtn.addEventListener('click', () => {
    menuList.classList.toggle('is-active');
  });
}