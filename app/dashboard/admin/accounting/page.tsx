"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { AccountingReportView } from "@/features/accounting/AccountingReportView";
import { accountingError, accountingMinor, currentAccountingMonth, providerName,
  type AccountingAccount, type AccountingDocument } from "@/features/accounting/accounting.service";

const inputClass = "mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5";
const buttonClass = "rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50";
const sectionClass = "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5";
const amountFields = [
  ["gross", "Cobros brutos"], ["fees", "Comisiones"], ["refunds", "Reembolsos"],
  ["withheld", "Impuestos retenidos"], ["deposits", "Depósitos del periodo"],
] as const;
type AuditEvent = { actor_kind: string; actor_id: number | null; action: string; month: string | null; created_at: string };

export default function AdminAccounting() {
  const [authorized, setAuthorized] = useState(false); const [checking, setChecking] = useState(true);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]); const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]); const [month, setMonth] = useState(currentAccountingMonth);
  const [username, setUsername] = useState(""); const [displayName, setDisplayName] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null); const [reveal, setReveal] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const [revision, setRevision] = useState(0);
  const [kind, setKind] = useState("CFDI"); const [file, setFile] = useState<File | null>(null);
  const [fileVersion, setFileVersion] = useState(0); const reloadGeneration = useRef(0);
  const [provider, setProvider] = useState("APPLE"); const [currency, setCurrency] = useState("MXN"); const [documentId, setDocumentId] = useState("");
  const [notes, setNotes] = useState(""); const [amounts, setAmounts] = useState({ gross: "0", fees: "0", refunds: "0", withheld: "0", deposits: "0" });
  useEffect(() => {
    let active = true;
    api.get<{ role: string }>("/users/me").then(({ data }) => { if (active) { setAuthorized(data.role === "admin"); if (data.role !== "admin") setError("Este módulo es exclusivo de administración."); } })
      .catch(error => { if (active) setError(accountingError(error)); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  const reload = useCallback(async (signal?: AbortSignal) => {
    const generation = ++reloadGeneration.current;
    const [accountData, documentData, auditData] = await Promise.all([
      api.get<{ accounts: AccountingAccount[] }>("/admin/accounting/accounts", { signal }),
      api.get<{ documents: AccountingDocument[] }>("/admin/accounting/documents", { params: { month }, signal }),
      api.get<{ events: AuditEvent[] }>("/admin/accounting/audit", { signal }),
    ]);
    if (signal?.aborted || generation !== reloadGeneration.current) return;
    setAccounts(accountData.data.accounts); setDocuments(documentData.data.documents); setEvents(auditData.data.events);
  }, [month]);
  useEffect(() => {
    if (!authorized) return;
    const controller = new AbortController();
    reload(controller.signal).catch(error => { if (!controller.signal.aborted) setError(accountingError(error)); });
    return () => controller.abort();
  }, [authorized, reload]);
  async function act(run: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await run(); await reload(); setRevision(value => value + 1); }
    catch (error) { setError(accountingError(error)); }
    finally { setBusy(false); }
  }
  function changeMonth(value: string) { setMonth(value); setDocumentId(""); setFile(null); setDocuments([]); }
  async function upload() {
    if (!file) throw Error("Selecciona un documento.");
    if (file.size > 10 * 1024 * 1024 || !file.size) throw Error("El archivo debe pesar entre 1 byte y 10 MB.");
    const ext = file.name.split(".").pop()?.toLowerCase();
    const mime = ext === "pdf" ? "application/pdf" : ext === "xml" ? "application/xml" : ext === "csv" ? "text/csv" : "";
    if (!mime) throw Error("Selecciona un PDF, XML o CSV.");
    await api.post("/admin/accounting/documents", file, { params: { month, kind, filename: file.name }, headers: { "Content-Type": mime } });
    setFile(null); setFileVersion(value => value + 1); setNotice("Documento guardado y disponible para el contador.");
  }
  if (checking) return <p role="status">Verificando permisos…</p>;
  if (!authorized) return <p role="alert" className="text-red-300">{error || "No tienes acceso a esta administración."}</p>;
  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><div><p className="text-xs uppercase tracking-widest text-purple-400">Administración</p><h1 className="mt-1 text-2xl font-bold">Accesos y documentos contables</h1></div><Link href="/contabilidad/login" target="_blank" rel="noopener noreferrer" className={buttonClass}>Abrir portal del contador</Link></div>
    {error && <p role="alert" className="rounded-xl border border-red-800 p-4 text-red-300 print:hidden">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-800 p-4 text-emerald-200 print:hidden">{notice}</p>}
    <section className={sectionClass + " print:hidden"}>
      <h2 className="text-lg font-semibold">Credenciales especiales</h2><p className="mt-2 text-sm text-zinc-400">El contador no necesita una cuenta de músico. Su acceso solo permite consultar reportes y descargar documentos. Puedes revocarlo o cambiar su contraseña cuando quieras.</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-3" onSubmit={event => { event.preventDefault(); void act(async () => {
        const { data } = await api.post<{ account: AccountingAccount; password: string }>("/admin/accounting/accounts", { username, displayName });
        setCredentials({ username: data.account.username, password: data.password }); setReveal(false); setUsername(""); setDisplayName("");
      }); }}>
        <label className="text-sm">Nombre del contador<input required maxLength={120} value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClass} /></label>
        <label className="text-sm">Usuario especial<input required pattern="[a-z0-9._-]{3,64}" maxLength={64} placeholder="contador.tocadapp" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} className={inputClass} /></label>
        <button disabled={busy} className={buttonClass + " self-end bg-purple-700"}>Crear acceso</button>
      </form>
      {credentials && <div className="mt-5 space-y-3 rounded-xl border border-purple-800 bg-purple-950/25 p-4">
        <p className="text-sm">Guarda y entrega estas credenciales por un canal privado. La contraseña se muestra únicamente ahora.</p>
        <p className="text-sm">Usuario: <strong>{credentials.username}</strong></p>
        <label className="block text-sm">Contraseña generada<input readOnly autoComplete="off" type={reveal ? "text" : "password"} value={credentials.password} className={inputClass} /></label>
        <div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => setReveal(value => !value)}>{reveal ? "Ocultar" : "Mostrar"}</button>
          <button className={buttonClass} onClick={() => { void navigator.clipboard.writeText(`Usuario: ${credentials.username}\nContraseña: ${credentials.password}\nPortal: ${window.location.origin}/contabilidad/login`).then(() => setNotice("Credenciales copiadas. Compártelas de forma privada.")).catch(() => setError("No se pudieron copiar. Puedes seleccionar y copiar la contraseña.")); }}>Copiar credenciales</button>
          <button className={buttonClass} onClick={() => { setCredentials(null); setReveal(false); }}>Ya las guardé</button></div>
      </div>}
      {!accounts.length ? <p className="mt-5 text-sm text-zinc-400">Todavía no hay accesos contables.</p> : <ul className="mt-5 divide-y divide-zinc-800">{accounts.map(account => <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p>{account.displayName}</p><p className="text-sm text-zinc-400">{account.username} · {account.active ? "Activo" : "Revocado"}</p></div><div className="flex gap-2">
        <button disabled={busy} className={buttonClass} onClick={() => { if (window.confirm("Esto cambiará la contraseña y cerrará sus sesiones actuales. ¿Continuar?")) void act(async () => { const { data } = await api.post<{ password: string }>(`/admin/accounting/accounts/${account.id}/rotate`); setCredentials({ username: account.username, password: data.password }); setReveal(false); }); }}>Nueva contraseña</button>
        <button disabled={busy || !account.active} className={buttonClass + " text-red-300"} onClick={() => { if (window.confirm("¿Revocar este acceso y cerrar sus sesiones?")) void act(async () => { await api.post(`/admin/accounting/accounts/${account.id}/revoke`); setCredentials(null); setNotice("Acceso revocado y sesiones cerradas."); }); }}>Revocar</button>
      </div></li>)}</ul>}
    </section>
    <AccountingReportView admin revision={revision} onMonthChange={changeMonth} />
    <div className="grid gap-6 xl:grid-cols-2 print:hidden">
      <section className={sectionClass}><h2 className="text-lg font-semibold">Cargar documentos de {month}</h2><p className="mt-2 text-sm text-zinc-400">PDF, XML o CSV, máximo 10 MB. Carga los originales del SAT, Stripe, las tiendas o tu banco.</p>
        <form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); void act(upload); }}>
          <label className="block text-sm">Tipo de documento<select className={inputClass} value={kind} onChange={e => setKind(e.target.value)}>{[["CFDI", "CFDI (XML o PDF)"], ["BANK", "Estado de cuenta bancario"], ["APPLE", "Liquidación de App Store"], ["GOOGLE_PLAY", "Liquidación de Google Play"], ["STRIPE_FEES", "Comisiones de Stripe"], ["OTHER", "Otro respaldo"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm">Archivo<input key={month + fileVersion} required type="file" accept=".pdf,.xml,.csv" onChange={e => setFile(e.target.files?.[0] ?? null)} className={inputClass} /></label>
          <button disabled={busy || !file} className={buttonClass}>Subir documento</button>
        </form>
        <ul className="mt-4 space-y-2">{documents.map(doc => <li key={doc.id} className="flex items-center justify-between gap-2 text-sm"><span className="break-all">{doc.filename} · {doc.kind}</span><button disabled={busy} className={buttonClass} onClick={() => { if (window.confirm("¿Eliminar este documento? Los respaldos usados en conciliaciones no se pueden eliminar.")) void act(async () => { await api.delete(`/admin/accounting/documents/${doc.id}`); }); }}>Eliminar</button></li>)}</ul>
      </section>
      <section className={sectionClass}><h2 className="text-lg font-semibold">Conciliar liquidación de tienda</h2><p className="mt-2 text-sm text-zinc-400">Registra los importes del reporte oficial de {month}. No uses el precio de una suscripción para estimar lo que depositó la tienda. Guardar reemplaza la conciliación de esa tienda y moneda.</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void act(async () => {
          const values = Object.fromEntries(amountFields.map(([key]) => [key + "Minor", accountingMinor(amounts[key], currency)]));
          await api.put("/admin/accounting/settlements", { month, provider, currency, documentId: Number(documentId), notes, ...values });
          setNotice("Conciliación guardada con su documento de respaldo.");
        }); }}>
          <label className="text-sm">Tienda<select value={provider} onChange={e => { setProvider(e.target.value); setDocumentId(""); }} className={inputClass}><option value="APPLE">App Store</option><option value="GOOGLE_PLAY">Google Play</option></select></label>
          <label className="text-sm">Moneda<input required pattern="[A-Z]{3}" maxLength={3} value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} className={inputClass} /></label>
          {amountFields.map(([key, label]) => <label key={key} className="text-sm">{label} ({currency})<input required inputMode="decimal" value={amounts[key]} onChange={e => setAmounts(previous => ({ ...previous, [key]: e.target.value }))} className={inputClass} /></label>)}
          <label className="text-sm">Reporte de respaldo<select required value={documentId} onChange={e => setDocumentId(e.target.value)} className={inputClass}><option value="">Seleccionar documento</option>{documents.filter(doc => doc.kind === provider).map(doc => <option key={doc.id} value={doc.id}>{doc.filename}</option>)}</select></label>
          <label className="text-sm sm:col-span-2">Notas<textarea maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></label>
          <button disabled={busy || !documentId} className={buttonClass + " sm:col-span-2"}>Guardar conciliación de {providerName(provider)}</button>
        </form>
      </section>
    </div>
    <details className={sectionClass + " print:hidden"}><summary className="cursor-pointer font-semibold">Actividad de accesos y descargas</summary><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-2">Fecha</th><th>Actor</th><th>Acción</th><th>Mes</th></tr></thead><tbody>{events.map((event, index) => <tr key={index} className="border-t border-zinc-800"><td className="p-2">{new Date(event.created_at).toLocaleString("es-MX")}</td><td>{event.actor_kind} {event.actor_id ?? ""}</td><td>{event.action}</td><td>{event.month || "—"}</td></tr>)}</tbody></table></div></details>
  </div>;
}
