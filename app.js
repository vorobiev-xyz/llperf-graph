'use strict';
/* ============================================================================
 *  llperf-graph — визуализатор json-отчётов о производительности LLM-провайдера
 *  Формат отчёта: см. JSON_FORMAT.md (config / summary / metrics[])
 * ==========================================================================*/

const CLR = {
  gen:  '#57d07f',
  pre:  '#5ec8f0',
  load: '#f0a35e',
  ovh:  '#4d5566',
  grid: '#232935',
  axis: '#39414f',
  text: '#8b95a7',
  cur:  '#e8d24a',
  sel:  '#ffffff',
  band: '#57d07f',
};
// Палитра для разных отчётов на сравнительных графиках
const REPORT_COLORS = [
  '#57d07f', '#5ec8f0', '#f0a35e', '#e85d75', '#9b6bdf', 
  '#4ecdc4', '#ff9f43', '#5f27cd', '#00d2d3', '#ff6348',
  '#a5b1c2', '#48dbfb', '#feca57', '#ee5a6f', '#c8d6e5'
];

/* ----------------------------- локализация -------------------------------- */
const LANG = {
  en: {
    // Top bar
    brand: 'llperf·graph',
    addReport: 'Add report…',
    addReportTitle: 'Add one or more json reports',
    closeAll: 'Close all',
    closeAllTitle: 'Close (unload) all loaded reports',
    fullRun: 'Full run',
    fullRunTitle: 'Reset zoom (or double-click on chart)',
    
    // Tabs
    tabSummary: 'Summary',
    tabDetails: 'Details',
    
    // Phases
    phaseLoad: 'model load',
    phasePre: 'prefill',
    phaseGen: 'generation',
    phaseOvh: 'overhead',
    
    // Sections
    runResults: 'Run Results',
    runOverview: 'Run Overview',
    systemActivity: 'System Activity',
    windowStats: 'Window Statistics',
    runParams: 'Run Parameters and Results',
    compareRuns: 'Compare Runs',
    statsComparison: 'Statistical Comparison',
    requests: 'Requests',
    
    // Charts
    timeline: 'Request Timeline',
    parallelism: 'Parallelism: Active Requests by Phase',
    totalGeneration: 'Total Generation, tok/s',
    perRequestSpeed: 'Speed per Request, tok/s',
    prefillProcessing: 'Prompt Processing (prefill), tok/s',
    genTokensInRun: 'Generation Tokens in Run, tok/s',
    totalParallelGen: 'Total Parallel Generation, tok/s',
    
    // Cards
    cardRequests: 'requests',
    cardDuration: 'duration',
    cardParallelism: 'parallelism',
    cardTotalGen: 'total generation',
    cardPerRequest: 'per request',
    cardP50: 'p50 per request',
    cardPrefill: 'prefill',
    cardResponseTokens: 'response tokens',
    cardModel: 'model',
    
    // Units
    unitTokS: 'tok/s',
    unitAvg: 'avg',
    unitMax: 'max',
    unitTotal: 'total',
    unitOf: 'of',
    unitSlot: 'slot',
    unitSlots: 'slots',
    
    // Common
    min: 'min',
    max: 'max',
    median: 'median',
    mean: 'mean',
    outlier: 'outlier',
    outliers: 'outliers',
    measurements: 'measurements',
    
    noData: 'no data',
    noDataInWindow: 'no data in window',
    
    // Tooltips
    request: 'Request',
    phaseNow: 'phase now',
    startEnd: 'start → end',
    duration: 'duration',
    slot: 'slot',
    prompt: 'prompt',
    response: 'response',
    modelLoad: 'model load',
    overhead: 'overhead',
    generatedSoFar: 'generated so far',
    genPrefillLoad: 'generation / prefill / load',
    totalGeneration: 'total generation',
    totalPrefill: 'total prefill',
    fromStart: 'from start',
    
    // Table headers
    colName: 'Name',
    colRequests: 'Requests',
    colDuration: 'Duration',
    colLane: 'lane',
    colStart: 'start',
    colEnd: 'end',
    colWait: 'wait',
    colPrefill: 'prefill',
    colGeneration: 'generation',
    colTotal: 'total',
    colPrompt: 'prompt',
    colResponse: 'response',
    colGenSpeed: 'gen',
    colAvgSpeed: 'avg',
    
    // Run info
    runDuration: 'run duration',
    maxSlots: 'max slots occupied',
    avgParallelism: 'average parallelism',
    idleTime: 'idle (no requests)',
    windowDuration: 'window duration',
    requestsInWindow: 'requests in window',
    started: 'started',
    finished: 'finished',
    machineGenTime: 'machine generation time',
    inAverage: 'slots on average',
    
    // Card labels
    minColonSec: 'min:sec',
    avgMaxFormat: 'avg · max',
    
    // Tooltip
    activeRequests: 'active requests',
    inWindow: 'in window',
    totalTps: 'total tok/s',
    
    // Format helpers
    ofFormat: 'of', // for "X of Y"
    
    // Options/Controls
    hintDrag: 'drag to select viewing window',
    optLanes: 'execution lanes',
    optLabels: 'labels',
    optAbs: 'absolute time',
    optOnlyView: 'only in window',
    
    // Dropzone (empty state)
    dropzoneTitle: 'llperf Reports Visualizer',
    dropzoneDesc: 'Drag and drop a json report (or several) here, or click "Add report…".',
    dropzoneFeatures: 'Shows what the system was doing at every moment: request timeline by phases (model load → prefill → generation), parallelism, total and per-request generation speed.',
    dropzoneServer: 'To auto-load reports from current directory, open the page via a local server:',
    dropzoneHelp: 'Help for each section is available by clicking the',
    dropzoneHelpNext: 'icon next to its heading.',
    
    // Legends
    legendPrefill: 'prompt processing (prefill)',
    legendGeneration: 'response generation',
    legendOverhead: 'overhead (network, queue)',
    legendCursor: 'cursor / window',
    legendHint: 'X-axis — time from run start; each pixel shows maximum, so short spikes are not lost',
    idle: 'idle',
    tokens: 'tokens',
    perRequest: 'per request',
    comparison: 'comparison of',
    reports: 'reports',
    byGenSpeed: 'by per-request generation speed',
    byParallelGen: 'by total parallel generation',
    byPerThread: 'by per-thread speed',
    
    // Config table
    totalResponseTokens: 'total response tokens',
    totalPromptTokens: 'total prompt tokens',
    totalGeneration: 'total generation',
    genTimeSum: 'generation time (sum)',
    prefillTimeSum: 'prefill time (sum)',
    modelLoadTimeSum: 'model load time (sum)',
    overheadSum: 'overhead (sum)',
    
    // Window table
    window: 'window',
    idleLabel: 'idle',
    generatedTokens: 'generated tokens',
    avgRequestSpeed: 'avg. request speed',
    promptTokens: 'prompt tokens',
    for: 'for',
    modelLoads: 'model loads',
    
    // Request table
    showingFirst: 'showing first',
    outOf: 'out of',
    reduceWindow: 'reduce viewing window',
    
    // Compare table
    total: 'total',
    maxParallel: 'max parallel',
    responseTokens: 'response tokens',
    
    // Help
    helpClose: 'Close',
    helpHint: 'Esc or click outside to close. Each section has its own "?" button.',
    
    // Axis labels
    timeFormat: 'hh:mm:ss',
    durationFormat: 'min:sec',
    tok: 'tok',
  },
  ru: {
    // Top bar
    brand: 'llperf·graph',
    addReport: 'Добавить отчёт…',
    addReportTitle: 'Добавить один или несколько json-отчётов',
    closeAll: 'Закрыть все',
    closeAllTitle: 'Закрыть (выгрузить) все загруженные отчёты',
    fullRun: 'Весь запуск',
    fullRunTitle: 'Сбросить масштаб (или двойной клик по графику)',
    
    // Tabs
    tabSummary: 'Сводка',
    tabDetails: 'Детали',
    
    // Phases
    phaseLoad: 'загрузка модели',
    phasePre: 'prefill',
    phaseGen: 'генерация',
    phaseOvh: 'накладные',
    
    // Sections
    runResults: 'Итоги запуска',
    runOverview: 'Обзор запуска',
    systemActivity: 'Что делала система',
    windowStats: 'Статистика в окне просмотра',
    runParams: 'Параметры запуска и итоги',
    compareRuns: 'Сравнение запусков',
    statsComparison: 'Статистическое сравнение',
    requests: 'Запросы',
    
    // Charts
    timeline: 'Таймлайн запросов',
    parallelism: 'Параллельность: активных запросов по фазам',
    totalGeneration: 'Суммарная генерация, ток/с',
    perRequestSpeed: 'Скорость на один запрос, ток/с',
    prefillProcessing: 'Обработка промптов (prefill), ток/с',
    genTokensInRun: 'Генерация токенов в замере, ток/с',
    totalParallelGen: 'Общая параллельная генерация, ток/с',
    
    // Cards
    cardRequests: 'запросов',
    cardDuration: 'длительность',
    cardParallelism: 'параллельность',
    cardTotalGen: 'суммарно генерация',
    cardPerRequest: 'на запрос',
    cardP50: 'p50 на запрос',
    cardPrefill: 'prefill',
    cardResponseTokens: 'токенов ответа',
    cardModel: 'модель',
    
    // Units
    unitTokS: 'ток/с',
    unitAvg: 'сред',
    unitMax: 'макс',
    unitTotal: 'всего',
    unitOf: 'из',
    unitSlot: 'слот',
    unitSlots: 'слота',
    
    // Common
    min: 'мин',
    max: 'макс',
    median: 'медиана',
    mean: 'среднее',
    outlier: 'выброс',
    outliers: 'выбросов',
    measurements: 'замеров',
    
    noData: 'нет данных',
    noDataInWindow: 'нет данных в окне',
    
    // Tooltips
    request: 'Запрос',
    phaseNow: 'фаза сейчас',
    startEnd: 'старт → конец',
    duration: 'длительность',
    slot: 'слот',
    prompt: 'промпт',
    response: 'ответ',
    modelLoad: 'загрузка модели',
    overhead: 'накладные',
    generatedSoFar: 'сгенерировано к моменту',
    genPrefillLoad: 'генерация / prefill / загрузка',
    totalGeneration: 'суммарная генерация',
    totalPrefill: 'суммарный prefill',
    fromStart: 'от старта',
    
    // Table headers
    colName: 'Имя',
    colRequests: 'Запросов',
    colDuration: 'Длительность',
    colLane: 'слот',
    colStart: 'старт',
    colEnd: 'конец',
    colWait: 'ожидание',
    colPrefill: 'prefill',
    colGeneration: 'генерация',
    colTotal: 'всего',
    colPrompt: 'промпт',
    colResponse: 'ответ',
    colGenSpeed: 'ген',
    colAvgSpeed: 'сред',
    
    // Run info
    runDuration: 'длительность запуска',
    maxSlots: 'занятых слотов (макс)',
    avgParallelism: 'средняя параллельность',
    idleTime: 'простой (нет запросов)',
    windowDuration: 'длительность окна',
    requestsInWindow: 'запросов в окне',
    started: 'стартовало',
    finished: 'завершилось',
    machineGenTime: 'машинное время генерации',
    inAverage: 'слота в среднем',
    
    // Card labels
    minColonSec: 'мин:с',
    avgMaxFormat: 'сред · макс',
    
    // Tooltip
    activeRequests: 'активных запросов',
    inWindow: 'в окне',
    totalTps: 'суммарно ток/с',
    
    // Format helpers
    ofFormat: 'из', // for "X из Y"
    
    // Options/Controls
    hintDrag: 'потяните мышью, чтобы выбрать окно просмотра',
    optLanes: 'дорожки исполнения',
    optLabels: 'подписи',
    optAbs: 'абсолютное время',
    optOnlyView: 'только попадающие в окно',
    
    // Dropzone (empty state)
    dropzoneTitle: 'Визуализатор отчётов llperf',
    dropzoneDesc: 'Перетащите сюда json-отчёт (или несколько) либо нажмите «Добавить отчёт…».',
    dropzoneFeatures: 'Показывает, что система делала в каждый момент времени: таймлайн запросов по фазам (загрузка модели → prefill → генерация), параллельность, суммарную и поштучную скорость генерации.',
    dropzoneServer: 'Чтобы отчёты из текущего каталога подхватывались автоматически, откройте страницу через локальный сервер:',
    dropzoneHelp: 'Справка по каждому блоку — по значку',
    dropzoneHelpNext: 'рядом с его заголовком.',
    
    // Legends
    legendPrefill: 'обработка промпта (prefill)',
    legendGeneration: 'генерация ответа',
    legendOverhead: 'накладные расходы (сеть, очередь)',
    legendCursor: 'курсор / окно',
    legendHint: 'ось X — время от старта запуска; в каждом пикселе показан максимум, поэтому короткие всплески не теряются',
    idle: 'простой',
    tokens: 'токенов',
    perRequest: 'на запрос',
    comparison: 'сравнение',
    reports: 'отчётов',
    byGenSpeed: 'по скорости генерации на запрос',
    byParallelGen: 'по суммарной параллельной генерации',
    byPerThread: 'по удельной скорости на поток',
    
    // Config table
    totalResponseTokens: 'суммарно токенов ответа',
    totalPromptTokens: 'суммарно токенов промпта',
    totalGeneration: 'суммарная генерация',
    genTimeSum: 'время генерации (сумма)',
    prefillTimeSum: 'время prefill (сумма)',
    modelLoadTimeSum: 'время загрузки модели (сумма)',
    overheadSum: 'накладные расходы (сумма)',
    
    // Window table
    window: 'окно',
    idleLabel: 'простой',
    generatedTokens: 'сгенерировано токенов',
    avgRequestSpeed: 'скорость на запрос (сред.)',
    promptTokens: 'токенов промпта',
    for: 'за',
    modelLoads: 'загрузка модели',
    
    // Request table
    showingFirst: 'показаны первые',
    outOf: 'из',
    reduceWindow: 'уменьшите окно просмотра',
    
    // Compare table
    total: 'сум.',
    maxParallel: 'макс. паралл.',
    responseTokens: 'токенов ответа',
    
    // Help
    helpClose: 'Закрыть',
    helpHint: 'Esc или клик вне окна — закрыть. Свой «?» есть у каждого блока.',
    
    // Axis labels
    timeFormat: 'чч:мм:сс',
    durationFormat: 'мин:с',
    tok: 'ток',
  }
};

