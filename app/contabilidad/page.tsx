"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LogOut } from "lucide-react";
import { AccountingReportView } from "@/features/accounting/AccountingReportView";
import { accountingApi, accountingError, type AccountingAccount } from "@/features/accounting/accounting.service";

export default function AccountingPortal() {
  const router = useRouter(); const [account, setAccount] = useState<AccountingAccount | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    accountingApi.get<{ account: AccountingAccount }>("/accounting/session").then(({ data }) => { if (active) setAccount(data.account); })
      .catch(error => { if (!active) return; if (axios.isAxiosError(error) && error.response?.status === 401) router.replace("/contabilidad/login"); else setError(accountingError(error)); });
    return () => { active = false; };
  }, [router]);
  async function logout() {
    setBusy(true);
    try { await accountingApi.post("/accounting/logout"); setAccount(null); router.replace("/contabilidad/login"); }
    catch (error) { setError(accountingError(error)); setBusy(false); }
  }
  return <main className="min-h-screen bg-zinc-950 px-5 py-8 text-white print:bg-white print:text-black">
    <div className="mx-auto max-w-7xl">
      {error && <p role="alert" className="mb-5 rounded-xl border border-red-800 p-4 text-red-300">{error}</p>}
      {account ? <><header className="mb-8 flex items-center justify-between gap-4 border-b border-zinc-800 pb-5 print:hidden">
        <div><p className="font-semibold">{account.displayName}</p><p className="text-xs text-zinc-400">Acceso contable · Solo consulta y descargas</p></div>
        <button disabled={busy} onClick={() => void logout()} className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"><LogOut size={16} />Cerrar sesión</button>
      </header><AccountingReportView /></> : !error && <p role="status">Verificando acceso contable…</p>}
    </div>
  </main>;
}
