/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner uses CommonJS. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function setup() {
  const state = [], calls = [], errors = [], effects = [];
  let cursor = 0;
  const cache = new Map();
  const root = path.resolve(__dirname, '..');
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }, fileName: filename }).outputText;
    const loadedModule = { exports: {} };
    vm.runInThisContext('(function(require,module,exports){' + code + '\n})')(name => {
      if (name === 'react') return { ...require('react'), useEffect: fn => effects.push(fn), useCallback: fn => fn, useState: initial => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
      } };
      if (name === 'sonner') return { toast: { error: message => errors.push(message), success: () => {} } };
      if (name === '@/components/ui/button') return { Button: 'button' };
      if (name === '@/lib/axios') return { api: {
        get: async url => ({ data: { data: url === '/bands' ? [
          { id: '11', name: 'Original', is_owner: true, member_count: 1 },
          { id: '12', name: 'Archivada', is_owner: true, archived_at: '2020-01-01', member_count: 1 },
          { id: '13', name: 'Ajena', is_owner: false, member_count: 1 },
        ] : [] } }), patch: async (url, payload) => { calls.push([url, payload]); return { data: { data: { name: payload.name } } }; } } };
      if (name.startsWith('@/')) return load(path.join(root, name.slice(2) + '.ts'));
      return require(name);
    }, loadedModule, loadedModule.exports);
    cache.set(filename, loadedModule.exports);
    return loadedModule.exports;
  }
  const { useGigForm } = load(path.join(root, 'features/gigs/hooks/useGigForm.ts'));
  const payloads = [];
  return { load: name => load(path.join(root, name)), calls, errors, payloads,
    renderPage: () => { cursor = 0; return load(path.join(root, "app/dashboard/bands/page.tsx")).default(); },
    runEffects: () => { for (const effect of effects.splice(0)) effect(); },
    render: () => { cursor = 0; return useGigForm({ onSave: async (gig, payload) => { payloads.push([gig, payload]); return true; } }); } };
}
const gig = { id: '1', title: 'Show', place: 'Venue', date: '2026-11-05', time: '18:00', hours: 4, free_hours: '1.5', is_owner: true };
const event = { preventDefault() {} };
test('editing preserves decimal free hours in the submitted payload', async () => {
  const h = setup(); h.render().openEdit(gig); const form = h.render();
  assert.equal(form.formData.free_hours, '1.5'); await form.submit(event);
  assert.equal(h.payloads[0][1].free_hours, '1.5'); assert.equal(h.payloads[0][1].hours, '4');
});
test('legacy gigs and new forms default to zero free hours', async () => {
  const h = setup(); h.render().openEdit({ ...gig, free_hours: undefined });
  await h.render().submit(event); assert.equal(h.payloads[0][1].free_hours, '0');
  h.render().openCreate(); assert.equal(h.render().formData.free_hours, '0');
});
for (const invalid of ['-1', '5', 'NaN']) {
  test('invalid free hours do not submit: ' + invalid, async () => {
    const h = setup(); h.render().openEdit(gig); h.render().updateField('free_hours', invalid);
    await h.render().submit(event); assert.equal(h.payloads.length, 0); assert.equal(h.errors.length, 1);
  });
}
test('new gigs submit fractional free hours, including fully free gigs', async () => {
  const h = setup(); h.render().updateField('hours', '2.5'); h.render().updateField('free_hours', '2.5');
  await h.render().submit(event); assert.equal(h.payloads[0][1].free_hours, '2.5');
});
test('billable hours exclude free hours without changing event duration', () => {
  const h = setup(); const { getBillableHours } = h.load('features/gigs/utils/gig.utils.ts');
  assert.equal(getBillableHours(gig), 2.5); assert.equal(gig.hours, 4);
  assert.equal(getBillableHours({ hours: 4 }), 4);
  assert.equal(getBillableHours({ hours: 4, free_hours: 4 }), 0);
  assert.equal(getBillableHours({ hours: 2, free_hours: 4 }), 0);
});
test('web band rename uses the shared backend endpoint and only sends the name', async () => {
  const h = setup(); const { bandsService } = h.load('features/bands/services/bands.service.ts');
  await bandsService.rename('11', 'Nuevo'); assert.deepEqual(h.calls, [['/bands/11', { name: 'Nuevo' }]]);
});

test('free hours are displayed on a gig and hidden for legacy or zero values', () => {
  const h = setup(); const { FreeHoursNote } = h.load('features/gigs/components/FreeHoursNote.tsx');
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const html = renderToStaticMarkup(React.createElement(FreeHoursNote, { gig }));
  assert.match(html, /1.5 horas gratis/);
  assert.equal(FreeHoursNote({ gig: { ...gig, free_hours: 0 } }), null);
  assert.equal(FreeHoursNote({ gig: { ...gig, free_hours: undefined } }), null);
});

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
test('web owners can rename active and archived bands; members have no rename control', async () => {
  const h = setup(); h.renderPage(); h.runEffects();
  await new Promise(resolve => setImmediate(resolve));
  let tree = h.renderPage();
  const buttons = nodes(tree).filter(node => node.props?.['aria-label']?.startsWith('Editar nombre de'));
  assert.equal(buttons.length, 2);
  assert.equal(buttons.some(node => node.props['aria-label'].includes('Ajena')), false);
  buttons.find(node => node.props['aria-label'].includes('Archivada')).props.onClick();
  tree = h.renderPage();
  assert.equal(nodes(tree).find(node => node.type === 'input' && node.props.id === 'band-name').props.value, 'Archivada');
  nodes(tree).find(node => node.type === 'input' && node.props.id === 'band-name').props.onChange({ target: { value: '  Nueva  ' } });
  tree = h.renderPage();
  await nodes(tree).find(node => node.type === 'form' && node.props.role === 'dialog').props.onSubmit(event);
  assert.deepEqual(h.calls, [['/bands/12', { name: 'Nueva' }]]);
  tree = h.renderPage();
  assert.ok(nodes(tree).some(node => node.props?.['aria-label'] === 'Editar nombre de Nueva'));
  assert.equal(nodes(tree).some(node => node.props?.role === 'dialog'), false);
});
