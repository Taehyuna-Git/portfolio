const clock = document.querySelector('#clock');
const updateClock = () => {
  const now = new Date();
  clock.textContent = now.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
};
updateClock();
setInterval(updateClock, 1000);

const gameToggle = document.querySelector('#gameToggle');
const gameOpen = document.querySelector('.game-open');
const gameDrawer = document.querySelector('#gameDrawer');
const gameTabs = [...document.querySelectorAll('.game-tab')];
const galleries = [...document.querySelectorAll('.game-gallery')];

function toggleGameDrawer() {
  const isOpen = gameToggle.getAttribute('aria-expanded') === 'true';
  gameToggle.setAttribute('aria-expanded', String(!isOpen));
  gameToggle.innerHTML = `${isOpen ? '열기 <span>↓</span>' : '닫기 <span>↑</span>'}`;
  gameDrawer.hidden = isOpen;
}

gameToggle.addEventListener('click', toggleGameDrawer);
gameOpen.addEventListener('click', toggleGameDrawer);

gameTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    gameTabs.forEach((item) => item.classList.toggle('active', item === tab));
    galleries.forEach((gallery) => { gallery.hidden = gallery.dataset.gallery !== tab.dataset.game; });
  });
});

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxClose = document.querySelector('#lightboxClose');

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.classList.remove('lightbox-open');
}

document.querySelectorAll('.game-gallery img').forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `${image.alt} 확대 보기`);

  const openLightbox = () => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  };

  image.addEventListener('click', openLightbox);
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') openLightbox();
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
});
