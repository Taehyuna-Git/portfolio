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