let currentLang = localStorage.getItem('llperf-lang') || 'en';
const t = (key) => LANG[currentLang][key] || key;
const PHASE_NAMES = () => ({ 
  load: t('phaseLoad'), 
  pre: t('phasePre'), 
  gen: t('phaseGen'), 
  ovh: t('phaseOvh') 
});



/* ----------------------------- утилиты ----------------------------------- */
const $  = (s) => document.querySelector(s);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function num(v, d = 1) {
  if (v === null || v === undefined || !isFinite(v)) return '—';
  const s = Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(d);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
function int(v) { return num(v, 0); }

/** «12:34» / «1:02:03» от начала запуска */
function fmtClock(s, ms) {
  if (!isFinite(s)) return '—';
  const neg = s < 0; s = Math.abs(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const ss = (sec < 10 ? '0' : '') + (ms ? sec.toFixed(ms) : String(Math.floor(sec)));
  const core = h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  return (neg ? '−' : '') + core;
}
/** длительность человеко-читаемо */
function fmtDur(s) {
  if (!isFinite(s)) return '—';
  if (s < 1) return (s * 1000).toFixed(0) + ' мс';
  if (s < 60) return s.toFixed(s < 10 ? 2 : 1) + ' с';
  return fmtClock(s) + ' (' + s.toFixed(0) + ' с)';
}
function fmtAbs(run, t, ms) {
  const d = new Date(run.epochMs + t * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
         (ms ? '.' + p(d.getMilliseconds(), 3) : '');
}
function fmtTime(run, t, ms) { return S.opts.abs ? fmtAbs(run, t, ms) : fmtClock(t, ms ? 2 : 0); }
function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

/** последний индекс с bp[i].t <= t, иначе -1 */
function lastLE(bp, t) {
  let lo = 0, hi = bp.length - 1, res = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (bp[m].t <= t) { res = m; lo = m + 1; } else hi = m - 1; }
  return res;
}
function stepAt(bp, t, key) {
  const i = lastLE(bp, t);
  return i < 0 ? 0 : Math.max(0, bp[i][key]);
}

function niceTicks(max, count) {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] };
  const raw = max / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  const step = n <= 1 ? mag : n <= 2 ? 2 * mag : n <= 2.5 ? 2.5 * mag : n <= 5 ? 5 * mag : 10 * mag;
  const top = Math.ceil(max / step - 1e-9) * step, ticks = [];
  for (let v = 0; v <= top + step * 1e-6; v += step) ticks.push(v);
  return { max: top, ticks };
}
const TSTEPS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30,
                60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 43200, 86400];
function timeTicks(a, b, pw) {
  const target = Math.max(2, Math.floor(pw / 95));
  const raw = (b - a) / target;
  let step = TSTEPS[TSTEPS.length - 1];
  for (const s of TSTEPS) if (s >= raw) { step = s; break; }
  const ticks = [];
  for (let t = Math.ceil(a / step - 1e-9) * step; t <= b + 1e-9; t += step) ticks.push(t);
  return { step, ticks };
}

/** шаговые серии из событий [{t,k,dv}] */
function buildSteps(events, keys) {
  events.sort((a, b) => a.t - b.t);
  const acc = {}; keys.forEach((k) => (acc[k] = 0));
  const out = [];
  for (let i = 0; i < events.length; ) {
    const t = events[i].t;
    while (i < events.length && events[i].t === t) { acc[events[i].k] += events[i].dv; i++; }
    const p = { t }; keys.forEach((k) => (p[k] = Math.abs(acc[k]) < 1e-9 ? 0 : acc[k]));
    out.push(p);
  }
  return out;
}

/** агрегация шаговой серии по пиксельным колонкам: min/max в каждой колонке */
function columnAgg(bp, key, a, b, pw) {
  const mx = new Float64Array(pw).fill(-Infinity), mn = new Float64Array(pw).fill(Infinity);
  const k = pw / (b - a);
  const paint = (t0, t1, v) => {
    let c0 = Math.floor((t0 - a) * k), c1 = Math.ceil((t1 - a) * k) - 1;
    if (c1 < c0) c1 = c0;
    c0 = clamp(c0, 0, pw - 1); c1 = clamp(c1, 0, pw - 1);
    for (let c = c0; c <= c1; c++) { if (v > mx[c]) mx[c] = v; if (v < mn[c]) mn[c] = v; }
  };
  if (bp.length) {
    let i = lastLE(bp, a), j = i < 0 ? 0 : i + 1;
    let v = i < 0 ? 0 : Math.max(0, bp[i][key]), t = a, guard = 0;
    while (t < b && guard++ < bp.length + pw + 8) {
      const tn = j < bp.length ? Math.min(bp[j].t, b) : b;
      paint(t, tn, v);
      if (tn >= b) break;
      v = Math.max(0, bp[j][key]); j++; t = tn;
    }
  }
  for (let c = 0; c < pw; c++) { if (mx[c] === -Infinity) mx[c] = 0; if (mn[c] === Infinity) mn[c] = 0; }
  return { mn, mx };
}
/** для каждой пиксельной колонки — состав фаз в момент пиковой загрузки внутри колонки */
function columnPhases(bp, a, b, pw) {
  const keys = ['act', 'load', 'pre', 'gen'];
  const out = { best: new Float64Array(pw).fill(-1) };
  keys.forEach((k) => (out[k] = new Float64Array(pw)));
  const k = pw / (b - a);
  const paint = (t0, t1, p) => {
    let c0 = Math.floor((t0 - a) * k), c1 = Math.ceil((t1 - a) * k) - 1;
    if (c1 < c0) c1 = c0;
    c0 = clamp(c0, 0, pw - 1); c1 = clamp(c1, 0, pw - 1);
    for (let c = c0; c <= c1; c++) {
      if (p.act > out.best[c]) { out.best[c] = p.act; keys.forEach((key) => (out[key][c] = Math.max(0, p[key]))); }
    }
  };
  if (bp.length) {
    const i = lastLE(bp, a);
    let cur = i >= 0 ? bp[i] : { act: 0, load: 0, pre: 0, gen: 0 };
    let t = a, j = i < 0 ? 0 : i + 1, guard = 0;
    while (t < b && guard++ < bp.length + pw + 8) {
      const tn = j < bp.length ? Math.min(bp[j].t, b) : b;
      paint(t, tn, cur);
      if (tn >= b) break;
      cur = bp[j]; j++; t = tn;
    }
  }
  return out;
}
function arrMax(a) { let m = 0; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }
function clipPlot(ctx, g) { ctx.save(); ctx.beginPath(); ctx.rect(g.pl + 1, g.pt, g.pw, g.ph); ctx.clip(); }
const overlap = (a1, a2, b1, b2) => Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));

/* ----------------------------- разбор отчёта ----------------------------- */
function parseRun(raw, name) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('корневой элемент не словарь');
  const metrics = raw.metrics;
  if (!Array.isArray(metrics) || !metrics.length) throw new Error('нет непустого массива metrics');

  const g = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);
  let t0 = Infinity;
  for (const m of metrics) t0 = Math.min(t0, g(m.request_start_time_ns));
  if (!isFinite(t0)) throw new Error('нет request_start_time_ns');

  const reqs = metrics.map((m, i) => {
    const s = (g(m.request_start_time_ns) - t0) / 1e9;
    let e = (g(m.request_end_time_ns) - t0) / 1e9;
    let load = g(m.load_model_time_ns) / 1e9,
        pp   = g(m.prompt_processing_time_ns) / 1e9,
        gen  = g(m.response_generating_time_ns) / 1e9;
    const total = g(m.provider_total_time_ns) / 1e9;
    if (!(e > s)) e = s + Math.max(total, load + pp + gen);   // страховка от битых меток
    const dur = e - s, sum = load + pp + gen;
    // фазы раскладываются от начала запроса: load -> prefill -> generation
    let f = 1;
    if (sum > dur && sum > 0) f = dur / sum;                  // не даём вылезти за пределы запроса
    const ls = s, le = s + load * f, ps = le, pe = le + pp * f, gs = pe, ge = pe + gen * f;
    let ttft = null;
    if (typeof m.request_ttft_ns === 'number' && isFinite(m.request_ttft_ns)) {
      ttft = m.request_ttft_ns > 1e15 ? (m.request_ttft_ns - t0) / 1e9 : s + m.request_ttft_ns / 1e9;
    }
    const pl = g(m.prompt_length), rl = g(m.response_length);
    return {
      i, s, e, dur, ls, le, ps, pe, gs, ge, ttft,
      load, pp, gen, total, pl, rl,
      ovh: Math.max(0, dur - sum),
      preTps: pp > 0 ? pl / pp : 0,
      genTps: gen > 0 ? rl / gen : 0,
      lane: 0,
    };
  });

  // дорожки исполнения (жадная упаковка по времени старта)
  const order = reqs.slice().sort((a, b) => a.s - b.s || a.e - b.e);
  const laneEnd = [];
  for (const r of order) {
    let k = laneEnd.findIndex((t) => t <= r.s + 1e-9);
    if (k < 0) { k = laneEnd.length; laneEnd.push(0); }
    laneEnd[k] = r.e; r.lane = k;
  }

  // шаговые серии
  const ev = [], evR = [];
  for (const r of reqs) {
    ev.push({ t: r.s, k: 'act', dv: 1 }, { t: r.e, k: 'act', dv: -1 });
    if (r.le > r.ls) ev.push({ t: r.ls, k: 'load', dv: 1 }, { t: r.le, k: 'load', dv: -1 });
    if (r.pe > r.ps) ev.push({ t: r.ps, k: 'pre', dv: 1 }, { t: r.pe, k: 'pre', dv: -1 });
    if (r.ge > r.gs) ev.push({ t: r.gs, k: 'gen', dv: 1 }, { t: r.ge, k: 'gen', dv: -1 });
    if (r.pe > r.ps) evR.push({ t: r.ps, k: 'pre', dv: r.preTps }, { t: r.pe, k: 'pre', dv: -r.preTps });
    if (r.ge > r.gs) evR.push({ t: r.gs, k: 'gen', dv: r.genTps }, { t: r.ge, k: 'gen', dv: -r.genTps });
  }
  const bpConc = buildSteps(ev, ['act', 'load', 'pre', 'gen']);
  const bpRate = buildSteps(evR, ['gen', 'pre']);

  let wall = 0, maxGenTps = 0, maxPreTps = 0;
  for (const q of reqs) {
    if (q.e > wall) wall = q.e;
    if (q.genTps > maxGenTps) maxGenTps = q.genTps;
    if (q.preTps > maxPreTps) maxPreTps = q.preTps;
  }
  let maxConc = 0, busy = 0, sumDur = 0;
  for (let i = 0; i < bpConc.length; i++) {
    maxConc = Math.max(maxConc, bpConc[i].act);
    const tn = i + 1 < bpConc.length ? bpConc[i + 1].t : wall;
    if (bpConc[i].act > 0) busy += tn - bpConc[i].t;
  }
  for (const r of reqs) sumDur += r.dur;

  const genTpsList = reqs.map((r) => r.genTps).filter((v) => v > 0).sort((a, b) => a - b);
  const med = (a) => (a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : 0);

  const run = {
    name, config: raw.config || {}, summary: raw.summary || {}, reqs, order,
    epochMs: t0 / 1e6, t0ns: t0, wall, lanes: laneEnd.length,
    bpConc, bpRate, maxConc, busy,
    avgConc: wall > 0 ? sumDur / wall : 0,
    totGen: reqs.reduce((a, r) => a + r.rl, 0),
    totPre: reqs.reduce((a, r) => a + r.pl, 0),
    sumGenTime: reqs.reduce((a, r) => a + r.gen, 0),
    sumPreTime: reqs.reduce((a, r) => a + r.pp, 0),
    sumLoad: reqs.reduce((a, r) => a + r.load, 0),
    sumOvh: reqs.reduce((a, r) => a + r.ovh, 0),
    p50GenTps: med(genTpsList),
    maxRate: 0, maxPreRate: 0, maxGenTps, maxPreTps,
  };
  for (const p of bpRate) { run.maxRate = Math.max(run.maxRate, p.gen); run.maxPreRate = Math.max(run.maxPreRate, p.pre); }
  run.aggTps = wall > 0 ? run.totGen / wall : 0;
  return run;
}

