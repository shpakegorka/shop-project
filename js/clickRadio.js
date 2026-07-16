export function radioClick() {
  const likeButton = document.querySelector('.product__button__like');
  const likeImage = document.querySelector('.product__button__like__image');
  const sizeButtons = document.querySelectorAll('.left-bar__size__checkbox');
  if (likeButton) {
    likeButton.addEventListener('click', () => {
      const isLike = likeImage.classList.toggle('is-red');
      if (isLike) {
        likeImage.classList.remove('product__button__like__image');
      } else {
        likeImage.classList.add('product__button__like__image');
      }
      }
    )
  }
  if (sizeButtons) {

  }
}