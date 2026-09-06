const tabs = document.querySelector('#cafeteriaTabs');
const dayTabs = document.querySelector('#dayTabs');
const mealGrid = document.querySelector('#mealGrid');
const title = document.querySelector('#menuTitle');
const officialName = document.querySelector('#officialName');
const updatedAt = document.querySelector('#updatedAt');
const weekRange = document.querySelector('#weekRange');

let menuData;
let cafeteriaIndex = 0;
let dayIndex = 0;

function displayDate(value) {
  if (!value || value.length !== 8) return value || '';
  return `${Number(value.slice(4, 6))}.${Number(value.slice(6, 8))}`;
}

function chooseToday(days) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = `${values.year}${values.month}${values.day}`;
  const exact = days.findIndex((day) => day.date === today);
  if (exact >= 0) return exact;
  const future = days.findIndex((day) => day.date > today);
  return future >= 0 ? future : Math.max(0, days.length - 1);
}

function makeButton(label, selected, click, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', String(selected));
  button.textContent = label;
  button.addEventListener('click', click);
  return button;
}

function renderCafeterias() {
  tabs.replaceChildren();
  menuData.cafeterias.forEach((cafeteria, index) => {
    tabs.append(makeButton(cafeteria.name, index === cafeteriaIndex, () => {
      cafeteriaIndex = index;
      dayIndex = chooseToday(cafeteria.days);
      render();
    }));
  });
}

function renderDays(cafeteria) {
  dayTabs.replaceChildren();
  cafeteria.days.forEach((day, index) => {
    const button = makeButton('', index === dayIndex, () => {
      dayIndex = index;
      renderDays(cafeteria);
      renderMeals(cafeteria.days[dayIndex]);
    });
    const date = document.createElement('strong');
    date.textContent = displayDate(day.date);
    button.append(date, document.createTextNode(day.dayOfWeek.replace('요일', '')));
    dayTabs.append(button);
  });
}

function renderMeals(day) {
  mealGrid.replaceChildren();
  if (!day || !day.meals.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '이 날짜에는 등록된 식단이 없습니다.';
    mealGrid.append(empty);
    return;
  }

  day.meals.forEach((meal) => {
    const card = document.createElement('article');
    card.className = 'meal-card';
    const heading = document.createElement('h3');
    const dot = document.createElement('span');
    heading.append(dot, document.createTextNode(meal.name));
    const list = document.createElement('ul');
    meal.items.forEach((item) => {
      const line = document.createElement('li');
      const isGroup = /^\[.+\]$/.test(item);
      if (isGroup) line.className = 'group';
      line.textContent = item;
      list.append(line);
    });
    card.append(heading, list);
    mealGrid.append(card);
  });
}

function render() {
  const cafeteria = menuData.cafeterias[cafeteriaIndex];
  title.textContent = cafeteria.name;
  officialName.textContent = cafeteria.officialName;
  renderCafeterias();
  renderDays(cafeteria);
  renderMeals(cafeteria.days[dayIndex]);
}

const loadMenu = window.SHINGU_MEALS
  ? Promise.resolve(window.SHINGU_MEALS)
  : fetch('data/meals.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error('식단 파일을 불러오지 못했습니다.');
      return response.json();
    });

loadMenu
  .then((data) => {
    menuData = data;
    if (!Array.isArray(data.cafeterias) || !data.cafeterias.length) throw new Error('등록된 식당이 없습니다.');
    dayIndex = chooseToday(data.cafeterias[0].days);
    const refreshed = new Date(data.fetchedAt);
    updatedAt.textContent = `최근 갱신 ${refreshed.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}`;
    weekRange.textContent = `${data.week.start} — ${data.week.end}`;
    render();
  })
  .catch((error) => {
    mealGrid.innerHTML = '';
    const message = document.createElement('div');
    message.className = 'error';
    message.textContent = `${error.message} 잠시 후 다시 확인해 주세요.`;
    mealGrid.append(message);
    updatedAt.textContent = '갱신 상태를 확인할 수 없습니다.';
  });
