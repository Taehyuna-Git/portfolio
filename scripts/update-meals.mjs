import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const endpoint = 'https://www.shingu.ac.kr/ajaxf/FR_BST_SVC/BistroCarteInfo.do';
const sourceUrl = 'https://www.shingu.ac.kr/cms/FR_CON/index.do?MENU_ID=1630';
const cafeterias = [
  { id: 'east', name: '동관 식당', officialName: '학생식당(미래창의관)', bistroSeq: 5 },
  { id: 'west', name: '서관 학생식당', officialName: '학생식당(서관)', bistroSeq: 7 }
];

const seoulDate = (date = new Date()) => new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
const dotDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('.');

function currentWeek() {
  const today = seoulDate();
  const monday = new Date(today);
  const day = today.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);
  if (day >= 6) monday.setDate(monday.getDate() + 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: dotDate(monday), end: dotDate(sunday) };
}

function cleanItems(value) {
  if (!value) return [];
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).filter((item) => item !== '분식없음');
}

async function fetchCafeteria(cafeteria, week) {
  const body = new URLSearchParams({
    MENU_ID: '1630', BISTRO_SEQ: String(cafeteria.bistroSeq), START_DAY: week.start, END_DAY: week.end
  });
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'user-agent': 'Mozilla/5.0 (GitHub Actions; Taehyun Portfolio)',
      referer: sourceUrl
    },
    body
  });
  if (!response.ok) throw new Error(`${cafeteria.name} 식단 요청 실패: ${response.status}`);
  const result = await response.json();
  const days = (result.data || []).map((row) => {
    const meals = [1, 2, 3].map((number) => ({
      name: row[`CARTE${number}_NM`],
      items: cleanItems(row[`CARTE${number}_CONT`])
    })).filter((meal) => meal.name && meal.items.length);
    return { date: row.STD_DT, dayOfWeek: row.STD_DY, meals };
  });
  return { ...cafeteria, days };
}

const week = currentWeek();
const result = {
  sourceUrl,
  fetchedAt: new Date().toISOString(),
  week,
  cafeterias: await Promise.all(cafeterias.map((cafeteria) => fetchCafeteria(cafeteria, week)))
};

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, '..', 'data');
const jsonOutput = resolve(outputDirectory, 'meals.json');
const scriptOutput = resolve(outputDirectory, 'meals.js');
const serialized = JSON.stringify(result, null, 2);
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(jsonOutput, `${serialized}\n`, 'utf8'),
  writeFile(scriptOutput, `window.SHINGU_MEALS = ${serialized};\n`, 'utf8')
]);
console.log(`Updated ${jsonOutput} and ${scriptOutput}`);