/* ------------------------------ состояние -------------------------------- */
const S = {
  runs: [], active: -1,
  view: { a: 0, b: 1 },
  cursor: null,          // время под курсором, с
  hoverReq: null,
  sel: null,             // закреплённый запрос
  opts: { lanes: true, labels: true, abs: false, onlyView: true },
  sort: { key: 'i', dir: 1 },
  drag: null,
  dragTab: null,        // индекс перетаскиваемой вкладки отчёта
  popAnchor: null,      // кнопка «?», для которой открыта справка
  activeView: 'summary', // активная вкладка: 'summary' или 'details'
};
const run = () => (S.active >= 0 ? S.runs[S.active] : null);
const span = () => S.view.b - S.view.a;

/* ------------------------------- графики --------------------------------- */
const PAD = { l: 58, r: 14, t: 8, b: 6 };
const charts = [];

function mkChart(key, cvId, wrapId, draw, options = {}) {
  const canvas = $('#' + cvId), wrap = $('#' + wrapId);
  const isStatic = options.static || false; // статические графики без привязки к времени
  const c = {
    key, canvas, wrap, ctx: canvas.getContext('2d'), draw, isStatic,
    g: null,
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(120, wrap.clientWidth), h = Math.max(24, wrap.clientHeight);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = h;
    },
    geom() {
      const pl = PAD.l, pt = PAD.t;
      // для статических графиков увеличиваем нижний отступ для легенды
      const pb = isStatic ? 90 : PAD.b;
      const pw = Math.max(10, this.W - PAD.l - PAD.r);
      const ph = Math.max(10, this.H - PAD.t - pb);
      const a = S.view.a, sp = S.view.b - a;
      return {
        pl, pt, pw, ph, a, b: S.view.b, sp,
        x: (t) => pl + ((t - a) / sp) * pw,
        tOf: (px) => a + ((px - pl) / pw) * sp,
        y: (v, max) => pt + ph - (max > 0 ? clamp(v / max, 0, 1) : 0) * ph,
      };
    },
    render(r) {
      this.resize();
      const ctx = this.ctx, g = this.geom(); this.g = g;
      ctx.clearRect(0, 0, this.W, this.H);
      this.draw(ctx, g, r, this);
      if (!isStatic) drawCursor(ctx, g, this.H);
    },
  };
  if (!isStatic) {
    attachPanZoom(c);
  } else {
    // для статических графиков добавляем обработку наведения для tooltip
    attachStaticHover(c);
  }
  charts.push(c);
  return c;
}

function frame(ctx, g, yTicks, yMax) {
  // сетка по времени
  const tt = timeTicks(g.a, g.b, g.pw);
  ctx.save();
  ctx.strokeStyle = CLR.grid; ctx.lineWidth = 1;
  ctx.beginPath();
  for (const t of tt.ticks) { const x = Math.round(g.x(t)) + 0.5; ctx.moveTo(x, g.pt); ctx.lineTo(x, g.pt + g.ph); }
  ctx.stroke();
  // сетка и подписи по значению
  if (yTicks) {
    ctx.strokeStyle = CLR.grid; ctx.fillStyle = CLR.text;
    ctx.font = '10px ui-sans-serif,system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.beginPath();
    for (const v of yTicks) {
      const y = Math.round(g.y(v, yMax)) + 0.5;
      ctx.moveTo(g.pl, y); ctx.lineTo(g.pl + g.pw, y);
      ctx.fillText(num(v, v < 10 ? 1 : 0), g.pl - 7, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = CLR.axis; ctx.beginPath();
  ctx.moveTo(g.pl + 0.5, g.pt); ctx.lineTo(g.pl + 0.5, g.pt + g.ph); ctx.lineTo(g.pl + g.pw, g.pt + g.ph);
  ctx.stroke();
  ctx.restore();
}

function drawCursor(ctx, g, H) {
  if (S.cursor === null || S.cursor < g.a || S.cursor > g.b) return;
  const x = Math.round(g.x(S.cursor)) + 0.5;
  ctx.save();
  ctx.strokeStyle = CLR.cur; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(x, g.pt); ctx.lineTo(x, g.pt + g.ph); ctx.stroke();
  ctx.restore();
}

/* --- 1. таймлайн запросов (Гантт) --- */
function ganttRows(r) { return S.opts.lanes ? Math.max(1, r.lanes) : r.reqs.length; }
function ganttHeight(r) {
  const rows = ganttRows(r);
  return clamp(rows * (S.opts.lanes ? 24 : 6) + PAD.t + PAD.b, 90, 460);
}
function drawGantt(ctx, g, r) {
  frame(ctx, g, null);
  const rows = ganttRows(r);
  const rowH = g.ph / rows, bh = Math.max(2, Math.min(rowH - 2, 20));
  const list = S.opts.lanes ? r.reqs : r.order;

  // подписи дорожек
  ctx.save();
  ctx.fillStyle = CLR.text; ctx.font = '10px ui-sans-serif,system-ui';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const every = Math.max(1, Math.ceil(rows / Math.max(1, Math.floor(g.ph / 14))));
  for (let i = 0; i < rows; i += every) {
    const y = g.pt + i * rowH + rowH / 2;
    ctx.fillText(S.opts.lanes ? t('unitSlot') + ' ' + (i + 1) : '#' + (list[i] ? list[i].i + 1 : i + 1), g.pl - 7, y);
  }
  ctx.restore();

  clipPlot(ctx, g);
  // полосы строк
  ctx.fillStyle = '#1b1f27';
  for (let i = 0; i < rows; i += 2) ctx.fillRect(g.pl + 1, g.pt + i * rowH, g.pw, rowH);

  const seg = (x0, x1, y, h, color, gap) => {
    const w = Math.max(1, x1 - x0 - (gap || 0));
    ctx.fillStyle = color; ctx.fillRect(x0, y, w, h);
  };
  for (let k = 0; k < list.length; k++) {
    const q = list[k];
    if (q.e < g.a || q.s > g.b) continue;
    const row = S.opts.lanes ? q.lane : k;
    const y = g.pt + row * rowH + (rowH - bh) / 2;
    const x0 = g.x(q.s), x1 = g.x(q.e);
    const gap = x1 - x0 > 3 ? 1 : 0;   // разделитель между соседними запросами слота
    // накладные (весь запрос) — фон
    seg(x0, x1, y, bh, CLR.ovh, gap);
    if (q.le > q.ls) seg(g.x(q.ls), g.x(q.le), y, bh, CLR.load);
    if (q.pe > q.ps) seg(g.x(q.ps), g.x(q.pe), y, bh, CLR.pre);
    if (q.ge > q.gs) seg(g.x(q.gs), g.x(q.ge), y, bh, CLR.gen, gap);
    if (q.ttft !== null) { ctx.fillStyle = '#fff'; ctx.fillRect(g.x(q.ttft), y, 1, bh); }

    const isSel = S.sel === q.i, isHov = S.hoverReq === q.i;
    if (isSel || isHov) {
      ctx.strokeStyle = isSel ? CLR.sel : '#c9d3e2'; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x0) - 0.5, Math.round(y) - 0.5, Math.max(2, Math.round(x1 - x0)) + 1, Math.round(bh) + 1);
    }
    if (S.opts.labels && bh >= 9 && x1 - x0 > 112) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, y, x1 - x0, bh); ctx.clip();
      ctx.fillStyle = '#0d1116'; ctx.font = '10px ui-sans-serif,system-ui'; ctx.textBaseline = 'middle';
      ctx.fillText(`#${q.i + 1} · ${int(q.rl)} ${t('tok')} · ${num(q.genTps, 1)} ${t('unitTokS')}`, x0 + 4, y + bh / 2 + 0.5);
      ctx.restore();
    }
  }
  ctx.restore();  // clipPlot
}

