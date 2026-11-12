"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Download, FileText, RefreshCw, Printer, Landmark } from "lucide-react";
import { accountingClient, accountingPath, accountingError, accountingMoney, currentAccountingMonth,
  downloadAccountingFile, providerName, type AccountingReport, type AccountingMoney } from "./accounting.service";

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
  const [report, setReport] = useState<AccountingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setReport(null); setError("");
    accountingClient(admin).get<AccountingReport>(accountingPath(admin) + "/report", { params: { month }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setReport(data); })
      .catch(error => {
        if (controller.signal.aborted) return;
        if (!admin && axios.isAxiosError(error) && error.response?.status === 401) router.replace("/contabilidad/login");
        else setError(accountingError(error));
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [admin, month, refresh, revision, router]);
  async function download(path: string, filename: string) {
    try { setDownloading(true); await downloadAccountingFile(admin, path, filename); }
    catch (error) { setError(accountingError(error)); }
    finally { setDownloading(false); }
  }
  const stripe = report?.stripe;
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
        <p className="mt-2 text-sm text-zinc-400">Periodo mensual en hora de Ciudad de México. Cada moneda se presenta por separado.</p>
      </div>
      <label className="text-sm print:hidden">Mes
        <input type="month" aria-label="Mes del reporte" min="2000-01" max="2099-12" value={month}
          onChange={e => { if (/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value)) { setMonth(e.target.value); onMonthChange?.(e.target.value); } }}
          className="ml-3 rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-white" />
      </label>
    </div>
    <div className="flex flex-wrap gap-2 print:hidden">
      <button className={button} disabled={loading} onClick={() => setRefresh(v => v + 1)}><RefreshCw size={16} />Actualizar</button>
      <button className={button} disabled={!report || loading || downloading} onClick={() => void download(`/export?month=${month}`, `tocadapp-contabilidad-${month}.csv`)}><Download size={16} />Descargar CSV</button>
      <button className={button} disabled={!report || loading} onClick={() => window.print()}><Printer size={16} />Imprimir / guardar PDF</button>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">{error}</p>}
    {loading && <p role="status" className={box}>Consultando los registros y las liquidaciones de {month}…</p>}
    {report && <>
      <div className="rounded-xl border border-amber-800/60 bg-amber-950/25 p-4 text-sm text-amber-100 print:text-black">
        {report.stripeMode === "test" && <p className="mb-2 font-bold">ENTORNO DE PRUEBAS: estos importes no son ingresos reales.</p>}
        {report.guidance}
      </div>
      <section className={box}>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold"><Landmark size={20} />Cuenta Stripe conectada a TocadApp</h2>
        <p className="mb-4 text-sm text-zinc-400">Movimientos por fecha de creación y transferencias por fecha de llegada estimada. “Pagada” es el estado informado por Stripe: confírmalo con el estado de cuenta bancario.</p>
        {stripe?.status === "unavailable" ? <p role="status" className="text-amber-200">{stripe.message}</p> : stripe?.status === "available" && <>
          {stripe.totals.length ? <div className="space-y-4">{stripe.totals.map(total => <MoneyCards key={total.currency} total={total} />)}</div>
            : <p className="rounded-xl bg-zinc-950/50 p-4 text-zinc-300">Sin movimientos de Stripe en este periodo. Revisa también las otras fuentes y documentos.</p>}
          <details className="mt-5"><summary className="cursor-pointer text-sm">Movimientos de saldo ({stripe.transactions.length})</summary>
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-zinc-400"><tr><th className="p-2">Fecha / referencia</th><th>Tipo</th><th>Bruto</th><th>Comisión</th><th>Neto</th></tr></thead>
              <tbody>{stripe.transactions.map(row => <tr key={row.id} className="border-t border-zinc-800"><td className="p-2">{date(row.date)}<span className="block text-xs text-zinc-500">{row.id}</span></td><td>{row.type}</td><td>{accountingMoney(row.amountMinor, row.currency)}</td><td>{accountingMoney(row.feeMinor, row.currency)}</td><td>{accountingMoney(row.netMinor, row.currency)}</td></tr>)}</tbody>
            </table></div>
          </details>
          <h3 className="mt-6 font-medium">Transferencias de Stripe</h3>
          {!stripe.payouts.length ? <p className="mt-2 text-sm text-zinc-400">Sin transferencias con llegada estimada en este mes.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-zinc-400"><tr><th className="p-2">Llegada estimada</th><th>Referencia</th><th>Estado</th><th>Importe</th></tr></thead>
            <tbody>{stripe.payouts.map(row => <tr key={row.id} className="border-t border-zinc-800"><td className="p-2">{date(row.arrivalDate)}</td><td>{row.id}</td><td>{row.status}</td><td>{accountingMoney(row.amountMinor, row.currency)}</td></tr>)}</tbody></table></div>}
          <h3 className="mt-6 font-medium">Comprobantes de pagos Stripe</h3>
          <p className="mt-1 text-xs text-zinc-400">Facturas emitidas en el periodo y referencias del registro local, filtradas por fecha de pago. No son CFDI timbrados.</p>
          {!stripe.invoices.length ? <p className="mt-2 text-sm text-zinc-400">No se recuperaron comprobantes pagados para este periodo.</p> : <ul className="mt-3 divide-y divide-zinc-800">{stripe.invoices.map(invoice => <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{invoice.number || invoice.id} · {date(invoice.paidAt)} · {accountingMoney(invoice.amountMinor, invoice.currency)}</span>
            {invoice.pdfUrl ? <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className={button}><FileText size={16} />PDF de Stripe</a> : <span className="text-zinc-500">PDF no disponible</span>}</li>)}</ul>}
        </>}
      </section>
      {["APPLE", "GOOGLE_PLAY"].map(provider => <section key={provider} className={box}>
        <h2 className="text-lg font-semibold">{providerName(provider)}</h2>
        {report.pendingProviders.includes(provider) ? <p className="mt-3 text-sm text-amber-200">Pendiente de reporte de liquidación. No hay un importe conciliado; esto no significa cero ingresos.</p> : report.settlements.filter(row => row.provider === provider).map(row => <div key={row.id} className="mt-4 space-y-3">
          <MoneyCards total={row} /><p className="text-xs text-zinc-400">Conciliación registrada por administración con documento de respaldo. Actualizada: {date(row.updatedAt)}.</p>
          {row.notes && <p className="text-sm">{row.notes}</p>}
          <button className={button} disabled={downloading} onClick={() => { const doc = report.documents.find(d => d.id === row.documentId); if (doc) void download(`/documents/${doc.id}`, doc.filename); }}>Descargar respaldo</button>
        </div>)}
      </section>)}
      <section className={box}><h2 className="text-lg font-semibold">Pagos de suscripción registrados manualmente</h2>
        {!report.manual.length ? <p className="mt-3 text-sm text-zinc-400">Sin pagos manuales registrados en el mes.</p> : <ul className="mt-3 space-y-2">{report.manual.map(row => <li key={row.id} className="flex justify-between gap-3 text-sm"><span>{date(row.paidAt)} · {row.reference || `Registro ${row.id}`}</span><span>{accountingMoney(row.amountMinor, row.currency)}</span></li>)}</ul>}
        <p className="mt-3 text-xs text-zinc-500">Estos registros no confirman depósitos bancarios. No incluyen pagos de tocadas de los usuarios.</p>
      </section>
      <section className={box}><h2 className="text-lg font-semibold">Documentos del mes</h2>
        <p className="mt-2 text-sm text-zinc-400">Archivos proporcionados por administración: CFDI XML/PDF, estados de cuenta y reportes de las tiendas. Su carga no valida el timbrado ante el SAT.</p>
        {!report.documents.length ? <p className="mt-3 text-sm text-zinc-400">Aún no se han cargado documentos para este mes.</p> : <ul className="mt-4 divide-y divide-zinc-800">{report.documents.map(doc => <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="break-all text-sm">{doc.filename}</p><p className="mt-1 text-xs text-zinc-500">{doc.kind} · {(doc.bytes / 1024).toFixed(1)} KB · {date(doc.createdAt)}</p></div>
          <button className={button} disabled={downloading} onClick={() => void download(`/documents/${doc.id}`, doc.filename)}><Download size={16} />Descargar</button></li>)}</ul>}
      </section>
      <p className="text-xs text-zinc-500">Periodo {report.month} · Generado {new Date(report.generatedAt).toLocaleString("es-MX", { timeZone: report.timezone })} · {report.timezone}</p>
    </>}
  </div>;
}
