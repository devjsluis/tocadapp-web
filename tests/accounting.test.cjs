/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner uses CommonJS. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');

function setup(options = {}) {
  const state = [], refs = [], effectRecords = [], pendingEffects = [], calls = [];
  let cursor = 0, refCursor = 0, effectCursor = 0;
  const router = { replace: path => calls.push(['route', path]) };
  const client = { get: async (path, config) => {
    calls.push(['accountant-get', path, config]);
    if (options.get) return options.get(path, config);
    if (options.failure) throw options.failure;
    if (path === '/accounting/session') return { data: { account: { id: 3, username: 'contador', displayName: 'Contador' } } };
    return { data: options.report || report() };
  }, post: async (path, body) => { calls.push(['accountant-post', path, body]); return { data: {} }; } };
  const admin = { get: async (path, config) => { calls.push(['admin-get', path, config]); return { data: options.report || report() }; } };
  const cache = new Map();
  function load(relative) {
    const file = path.resolve(root, relative); if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }, fileName: file }).outputText;
    vm.runInNewContext('(function(require,module,exports){' + code + '\n})', {
      process: { env: {} }, console, Date, Intl, AbortController, setTimeout, URL, URLSearchParams,
      window: { location: { origin: 'https://tocadapp.com' }, print: () => calls.push(['print']) },
    })(name => {
      if (name === 'react') return { ...require('react'), useState: initial => {
        const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
        return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
      }, useRef: initial => { const i = refCursor++; return refs[i] || (refs[i] = { current: initial }); },
      useEffect: (fn, deps) => {
        const i = effectCursor++; const previous = effectRecords[i];
        if (!previous || deps.some((value, j) => !Object.is(value, previous.deps[j]))) {
          previous?.cleanup?.(); effectRecords[i] = { deps }; pendingEffects.push(() => { effectRecords[i].cleanup = fn(); });
        }
      } };
      if (name === 'next/navigation') return { useRouter: () => router };
      if (name === 'next/link') return { __esModule: true, default: 'a' };
      if (name === '@/lib/axios') return { api: admin };
      if (name === 'axios') return { __esModule: true, default: { create: config => { calls.push(['create-client', config]); return client; }, isAxiosError: value => value?.isAxiosError === true } };
      if (name.startsWith('@/')) return load(name.slice(2) + '.ts' + (name.endsWith('AccountingReportView') ? 'x' : ''));
      if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(file), name + '.ts')));
      return require(name);
    }, mod, mod.exports);
    return mod.exports;
  }
  const render = (file, props = {}) => {
    cursor = 0; refCursor = 0; effectCursor = 0;
    const loadedModule = load(file); return (loadedModule.default || loadedModule.AccountingReportView)(props);
  };
  return { calls, load, render, flush: async () => { for (const fn of pendingEffects.splice(0)) fn(); await new Promise(resolve => setImmediate(resolve)); } };
}
function nodes(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap(child => nodes(child, predicate))];
}
function text(node) { return renderToStaticMarkup(node); }
function report(patch = {}) {
  return { month: '2026-11', timezone: 'America/Mexico_City', generatedAt: '2026-11-12T12:00:00Z',
    stripeMode: 'live', stripe: { status: 'available', totals: [], transactions: [], payouts: [], invoices: [] },
    documents: [], settlements: [], manual: [], pendingProviders: ['APPLE', 'GOOGLE_PLAY'], guidance: 'Sin movimientos no implica automáticamente declarar en ceros.', ...patch };
}