/* --- 2. параллельность по фазам --- */
function drawConc(ctx, g, r) {
  const pw = Math.round(g.pw);
  const ph = columnPhases(r.bpConc, g.a, g.b, pw);
  // «накладные»: запрос уже сгенерировал ответ, но ещё не закрыт (сеть/сериализация)
  const ovh = new Float64Array(pw);
  for (let c = 0; c < pw; c++) ovh[c] = Math.max(0, ph.act[c] - ph.gen[c] - ph.pre[c] - ph.load[c]);
  const nt = niceTicks(Math.max(1, arrMax(ph.act)), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);

  clipPlot(ctx, g);
  const base = new Float64Array(pw);
  for (const [key, arr] of [['gen', ph.gen], ['pre', ph.pre], ['load', ph.load], ['ovh', ovh]]) {
    ctx.beginPath();
    ctx.moveTo(g.pl, g.y(0, nt.max));
    for (let c = 0; c < pw; c++) {
      const y = g.y(base[c] + arr[c], nt.max), x = g.pl + c;
      ctx.lineTo(x, y); ctx.lineTo(x + 1, y);
    }
    for (let c = pw - 1; c >= 0; c--) {
      const y = g.y(base[c], nt.max), x = g.pl + c;
      ctx.lineTo(x + 1, y); ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = CLR[key] + 'd0'; ctx.fill();
    for (let c = 0; c < pw; c++) base[c] += arr[c];
  }
  ctx.restore();
  // предел параллельности из конфигурации
  const lim = Number(r.config.parallel_size);
  if (isFinite(lim) && lim > 0 && lim <= nt.max) {
    const y = Math.round(g.y(lim, nt.max)) + 0.5;
    ctx.save(); ctx.strokeStyle = '#8a93a5'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(g.pl, y); ctx.lineTo(g.pl + g.pw, y); ctx.stroke();
    ctx.fillStyle = '#8a93a5'; ctx.font = '9.5px ui-sans-serif'; ctx.textAlign = 'right';
    ctx.textBaseline = y - g.pt < 14 ? 'top' : 'bottom';
    ctx.fillText('предел parallel_size = ' + lim, g.pl + g.pw - 4, y + (y - g.pt < 14 ? 3 : -3));
    ctx.restore();
  }
}

/* --- 3. суммарная скорость генерации --- */
function drawThr(ctx, g, r) {
  const pw = Math.round(g.pw);
  const a = columnAgg(r.bpRate, 'gen', g.a, g.b, pw);
  const nt = niceTicks(Math.max(1, arrMax(a.mx)), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);

  ctx.beginPath(); ctx.moveTo(g.pl, g.y(0, nt.max));
  for (let c = 0; c < pw; c++) { const x = g.pl + c, y = g.y(a.mx[c], nt.max); ctx.lineTo(x, y); ctx.lineTo(x + 1, y); }
  ctx.lineTo(g.pl + pw, g.y(0, nt.max)); ctx.closePath();
  ctx.fillStyle = CLR.gen + '38'; ctx.fill();

  ctx.beginPath();
  for (let c = 0; c < pw; c++) { const x = g.pl + c, y = g.y(a.mx[c], nt.max); if (!c) ctx.moveTo(x, y); ctx.lineTo(x, y); ctx.lineTo(x + 1, y); }
  ctx.strokeStyle = CLR.gen; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath();
  for (let c = 0; c < pw; c++) { const x = g.pl + c, y = g.y(a.mn[c], nt.max); if (!c) ctx.moveTo(x, y); ctx.lineTo(x, y); ctx.lineTo(x + 1, y); }
  ctx.strokeStyle = '#2f7d4e'; ctx.lineWidth = 1; ctx.stroke();

  // средняя суммарная скорость в окне
  const w = windowStats(r);
  if (w.aggTps > 0 && w.aggTps <= nt.max) {
    const y = Math.round(g.y(w.aggTps, nt.max)) + 0.5;
    ctx.save(); ctx.strokeStyle = CLR.cur + 'aa'; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(g.pl, y); ctx.lineTo(g.pl + g.pw, y); ctx.stroke();
    ctx.fillStyle = CLR.cur; ctx.font = '9.5px ui-sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('среднее в окне ' + num(w.aggTps, 1), g.pl + g.pw - 3, y - 4); ctx.restore();
  }
}

/* --- 4. скорость на запрос --- */
function drawRtps(ctx, g, r) {
  const nt = niceTicks(Math.max(1, r.maxGenTps) * 1.05, Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);
  clipPlot(ctx, g);
  for (const q of r.reqs) {
    if (q.ge < g.a || q.gs > g.b || q.genTps <= 0) continue;
    const x0 = g.x(q.gs), x1 = g.x(q.ge), y = g.y(q.genTps, nt.max);
    const sel = S.sel === q.i || S.hoverReq === q.i;
    ctx.strokeStyle = sel ? CLR.sel : CLR.gen + (S.sel === null ? 'cc' : '55');
    ctx.lineWidth = sel ? 2.4 : 1.6;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(Math.max(x1, x0 + 1), y); ctx.stroke();
  }
  ctx.restore();
  const p50 = Number(r.summary.p50_response_tps) || r.p50GenTps;
  if (p50 > 0 && p50 <= nt.max) {
    const y = Math.round(g.y(p50, nt.max)) + 0.5;
    ctx.save(); ctx.strokeStyle = '#8a93a5'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(g.pl, y); ctx.lineTo(g.pl + g.pw, y); ctx.stroke();
    ctx.fillStyle = '#8a93a5'; ctx.font = '9.5px ui-sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('p50 ' + num(p50, 2), g.pl + g.pw - 3, y - 4); ctx.restore();
  }
}

/* --- 5. prefill --- */
function drawPre(ctx, g, r) {
  const pw = Math.round(g.pw);
  const a = columnAgg(r.bpRate, 'pre', g.a, g.b, pw);
  const peak = arrMax(a.mx);
  const nt = niceTicks(Math.max(1, peak), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);
  ctx.fillStyle = CLR.pre;
  for (let c = 0; c < pw; c++) {
    if (a.mx[c] <= 0) continue;
    const y = g.y(a.mx[c], nt.max);
    ctx.fillRect(g.pl + c, y, 1, g.pt + g.ph - y);
  }
  ctx.fillStyle = CLR.text; ctx.font = '9.5px ui-sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('пик в окне ' + num(peak, 0) + ' ток/с', g.pl + g.pw - 3, g.pt + 9);
}

/* --- утилиты для статистики --- */
function calcStats(values) {
  if (!values.length) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, outliers: [] };
  const sorted = values.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = n % 2 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
  const min = sorted.find(v => v >= lowerFence) || sorted[0];
  const max = [...sorted].reverse().find(v => v <= upperFence) || sorted[n - 1];
  return { min, q1, median, q3, max, mean, outliers };
}

// Определение элемента box plot под курсором
function hitTestBoxPlot(hitAreas, px, py) {
  if (!hitAreas) return null;
  
  for (const area of hitAreas) {
    // проверка выбросов (точки)
    for (const outlier of area.outliers) {
      const dx = px - outlier.x, dy = py - outlier.y;
      if (dx * dx + dy * dy <= (outlier.r + 3) * (outlier.r + 3)) {
        return { type: 'outlier', area, value: outlier.value };
      }
    }
    
    // проверка среднего (красный ромбик)
    const dmx = px - area.mean.x, dmy = py - area.mean.y;
    if (dmx * dmx + dmy * dmy <= (area.mean.r + 3) * (area.mean.r + 3)) {
      return { type: 'mean', area };
    }
    
    // проверка усов
    if (Math.abs(px - area.whiskerTop.x) <= 5 && py >= area.whiskerTop.y1 && py <= area.whiskerTop.y2) {
      return { type: 'whisker', area, part: 'top' };
    }
    if (Math.abs(px - area.whiskerBot.x) <= 5 && py >= area.whiskerBot.y1 && py <= area.whiskerBot.y2) {
      return { type: 'whisker', area, part: 'bottom' };
    }
    
    // проверка ящика
    if (px >= area.box.x1 && px <= area.box.x2 && py >= area.box.y1 && py <= area.box.y2) {
      return { type: 'box', area };
    }
  }
  
  return null;
}

// Отрисовка одного box plot (возвращает границы для hit-testing)
function drawSingleBoxPlot(ctx, g, stats, yMax, cx, boxW, color, idx) {
  const y = (v) => g.y(v, yMax);
  
  // усы
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, y(stats.min)); ctx.lineTo(cx, y(stats.q1));
  ctx.moveTo(cx, y(stats.q3)); ctx.lineTo(cx, y(stats.max));
  ctx.stroke();
  
  // заглушки усов
  ctx.beginPath();
  ctx.moveTo(cx - 8, y(stats.min)); ctx.lineTo(cx + 8, y(stats.min));
  ctx.moveTo(cx - 8, y(stats.max)); ctx.lineTo(cx + 8, y(stats.max));
  ctx.stroke();
  
  // ящик
  ctx.fillStyle = color + '40';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const boxH = y(stats.q1) - y(stats.q3);
  ctx.fillRect(cx - boxW / 2, y(stats.q3), boxW, boxH);
  ctx.strokeRect(cx - boxW / 2, y(stats.q3), boxW, boxH);
  
  // медиана
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - boxW / 2, y(stats.median));
  ctx.lineTo(cx + boxW / 2, y(stats.median));
  ctx.stroke();
  
  // среднее
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(cx, y(stats.mean), 4, 0, Math.PI * 2);
  ctx.fill();
  
  // выбросы
  ctx.fillStyle = color + 'aa';
  for (const v of stats.outliers) {
    ctx.beginPath();
    ctx.arc(cx, y(v), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // возвращаем границы для hit-testing
  return {
    idx, stats, color,
    box: { x1: cx - boxW / 2, x2: cx + boxW / 2, y1: y(stats.q3), y2: y(stats.q1) },
    whiskerTop: { x: cx, y1: y(stats.max), y2: y(stats.q3) },
    whiskerBot: { x: cx, y1: y(stats.q1), y2: y(stats.min) },
    mean: { x: cx, y: y(stats.mean), r: 4 },
    outliers: stats.outliers.map(v => ({ x: cx, y: y(v), r: 2.5, value: v }))
  };
}

// Отрисовка нескольких box plot для сравнения отчётов
function drawMultiBoxPlot(ctx, g, dataList, yMax, chart) {
  const n = dataList.length;
  if (!n) return;
  
  const totalW = g.pw * 0.7;
  const boxW = Math.min(80, totalW / n - 10);
  const spacing = totalW / n;
  const startX = g.pl + (g.pw - totalW) / 2 + spacing / 2;
  
  const hitAreas = [];
  for (let i = 0; i < n; i++) {
    const { stats, color, label } = dataList[i];
    const cx = startX + i * spacing;
    const area = drawSingleBoxPlot(ctx, g, stats, yMax, cx, boxW, color, i);
    area.label = label;
    hitAreas.push(area);
  }
  
  // сохраняем hitAreas для обработки событий мыши
  if (chart) chart.hitAreas = hitAreas;
  
  // легенда под графиком - рассчитываем необходимое количество строк
  const legendItemW = 220; // фиксированная ширина элемента легенды
  const cols = Math.max(1, Math.floor(g.pw / legendItemW));
  const rows = Math.ceil(n / cols);
  const legendRowHeight = 18;
  const legendStartY = g.pt + g.ph + 12;
  
  ctx.font = '10px ui-sans-serif';
  ctx.textAlign = 'left';
  
  for (let i = 0; i < n; i++) {
    const { color, label } = dataList[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = g.pl + col * legendItemW;
    const y = legendStartY + row * legendRowHeight;
    
    // цветной квадратик
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 7, 12, 12);
    
    // название отчёта (полное, без обрезки)
    ctx.fillStyle = CLR.text;
    ctx.fillText(label, x + 16, y);
  }
}

/* --- 6. генерация токенов в замере (box plot для всех отчётов) --- */
function drawGenTps(ctx, g, r, chart) {
  const dataList = [];
  let globalMax = 0;
  
  // собираем данные по всем загруженным отчётам в порядке S.runs (порядок вкладок)
  for (let i = 0; i < S.runs.length; i++) {
    const run = S.runs[i];
    // используем весь временной диапазон отчёта, не зависим от окна просмотра
    const values = run.reqs
      .filter(q => q.genTps > 0)
      .map(q => q.genTps);
    
    if (values.length) {
      const stats = calcStats(values);
      const color = REPORT_COLORS[i % REPORT_COLORS.length];
      const label = run.name;
      dataList.push({ stats, color, label, count: values.length });
      if (stats.max > globalMax) globalMax = stats.max;
    }
  }
  
  if (!dataList.length) {
    ctx.fillStyle = CLR.text; ctx.font = '12px ui-sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(t('noData'), g.pl + g.pw / 2, g.pt + g.ph / 2);
    return;
  }
  
  const nt = niceTicks(Math.max(1, globalMax * 1.1), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);
  drawMultiBoxPlot(ctx, g, dataList, nt.max, chart);
}

/* --- 7. общая параллельная генерация токенов (box plot для всех отчётов) --- */
function drawParTps(ctx, g, r, chart) {
  const dataList = [];
  let globalMax = 0;
  const pw = 1000; // фиксированная детализация, не зависит от ширины окна
  
  // собираем данные по всем загруженным отчётам в порядке S.runs (порядок вкладок)
  for (let i = 0; i < S.runs.length; i++) {
    const run = S.runs[i];
    // используем весь временной диапазон отчёта
    const a = columnAgg(run.bpRate, 'gen', 0, run.wall, pw);
    const values = [];
    for (let c = 0; c < pw; c++) {
      if (a.mx[c] > 0) values.push(a.mx[c]);
    }
    
    if (values.length) {
      const stats = calcStats(values);
      const color = REPORT_COLORS[i % REPORT_COLORS.length];
      const label = run.name;
      dataList.push({ stats, color, label, count: values.length });
      if (stats.max > globalMax) globalMax = stats.max;
    }
  }
  
  if (!dataList.length) {
    ctx.fillStyle = CLR.text; ctx.font = '12px ui-sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(t('noData'), g.pl + g.pw / 2, g.pt + g.ph / 2);
    return;
  }
  
  const nt = niceTicks(Math.max(1, globalMax * 1.1), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);
  drawMultiBoxPlot(ctx, g, dataList, nt.max, chart);
}

/* --- 8. удельная генерация на поток (box plot для всех отчётов) --- */
function drawPerThr(ctx, g, r, chart) {
  const dataList = [];
  let globalMax = 0;
  const pw = 1000; // фиксированная детализация
  
  // собираем данные по всем загруженным отчётам в порядке S.runs (порядок вкладок)
  for (let i = 0; i < S.runs.length; i++) {
    const run = S.runs[i];
    // используем весь временной диапазон отчёта
    const rate = columnAgg(run.bpRate, 'gen', 0, run.wall, pw);
    const threads = columnAgg(run.bpConc, 'gen', 0, run.wall, pw);
    const values = [];
    for (let c = 0; c < pw; c++) {
      if (threads.mx[c] > 0) {
        values.push(rate.mx[c] / threads.mx[c]);
      }
    }
    
    if (values.length) {
      const stats = calcStats(values);
      const color = REPORT_COLORS[i % REPORT_COLORS.length];
      const label = run.name;
      dataList.push({ stats, color, label, count: values.length });
      if (stats.max > globalMax) globalMax = stats.max;
    }
  }
  
  if (!dataList.length) {
    ctx.fillStyle = CLR.text; ctx.font = '12px ui-sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(t('noData'), g.pl + g.pw / 2, g.pt + g.ph / 2);
    return;
  }
  
  const nt = niceTicks(Math.max(1, globalMax * 1.1), Math.max(2, Math.floor(g.ph / 26)));
  frame(ctx, g, nt.ticks, nt.max);
  drawMultiBoxPlot(ctx, g, dataList, nt.max, chart);
}

/* --- ось времени --- */
function drawAxis() {
  const c = axisChart, r = run(); if (!r) return;
  c.resize();
  const ctx = c.ctx, g = c.geom();
  ctx.clearRect(0, 0, c.W, c.H);
  const tt = timeTicks(g.a, g.b, g.pw);
  ctx.fillStyle = CLR.text; ctx.font = '10px ui-sans-serif,system-ui';
  ctx.textBaseline = 'top'; ctx.textAlign = 'center';
  ctx.strokeStyle = CLR.axis; ctx.beginPath();
  for (const t of tt.ticks) {
    const x = Math.round(g.x(t)) + 0.5;
    ctx.moveTo(x, 0); ctx.lineTo(x, 4);
    ctx.fillText(S.opts.abs ? fmtAbs(r, t, tt.step < 1) : fmtClock(t, tt.step < 1 ? 2 : 0), x, 6);
  }
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillText(S.opts.abs ? t('timeFormat') : t('durationFormat'), 2, 6);
  if (S.cursor !== null && S.cursor >= g.a && S.cursor <= g.b) {
    const x = g.x(S.cursor), label = fmtTime(r, S.cursor, true);
    ctx.font = '10px ui-sans-serif'; const w = ctx.measureText(label).width + 8;
    ctx.fillStyle = CLR.cur;
    ctx.fillRect(clamp(x - w / 2, 0, c.W - w), 3, w, 14);
    ctx.fillStyle = '#161a20'; ctx.textAlign = 'center';
    ctx.fillText(label, clamp(x, w / 2, c.W - w / 2), 5);
  }
}

/* --- обзор запуска (минимапа) --- */
function drawMini() {
  const c = miniChart, r = run(); if (!r) return;
  c.resize();
  const ctx = c.ctx, W = c.W, H = c.H, pl = PAD.l, pw = Math.max(10, W - PAD.l - PAD.r), ph = H - 6;
  ctx.clearRect(0, 0, W, H);
  const x = (t) => pl + (t / r.wall) * pw;
  const cols = Math.round(pw);
  const act = columnAgg(r.bpConc, 'act', 0, r.wall, cols);
  const rate = columnAgg(r.bpRate, 'gen', 0, r.wall, cols);
  const mA = Math.max(1, arrMax(act.mx)), mR = Math.max(1, arrMax(rate.mx));
  ctx.fillStyle = '#1b1f27'; ctx.fillRect(pl, 3, pw, ph);
  for (let i = 0; i < cols; i++) {
    const h = (act.mx[i] / mA) * ph;
    ctx.fillStyle = CLR.pre + '55'; ctx.fillRect(pl + i, 3 + ph - h, 1, h);
  }
  ctx.beginPath();
  for (let i = 0; i < cols; i++) { const y = 3 + ph - (rate.mx[i] / mR) * ph; if (!i) ctx.moveTo(pl + i, y); else ctx.lineTo(pl + i, y); }
  ctx.strokeStyle = CLR.gen; ctx.lineWidth = 1; ctx.stroke();

  // окно просмотра
  const xa = x(clamp(S.view.a, 0, r.wall)), xb = x(clamp(S.view.b, 0, r.wall));
  ctx.fillStyle = '#0b0e1399';
  ctx.fillRect(pl, 3, xa - pl, ph); ctx.fillRect(xb, 3, pl + pw - xb, ph);
  ctx.strokeStyle = CLR.cur; ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(xa) + 0.5, 3.5, Math.max(1, Math.round(xb - xa)), ph - 1);
  if (S.cursor !== null) {
    ctx.strokeStyle = CLR.cur + '99'; ctx.beginPath();
    const cx = Math.round(x(clamp(S.cursor, 0, r.wall))) + 0.5;
    ctx.moveTo(cx, 3); ctx.lineTo(cx, 3 + ph); ctx.stroke();
  }
  c.miniX = x;
  c.miniInv = (px) => clamp(((px - pl) / pw) * r.wall, 0, r.wall);
}

