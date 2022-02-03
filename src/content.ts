const disp = <HTMLDivElement>document.querySelector('.clearfix');
const titleSelector = '.fc-title div:first-child';
const titlesSelector = '.fc-content-col .fc-event-container .fc-content .fc-title div:first-child';
const viewDivId = 'dispSumTime';
const JIRA_BASE_URL = '#';

type Dict = Record<string, number>;

type PersonMinute = {
  minute: number,
  ticket: string
};

const notNull = <T>(item: T | null): item is T => {
  return item !== null;
}

const createPElem = (text: string) => {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

const createTicketLink = (sourceText: string, ticketNumber: string) => {
  const atag = document.createElement('a');
  atag.href = `${JIRA_BASE_URL}${ticketNumber}`;
  atag.target = '_blank';
  atag.rel = 'noopener noreferrer';
  atag.text = sourceText;
  return atag;
};

const createTimeElem = (ticket: string, timeText: string) => {
  const matches = ticket.match(/^(KAPI-[0-9]{5}).*$/);
  const p = document.createElement('p');

  // チケット番号なしの場合はリンクを作らずそのまま返す
  if (!matches) {
    p.textContent = `${ticket}: ${timeText}`;
    return p;
  }

  const atag = createTicketLink(matches[0], matches[1]);
  const timeTextElem = document.createElement('span');
  timeTextElem.textContent = `: ${timeText}`;

  p.appendChild(atag);
  p.appendChild(timeTextElem);
  return p;
};

const toTimeString = (sumMinute: number) => {
  const hour = Math.floor(sumMinute / 60);
  const minute = sumMinute - (hour * 60);
  return `${hour}h ${minute}m`;
}

const tally = () => {
  const calcedDict = calcTime();

  // 表示クリア
  const viewDiv = <HTMLDivElement>document.getElementById(viewDivId);
  viewDiv.innerHTML = '';

  const dictKeys = Array.from(Object.keys(calcedDict));
  const pList = dictKeys.map(key => createTimeElem(key, toTimeString(calcedDict[key])));
  pList.forEach(p => viewDiv.appendChild(p));

  const sumTime = dictKeys
    .map(key => calcedDict[key])
    .reduce((acc, currentValue) => acc + currentValue);

  viewDiv.appendChild(createPElem(`合計: ${toTimeString(sumTime)}`));
}

// 時間計算処理
const calcTime = () => {
  const contentElements = document.querySelectorAll('.fc-content-col .fc-event-container .fc-content');
  const arr = Array.from(contentElements).map(parseElementToPersonMinute).filter(notNull);

  const d = {} as Dict;
  for (const p of arr) {
    if (!d[p.ticket]) {
      d[p.ticket] = 0;
    }

    d[p.ticket] += p.minute;
  }

  return d;
};

// HTML要素から必要なデータを抜き取ってオブジェクトで返す
const parseElementToPersonMinute = (element: Element): PersonMinute | null => {
  const titleElem = element.querySelector('.fc-title div:first-child');
  const timeRangeStr = element.querySelector('.fc-time')?.getAttribute('data-full');

  if (!titleElem?.textContent || !timeRangeStr) return null;

  // 差分を計算
  const startTime = new Date(`2020-01-01 ${timeRangeStr.slice(0, 5)}:00`);
  const endTime = new Date(`2020-01-01 ${timeRangeStr.slice(8)}:00`);
  const diff = endTime.getTime() - startTime.getTime();
  const minute = diff / (1000 * 60);

  return {
    ticket: titleElem.textContent,
    minute: minute
  };
};

// 画面上に「計算する」ボタンを追加
const addCalcButton = () => {
  const runButton = document.createElement('button');
  const viewDiv = document.createElement('div');
  runButton.textContent = '集計する';
  viewDiv.setAttribute('id', viewDivId)

  disp.appendChild(runButton);
  disp.appendChild(viewDiv);
  runButton.addEventListener('click', tally);
};

// 初期化処理
(() => {
  const dayButton = document.getElementById('idAgendaDay');
  if (!dayButton) return;
  addCalcButton();
})();
