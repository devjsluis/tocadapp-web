"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Download, FileText, RefreshCw, Printer, Landmark } from "lucide-react";
import { accountingClient, accountingPath, accountingError, accountingMoney, currentAccountingMonth,
  downloadAccountingFile, providerName, accountingFilterQuery, accountingMonthDates, accountingStatusOptions, type AccountingReport, type AccountingMoney } from "./accounting.service";

const date = (value: string) => new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "America/Mexico_City" }).format(new Date(value));
const box = "rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 print:border-zinc-300 print:bg-white";
const button = "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50 print:hidden";
function MoneyCards({ total }: { total: AccountingMoney }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[
      ["Cobros brutos", total.grossMinor], ["Comisiones", total.feesMinor],
      ["Movimiento neto de saldo", total.netMinor], ["Transferencias pagadas", total.depositsMinor],
    ].map(([label, amount]) => <div key={label} className="rounded-xl bg-zinc-950/70 p-4 print:bg-zinc-100">
      <p className="text-xs text-zinc-400 print:text-zinc-600">{label}</p>
      <p className="mt-2 text-lg font-semibold tabular-nums">{accountingMoney(Number(amount), total.currency)}</p>
    </div>)}
    {(total.refundsMinor !== 0 || total.withheldMinor !== 0) && <p className="col-span-full text-sm text-zinc-400">
      Reembolsos: {accountingMoney(total.refundsMinor, total.currency)} · Retenciones: {accountingMoney(total.withheldMinor, total.currency)}
    </p>}
  </div>;
}