/* ------------------------- статистика окна ------------------------------- */
let _wsCache = { key: '', val: null };
function windowStats(r) {
  const key = r.name + '|' + S.view.a.toFixed(4) + '|' + S.view.b.toFixed(4);
  if (_wsCache.key === key) return _wsCache.val;
  const a = S.view.a, b = S.view.b, sp = b - a;
  let active = 0, started = 0, finished = 0, gTok = 0, pTok = 0, wSum = 0, wTime = 0,
      concInt = 0, maxConc = 0, loadTime = 0, loads = 0, genTime = 0, preTime = 0;
  for (const q of r.reqs) {
    if (q.e >= a && q.s <= b) active++;
    if (q.s >= a && q.s <= b) started++;
    if (q.e >= a && q.e <= b) finished++;
    concInt += overlap(q.s, q.e, a, b);
    const og = overlap(q.gs, q.ge, a, b);
    if (og > 0) { gTok += q.genTps * og; wSum += q.genTps * og; wTime += og; genTime += og; }
    const op = overlap(q.ps, q.pe, a, b);
    if (op > 0) { pTok += q.preTps * op; preTime += op; }
    const ol = overlap(q.ls, q.le, a, b);
    if (ol > 0) { loadTime += ol; loads++; }
  }
  let idle = 0;
  for (let i = 0; i < r.bpConc.length; i++) {
    const t1 = r.bpConc[i].t, t2 = i + 1 < r.bpConc.length ? r.bpConc[i + 1].t : r.wall;
    const ov = overlap(t1, t2, a, b);
    if (ov > 0) { maxConc = Math.max(maxConc, r.bpConc[i].act); if (r.bpConc[i].act === 0) idle += ov; }
  }
  if (a < r.bpConc[0].t) idle += overlap(a, r.bpConc[0].t, a, b);
  const val = {
    a, b, sp, active, started, finished, maxConc,
    avgConc: sp > 0 ? concInt / sp : 0,
    gTok, pTok, genTime, preTime, loadTime, loads, idle,
    aggTps: sp > 0 ? gTok / sp : 0,
    perReqTps: wTime > 0 ? wSum / wTime : 0,
  };
  _wsCache = { key, val };
  return val;
}

/* ---------------------------- панели и таблицы --------------------------- */
function clearDropMarks() {
  $('#runs').querySelectorAll('.run-tab').forEach((t) => t.classList.remove('dropL', 'dropR'));
}
function renderRunTabs() {
  const el = $('#runs');
  el.innerHTML = '';
  S.runs.forEach((r, i) => {
    const b = document.createElement('span');
    b.className = 'run-tab' + (i === S.active ? ' active' : '');
    b.draggable = true;
    b.dataset.i = i;
    b.title = `${r.name} — ${r.reqs.length} запросов, ${fmtClock(r.wall)}\n` +
      'перетащите, чтобы изменить порядок; × — выгрузить отчёт';
    const lbl = document.createElement('span');
    lbl.className = 'lbl'; lbl.textContent = r.name;
    const x = document.createElement('span');
    x.className = 'x'; x.textContent = '×'; x.title = 'Выгрузить отчёт';
    b.append(lbl, x);

    x.onclick = (e) => { e.stopPropagation(); closeRun(i); };
    b.onclick = () => { if (i !== S.active) setActive(i, true); }; // keepView = true - сохраняем вкладку

    b.ondragstart = (e) => {
      S.dragTab = i;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'run:' + i);
      b.classList.add('dragging');
    };
    b.ondragend = () => { S.dragTab = null; clearDropMarks(); b.classList.remove('dragging'); };
    b.ondragover = (e) => {
      if (S.dragTab === null || S.dragTab === undefined || S.dragTab === i) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const rc = b.getBoundingClientRect();
      const after = e.clientX > rc.left + rc.width / 2;
      clearDropMarks();
      b.classList.add(after ? 'dropR' : 'dropL');
    };
    b.ondragleave = () => b.classList.remove('dropL', 'dropR');
    b.ondrop = (e) => {
      if (S.dragTab === null || S.dragTab === undefined) return;
      e.preventDefault(); e.stopPropagation();
      const rc = b.getBoundingClientRect();
      moveRun(S.dragTab, i, e.clientX > rc.left + rc.width / 2);
      S.dragTab = null;
    };
    el.appendChild(b);
  });
  $('#btnCloseAll').hidden = S.runs.length === 0;
  $('#cmpPanel').classList.toggle('hidden', S.runs.length < 2);
  $('#statsPanelSummary').classList.toggle('hidden', S.runs.length < 2);
}

/** перенести отчёт from на позицию рядом с i (after — справа от него) */
function moveRun(from, i, after) {
  let to = i + (after ? 1 : 0);
  if (to > from) to--;
  if (to === from || from < 0 || from >= S.runs.length) { clearDropMarks(); renderRunTabs(); return; }
  const cur = run();
  const [r] = S.runs.splice(from, 1);
  S.runs.splice(clamp(to, 0, S.runs.length), 0, r);
  S.active = S.runs.indexOf(cur);
  renderRunTabs(); renderCompare();
  // перерисовываем статические графики при изменении порядка
  drawStaticCharts();
}

/** выгрузить один отчёт */
function closeRun(i) {
  if (i < 0 || i >= S.runs.length) return;
  const cur = run(), wasActive = i === S.active;
  S.runs.splice(i, 1);
  hideTip();
  if (!S.runs.length) { showEmpty(); return; }
  if (wasActive) setActive(Math.min(i, S.runs.length - 1), true); // keepView = true - сохраняем вкладку
  else { S.active = S.runs.indexOf(cur); renderRunTabs(); renderCompare(); }
}

/** выгрузить все отчёты */
function closeAll() {
  if (!S.runs.length) return;
  S.runs = [];
  showEmpty();
}

function showEmpty() {
  S.active = -1; S.sel = null; S.cursor = null; S.hoverReq = null; S.dragTab = null;
  _wsCache = { key: '', val: null };
  hideTip(); hidePop(); banner('');
  renderRunTabs();
  $('#main').classList.add('hidden');
  $('#dropzone').classList.remove('hidden', 'over-main', 'drag');
}

