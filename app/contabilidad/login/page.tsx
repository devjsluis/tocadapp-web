"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { accountingApi, accountingError } from "@/features/accounting/accounting.service";

export default function AccountingLogin() {
  const router = useRouter();
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function login(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try { await accountingApi.post("/accounting/login", { username, password }); setPassword(""); router.replace("/contabilidad"); }
    catch (error) { setError(accountingError(error)); setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-12 text-white">
    <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
      <LockKeyhole className="mb-5 text-purple-400" size={32} />
      <p className="text-sm font-semibold tracking-wider text-purple-400">TocadApp</p>
      <h1 className="mt-2 text-2xl font-bold">Portal del contador</h1>
      <p className="mt-3 text-sm text-zinc-400">Acceso exclusivo para consultar los ingresos de suscripciones y descargar documentos contables.</p>
      <form onSubmit={event => void login(event)} className="mt-7 space-y-5">
        <label className="block text-sm">Usuario contable<input required autoComplete="username" maxLength={64} value={username} onChange={e => setUsername(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3" /></label>
        <label className="block text-sm">Contraseña<input required type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3" /></label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-purple-600 p-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{busy ? "Verificando…" : "Entrar al portal contable"}</button>
      </form>
      <p className="mt-6 text-xs text-zinc-500">Las credenciales las proporciona la administración de TocadApp. No se utiliza una cuenta de músico ni se necesita una suscripción.</p>
      <Link href="/" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">Volver a TocadApp</Link>
    </section>
  </main>;
}