export function AccountingReportView({ admin = false, revision = 0, onMonthChange }: { admin?: boolean; revision?: number; onMonthChange?: (month: string) => void }) {
  const router = useRouter();
  const [month, setMonth] = useState(currentAccountingMonth);
  const [mode, setMode] = useState("month");
  const [from, setFrom] = useState(() => accountingMonthDates(currentAccountingMonth()).from);
  const [to, setTo] = useState(() => accountingMonthDates(currentAccountingMonth()).to);
  const [provider, setProvider] = useState("ALL"); const [currency, setCurrency] = useState(""); const [status, setStatus] = useState("all");
  let queryString = "", validationError = "";
  try { queryString = accountingFilterQuery({ mode, month, from, to, provider, currency, status }); }
  catch (error) { validationError = accountingError(error); }
  const [report, setReport] = useState<AccountingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    if (!queryString) { setReport(null); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setReport(null); setError("");
    accountingClient(admin).get<AccountingReport>(accountingPath(admin) + "/report", { params: Object.fromEntries(new URLSearchParams(queryString)), signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setReport(data); })
      .catch(error => {
        if (controller.signal.aborted) return;
        if (!admin && axios.isAxiosError(error) && error.response?.status === 401) router.replace("/contabilidad/login");
        else setError(accountingError(error));
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [admin, queryString, refresh, revision, router]);
  async function download(path: string, filename: string) {
    try { setDownloading(true); await downloadAccountingFile(admin, path, filename); }
    catch (error) { setError(accountingError(error)); }
    finally { setDownloading(false); }
  }
  const stripe = report?.stripe;
  const selectedProvider = (value: string) => provider === "ALL" || provider === value;
  const applied = report?.filters;
  const periodLabel = report?.periodLabel ?? report?.month ?? (mode === "month" ? month : from + " a " + to);
  const exportName = `tocadapp-contabilidad-${mode === "month" ? month : from + "_" + to}-${provider}-${currency || "TODAS"}-${status}.csv`;
  const nativePartial = report?.partialMonths ?? [];
  return <div className="accounting-report space-y-6 print:text-black">
    <style>{`@media print {
      body, main { background: white !important; color: #111 !important; margin: 0 !important; }
      aside, nav { display: none !important; }
      .accounting-report, .accounting-report [class*="text-"] { color: #111 !important; }
      .accounting-report [class*="bg-"] { background: transparent !important; }
      .accounting-report section { break-inside: avoid; }
    }`}</style>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-purple-400">TocadApp · Contabilidad</p>
        <h1 className="mt-2 text-3xl font-bold">Ingresos de suscripciones</h1>
        <p className="mt-2 text-sm text-zinc-400">Periodo en hora de Ciudad de México. Desde y Hasta incluyen los días completos. Cada moneda se presenta por separado.</p>
      </div>
    </div>
    <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
      <label className="text-sm">Periodo<select aria-label="Tipo de periodo" value={mode} onChange={e => {
        setMode(e.target.value); if (e.target.value === "range") { const dates = accountingMonthDates(month); setFrom(dates.from); setTo(dates.to); }
      }} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2"><option value="month">Mes completo</option><option value="range">Rango de fechas</option></select></label>
      {mode === "month" ? <label className="text-sm">Mes<input type="month" aria-label="Mes del reporte" min="2000-01" max="2099-12" value={month}
        onChange={e => { if (/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value)) { setMonth(e.target.value); onMonthChange?.(e.target.value); } }}
        className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2" /></label> : <>
        <label className="text-sm">Desde<input type="date" aria-label="Desde" min="2000-01-01" max="2099-12-31" value={from} onChange={e => setFrom(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2" /></label>
        <label className="text-sm">Hasta<input type="date" aria-label="Hasta" min="2000-01-01" max="2099-12-31" value={to} onChange={e => setTo(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2" /></label>
      </>}
      <label className="text-sm">Proveedor<select aria-label="Proveedor del reporte" value={provider} onChange={e => setProvider(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2">{["ALL", "STRIPE", "APPLE", "GOOGLE_PLAY", "MANUAL"].map(value => <option key={value} value={value}>{providerName(value)}</option>)}</select></label>
      <label className="text-sm">Moneda<input aria-label="Moneda del reporte" maxLength={3} placeholder="Todas (ej. MXN, USD)" value={currency} onChange={e => setCurrency(e.target.value.toUpperCase().trim())} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2" /></label>
      <label className="text-sm">Estado<select aria-label="Estado del reporte" value={status} onChange={e => setStatus(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2">{accountingStatusOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p className="text-xs text-zinc-400 sm:col-span-2 lg:col-span-3">El estado corresponde al tipo indicado: saldo, transferencia, comprobante, registro manual o conciliación. Los documentos mensuales se conservan como respaldo; no se filtran por moneda o estado.</p>
    </div>
    <div className="flex flex-wrap gap-2 print:hidden">
      <button className={button} disabled={loading} onClick={() => setRefresh(v => v + 1)}><RefreshCw size={16} />Actualizar</button>
      <button className={button} disabled={!report || loading || downloading || !!validationError} onClick={() => void download(`/export?${queryString}`, exportName)}><Download size={16} />Descargar CSV</button>
      <button className={button} disabled={!report || loading || !!validationError} onClick={() => window.print()}><Printer size={16} />Imprimir / guardar PDF</button>
    </div>
    {validationError && <p role="alert" className="rounded-xl border border-amber-800 p-4 text-amber-200">{validationError}</p>}
    {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</p>}
    {loading && <p role="status" className={box}>Consultando los registros y las liquidaciones del periodo seleccionado…</p>}
    {report && <>
      <p className="text-sm text-zinc-400">Periodo {periodLabel} · Fuente: {providerName(applied?.provider ?? provider)} · Moneda: {(applied?.currency ?? currency) || "Todas"} · Estado: {accountingStatusOptions.find(([value]) => value === (applied?.status ?? status))?.[1] ?? status}</p>
      <div className="rounded-xl border border-amber-800/60 bg-amber-950/25 p-4 text-sm text-amber-100 print:text-black">
        {report.stripeMode === "test" && <p className="mb-2 font-bold">ENTORNO DE PRUEBAS: estos importes no son ingresos reales.</p>}
        {report.guidance}
      </div>
      {selectedProvider("STRIPE") && <section className={box}>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold"><Landmark size={20} />Cuenta Stripe conectada a TocadApp</h2>
        <p className="mb-4 text-sm text-zinc-400">Movimientos por fecha de creación y transferencias por fecha de llegada estimada. “Pagada” es el estado informado por Stripe: confírmalo con el estado de cuenta bancario.</p>
        {stripe?.status === "unavailable" ? <p role="status" className="text-amber-200">{stripe.message}</p> : stripe?.status === "available" && <>
          {stripe.totals.length ? <div className="space-y-4">{stripe.totals.map(total => <MoneyCards key={total.currency} total={total} />)}</div>
            : <p className="rounded-xl bg-zinc-950/50 p-4 text-zinc-300">Sin movimientos de Stripe que coincidan con los filtros seleccionados. Revisa también las otras fuentes y documentos.</p>}
          <details className="mt-5"><summary className="cursor-pointer text-sm">Movimientos de saldo ({stripe.transactions.length})</summary>
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-zinc-400"><tr><th className="p-2">Fecha / referencia</th><th>Tipo</th><th>Bruto</th><th>Comisión</th><th>Neto</th></tr></thead>
              <tbody>{stripe.transactions.map(row => <tr key={row.id} className="border-t border-zinc-800"><td className="p-2">{date(row.date)}<span className="block text-xs text-zinc-500">{row.id}</span></td><td>{row.type}</td><td>{accountingMoney(row.amountMinor, row.currency)}</td><td>{accountingMoney(row.feeMinor, row.currency)}</td><td>{accountingMoney(row.netMinor, row.currency)}</td></tr>)}</tbody>
            </table></div>
          </details>
          <h3 className="mt-6 font-medium">Transferencias de Stripe</h3>
          {!stripe.payouts.length ? <p className="mt-2 text-sm text-zinc-400">Sin transferencias que coincidan con el periodo y los filtros seleccionados.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-zinc-400"><tr><th className="p-2">Llegada estimada</th><th>Referencia</th><th>Estado</th><th>Importe</th></tr></thead>
            <tbody>{stripe.payouts.map(row => <tr key={row.id} className="border-t border-zinc-800"><td className="p-2">{date(row.arrivalDate)}</td><td>{row.id}</td><td>{row.status}</td><td>{accountingMoney(row.amountMinor, row.currency)}</td></tr>)}</tbody></table></div>}
          <h3 className="mt-6 font-medium">Comprobantes de pagos Stripe</h3>
          <p className="mt-1 text-xs text-zinc-400">Facturas emitidas en el periodo y referencias del registro local, filtradas por fecha de pago. No son CFDI timbrados.</p>
          {!stripe.invoices.length ? <p className="mt-2 text-sm text-zinc-400">No se recuperaron comprobantes pagados para este periodo.</p> : <ul className="mt-3 divide-y divide-zinc-800">{stripe.invoices.map(invoice => <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{invoice.number || invoice.id} · {date(invoice.paidAt)} · {accountingMoney(invoice.amountMinor, invoice.currency)}</span>
            {invoice.pdfUrl ? <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className={button}><FileText size={16} />PDF de Stripe</a> : <span className="text-zinc-500">PDF no disponible</span>}</li>)}</ul>}
        </>}
      </section>}
      {["APPLE", "GOOGLE_PLAY"].filter(selectedProvider).map(provider => <section key={provider} className={box}>
        <h2 className="text-lg font-semibold">{providerName(provider)}</h2>
        {report.pendingProviders.includes(provider) && <p className="mt-3 text-sm text-amber-200">Pendiente de reporte de liquidación. No hay un importe conciliado para todos los meses o monedas seleccionados; esto no significa cero ingresos. {(report.pendingProviderMonths ?? []).filter(row => row.provider === provider).map(row => row.month).join(", ")}</p>}
        {nativePartial.length > 0 && <p className="mt-3 text-sm text-amber-200">Meses parciales: {nativePartial.join(", ")}. Las liquidaciones de tienda son mensuales: sus importes no se incluyen ni se prorratean. Puedes descargar sus respaldos en Documentos del periodo.</p>}
        {report.settlements.filter(row => row.provider === provider).map(row => <div key={row.id} className="mt-4 space-y-3">
          <p className="text-sm font-medium">Mes completo: {row.month ?? report.month}</p>
          <MoneyCards total={row} /><p className="text-xs text-zinc-400">Conciliación registrada por administración con documento de respaldo. Actualizada: {date(row.updatedAt)}.</p>
          {row.notes && <p className="text-sm">{row.notes}</p>}
          <button className={button} disabled={downloading} onClick={() => { const doc = report.documents.find(d => d.id === row.documentId); if (doc) void download(`/documents/${doc.id}`, doc.filename); }}>Descargar respaldo</button>
        </div>)}
        {!report.pendingProviders.includes(provider) && !nativePartial.length && !report.settlements.some(row => row.provider === provider) && <p className="mt-3 text-sm text-zinc-400">Sin liquidaciones que coincidan con los filtros seleccionados.</p>}
      </section>)}
      {selectedProvider("MANUAL") && <section className={box}><h2 className="text-lg font-semibold">Pagos de suscripción registrados manualmente</h2>
        {!report.manual.length ? <p className="mt-3 text-sm text-zinc-400">Sin pagos manuales que coincidan con los filtros seleccionados.</p> : <ul className="mt-3 space-y-2">{report.manual.map(row => <li key={row.id} className="flex justify-between gap-3 text-sm"><span>{date(row.paidAt)} · {row.reference || `Registro ${row.id}`}</span><span>{accountingMoney(row.amountMinor, row.currency)}</span></li>)}</ul>}
        <p className="mt-3 text-xs text-zinc-500">Estos registros no confirman depósitos bancarios. No incluyen pagos de tocadas de los usuarios.</p>
      </section>}
      <section className={box}><h2 className="text-lg font-semibold">Documentos del periodo</h2>
        <p className="mt-2 text-sm text-zinc-400">Archivos proporcionados por administración: CFDI XML/PDF, estados de cuenta y reportes de las tiendas. Su carga no valida el timbrado ante el SAT.</p>
        {!report.documents.length ? <p className="mt-3 text-sm text-zinc-400">No hay documentos de los meses incluidos en este periodo para la fuente seleccionada.</p> : <ul className="mt-4 divide-y divide-zinc-800">{report.documents.map(doc => <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="break-all text-sm">{doc.filename}</p><p className="mt-1 text-xs text-zinc-500">{doc.month ? doc.month + " · " : ""}{doc.kind} · {(doc.bytes / 1024).toFixed(1)} KB · {date(doc.createdAt)}</p></div>
          <button className={button} disabled={downloading} onClick={() => void download(`/documents/${doc.id}`, doc.filename)}><Download size={16} />Descargar</button></li>)}</ul>}
      </section>
      <p className="text-xs text-zinc-500">Periodo {periodLabel} · Generado {new Date(report.generatedAt).toLocaleString("es-MX", { timeZone: report.timezone })} · {report.timezone}</p>
    </>}
  </div>;
}