function card(k, v, sub) {
  return `<div class="card"><div class="k">${k}</div><div class="v">${v}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}
function renderCards(r) {
  const c = r.config, s = r.summary;
  $('#cards').innerHTML = [
    card(t('cardRequests'), int(r.reqs.length), s.iterations && s.iterations !== r.reqs.length ? t('ofFormat') + ' ' + int(s.iterations) : ''),
    card(t('cardDuration'), fmtClock(r.wall), t('minColonSec')),
    card(t('cardParallelism'), num(r.avgConc, 2), t('avgMaxFormat') + ' ' + int(r.maxConc) + (c.parallel_size ? '/' + int(c.parallel_size) : '')),
    card(t('cardTotalGen'), num(r.aggTps, 1), t('unitTokS')),
    card(t('cardPerRequest'), num(Number(s.avg_response_tps) || r.totGen / (r.sumGenTime || 1), 2), t('unitTokS') + ' ' + t('unitAvg')),
    card(t('cardP50'), num(Number(s.p50_response_tps) || r.p50GenTps, 2), t('unitTokS')),
    card(t('cardPrefill'), num(Number(s.avg_prompt_tps) || r.totPre / (r.sumPreTime || 1), 0), t('unitTokS') + ' ' + t('unitAvg')),
    card(t('cardResponseTokens'), int(r.totGen), t('unitTotal')),
  ].join('') +
    `<div class="card"><div class="k">${t('cardModel')}${c.provider ? ' · ' + esc(String(c.provider)) : ''}</div>` +
    `<div class="v txt" title="${esc(String(c.model || ''))}">${esc(String(c.model || '—'))}</div></div>`;
}

function kvRows(rows) {
  return rows.filter(Boolean).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
}
function renderConfigTable(r) {
  const cfgRows = Object.entries(r.config).map(([k, v]) => [esc(k), `<code>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</code>`]);
  const s = r.summary;
  const sumRows = Object.entries(s).map(([k, v]) => [esc(k), typeof v === 'number' ? num(v, 2) : esc(String(v))]);
  $('#tblConfig').innerHTML = kvRows([
    ['<b>config</b>', ''], ...cfgRows,
    ['<b>summary (из отчёта)</b>', ''], ...sumRows,
    ['<b>вычислено</b>', ''],
    ['начало запуска', fmtAbs(r, 0, false) + ' ' + new Date(r.epochMs).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-US')],
    [t('runDuration'), fmtDur(r.wall)],
    [t('maxSlots'), int(r.maxConc)],
    [t('avgParallelism'), num(r.avgConc, 2)],
    [t('idleTime'), fmtDur(r.wall - r.busy) + ' · ' + num(((r.wall - r.busy) / r.wall) * 100, 1) + ' %'],
    [t('totalResponseTokens'), int(r.totGen)],
    [t('totalPromptTokens'), int(r.totPre)],
    [t('totalGeneration'), num(r.aggTps, 2) + ' ' + t('unitTokS')],
    [t('genTimeSum'), fmtDur(r.sumGenTime)],
    [t('prefillTimeSum'), fmtDur(r.sumPreTime)],
    [t('modelLoadTimeSum'), fmtDur(r.sumLoad)],
    [t('overheadSum'), fmtDur(r.sumOvh)],
  ]);
}
function renderWindowTable(r) {
  const w = windowStats(r);
  const pct = (v) => num((v / (w.sp || 1)) * 100, 1) + ' %';
  $('#tblWindow').innerHTML = kvRows([
    [t('window'), fmtTime(r, w.a, true) + ' — ' + fmtTime(r, w.b, true)],
    [t('windowDuration'), fmtDur(w.sp)],
    [t('requestsInWindow'), int(w.active) + ' (' + t('started') + ' ' + int(w.started) + ', ' + t('finished') + ' ' + int(w.finished) + ')'],
    [t('cardParallelism'), num(w.avgConc, 2) + ' ' + t('unitAvg') + ' · ' + int(w.maxConc) + ' ' + t('unitMax')],
    [t('idleLabel'), fmtDur(w.idle) + ' · ' + pct(w.idle)],
    [t('generatedTokens'), int(w.gTok)],
    [t('totalGeneration'), num(w.aggTps, 2) + ' ' + t('unitTokS')],
    [t('avgRequestSpeed'), num(w.perReqTps, 2) + ' ' + t('unitTokS')],
    [t('machineGenTime'), fmtDur(w.genTime) + ' · ' + num(w.genTime / (w.sp || 1), 2) + ' ' + t('inAverage')],
    ['prefill', int(w.pTok) + ' ' + t('tokens') + ' ' + t('for') + ' ' + fmtDur(w.preTime)],
    [t('modelLoads'), int(w.loads) + ' × / ' + fmtDur(w.loadTime)],
  ]);
}

const REQ_COLS = [
  ['i', '#', (q) => q.i + 1],
  ['s', () => t('colStart'), (q, r) => fmtTime(r, q.s, true)],
  ['e', () => t('colEnd'), (q, r) => fmtTime(r, q.e, true)],
  ['dur', 'длит., с', (q) => num(q.dur, 1)],
  ['lane', () => t('colLane'), (q) => q.lane + 1],
  ['pl', () => t('colPrompt') + ', ток', (q) => int(q.pl)],
  ['pp', 'prefill, с', (q) => num(q.pp, 3)],
  ['preTps', 'prefill, ' + (() => t('unitTokS'))(), (q) => num(q.preTps, 0)],
  ['rl', () => t('colResponse') + ', ток', (q) => int(q.rl)],
  ['gen', () => t('colGeneration') + ', с', (q) => num(q.gen, 1)],
  ['genTps', () => t('unitTokS'), (q) => num(q.genTps, 2)],
  ['load', 'load, с', (q) => num(q.load, 3)],
  ['ovh', 'накладные, с', (q) => num(q.ovh, 3)],
];
function renderReqTable(r) {
  const w = S.view;
  let list = r.reqs.filter((q) => !S.opts.onlyView || (q.e >= w.a && q.s <= w.b));
  const { key, dir } = S.sort;
  list = list.slice().sort((x, y) => (x[key] - y[key]) * dir);
  const total = list.length, LIMIT = 500;
  if (total > LIMIT) list = list.slice(0, LIMIT);
  const head = '<thead><tr>' + REQ_COLS.map(([k, titleFn]) =>
    `<th data-k="${k}">${typeof titleFn === 'function' ? titleFn() : titleFn}${S.sort.key === k ? (dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('') + '</tr></thead>';
  const body = '<tbody>' + list.map((q) =>
    `<tr data-i="${q.i}" class="${S.sel === q.i ? 'sel' : ''}">` +
    REQ_COLS.map(([, , f]) => `<td>${f(q, r)}</td>`).join('') + '</tr>').join('') +
    (total > LIMIT ? `<tr><td colspan="${REQ_COLS.length}" style="color:var(--muted)">${t('showingFirst')} ${LIMIT} ${t('outOf')} ${int(total)} — ${t('reduceWindow')}</td></tr>` : '') +
    '</tbody>';
  const t = $('#tblReqs');
  t.innerHTML = head + body;
  t.querySelectorAll('th').forEach((th) => (th.onclick = () => {
    const k = th.dataset.k;
    S.sort = { key: k, dir: S.sort.key === k ? -S.sort.dir : (k === 'i' || k === 's' ? 1 : -1) };
    renderReqTable(r);
  }));
  t.querySelectorAll('tbody tr[data-i]').forEach((tr) => {
    const i = +tr.dataset.i;
    tr.onclick = () => { S.sel = S.sel === i ? null : i; refresh(); };
    tr.ondblclick = () => { const q = r.reqs[i]; const m = q.dur * 0.15 + 0.5; setView(q.s - m, q.e + m); };
    tr.onmouseenter = () => { S.hoverReq = i; drawCharts(); };
    tr.onmouseleave = () => { if (S.hoverReq === i) { S.hoverReq = null; drawCharts(); } };
  });
}

function renderCompare() {
  const cols = [
    [() => t('colName'), (r) => esc(r.name)],
    [() => t('colRequests'), (r) => int(r.reqs.length)],
    ['parallel', (r) => (r.config.parallel_size ?? '—')],
    [() => t('cardModel'), (r) => esc(String(r.config.model ?? '—'))],
    [() => t('colDuration'), (r) => fmtClock(r.wall)],
    [() => t('total') + ' ' + t('unitTokS'), (r) => num(r.aggTps, 1)],
    [() => t('unitTokS') + ' ' + t('perRequest'), (r) => num(Number(r.summary.avg_response_tps) || 0, 2)],
    [() => 'p50 ' + t('unitTokS'), (r) => num(Number(r.summary.p50_response_tps) || r.p50GenTps, 2)],
    [() => 'prefill ' + t('unitTokS'), (r) => num(Number(r.summary.avg_prompt_tps) || 0, 0)],
    [() => t('maxParallel'), (r) => int(r.maxConc)],
    [() => t('idle'), (r) => num(((r.wall - r.busy) / r.wall) * 100, 1) + ' %'],
    [() => t('responseTokens'), (r) => int(r.totGen)],
  ];
  $('#tblCompare').innerHTML =
    '<thead><tr>' + cols.map(([titleFn]) => `<th>${typeof titleFn === 'function' ? titleFn() : titleFn}</th>`).join('') + '</tr></thead><tbody>' +
    S.runs.map((r, i) => `<tr class="${i === S.active ? 'active' : ''}" data-i="${i}">` +
      cols.map(([, f]) => `<td>${f(r)}</td>`).join('') + '</tr>').join('') + '</tbody>';
  $('#tblCompare').querySelectorAll('tbody tr').forEach((tr) => (tr.onclick = () => setActive(+tr.dataset.i, true))); // keepView = true
}

function renderLegends() {
  const item = (c, txt) => `<span><i style="background:${c}"></i>${txt}</span>`;
  const phases = PHASE_NAMES();
  $('#legendMain').innerHTML =
    item(CLR.load, phases.load) + item(CLR.pre, t('legendPrefill')) +
    item(CLR.gen, t('legendGeneration')) + item(CLR.ovh, t('legendOverhead')) +
    item(CLR.cur, t('legendCursor')) +
    '<span class="hint">' + t('legendHint') + '</span>';
  $('#legendMini').innerHTML = item(CLR.pre + '99', t('activeRequests')) + item(CLR.gen, t('totalTps'));
}

function updateHeads(r) {
  const cur = S.cursor, w = windowStats(r);
  const set = (k, v) => { const el = document.querySelector(`[data-val="${k}"]`); if (el) el.textContent = v; };
  if (cur === null) {
    set('gantt', `${int(w.active)} ${t('requestsInWindow')} · ${int(w.started)} ${t('started')} · ${int(w.finished)} ${t('finished')}`);
    set('conc', `${t('inWindow')}: ${t('unitAvg')}. ${num(w.avgConc, 2)} · ${t('unitMax')} ${int(w.maxConc)} · ${t('idle')} ${num((w.idle / (w.sp || 1)) * 100, 1)} %`);
    set('thr', `${t('inWindow')}: ${num(w.aggTps, 1)} ${t('unitTokS')} · ${int(w.gTok)} ${t('tokens')}`);
    set('rtps', `${t('inWindow')}: ${num(w.perReqTps, 2)} ${t('unitTokS')} ${t('perRequest')}`);
    set('pre', `${t('inWindow')}: ${int(w.pTok)} ${t('tokens')} промпта за ${fmtDur(w.preTime)}`);
    
    // статистика для box plot графиков (для всех отчётов)
    const totalReports = S.runs.length;
    set('gentps', `${t('comparison')} ${totalReports} ${t('reports')} ${t('byGenSpeed')}`);
    set('partps', `${t('comparison')} ${totalReports} ${t('reports')} ${t('byParallelGen')}`);
    set('perthr', `${t('comparison')} ${totalReports} ${t('reports')} ${t('byPerThread')}`);
    return;
  }
  const c = { act: stepAt(r.bpConc, t, 'act'), gen: stepAt(r.bpConc, t, 'gen'), pre: stepAt(r.bpConc, t, 'pre'), load: stepAt(r.bpConc, t, 'load') };
  const rate = stepAt(r.bpRate, t, 'gen'), prate = stepAt(r.bpRate, t, 'pre');
  const tl = fmtTime(r, t, true);
  set('gantt', `${tl} → активно ${int(c.act)}`);
  set('conc', `${tl} → всего ${int(c.act)} · генерация ${int(c.gen)} · prefill ${int(c.pre)} · загрузка ${int(c.load)}`);
  set('thr', `${tl} → ${num(rate, 1)} ток/с`);
  set('rtps', `${tl} → ${c.gen ? num(rate / c.gen, 2) : '0'} ток/с на активный запрос`);
  set('pre', `${tl} → ${num(prate, 0)} ток/с`);
  // статические графики не меняют заголовки при наведении курсора
}

/* ------------------------------- тултип ---------------------------------- */
function phaseOf(q, t) {
  if (t < q.s || t > q.e) return null;
  if (t < q.le) return 'load';
  if (t < q.pe) return 'pre';
  if (t < q.ge) return 'gen';
  return 'ovh';
}
function tipRow(k, v) { return `<div class="row"><span>${k}</span><span>${v}</span></div>`; }
function tooltipHTML(r, tm, q) {
  const phases = PHASE_NAMES();
  let h = `<b>${fmtTime(r, tm, true)}</b> <span style="color:var(--muted)">${S.opts.abs ? '' : t('fromStart')}</span>`;
  if (q) {
    const ph = phaseOf(q, tm);
    h += `<hr><b>${t('request')} #${q.i + 1}</b>` +
      tipRow(t('phaseNow'), ph ? `<span class="ph" style="background:${CLR[ph]}"></span>${phases[ph]}` : '—') +
      tipRow(t('startEnd'), `${fmtTime(r, q.s, true)} → ${fmtTime(r, q.e, true)}`) +
      tipRow(t('duration'), fmtDur(q.dur)) +
      tipRow(t('slot'), q.lane + 1) +
      tipRow(t('prompt'), `${int(q.pl)} ток / ${fmtDur(q.pp)} = ${num(q.preTps, 0)} ${t('unitTokS')}`) +
      tipRow(t('response'), `${int(q.rl)} ток / ${fmtDur(q.gen)} = ${num(q.genTps, 2)} ${t('unitTokS')}`) +
      tipRow(t('modelLoad'), fmtDur(q.load)) +
      (q.ttft !== null ? tipRow('TTFT', fmtDur(q.ttft - q.s)) : '') +
      tipRow(t('overhead'), fmtDur(q.ovh)) +
      (ph === 'gen' ? tipRow(t('generatedSoFar'), `${int(q.genTps * (tm - q.gs))} / ${int(q.rl)} ток (${num(((tm - q.gs) / (q.gen || 1)) * 100, 0)} %)`) : '');
  }
  const c = { act: stepAt(r.bpConc, tm, 'act'), gen: stepAt(r.bpConc, tm, 'gen'), pre: stepAt(r.bpConc, tm, 'pre'), load: stepAt(r.bpConc, tm, 'load') };
  h += '<hr>' + tipRow(t('activeRequests'), `<b>${int(c.act)}</b>${r.config.parallel_size ? ' / ' + int(r.config.parallel_size) : ''}`) +
    tipRow(t('genPrefillLoad'), `${int(c.gen)} / ${int(c.pre)} / ${int(c.load)}`) +
    tipRow(t('totalGeneration'), `<b>${num(stepAt(r.bpRate, tm, 'gen'), 1)}</b> ${t('unitTokS')}`) +
    (c.pre ? tipRow(t('totalPrefill'), num(stepAt(r.bpRate, tm, 'pre'), 0) + ' ' + t('unitTokS')) : '');

  const act = r.reqs.filter((x) => x.s <= tm && tm <= x.e).sort((a, b) => a.lane - b.lane);
  if (act.length) {
    h += '<hr><div class="list">';
    const phases = PHASE_NAMES();
    for (const x of act.slice(0, 9)) {
      const ph = phaseOf(x, tm);
      const prog = ph === 'gen' ? num(((tm - x.gs) / (x.gen || 1)) * 100, 0) + ' %' : phases[ph];
      h += tipRow(`<span class="ph" style="background:${CLR[ph]}"></span>#${x.i + 1}` + (x.i === (q && q.i) ? ' ◂' : ''),
        `${prog} · ${num(x.genTps, 1)} ${t('unitTokS')}`);
    }
    if (act.length > 9) h += `<div style="color:var(--muted)">…и ещё ${act.length - 9}</div>`;
    h += '</div>';
  }
  return h;
}
/* ------------------- справка по блокам (всплывающее окно) ----------------- */
function hidePop() {
  $('#pop').classList.add('hidden');
  document.querySelectorAll('.qm.on').forEach((b) => b.classList.remove('on'));
  S.popAnchor = null;
}
function placePop() {
  const el = $('#pop'), a = S.popAnchor;
  if (!a || el.classList.contains('hidden')) return;
  const r = a.getBoundingClientRect();
  if (!r.width || r.bottom < 0 || r.top > innerHeight) { hidePop(); return; }
  const w = el.offsetWidth, h = el.offsetHeight;
  const left = clamp(r.left - 4, 8, Math.max(8, innerWidth - w - 8));
  let top = r.bottom + 8;
  if (top + h > innerHeight - 8) top = r.top - h - 8;
  if (top < 8) top = clamp(innerHeight - h - 8, 8, innerHeight);
  el.style.left = left + 'px'; el.style.top = top + 'px';
}
function showPop(key, anchor) {
  const src = document.querySelector(`#helpTexts [data-help="${key}"][data-lang="${currentLang}"]`);
  const el = $('#pop');
  if (!src) { hidePop(); return; }
  el.innerHTML = '<button class="pop-close" title="' + t('helpClose') + '">×</button>' + src.innerHTML +
    '<span class="pop-hint">' + t('helpHint') + '</span>';
  el.classList.remove('hidden');
  document.querySelectorAll('.qm.on').forEach((b) => b.classList.remove('on'));
  anchor.classList.add('on');
  S.popAnchor = anchor;
  el.scrollTop = 0;
  const rc = anchor.getBoundingClientRect();
  if (rc.top < 8 || rc.bottom > innerHeight - 8) anchor.scrollIntoView({ block: 'center' });
  placePop();
  el.querySelector('.pop-close').onclick = hidePop;
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.qm[data-help]');
  if (btn) {
    e.preventDefault(); e.stopPropagation();
    if (S.popAnchor === btn) hidePop(); else showPop(btn.dataset.help, btn);
    return;
  }
  if (!e.target.closest('#pop')) hidePop();
});
window.addEventListener('scroll', placePop, { passive: true });
window.addEventListener('resize', placePop);

function showTip(ev, html) {
  const el = $('#tooltip');
  el.innerHTML = html; el.classList.remove('hidden');
  const r = el.getBoundingClientRect();
  let x = ev.clientX + 14, y = ev.clientY + 14;
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - 14;
  if (y + r.height > innerHeight - 8) y = Math.max(8, innerHeight - r.height - 8);
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
const hideTip = () => $('#tooltip').classList.add('hidden');

/* ---------------------------- взаимодействие ----------------------------- */
function setView(a, b) {
  const r = run(); if (!r) return;
  const minSpan = Math.min(0.05, r.wall / 5000) || 0.001;
  let sp = Math.max(minSpan, b - a);
  if (sp > r.wall) { a = 0; sp = r.wall; }
  a = clamp(a, 0, Math.max(0, r.wall - sp));
  S.view = { a, b: a + sp };
  refresh();
}
const resetView = () => { const r = run(); if (r) setView(0, r.wall); };

function hitReq(c, ev) {
  const r = run(); if (!r || c.key !== 'gantt' || !c.g) return null;
  const rect = c.canvas.getBoundingClientRect();
  const px = ev.clientX - rect.left, py = ev.clientY - rect.top;
  const g = c.g, rows = ganttRows(r), rowH = g.ph / rows;
  const row = Math.floor((py - g.pt) / rowH);
  if (row < 0 || row >= rows) return null;
  const t = g.tOf(px);
  const list = S.opts.lanes ? r.reqs.filter((q) => q.lane === row) : [r.order[row]];
  const tol = (g.sp / g.pw) * 2;
  for (const q of list) if (q && t >= q.s - tol && t <= q.e + tol) return q;
  return null;
}

/** координаты внутри области построения; null — курсор над подписями осей/полями */
function plotPos(c, ev) {
  if (!c.g) return null;
  const rect = c.canvas.getBoundingClientRect();
  const px = ev.clientX - rect.left, py = ev.clientY - rect.top, g = c.g;
  if (px < g.pl || px > g.pl + g.pw || py < g.pt || py > g.pt + g.ph) return null;
  return { px, py };
}

function attachStaticHover(c) {
  const cv = c.canvas;
  
  cv.addEventListener('mousemove', (ev) => {
    if (!c.hitAreas || !c.g) return;
    const rect = cv.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    
    const hit = hitTestBoxPlot(c.hitAreas, px, py);
    
    if (!hit) {
      cv.style.cursor = 'default';
      hideTip();
      return;
    }
    
    cv.style.cursor = 'pointer';
    
    // формируем содержимое подсказки
    let html = `<b>${hit.area.label}</b><hr>`;
    
    if (hit.type === 'outlier') {
      html += `<div class="row"><span>Выброс</span><span><b>${num(hit.value, 2)}</b></span></div>`;
    } else if (hit.type === 'mean') {
      html += `<div class="row"><span>Среднее (μ)</span><span><b>${num(hit.area.stats.mean, 2)}</b></span></div>`;
    } else if (hit.type === 'whisker') {
      const val = hit.part === 'top' ? hit.area.stats.max : hit.area.stats.min;
      const label = hit.part === 'top' ? 'Максимум' : 'Минимум';
      html += `<div class="row"><span>${label}</span><span><b>${num(val, 2)}</b></span></div>`;
    } else if (hit.type === 'box') {
      const s = hit.area.stats;
      html += `<div class="row"><span>Максимум</span><span>${num(s.max, 2)}</span></div>`;
      html += `<div class="row"><span>Q3 (75%)</span><span>${num(s.q3, 2)}</span></div>`;
      html += `<div class="row"><span>Медиана (Q2)</span><span><b>${num(s.median, 2)}</b></span></div>`;
      html += `<div class="row"><span>Среднее (μ)</span><span><b style="color:#ff4444">${num(s.mean, 2)}</b></span></div>`;
      html += `<div class="row"><span>Q1 (25%)</span><span>${num(s.q1, 2)}</span></div>`;
      html += `<div class="row"><span>Минимум</span><span>${num(s.min, 2)}</span></div>`;
      if (s.outliers.length) {
        html += `<div class="row"><span>Выбросов</span><span>${s.outliers.length}</span></div>`;
      }
    }
    
    showTip(ev, html);
  });
  
  cv.addEventListener('mouseleave', () => {
    cv.style.cursor = 'default';
    hideTip();
  });
}

function attachPanZoom(c) {
  const cv = c.canvas;
  // масштабирование колесом — только над самим графиком; над подписями осей страница скроллится
  cv.addEventListener('wheel', (ev) => {
    const r = run(); if (!r) return;
    const p = plotPos(c, ev); if (!p) return;
    ev.preventDefault();
    const t = c.g.tOf(p.px);
    const f = Math.exp((ev.deltaY > 0 ? 1 : -1) * 0.22);
    setView(t - (t - S.view.a) * f, t + (S.view.b - t) * f);
  }, { passive: false });

  cv.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0 || !plotPos(c, ev)) return;
    S.drag = { chart: c, x0: ev.clientX, a0: S.view.a, b0: S.view.b, moved: 0 };
    cv.style.cursor = 'grabbing';
  });
  cv.addEventListener('mousemove', (ev) => {
    const r = run(); if (!r || !c.g) return;
    if (S.drag && S.drag.chart === c) {
      const dx = ev.clientX - S.drag.x0;
      S.drag.moved = Math.max(S.drag.moved, Math.abs(dx));
      const dt = (dx / c.g.pw) * (S.drag.b0 - S.drag.a0);
      setView(S.drag.a0 - dt, S.drag.b0 - dt);
      hideTip();
      return;
    }
    const p = plotPos(c, ev);
    cv.style.cursor = p ? 'crosshair' : 'default';
    if (!p) {                       // над подписями осей — ни курсора, ни подсказки
      if (S.cursor !== null || S.hoverReq !== null) {
        S.cursor = null; S.hoverReq = null; drawCharts(); updateHeads(r);
      }
      hideTip();
      return;
    }
    S.cursor = clamp(c.g.tOf(p.px), 0, r.wall);
    const q = hitReq(c, ev);
    S.hoverReq = q ? q.i : null;
    drawCharts();
    updateHeads(r);
    showTip(ev, tooltipHTML(r, S.cursor, q));
  });
  cv.addEventListener('mouseleave', () => {
    S.cursor = null; S.hoverReq = null; hideTip();
    const r = run(); if (r) { drawCharts(); updateHeads(r); }
  });
  cv.addEventListener('click', (ev) => {
    if ((S.drag && S.drag.moved > 3) || !plotPos(c, ev)) return;
    const q = hitReq(c, ev);
    if (q) { S.sel = S.sel === q.i ? null : q.i; refresh(); }
  });
  cv.addEventListener('dblclick', (ev) => { if (plotPos(c, ev)) resetView(); });
}

