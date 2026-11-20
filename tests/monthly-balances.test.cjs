/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner uses CommonJS. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
const gig = { id: "1", title: "Evento", place: "Lugar", hours: 2, time: "09:00", band_name: "Banda" };
const gigs = [
  { ...gig, date: "2026-01-15", is_owner: false, my_collected: "100.10", collected_amount: 900 },
  { ...gig, id: "2", date: "2026-01-15", time: "20:00", is_owner: true, collected_amount: 500 },
];
const movements = [
  { id: "1", date: "2025-12-31", type: "EXPENSE", amount: "40.20", band_name: "Banda" },
  { id: "2", date: "2026-01-15", type: "INCOME", amount: "5.15", band_name: "Banda" },
  { id: "3", date: "2026-01-15", type: "EXPENSE", amount: "200.25", band_name: null },
].map((movement) => ({ gig_id: null, band_id: movement.band_name ? 1 : null, category: "Otro", ...movement }));

async function loadPage(filename, { failMovements = false, period = "all", band = "all" } = {}) {
  const state = [];
  const effects = [];
  const cache = new Map();
  let cursor = 0;
  const filters = [period, band];
  const chart = [];
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [2026, 0, 15, 12]));
    }
  }
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    const loadedModule = { exports: {} };
    vm.runInThisContext(`(function (require, module, exports, Date, console) { ${outputText}\n})`)((name) => {
      if (name === "react") return {
        ...require("react"),
        useEffect: (effect) => effects.push(effect),
        useState: (initial) => {
          const index = cursor++;
          if (!(index in state)) state[index] = initial === "all" ? filters.shift() : initial;
          return [state[index], (value) => { state[index] = value; }];
        },
      };
      if (name === "@/lib/axios") return { api: { get: async (url) => {
        if (url === "/financial-movements" && failMovements) throw new Error("Movimientos no disponibles");
        return { data: { data: url === "/gigs" ? gigs : url === "/bands" ? [] : movements } };
      } } };
      if (name === "@/components/ui/button") return { Button: "button" };
      if (name === "next/link") return "a";
      if (name === "recharts") return {
        ResponsiveContainer: ({ children }) => children,
        BarChart: ({ data }) => { chart.push(...data); return null; },
      };
      if (name.startsWith("@/")) return load(path.join(root, name.slice(2) + ".ts"));
      if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name + ".ts"));
      return require(name);
    }, loadedModule, loadedModule.exports, FixedDate, { error() {} });
    cache.set(file, loadedModule.exports);
    return loadedModule.exports;
  }
  const Page = load(path.join(root, filename)).default;
  Page();
  for (const effect of effects.splice(0)) effect();
  await new Promise(setImmediate);
  cursor = 0;
  const html = renderToStaticMarkup(Page()).replace(/<[^>]*>/g, "");
  return { html, chart };
}

test("dashboard and finances agree on net balances, including negative and movement-only months", async () => {
  const dashboard = await loadPage("app/dashboard/page.tsx");
  const finances = await loadPage("app/dashboard/finances/page.tsx");
  assert.match(dashboard.html, /Saldo neto este mes.*?\$-95\.00/);
  assert.deepEqual(dashboard.chart.map(({ total }) => total), [0, 0, 0, 0, -40.2, -95]);
  assert.match(dashboard.html, /Saldo acumulado.*?\$-135\.20/);
  assert.match(finances.html, /Saldo neto vs\. mes anterior.*?\$-95\.00.*?-136\.3%/);
  assert.match(finances.html, /Mejor mes.*?\$-40\.20.*?diciembre de 2025/);
});

test("finance net balances respect band and personal filters", async () => {
  const band = await loadPage("app/dashboard/finances/page.tsx", { band: "Banda", period: "month" });
  assert.match(band.html, /Saldo neto vs\. mes anterior.*?\$105\.25.*?\+361\.8%/);
  const personal = await loadPage("app/dashboard/finances/page.tsx", { band: "personal" });
  assert.match(personal.html, /Saldo neto vs\. mes anterior.*?\$-200\.25.*?Sin datos para comparar/);
});

test("monthly balances stay unavailable when movements fail to load", async () => {
  const dashboard = await loadPage("app/dashboard/page.tsx", { failMovements: true });
  const finances = await loadPage("app/dashboard/finances/page.tsx", { failMovements: true });
  assert.match(dashboard.html, /Saldo no disponible/);
  assert.equal(dashboard.chart.length, 0);
  assert.match(finances.html, /Saldo neto vs\. mes anterior—Saldo no disponible/);
});