test('accountant client uses cookie credentials and no shared musician interceptor', () => {
  const h = setup(); h.load('features/accounting/accounting.service.ts');
  const config = h.calls.find(call => call[0] === 'create-client')[1];
  assert.equal(config.withCredentials, true); assert.equal(config.baseURL, '/api'); assert.equal(config.headers, undefined);
});
test('accounting amounts preserve cents, currencies and reject overprecision', () => {
  const h = setup(); const { accountingMinor, accountingMoney } = h.load('features/accounting/accounting.service.ts');
  assert.equal(accountingMinor('79.01', 'MXN'), 7901); assert.equal(accountingMinor('10', 'JPY'), 10);
  assert.match(accountingMoney(7901, 'MXN'), /79\.01/);
  for (const [value, currency] of [['1.001', 'MXN'], ['-1', 'MXN'], ['1e5', 'MXN'], ['10.5', 'JPY'], ['999999999999999999', 'MXN']]) assert.throws(() => accountingMinor(value, currency));
});
test('portal redirects an unauthorized accountant to its own login, never to musician login', async () => {
  const h = setup({ failure: { isAxiosError: true, response: { status: 401 } } });
  const file = 'app/contabilidad/page.tsx';
  assert.doesNotMatch(text(h.render(file)), /Ingresos de suscripciones/);
  await h.flush(); h.render(file);
  assert.ok(h.calls.some(call => call[0] === 'route' && call[1] === '/contabilidad/login'));
  assert.equal(h.calls.some(call => call[0] === 'admin-get'), false);
});
test('login sends only special credentials and routes to accounting without setting musician tokens', async () => {
  const h = setup(); const file = 'app/contabilidad/login/page.tsx'; let tree = h.render(file);
  const inputs = nodes(tree, node => node.type === 'input');
  inputs[0].props.onChange({ target: { value: 'contador' } }); inputs[1].props.onChange({ target: { value: 'special-secret' } });
  tree = h.render(file); nodes(tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  await h.flush();
  const sent = h.calls.find(call => call[0] === 'accountant-post');
  assert.equal(sent[1], '/accounting/login'); assert.equal(JSON.stringify(sent[2]), JSON.stringify({ username: 'contador', password: 'special-secret' }));
  assert.ok(h.calls.some(call => call[0] === 'route' && call[1] === '/contabilidad'));
  assert.equal(h.calls.some(call => call[0] === 'admin-get'), false);
});
test('report is not downloadable before data loads and empty month leaves native providers pending', async () => {
  const h = setup(); const file = 'features/accounting/AccountingReportView.tsx';
  const first = h.render(file);
  const exportButton = nodes(first, node => node.type === 'button').find(node => text(node).includes('Descargar CSV'));
  assert.equal(exportButton.props.disabled, true);
  await h.flush(); const html = text(h.render(file));
  assert.match(html, /Sin movimientos de Stripe/); assert.match(html, /Pendiente de reporte de liquidación/);
  assert.match(html, /no significa cero ingresos/); assert.doesNotMatch(html, /\$0\.00/);
});
test('unavailable Stripe is displayed as missing data, not as zero income', async () => {
  const h = setup({ report: report({ stripe: { status: 'unavailable', message: 'Stripe no disponible; no equivale a cero.' } }) });
  const file = 'features/accounting/AccountingReportView.tsx'; h.render(file); await h.flush();
  const html = text(h.render(file)); assert.match(html, /Stripe no disponible/); assert.doesNotMatch(html, /Sin movimientos de Stripe/); assert.doesNotMatch(html, /\$0\.00/);
});
test('changing month discards a late response from the previous month', async () => {
  const pending = [];
  const h = setup({ get: (url, config) => new Promise(resolve => pending.push({ url, config, resolve })) });
  const file = 'features/accounting/AccountingReportView.tsx'; let tree = h.render(file); await h.flush();
  nodes(tree, node => node.type === 'input' && node.props.type === 'month')[0].props.onChange({ target: { value: '2026-10' } });
  tree = h.render(file); await h.flush(); assert.equal(pending.length, 2); assert.equal(pending[0].config.signal.aborted, true);
  pending[1].resolve({ data: report({ month: '2026-10' }) }); await h.flush(); assert.match(text(h.render(file)), /Periodo 2026-10/);
  pending[0].resolve({ data: report({ month: '2026-11' }) }); await h.flush(); assert.match(text(h.render(file)), /Periodo 2026-10/);
});


test('filter query preserves inclusive dates and all selections without mixing month and range', () => {
  const h=setup();const {accountingFilterQuery}=h.load('features/accounting/accounting.service.ts');
  const query=new URLSearchParams(accountingFilterQuery({mode:'range',month:'2026-11',from:'2026-10-01',to:'2026-12-31',provider:'STRIPE',currency:'MXN',status:'paid'}));
  assert.equal(query.has('month'),false);for(const [key,value] of Object.entries({from:'2026-10-01',to:'2026-12-31',provider:'STRIPE',currency:'MXN',status:'paid'}))assert.equal(query.get(key),value);
  assert.throws(()=>accountingFilterQuery({mode:'range',month:'2026-11',from:'2026-11-12',to:'2026-11-11',provider:'ALL',currency:'',status:'all'}));
});
test('changing provider, currency, status and date inputs sends the complete filter set', async () => {
  const h=setup();const file='features/accounting/AccountingReportView.tsx';let tree=h.render(file);await h.flush();
  function change(label,value){nodes(tree,node=>node.props?.['aria-label']===label)[0].props.onChange({target:{value}});tree=h.render(file);}
  change('Tipo de periodo','range');change('Desde','2026-10-01');change('Hasta','2026-12-31');change('Proveedor del reporte','STRIPE');change('Moneda del reporte','MXN');change('Estado del reporte','paid');
  await h.flush();
  const calls=h.calls.filter(call=>call[0]==='accountant-get');const params=calls.at(-1)[2].params;
  assert.equal(JSON.stringify(params),JSON.stringify({from:'2026-10-01',to:'2026-12-31',provider:'STRIPE',currency:'MXN',status:'paid'}));
});
test('partial-month native report explains missing daily precision and never shows the full monthly amount', async () => {
  const h=setup({report:report({month:null,periodLabel:'2026-11-10 a 2026-11-20',partialMonths:['2026-11'],pendingProviders:[],settlements:[]})});
  const file='features/accounting/AccountingReportView.tsx';h.render(file);await h.flush();const html=text(h.render(file));
  assert.match(html,/Meses parciales/);assert.match(html,/no se incluyen ni se prorratean/);assert.doesNotMatch(html,/\$100\.00/);
});