function attachMini(c) {
  const cv = c.canvas;
  const tAt = (ev) => { const rect = cv.getBoundingClientRect(); return c.miniInv ? c.miniInv(ev.clientX - rect.left) : 0; };
  // полоса обзора занимает всю ширину графика
  const inBand = (ev) => {
    const rect = cv.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    return px >= PAD.l && px <= rect.width - PAD.r;
  };
  cv.addEventListener('mousedown', (ev) => {
    if (!inBand(ev)) return;
    S.drag = { mini: true, t0: tAt(ev), moved: 0, x0: ev.clientX };
  });
  cv.addEventListener('mousemove', (ev) => {
    const r = run(); if (!r) return;
    if (S.drag && S.drag.mini) {
      S.drag.moved = Math.max(S.drag.moved, Math.abs(ev.clientX - S.drag.x0));
      const t = tAt(ev);
      if (S.drag.moved > 3) setView(Math.min(S.drag.t0, t), Math.max(S.drag.t0, t));
      return;
    }
    const ok = inBand(ev);
    cv.style.cursor = ok ? 'ew-resize' : 'default';
    if (!ok) {
      if (S.cursor !== null) { S.cursor = null; drawCharts(); updateHeads(r); }
      hideTip();
      return;
    }
    S.cursor = tAt(ev); drawCharts(); updateHeads(r);
    showTip(ev, tooltipHTML(r, S.cursor, null));
  });
  cv.addEventListener('mouseleave', () => { S.cursor = null; hideTip(); const r = run(); if (r) { drawCharts(); updateHeads(r); } });
  cv.addEventListener('click', (ev) => {
    if ((S.drag && S.drag.moved > 3) || !inBand(ev)) return;
    const t = tAt(ev), sp = span();
    setView(t - sp / 2, t + sp / 2);
  });
  cv.addEventListener('dblclick', (ev) => { if (inBand(ev)) resetView(); });
}

