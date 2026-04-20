"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  Music,
  MapPin,
  Hourglass,
  Banknote,
  Star,
  Users2,
  AlertCircle,
  HelpCircle,
  Wallet,
  ShoppingBag,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Gig {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  amount: number | string | null;
  hours: number | string;
  band_name?: string | null;
  is_owner: boolean;
  my_amount?: number | null;
  my_collected?: number | null;
  collected_amount?: number | null;
}

interface Expense {
  id: string;
  amount: number | string;
  category: string;
  description?: string | null;
  date: string;
}

type TableTab = "pasadas" | "proximas" | "todas";

const EXPENSE_CATEGORIES = [
  "Baquetas",
  "Cañas",
  "Boquillas",
  "Cuerdas",
  "Cepillos",
  "Aceite",
  "Reparación",
  "Transporte",
  "Equipo",
  "Otro",
];

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fmt(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function effectiveAmount(gig: Gig): number | null {
  if (gig.is_owner) return gig.amount != null ? Number(gig.amount) : null;
  return gig.my_amount != null ? Number(gig.my_amount) : null;
}

function effectiveCollected(gig: Gig): number | null {
  if (gig.is_owner)
    return gig.collected_amount != null ? Number(gig.collected_amount) : null;
  return gig.my_collected != null ? Number(gig.my_collected) : null;
}

function countsInFinances(gig: Gig): boolean {
  return effectiveAmount(gig) !== null || effectiveCollected(gig) !== null;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-zinc-800 rounded animate-pulse ${className}`} />
);

export default function FinancesPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TableTab>("pasadas");

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expDescription, setExpDescription] = useState("");
  const [expDate, setExpDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [savingExpense, setSavingExpense] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/gigs"),
      api.get("/expenses").catch(() => ({ data: { data: [] } })),
    ])
      .then(([gigsRes, expensesRes]) => {
        setGigs(gigsRes.data.data);
        setExpenses(expensesRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allPastGigs = gigs.filter((g) => parseLocalDate(g.date) < today);
  const allFutureGigs = gigs
    .filter((g) => parseLocalDate(g.date) >= today)
    .sort(
      (a, b) =>
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
    );

  const pastGigs = allPastGigs.filter(countsInFinances);
  const futureGigs = allFutureGigs.filter(countsInFinances);

  // ── Cobros reales (lo único que cuenta como "ganado") ──
  const pastGigsWithCollected = pastGigs.filter(
    (g) => effectiveCollected(g) !== null,
  );
  const totalCollected = pastGigsWithCollected.reduce(
    (acc, g) => acc + (effectiveCollected(g) ?? 0),
    0,
  );
  const collectedHours = pastGigsWithCollected.reduce(
    (acc, g) => acc + Number(g.hours),
    0,
  );
  const tarifaReal = collectedHours > 0 ? totalCollected / collectedHours : 0;

  // Monto pactado en pasadas (referencia, no "ganado")
  const earned = pastGigs.reduce(
    (acc, g) => acc + (effectiveAmount(g) ?? 0),
    0,
  );
  const earnedHours = pastGigs.reduce((acc, g) => acc + Number(g.hours), 0);

  const pendingFromPast = pastGigs.reduce((acc, g) => {
    const ea = effectiveAmount(g) ?? 0;
    const ec = effectiveCollected(g) ?? 0;
    return acc + Math.max(0, ea - ec);
  }, 0);
  const unregisteredPastCount = pastGigs.filter(
    (g) => effectiveCollected(g) === null,
  ).length;
  const hasCollectedTracking = pastGigsWithCollected.length > 0;

  const pendingGigsList = pastGigs.filter((g) => {
    const ec = effectiveCollected(g);
    const ea = effectiveAmount(g);
    return ec === null || (ea !== null && ec < ea);
  });

  // ── Gastos ──
  const totalExpenses = expenses.reduce(
    (acc, e) => acc + Number(e.amount),
    0,
  );
  const netIncome = totalCollected - totalExpenses;

  const expensesByCategory = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    },
    {} as Record<string, number>,
  );
  const topCategory = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1],
  )[0] ?? null;

  // ── Métricas futuras ──
  const pending = futureGigs.reduce(
    (acc, g) => acc + (effectiveAmount(g) ?? 0),
    0,
  );

  // ── Barra anual (3 segmentos: cobrado · por cobrar · por venir) ──
  const currentYear = today.getFullYear();
  const yearPastGigs = pastGigs.filter(
    (g) => parseLocalDate(g.date).getFullYear() === currentYear,
  );
  const yearFutureGigs = futureGigs.filter(
    (g) => parseLocalDate(g.date).getFullYear() === currentYear,
  );
  const yearCollected = yearPastGigs.reduce(
    (acc, g) => acc + (effectiveCollected(g) ?? 0),
    0,
  );
  const yearPendingPast = yearPastGigs.reduce((acc, g) => {
    const ea = effectiveAmount(g) ?? 0;
    const ec = effectiveCollected(g) ?? 0;
    return acc + Math.max(0, ea - ec);
  }, 0);
  const yearFutureAmt = yearFutureGigs.reduce(
    (acc, g) => acc + (effectiveAmount(g) ?? 0),
    0,
  );
  const yearBarTotal = yearCollected + yearPendingPast + yearFutureAmt;
  const yearCollectedPct =
    yearBarTotal > 0 ? (yearCollected / yearBarTotal) * 100 : 0;
  const yearPendingPct =
    yearBarTotal > 0 ? (yearPendingPast / yearBarTotal) * 100 : 0;
  const yearFuturePct =
    yearBarTotal > 0 ? (yearFutureAmt / yearBarTotal) * 100 : 0;

  // ── Comparativa mensual (cobros reales) ──
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const prevMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const collectedThisMonth = pastGigs
    .filter((g) => {
      const d = parseLocalDate(g.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((acc, g) => acc + (effectiveCollected(g) ?? 0), 0);

  const collectedPrevMonth = pastGigs
    .filter((g) => {
      const d = parseLocalDate(g.date);
      return (
        d.getMonth() === prevMonthDate.getMonth() &&
        d.getFullYear() === prevMonthDate.getFullYear()
      );
    })
    .reduce((acc, g) => acc + (effectiveCollected(g) ?? 0), 0);

  const monthDiff =
    collectedPrevMonth > 0
      ? ((collectedThisMonth - collectedPrevMonth) / collectedPrevMonth) * 100
      : null;

  // ── Mejor mes (por cobrado) ──
  const byMonth = new Map<string, { total: number; label: string }>();
  pastGigsWithCollected.forEach((g) => {
    const d = parseLocalDate(g.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
    const prev = byMonth.get(key);
    byMonth.set(key, {
      total: (prev?.total ?? 0) + (effectiveCollected(g) ?? 0),
      label,
    });
  });
  const bestMonth =
    [...byMonth.values()].sort((a, b) => b.total - a.total)[0] ?? null;

  // ── Tabla ──
  const tableGigs =
    tab === "pasadas"
      ? allPastGigs
      : tab === "proximas"
        ? allFutureGigs
        : gigs;

  const tableTotal = tableGigs.reduce(
    (acc, g) => acc + (effectiveAmount(g) ?? 0),
    0,
  );
  const tableHours = tableGigs.reduce((acc, g) => acc + Number(g.hours), 0);

  const isEmpty = !loading && gigs.length === 0;

  // ── Handlers de gastos ──
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;
    setSavingExpense(true);
    try {
      const res = await api.post("/expenses", {
        amount: Number(expAmount),
        category: expCategory,
        description: expDescription || null,
        date: expDate,
      });
      setExpenses((prev) => [res.data.data, ...prev]);
      setExpAmount("");
      setExpDescription("");
      setExpDate(new Date().toISOString().split("T")[0]);
      setShowExpenseForm(false);
    } catch (error) {
      console.error("Error al guardar gasto:", error);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Finanzas
        </h1>
        <p className="text-zinc-600 text-sm mt-0.5">
          Tu dinero real y lo que viene
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <DollarSign size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin datos financieros
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Cuando agregues tocadas y registres cobros, aquí verás tu resumen real.
          </p>
        </div>
      ) : (
        <>
          {/* ── Barra anual 3 colores ── */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">
                  Progreso {currentYear}
                </p>
                <p className="text-sm text-zinc-300 mt-0.5 flex flex-wrap gap-x-2">
                  <span>
                    <span className="text-green-400 font-bold">
                      ${fmt(yearCollected)}
                    </span>
                    <span className="text-zinc-600"> cobrados</span>
                  </span>
                  {yearPendingPast > 0 && (
                    <span>
                      <span className="text-yellow-400 font-bold">
                        · ${fmt(yearPendingPast)}
                      </span>
                      <span className="text-zinc-600"> por cobrar</span>
                    </span>
                  )}
                  {yearFutureAmt > 0 && (
                    <span>
                      <span className="text-blue-400 font-bold">
                        · ${fmt(yearFutureAmt)}
                      </span>
                      <span className="text-zinc-600"> por venir</span>
                    </span>
                  )}
                </p>
              </div>
              <span className="text-2xl font-bold text-white">
                {yearBarTotal > 0 ? `${yearCollectedPct.toFixed(0)}%` : "—"}
              </span>
            </div>
            {loading ? (
              <Skeleton className="h-3 w-full rounded-full" />
            ) : (
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-linear-to-r from-green-600 to-green-400 transition-all duration-700"
                  style={{ width: `${yearCollectedPct}%` }}
                />
                <div
                  className="h-full bg-linear-to-r from-yellow-700/70 to-yellow-500/50 transition-all duration-700"
                  style={{ width: `${yearPendingPct}%` }}
                />
                <div
                  className="h-full bg-linear-to-r from-blue-700/60 to-blue-500/40 transition-all duration-700"
                  style={{ width: `${yearFuturePct}%` }}
                />
              </div>
            )}
            <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Cobrado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500/70 inline-block" />
                Por cobrar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500/60 inline-block" />
                Por venir
              </span>
            </div>
          </div>

          {/* ── Sección: En tu bolsa ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                En tu bolsa
              </h2>
              <span className="text-xs text-zinc-700">
                · {pastGigs.length} tocadas realizadas
              </span>
            </div>

            {/* Hero: resultado neto + cobrado + gastos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hero neto */}
              <div className="col-span-2 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl hover:border-zinc-600 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <Wallet size={16} className="text-purple-400" />
                </div>
                <p className="text-zinc-500 text-xs font-medium">Resultado neto</p>
                {loading ? (
                  <div className="h-9 w-44 bg-zinc-800 rounded animate-pulse mt-1.5" />
                ) : (
                  <h3
                    className={`text-3xl font-bold mt-1 ${
                      netIncome >= 0 ? "text-white" : "text-red-400"
                    }`}
                  >
                    ${fmt(netIncome)}
                  </h3>
                )}
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  {hasCollectedTracking
                    ? `$${fmt(totalCollected)} cobrados − $${fmt(totalExpenses)} gastos`
                    : "Registra cobros para ver tu resultado real"}
                </p>
              </div>

              {/* Cobrado */}
              <div className="bg-zinc-900 border border-green-500/20 p-5 rounded-2xl hover:border-green-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <DollarSign size={16} className="text-green-400" />
                </div>
                <p className="text-zinc-500 text-xs font-medium">Cobrado</p>
                {loading ? (
                  <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse mt-1.5" />
                ) : (
                  <h3 className="text-xl font-bold mt-1 text-green-400">
                    ${fmt(totalCollected)}
                  </h3>
                )}
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  {pastGigsWithCollected.length} tocadas registradas
                </p>
              </div>

              {/* Gastos */}
              <div className="bg-zinc-900 border border-red-500/20 p-5 rounded-2xl hover:border-red-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                  <ShoppingBag size={16} className="text-red-400" />
                </div>
                <p className="text-zinc-500 text-xs font-medium">Gastos</p>
                {loading ? (
                  <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse mt-1.5" />
                ) : (
                  <h3 className="text-xl font-bold mt-1 text-red-400">
                    ${fmt(totalExpenses)}
                  </h3>
                )}
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  {expenses.length} registros
                  {topCategory && ` · más en ${topCategory[0]}`}
                </p>
              </div>
            </div>

            {/* Segunda fila: métricas ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <Card
                loading={loading}
                icon={<AlertCircle size={16} className="text-yellow-400" />}
                color="yellow"
                title="Por cobrar"
                value={`$${fmt(pendingFromPast)}`}
                sub="Tocadas pasadas sin cobrar todo"
              />
              <Card
                loading={loading}
                icon={<HelpCircle size={16} className="text-zinc-400" />}
                color="purple"
                title="Sin registrar"
                value={`${unregisteredPastCount} tocada${unregisteredPastCount !== 1 ? "s" : ""}`}
                sub="Sin dato de cobro"
              />
              <Card
                loading={loading}
                icon={<BarChart3 size={16} className="text-blue-400" />}
                color="blue"
                title="Tarifa real / hora"
                value={tarifaReal > 0 ? `$${fmt(tarifaReal)}` : "—"}
                sub="Cobrado ÷ horas trabajadas"
              />
              <Card
                loading={loading}
                icon={<Clock size={16} className="text-zinc-400" />}
                color="purple"
                title="Horas tocadas"
                value={`${earnedHours.toLocaleString("en-US")} hrs`}
                sub="Tiempo trabajado"
              />
            </div>

            {/* Barra cobrado vs por cobrar */}
            {!loading && hasCollectedTracking && (() => {
              const total = totalCollected + pendingFromPast;
              const pct = total > 0 ? (totalCollected / total) * 100 : 0;
              return total > 0 ? (
                <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">
                      Cobrado vs Pendiente
                    </p>
                    <span className="text-sm font-bold text-white">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-linear-to-r from-green-600 to-green-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="h-full bg-linear-to-r from-yellow-700/60 to-yellow-500/40 transition-all duration-700"
                      style={{ width: `${100 - pct}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Cobrado
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500/60 inline-block" />
                      Por cobrar
                    </span>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Lista de tocadas con cobro pendiente */}
            {!loading && pendingGigsList.length > 0 && (
              <div className="mt-4 bg-zinc-900/50 border border-yellow-500/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800/60">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                    Tocadas pasadas con cobro incompleto
                  </p>
                </div>
                {pendingGigsList.map((gig, idx) => {
                  const ea = effectiveAmount(gig);
                  const ec = effectiveCollected(gig) ?? 0;
                  const falta = ea != null ? ea - ec : null;
                  const pct = ea != null && ea > 0 ? (ec / ea) * 100 : null;
                  const isLast = idx === pendingGigsList.length - 1;
                  return (
                    <div
                      key={gig.id}
                      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? "border-b border-zinc-800/60" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-zinc-300 truncate">
                            {gig.title}
                          </p>
                          {gig.band_name && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold shrink-0">
                              {gig.band_name}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs text-zinc-600 mt-0.5 capitalize"
                          suppressHydrationWarning
                        >
                          {fmtDate(gig.date)}
                        </p>
                        {pct !== null && (
                          <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden w-full max-w-48">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {ec > 0 && (
                          <p className="text-xs text-zinc-500">
                            Cobrado ${fmt(ec)}
                          </p>
                        )}
                        {falta !== null ? (
                          <p className="text-sm font-bold text-yellow-400">
                            Falta ${fmt(falta)}
                          </p>
                        ) : (
                          <p className="text-sm font-bold text-zinc-600 italic">
                            Sin monto
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Este mes vs anterior + Mejor mes */}
            {!loading && pastGigs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      monthDiff === null
                        ? "bg-zinc-800"
                        : monthDiff >= 0
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    {monthDiff === null ? (
                      <BarChart3 size={18} className="text-zinc-600" />
                    ) : monthDiff >= 0 ? (
                      <TrendingUp size={18} className="text-green-400" />
                    ) : (
                      <TrendingDown size={18} className="text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide mb-0.5">
                      Cobrado este mes vs anterior
                    </p>
                    <p className="text-xl font-bold">
                      {collectedThisMonth > 0
                        ? `$${fmt(collectedThisMonth)}`
                        : "$0.00"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 capitalize">
                      {monthDiff !== null ? (
                        <span
                          className={
                            monthDiff >= 0 ? "text-green-500" : "text-red-400"
                          }
                        >
                          {monthDiff >= 0 ? "+" : ""}
                          {monthDiff.toFixed(1)}% vs{" "}
                          <span suppressHydrationWarning>
                            {prevMonthDate.toLocaleDateString("es-MX", {
                              month: "long",
                            })}
                          </span>
                        </span>
                      ) : (
                        "Sin cobros registrados para comparar"
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Star size={18} className="text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide mb-0.5">
                      Mejor mes cobrado
                    </p>
                    <p className="text-xl font-bold text-yellow-400">
                      {bestMonth ? `$${fmt(bestMonth.total)}` : "—"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 capitalize">
                      {bestMonth?.label ?? "Registra cobros para verlo"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Sección: Gastos ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Gastos
                </h2>
                <span className="text-xs text-zinc-700">
                  · {expenses.length} registros
                </span>
              </div>
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Agregar gasto
              </button>
            </div>

            {expenses.length === 0 && !showExpenseForm ? (
              <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-2xl p-6 text-center">
                <p className="text-zinc-600 text-sm">
                  Registra tus gastos para ver tu ingreso real neto.
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  Baquetas, cañas, reparaciones, transporte…
                </p>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="mt-3 text-xs text-purple-500 hover:text-purple-400 transition-colors cursor-pointer"
                >
                  + Agregar primer gasto
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Form inline */}
                {showExpenseForm && (
                  <form
                    onSubmit={handleAddExpense}
                    className="p-5 border-b border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">
                        Nuevo gasto
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowExpenseForm(false)}
                        className="text-zinc-600 hover:text-white cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Monto $"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg outline-none focus:border-red-500 text-white placeholder:text-zinc-500 text-sm"
                        required
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                      <select
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg outline-none focus:border-red-500 text-white text-sm"
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Descripción (opcional)"
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg outline-none focus:border-red-500 text-white placeholder:text-zinc-500 text-sm"
                      />
                      <input
                        type="date"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg outline-none focus:border-red-500 text-white text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={savingExpense || !expAmount}
                      className="w-full bg-red-600/80 hover:bg-red-600 font-bold cursor-pointer"
                    >
                      Guardar gasto
                    </Button>
                  </form>
                )}

                {/* Lista de gastos */}
                {expenses.map((expense, idx) => {
                  const isLast = idx === expenses.length - 1;
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/20 transition-colors ${
                        !isLast ? "border-b border-zinc-800/40" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <ShoppingBag size={13} className="text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-300">
                            {expense.category}
                          </span>
                          {expense.description && (
                            <span className="text-xs text-zinc-600 truncate">
                              · {expense.description}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs text-zinc-600 mt-0.5"
                          suppressHydrationWarning
                        >
                          {fmtDate(expense.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-red-400">
                          −${fmt(Number(expense.amount))}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {expenses.length === 0 && showExpenseForm && (
                  <div className="py-6 text-center text-zinc-700 text-sm">
                    Aún no hay gastos registrados.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Sección: Próximas ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Por venir
              </h2>
              <span className="text-xs text-zinc-700">
                · {allFutureGigs.length} tocadas próximas
              </span>
            </div>

            {allFutureGigs.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 text-center">
                <p className="text-zinc-700 text-sm">
                  No hay tocadas futuras registradas.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    loading={loading}
                    icon={<Banknote size={16} className="text-blue-400" />}
                    color="blue"
                    title="Total esperado"
                    value={pending > 0 ? `$${fmt(pending)}` : "—"}
                    sub="Ingresos contratados"
                  />
                  <Card
                    loading={loading}
                    icon={<Music size={16} className="text-purple-400" />}
                    color="purple"
                    title="Tocadas agendadas"
                    value={allFutureGigs.length.toString()}
                    sub="Próximos eventos"
                  />
                  <Card
                    loading={loading}
                    icon={<Hourglass size={16} className="text-cyan-400" />}
                    color="cyan"
                    title="Horas agendadas"
                    value={`${allFutureGigs.reduce((a, g) => a + Number(g.hours), 0).toLocaleString("en-US")} hrs`}
                    sub="Tiempo comprometido"
                  />
                </div>

                <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  {allFutureGigs.map((gig, idx) => {
                    const d = parseLocalDate(gig.date);
                    const isLast = idx === allFutureGigs.length - 1;
                    const ea = effectiveAmount(gig);
                    return (
                      <div
                        key={gig.id}
                        className={`flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors ${
                          !isLast ? "border-b border-zinc-800/60" : ""
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-blue-400 leading-none">
                            {d.getDate()}
                          </span>
                          <span
                            className="text-[9px] text-blue-400/60 uppercase mt-0.5"
                            suppressHydrationWarning
                          >
                            {d
                              .toLocaleDateString("es-MX", { month: "short" })
                              .replace(".", "")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-white truncate">
                              {gig.title}
                            </p>
                            {gig.band_name && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center gap-0.5 shrink-0">
                                <Users2 size={8} />
                                {gig.band_name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin size={10} /> {gig.place}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {gig.hours} hrs
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {ea !== null ? (
                            <>
                              <p className="text-sm font-bold text-blue-300">
                                ${fmt(ea)}
                              </p>
                              <p className="text-[10px] text-zinc-600 mt-0.5">
                                Contratado
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-zinc-700 italic">
                              Sin monto
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* ── Tabla detalle ── */}
          <section>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex border-b border-zinc-800">
                {(["pasadas", "proximas", "todas"] as TableTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                      tab === t
                        ? "text-purple-400 border-b-2 border-purple-500 -mb-px"
                        : "text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {t === "pasadas"
                      ? `Realizadas (${allPastGigs.length})`
                      : t === "proximas"
                        ? `Próximas (${allFutureGigs.length})`
                        : `Todas (${gigs.length})`}
                  </button>
                ))}
              </div>

              {tableGigs.length === 0 ? (
                <div className="py-12 text-center text-zinc-700 text-sm">
                  Sin eventos en esta categoría
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-600 text-[11px] uppercase border-b border-zinc-800 bg-zinc-900/30">
                        <th className="px-5 py-3 text-left font-semibold">
                          Evento
                        </th>
                        <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">
                          Lugar
                        </th>
                        <th className="px-5 py-3 text-left font-semibold">
                          Fecha
                        </th>
                        <th className="px-5 py-3 text-right font-semibold hidden sm:table-cell">
                          Horas
                        </th>
                        <th className="px-5 py-3 text-right font-semibold hidden sm:table-cell">
                          Pactado
                        </th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Cobrado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableGigs.map((gig) => {
                        const isPast = parseLocalDate(gig.date) < today;
                        const ea = effectiveAmount(gig);
                        const ec = isPast ? effectiveCollected(gig) : null;
                        return (
                          <tr
                            key={gig.id}
                            className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors last:border-0"
                          >
                            <td className="px-5 py-3 font-medium">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-zinc-200">
                                  {gig.title}
                                </span>
                                {gig.band_name && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold shrink-0">
                                    {gig.band_name}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-zinc-500 hidden md:table-cell">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {gig.place}
                              </span>
                            </td>
                            <td
                              className="px-5 py-3 text-zinc-500 whitespace-nowrap capitalize"
                              suppressHydrationWarning
                            >
                              {fmtDate(gig.date)}
                            </td>
                            <td className="px-5 py-3 text-right text-zinc-500 hidden sm:table-cell">
                              {Number(gig.hours).toLocaleString("en-US")}
                            </td>
                            <td className="px-5 py-3 text-right text-zinc-600 hidden sm:table-cell whitespace-nowrap">
                              {ea !== null ? (
                                `$${fmt(ea)}`
                              ) : (
                                <span className="italic text-zinc-700 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right font-bold whitespace-nowrap">
                              {!isPast ? (
                                <span className="text-zinc-700 text-xs">—</span>
                              ) : ec !== null ? (
                                <span className="text-green-400">
                                  ${fmt(ec)}
                                </span>
                              ) : (
                                <span className="text-zinc-700 text-xs italic">
                                  Sin registrar
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-zinc-900/40">
                        <td
                          className="px-5 py-3.5 font-bold text-zinc-300"
                          colSpan={3}
                        >
                          Total
                        </td>
                        <td className="px-5 py-3.5 text-right text-zinc-500 hidden sm:table-cell">
                          {tableHours.toLocaleString("en-US")} hrs
                        </td>
                        <td className="px-5 py-3.5 text-right text-zinc-600 hidden sm:table-cell">
                          ${fmt(tableTotal)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-green-400">
                          $
                          {fmt(
                            tableGigs
                              .filter((g) => parseLocalDate(g.date) < today)
                              .reduce(
                                (acc, g) => acc + (effectiveCollected(g) ?? 0),
                                0,
                              ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ── Card component ────────────────────────────────────
const colorMap: Record<string, string> = {
  green: "bg-green-500/10",
  purple: "bg-purple-500/10",
  blue: "bg-blue-500/10",
  yellow: "bg-yellow-500/10",
  cyan: "bg-cyan-500/10",
};

function Card({
  icon,
  title,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg ${colorMap[color] ?? "bg-zinc-800"} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-zinc-500 text-xs font-medium">{title}</p>
      {loading ? (
        <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse mt-1.5" />
      ) : (
        <h3 className="text-xl font-bold mt-1">{value}</h3>
      )}
      <p className="text-[11px] text-zinc-600 mt-1.5">{sub}</p>
    </div>
  );
}