window.addEventListener('mouseup', () => {
  if (S.drag && S.drag.chart) S.drag.chart.canvas.style.cursor = 'crosshair';
  setTimeout(() => (S.drag = null), 0);
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && S.popAnchor) { hidePop(); ev.preventDefault(); return; }
  const r = run(); if (!r || ev.target.tagName === 'INPUT') return;
  const sp = span();
  if (ev.key === '0') resetView();
  else if (ev.key === 'ArrowLeft') setView(S.view.a - sp * 0.2, S.view.b - sp * 0.2);
  else if (ev.key === 'ArrowRight') setView(S.view.a + sp * 0.2, S.view.b + sp * 0.2);
  else if (ev.key === '+' || ev.key === '=') setView(S.view.a + sp * 0.15, S.view.b - sp * 0.15);
  else if (ev.key === '-') setView(S.view.a - sp * 0.2, S.view.b + sp * 0.2);
  else if (ev.key === 'Escape') { S.sel = null; refresh(); }
  else return;
  ev.preventDefault();
});

/* ------------------------------- рендер ---------------------------------- */
function drawCharts() {
  const r = run(); if (!r) return;
  $('#wrapGantt').style.height = ganttHeight(r) + 'px';
  for (const c of charts) c.render(r);
  drawAxis();
  drawMini();
}
function drawStaticCharts() {
  const r = run(); if (!r) return;
  // рисуем только графики для активной вкладки
  const suffix = S.activeView === 'summary' ? 'Summary' : '';
  for (const c of charts) {
    if (!c.isStatic) continue;
    if (S.activeView === 'summary' && c.key.endsWith('Summary')) {
      c.render(r);
    } else if (S.activeView === 'details' && !c.key.endsWith('Summary')) {
      c.render(r);
    }
  }
}
function refresh() {
  const r = run(); if (!r) return;
  drawCharts();
  updateHeads(r);
  renderWindowTable(r);
  renderReqTable(r);
}

function switchView(view) {
  S.activeView = view;
  
  // переключаем активный класс на табах
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  
  // показываем/скрываем контент
  $('#viewSummary').classList.toggle('hidden', view !== 'summary');
  $('#viewDetails').classList.toggle('hidden', view !== 'details');
  
  // перерисовываем графики активной вкладки
  if (view === 'summary') {
    drawStaticCharts(); // перерисовываем графики Summary
    renderCompareSummary();
  } else {
    const r = run();
    if (r) refresh();
  }
}

function renderCompareSummary() {
  // копия таблицы сравнения для вкладки Summary
  $('#tblCompareSummary').innerHTML = $('#tblCompare').innerHTML;
}

function setActive(i, keepView = false) {
  // сохраняем view предыдущего отчёта
  const prevRun = run();
  if (prevRun && S.activeView === 'details') {
    prevRun.savedView = { ...S.view };
  }
  
  S.active = i; S.sel = null; S.cursor = null;
  const r = run(); if (!r) return;
  
  // восстанавливаем сохранённый view или устанавливаем по умолчанию
  if (r.savedView && keepView && S.activeView === 'details') {
    S.view = { ...r.savedView };
  } else {
    S.view = { a: 0, b: Math.max(r.wall, 0.001) };
  }
  
  _wsCache = { key: '', val: null };
  renderRunTabs(); renderCards(r); renderConfigTable(r); renderCompare(); renderLegends();
  $('#main').classList.remove('hidden');
  $('#dropzone').classList.add('hidden');
  // показываем/скрываем панель статистики на вкладке "Сводка" в зависимости от количества отчётов
  $('#statsPanelSummary').classList.toggle('hidden', S.runs.length < 2);
  
  // если keepView = true, сохраняем текущую вкладку
  if (keepView) {
    // просто обновляем данные на текущей вкладке
    switchView(S.activeView);
  } else {
    // переключаемся на summary если много отчётов, иначе на details (только при первой загрузке)
    if (S.runs.length >= 2 && S.activeView !== 'summary') {
      switchView('summary');
    } else if (S.runs.length === 1) {
      switchView('details');
    } else {
      switchView(S.activeView);
    }
  }
  
  if (S.activeView === 'details') refresh();
}

/* ------------------------------ загрузка --------------------------------- */
function banner(msg) {
  const el = $('#banner');
  if (!msg) { el.classList.add('hidden'); return; }
  el.textContent = msg; el.classList.remove('hidden');
}
function addRun(raw, name) {
  const r = parseRun(raw, name);
  const i = S.runs.findIndex((x) => x.name === name);
  if (i >= 0) S.runs[i] = r; else S.runs.push(r);
  return r;
}
async function loadFiles(files) {
  const errs = [];
  let last = -1;
  for (const f of files) {
    try {
      addRun(JSON.parse(await f.text()), f.name);
      last = S.runs.findIndex((x) => x.name === f.name);
    } catch (e) { errs.push(`${f.name}: ${e.message}`); }
  }
  banner(errs.length ? 'Не удалось разобрать: ' + errs.join('; ') : '');
  if (last >= 0) setActive(last); else if (S.runs.length) renderRunTabs();
}
async function autoDiscover() {
  if (location.protocol === 'file:') return;
  const qs = new URLSearchParams(location.search);
  let names = qs.getAll('file');
  if (!names.length) {
    // 1) манифест reports.json со списком файлов, 2) листинг каталога (если нет index.html)
    try {
      const res = await fetch('reports.json');
      if (res.ok) {
        const j = await res.json();
        const arr = Array.isArray(j) ? j : Array.isArray(j.files) ? j.files : [];
        names = arr.filter((n) => typeof n === 'string');
      }
    } catch (e) { /* манифеста нет */ }
    for (const dir of ['./', '../']) {
      if (names.length) break;
      try {
        const res = await fetch(dir);
        if (!res.ok) continue;
        const txt = await res.text();
        if (/<canvas|llperf·graph/.test(txt)) continue;      // это сама страница, а не листинг
        names = [...new Set([...txt.matchAll(/href="([^"?#]+\.json)"/gi)].map((m) => decodeURIComponent(m[1])))]
          .filter((n) => !n.includes('/')).sort().map((n) => dir + n);
      } catch (e) { /* каталог недоступен — ничего страшного */ }
    }
  }
  let ok = 0;
  for (const n of names.slice(0, 24)) {
    try {
      const res = await fetch(n); if (!res.ok) continue;
      addRun(await res.json(), n.split('/').pop()); ok++;
    } catch (e) { /* пропускаем не-отчёты */ }
  }
  if (ok) setActive(0);
}

/* --------------------------------- старт --------------------------------- */
const miniChart = { canvas: $('#cvMini'), wrap: $('#wrapMini'), ctx: $('#cvMini').getContext('2d'), key: 'mini' };
miniChart.resize = function () {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(120, this.wrap.clientWidth), h = Math.max(24, this.wrap.clientHeight);
  this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.W = w; this.H = h;
};
attachMini(miniChart);

const axisChart = {
  canvas: $('#cvAxis'), wrap: $('#wrapAxis'), ctx: $('#cvAxis').getContext('2d'), key: 'axis',
  resize: miniChart.resize,
  geom() {
    const pl = PAD.l, pw = Math.max(10, this.W - PAD.l - PAD.r), a = S.view.a, sp = span();
    return { pl, pt: 0, pw, ph: this.H, a, b: S.view.b, sp, x: (t) => pl + ((t - a) / sp) * pw, tOf: (px) => a + ((px - pl) / pw) * sp };
  },
};

// графики для вкладки "Детали"
mkChart('gantt', 'cvGantt', 'wrapGantt', drawGantt);
mkChart('conc', 'cvConc', 'wrapConc', drawConc);
mkChart('thr', 'cvThr', 'wrapThr', drawThr);
mkChart('rtps', 'cvRtps', 'wrapRtps', drawRtps);
mkChart('pre', 'cvPre', 'wrapPre', drawPre);
// статические графики для вкладки "Сводка"
mkChart('gentpsSummary', 'cvGenTpsSummary', 'wrapGenTpsSummary', drawGenTps, { static: true });
mkChart('partpsSummary', 'cvParTpsSummary', 'wrapParTpsSummary', drawParTps, { static: true });

$('#fileInput').addEventListener('change', (e) => loadFiles([...e.target.files]));
$('#btnReset').addEventListener('click', resetView);
$('#btnCloseAll').addEventListener('click', closeAll);

// обработчики табов
document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

// локализация
function applyLocalization() {
  // применяем локализацию ко всем элементам с data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  
  // применяем локализацию к атрибутам title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });
  
  // обновляем динамический контент
  const r = run();
  if (r) {
    renderCards(r);
    renderConfigTable(r);
    renderWindowTable(r);
    renderReqTable(r);
    renderCompare();
    if (S.activeView === 'summary') renderCompareSummary();
    refresh();
  }
  
  // обновляем открытое окно справки, если оно открыто
  if (S.popAnchor && S.popAnchor.dataset.help) {
    showPop(S.popAnchor.dataset.help, S.popAnchor);
  }
}

function setLanguage(lang) {
  if (!LANG[lang]) return;
  currentLang = lang;
  localStorage.setItem('llperf-lang', lang);
  $('#langSelect').value = lang;
  applyLocalization();
}

// обработчик переключателя языка
$('#langSelect').value = currentLang;
$('#langSelect').addEventListener('change', (e) => setLanguage(e.target.value));

// применить локализацию при загрузке страницы
applyLocalization();

const bindOpt = (id, key, full) => $(id).addEventListener('change', (e) => {
  S.opts[key] = e.target.checked;
  const r = run(); if (!r) return;
  if (full) { renderConfigTable(r); }
  refresh();
});
bindOpt('#optLanes', 'lanes');
bindOpt('#optLabels', 'labels');
bindOpt('#optAbs', 'abs', true);
bindOpt('#optOnlyView', 'onlyView');

// перетаскивание файлов в окно (перетаскивание вкладок отчётов не трогаем)
const isFileDrag = (e) => !!e.dataTransfer && [...e.dataTransfer.types].includes('Files');
['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (e) => {
  if (!isFileDrag(e)) return;
  e.preventDefault(); $('#dropzone').classList.add('drag');
  if (S.runs.length) { $('#dropzone').classList.remove('hidden'); $('#dropzone').classList.add('over-main'); }
}));
document.addEventListener('dragleave', (e) => {
  if (e.relatedTarget || S.dragTab !== null) return;
  $('#dropzone').classList.remove('drag');
  if (S.runs.length) { $('#dropzone').classList.add('hidden'); $('#dropzone').classList.remove('over-main'); }
});
document.addEventListener('drop', (e) => {
  if (!isFileDrag(e)) return;
  e.preventDefault();
  $('#dropzone').classList.remove('drag', 'over-main');
  const files = [...(e.dataTransfer.files || [])].filter((f) => /\.json$/i.test(f.name));
  if (files.length) loadFiles(files);
  else if (S.runs.length) $('#dropzone').classList.add('hidden');
});

let rto = null;
const onResize = () => { clearTimeout(rto); rto = setTimeout(() => { if (run()) drawCharts(); }, 60); };
window.addEventListener('resize', onResize);
if (window.ResizeObserver) new ResizeObserver(onResize).observe($('#main'));

window.addEventListener('error', (e) => banner('Ошибка: ' + (e.message || e)));
renderLegends();
autoDiscover();
