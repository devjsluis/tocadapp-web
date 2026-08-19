"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  MapPin,
  Hourglass,
  Banknote,
  Star,
  Users2,
  Wallet,
  ShoppingBag,
  Pencil,
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

type FinancialMovementType = "INCOME" | "EXPENSE";

type MovementScope = "GENERAL" | "BAND" | "GIG";

interface Band {
  id: number;
  name: string;
}

interface FinancialMovement {
  id: string;
  user_id: number;
  gig_id: number | null;
  band_id: number | null;
  type: FinancialMovementType;
  amount: number | string;
  category: string;
  description?: string | null;
  date: string;

  gig_title?: string | null;
  gig_date?: string | null;
  gig_place?: string | null;
  band_name?: string | null;
}

type TableTab = "pasadas" | "proximas" | "todas";

type FinancePeriod = "all" | "today" | "week" | "month" | "year" | "custom";
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

const INCOME_CATEGORIES = [
  "Propina",
  "Ensayo",
  "Partitura",
  "Clase",
  "Grabación",
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

function effectiveCollected(gig: Gig): number | null {
  if (gig.is_owner)
    return gig.collected_amount != null ? Number(gig.collected_amount) : null;
  return gig.my_collected != null ? Number(gig.my_collected) : null;
}

function countsInFinances(gig: Gig): boolean {
  return effectiveCollected(gig) !== null;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-zinc-800 rounded animate-pulse ${className}`} />
);

export default function FinancesPage() {
  const [bands, setBands] = useState<Band[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TableTab>("pasadas");
  const [period, setPeriod] = useState<FinancePeriod>("all");
  const [selectedBand, setSelectedBand] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Financial movement form state
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementType, setMovementType] =
    useState<FinancialMovementType>("EXPENSE");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementCategory, setMovementCategory] = useState(
    EXPENSE_CATEGORIES[0],
  );
  const [movementDescription, setMovementDescription] = useState("");
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [movementScope, setMovementScope] = useState<MovementScope>("GENERAL");
  const [movementBandId, setMovementBandId] = useState("");
  const [movementGigId, setMovementGigId] = useState("");
  const [savingMovement, setSavingMovement] = useState(false);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(
    null,
  );
  const [movementToDelete, setMovementToDelete] =
    useState<FinancialMovement | null>(null);

  const [deletingMovement, setDeletingMovement] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/gigs"),
      api.get("/bands"),
      api.get("/financial-movements").catch(() => ({ data: { data: [] } })),
    ])
      .then(([gigsRes, bandsRes, movementsRes]) => {
        setGigs(gigsRes.data.data);
        setBands(bandsRes.data.data);
        setMovements(movementsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableBands = Array.from(
    new Set(
      gigs
        .map((gig) => gig.band_name?.trim())
        .filter((bandName): bandName is string => Boolean(bandName)),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const isGigInsideSelectedPeriod = (gig: Gig): boolean => {
    if (period === "all") {
      return true;
    }

    const gigDate = parseLocalDate(gig.date);

    const startOfToday = new Date(today);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    if (period === "today") {
      return gigDate >= startOfToday && gigDate <= endOfToday;
    }

    if (period === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return gigDate >= weekStart && gigDate <= weekEnd;
    }

    if (period === "month") {
      return (
        gigDate.getMonth() === today.getMonth() &&
        gigDate.getFullYear() === today.getFullYear()
      );
    }

    if (period === "year") {
      return gigDate.getFullYear() === today.getFullYear();
    }

    if (period === "custom") {
      if (!customStartDate || !customEndDate) {
        return true;
      }

      const startDate = parseLocalDate(customStartDate);
      const endDate = parseLocalDate(customEndDate);
      endDate.setHours(23, 59, 59, 999);

      return gigDate >= startDate && gigDate <= endDate;
    }

    return true;
  };

  const isGigInsideSelectedBand = (gig: Gig): boolean => {
    if (selectedBand === "all") {
      return true;
    }

    if (selectedBand === "personal") {
      return !gig.band_name;
    }

    return gig.band_name === selectedBand;
  };

  const filteredGigs = gigs.filter(
    (gig) => isGigInsideSelectedPeriod(gig) && isGigInsideSelectedBand(gig),
  );

  const allPastGigs = filteredGigs.filter(
    (gig) => parseLocalDate(gig.date) < today,
  );
  const allFutureGigs = filteredGigs
    .filter((g) => parseLocalDate(g.date) >= today)
    .sort(
      (a, b) =>
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
    );

  const pastGigs = allPastGigs.filter(countsInFinances);

  // ── Cobros: única fuente de verdad financiera ──
  const totalCollected = pastGigs.reduce(
    (acc, g) => acc + (effectiveCollected(g) ?? 0),
    0,
  );
  const collectedHours = pastGigs.reduce((acc, g) => acc + Number(g.hours), 0);
  // Excluir tocadas gratis (cobro = 0) de tarifa/hora y promedio
  const paidGigs = pastGigs.filter((g) => (effectiveCollected(g) ?? 0) > 0);
  const paidHours = paidGigs.reduce((acc, g) => acc + Number(g.hours), 0);
  const tarifaReal = paidHours > 0 ? totalCollected / paidHours : 0;

  const earningsByBand = paidGigs.reduce((acc, gig) => {
    const bandName = gig.band_name?.trim() || "Eventos personales";
    const collected = effectiveCollected(gig) ?? 0;

    const current = acc.get(bandName) ?? {
      name: bandName,
      total: 0,
      gigs: 0,
    };

    current.total += collected;
    current.gigs += 1;

    acc.set(bandName, current);

    return acc;
  }, new Map<string, { name: string; total: number; gigs: number }>());

  const topEarningBand =
    Array.from(earningsByBand.values()).sort(
      (first, second) => second.total - first.total,
    )[0] ?? null;

  const filteredMovements = movements.filter((movement) => {
    const movementDate = parseLocalDate(movement.date);

    let insidePeriod = true;

    if (period === "today") {
      const start = new Date(today);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      insidePeriod = movementDate >= start && movementDate <= end;
    }

    if (period === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      insidePeriod = movementDate >= weekStart && movementDate <= weekEnd;
    }

    if (period === "month") {
      insidePeriod =
        movementDate.getMonth() === today.getMonth() &&
        movementDate.getFullYear() === today.getFullYear();
    }

    if (period === "year") {
      insidePeriod = movementDate.getFullYear() === today.getFullYear();
    }

    if (period === "custom") {
      if (customStartDate && customEndDate) {
        const start = parseLocalDate(customStartDate);
        const end = parseLocalDate(customEndDate);
        end.setHours(23, 59, 59, 999);

        insidePeriod = movementDate >= start && movementDate <= end;
      }
    }

    if (!insidePeriod) return false;

    if (selectedBand === "all") {
      return true;
    }

    if (selectedBand === "personal") {
      return movement.gig_id !== null && movement.band_id === null;
    }

    return movement.band_name === selectedBand;
  });

  // ── Movimientos financieros ──
  const expenses = filteredMovements.filter(
    (movement) => movement.type === "EXPENSE",
  );

  const extraIncomes = filteredMovements.filter(
    (movement) => movement.type === "INCOME",
  );

  const totalExpenses = expenses.reduce(
    (acc, movement) => acc + Number(movement.amount),
    0,
  );

  const totalExtraIncome = extraIncomes.reduce(
    (acc, movement) => acc + Number(movement.amount),
    0,
  );

  const totalIncome = totalCollected + totalExtraIncome;

  const netIncome = totalIncome - totalExpenses;

  const expensesByCategory = expenses.reduce(
    (acc, movement) => {
      acc[movement.category] =
        (acc[movement.category] ?? 0) + Number(movement.amount);

      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory =
    Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0] ?? null;

  // ── Barra anual (2 segmentos: cobrado · tocadas por hacer) ──
  const currentYear = today.getFullYear();
  const yearPastGigs = pastGigs.filter(
    (g) => parseLocalDate(g.date).getFullYear() === currentYear,
  );
  const yearFutureGigs = allFutureGigs.filter(
    (g) => parseLocalDate(g.date).getFullYear() === currentYear,
  );
  const yearCollected = yearPastGigs.reduce(
    (acc, g) => acc + (effectiveCollected(g) ?? 0),
    0,
  );
  const yearFutureCount = yearFutureGigs.length;
  const yearPastCount = yearPastGigs.length;
  const yearTotalGigs = yearPastCount + yearFutureCount;
  const yearCollectedPct =
    yearTotalGigs > 0 ? (yearPastCount / yearTotalGigs) * 100 : 0;

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
  pastGigs.forEach((g) => {
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
        : filteredGigs;

  const tableHours = tableGigs.reduce((acc, g) => acc + Number(g.hours), 0);

  const isEmpty = !loading && gigs.length === 0 && movements.length === 0;

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!movementAmount) return;

    setSavingMovement(true);

    const payload = {
      type: movementType,
      amount: Number(movementAmount),
      category: movementCategory,
      description: movementDescription || null,
      date: movementDate,

      gig_id:
        movementScope === "GIG" && movementGigId ? Number(movementGigId) : null,

      band_id:
        movementScope === "BAND" && movementBandId
          ? Number(movementBandId)
          : null,
    };

    try {
      if (editingMovementId) {
        await api.put(`/financial-movements/${editingMovementId}`, payload);
      } else {
        await api.post("/financial-movements", payload);
      }

      const movementsRes = await api.get("/financial-movements");

      setMovements(movementsRes.data.data);

      setMovementAmount("");
      setMovementDescription("");
      setMovementDate(new Date().toISOString().split("T")[0]);
      setMovementGigId("");
      setMovementBandId("");
      setMovementScope("GENERAL");
      setMovementType("EXPENSE");
      setMovementCategory(EXPENSE_CATEGORIES[0]);
      setEditingMovementId(null);
      setShowMovementForm(false);
    } catch (error) {
      console.error(
        editingMovementId
          ? "Error al actualizar movimiento:"
          : "Error al guardar movimiento:",
        error,
      );
    } finally {
      setSavingMovement(false);
    }
  };

  const handleEditMovement = (movement: FinancialMovement) => {
    setEditingMovementId(movement.id);
    setMovementType(movement.type);
    setMovementAmount(String(movement.amount));
    setMovementCategory(movement.category);
    setMovementDescription(movement.description ?? "");
    setMovementDate(movement.date.split("T")[0]);

    if (movement.gig_id !== null) {
      setMovementScope("GIG");
      setMovementGigId(String(movement.gig_id));
      setMovementBandId("");
    } else if (movement.band_id !== null) {
      setMovementScope("BAND");
      setMovementBandId(String(movement.band_id));
      setMovementGigId("");
    } else {
      setMovementScope("GENERAL");
      setMovementBandId("");
      setMovementGigId("");
    }

    setShowMovementForm(true);
  };

  const handleDeleteMovement = async () => {
    if (!movementToDelete || deletingMovement) {
      return;
    }

    try {
      setDeletingMovement(true);

      await api.delete(`/financial-movements/${movementToDelete.id}`);

      setMovements((prev) =>
        prev.filter((movement) => movement.id !== movementToDelete.id),
      );

      setMovementToDelete(null);
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    } finally {
      setDeletingMovement(false);
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

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Periodo
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {(
                [
                  { value: "all", label: "Todo" },
                  { value: "today", label: "Hoy" },
                  { value: "week", label: "Semana" },
                  { value: "month", label: "Mes" },
                  { value: "year", label: "Año" },
                  { value: "custom", label: "Personalizado" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    period === option.value
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-800 text-zinc-500 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {period === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="finance-start-date"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Desde
                </label>

                <input
                  id="finance-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label
                  htmlFor="finance-end-date"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Hasta
                </label>

                <input
                  id="finance-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="finance-band-filter"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500"
            >
              Banda
            </label>

            <select
              id="finance-band-filter"
              value={selectedBand}
              onChange={(event) => setSelectedBand(event.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-purple-500 sm:max-w-sm"
            >
              <option value="all">Todas las bandas</option>
              <option value="personal">Eventos personales</option>

              {availableBands.map((bandName) => (
                <option key={bandName} value={bandName}>
                  {bandName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <DollarSign size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin datos financieros
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Cuando agregues tocadas y registres cobros, aquí verás tu resumen
            real.
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
                    <span className="text-zinc-600">
                      {" "}
                      cobrados en {yearPastCount} tocadas
                    </span>
                  </span>
                  {yearFutureCount > 0 && (
                    <span className="text-zinc-600">
                      · {yearFutureCount} por venir
                    </span>
                  )}
                </p>
              </div>
              <span className="text-2xl font-bold text-white">
                {yearTotalGigs > 0 ? `${yearCollectedPct.toFixed(0)}%` : "—"}
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
                  className="h-full bg-zinc-700/40 transition-all duration-700"
                  style={{ width: `${100 - yearCollectedPct}%` }}
                />
              </div>
            )}
            <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Tocadas realizadas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Hero neto */}
              <div className="col-span-2 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl hover:border-zinc-600 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <Wallet size={16} className="text-purple-400" />
                </div>
                <p className="text-zinc-500 text-xs font-medium">
                  Resultado neto
                </p>
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
                  ${fmt(totalCollected)} cobrado + ${fmt(totalExtraIncome)}{" "}
                  extra − ${fmt(totalExpenses)} gastos
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
                  {pastGigs.length} tocadas realizadas
                </p>
              </div>

              {/* Ingresos adicionales */}
              <div className="bg-zinc-900 border border-blue-500/20 p-5 rounded-2xl hover:border-blue-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <Plus size={16} className="text-blue-400" />
                </div>

                <p className="text-zinc-500 text-xs font-medium">
                  Ingresos extra
                </p>

                {loading ? (
                  <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse mt-1.5" />
                ) : (
                  <h3 className="text-xl font-bold mt-1 text-blue-400">
                    +${fmt(totalExtraIncome)}
                  </h3>
                )}

                <p className="text-[11px] text-zinc-600 mt-1.5">
                  {extraIncomes.length} registros
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

            {/* Segunda fila: métricas */}
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card
                loading={loading}
                icon={<BarChart3 size={16} className="text-blue-400" />}
                color="blue"
                title="Tarifa / hora"
                value={tarifaReal > 0 ? `$${fmt(tarifaReal)}` : "—"}
                sub="Cobrado ÷ horas trabajadas"
              />
              <Card
                loading={loading}
                icon={<Clock size={16} className="text-zinc-400" />}
                color="purple"
                title="Horas tocadas"
                value={`${collectedHours.toLocaleString("en-US")} hrs`}
                sub="Tiempo trabajado"
              />
              <Card
                loading={loading}
                icon={<TrendingUp size={16} className="text-purple-400" />}
                color="purple"
                title="Promedio / tocada"
                value={
                  paidGigs.length > 0
                    ? `$${fmt(totalCollected / paidGigs.length)}`
                    : "—"
                }
                sub={`${paidGigs.length} tocadas pagadas`}
              />
              <Card
                loading={loading}
                icon={<Users2 size={16} className="text-yellow-400" />}
                color="yellow"
                title={
                  selectedBand === "all"
                    ? "Origen con más ingresos"
                    : selectedBand === "personal"
                      ? "Eventos personales"
                      : "Ingresos con esta banda"
                }
                value={topEarningBand ? `$${fmt(topEarningBand.total)}` : "—"}
                sub={
                  topEarningBand
                    ? `${topEarningBand.name} · ${topEarningBand.gigs} ${
                        topEarningBand.gigs === 1 ? "tocada" : "tocadas"
                      }`
                    : "Sin cobros registrados"
                }
              />
            </div>

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

          {/* ── Sección: Movimientos financieros ── */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />

                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Movimientos
                </h2>

                <span className="text-xs text-zinc-700">
                  · {filteredMovements.length} registros
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingMovementId(null);
                  setMovementAmount("");
                  setMovementDescription("");
                  setMovementGigId("");
                  setMovementBandId("");
                  setMovementScope("GENERAL");
                  setMovementType("EXPENSE");
                  setMovementCategory(EXPENSE_CATEGORIES[0]);
                  setMovementDate(new Date().toISOString().split("T")[0]);
                  setShowMovementForm(true);
                }}
                className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                <Plus size={14} />
                Registrar movimiento
              </button>
            </div>

            {movements.length === 0 && !showMovementForm ? (
              <div className="rounded-2xl border border-dashed border-zinc-800/50 bg-zinc-900/30 p-6 text-center">
                <p className="text-sm text-zinc-600">
                  Registra ingresos y gastos para conocer tu resultado real.
                </p>

                <p className="mt-1 text-xs text-zinc-700">
                  Propinas, ensayos, gasolina, reparaciones, equipo…
                </p>

                <button
                  type="button"
                  onClick={() => setShowMovementForm(true)}
                  className="mt-3 cursor-pointer text-xs text-purple-500 transition-colors hover:text-purple-400"
                >
                  + Registrar primer movimiento
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                {showMovementForm && (
                  <form
                    onSubmit={handleSaveMovement}
                    className="space-y-4 border-b border-zinc-800 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {editingMovementId
                            ? "Editar movimiento"
                            : "Nuevo movimiento"}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-600">
                          Registra dinero que entra o sale.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMovementForm(false);
                          setEditingMovementId(null);
                          setMovementAmount("");
                          setMovementDescription("");
                          setMovementGigId("");
                          setMovementBandId("");
                          setMovementScope("GENERAL");
                          setMovementType("EXPENSE");
                        }}
                        className="cursor-pointer text-zinc-600 transition-colors hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Tipo */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Tipo
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMovementType("INCOME");
                            setMovementCategory(INCOME_CATEGORIES[0]);
                          }}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                            movementType === "INCOME"
                              ? "border-green-500/50 bg-green-500/10 text-green-400"
                              : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-white"
                          }`}
                        >
                          + Ingreso
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMovementType("EXPENSE");
                            setMovementCategory(EXPENSE_CATEGORIES[0]);
                          }}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                            movementType === "EXPENSE"
                              ? "border-red-500/50 bg-red-500/10 text-red-400"
                              : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-white"
                          }`}
                        >
                          − Gasto
                        </button>
                      </div>
                    </div>

                    {/* Monto y categoría */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="movement-amount"
                          className="mb-1.5 block text-xs font-medium text-zinc-500"
                        >
                          Monto
                        </label>

                        <input
                          id="movement-amount"
                          type="number"
                          placeholder="$0.00"
                          value={movementAmount}
                          onChange={(event) =>
                            setMovementAmount(event.target.value)
                          }
                          className={`w-full rounded-lg border bg-zinc-800 p-2.5 text-sm text-white outline-none placeholder:text-zinc-500 ${
                            movementType === "INCOME"
                              ? "border-zinc-700 focus:border-green-500"
                              : "border-zinc-700 focus:border-red-500"
                          }`}
                          required
                          min="0.01"
                          step="0.01"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="movement-category"
                          className="mb-1.5 block text-xs font-medium text-zinc-500"
                        >
                          Categoría
                        </label>

                        <select
                          id="movement-category"
                          value={movementCategory}
                          onChange={(event) =>
                            setMovementCategory(event.target.value)
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white outline-none focus:border-purple-500"
                        >
                          {(movementType === "INCOME"
                            ? INCOME_CATEGORIES
                            : EXPENSE_CATEGORIES
                          ).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Ámbito del movimiento */}
                    <div>
                      <p className="mb-2 text-xs font-medium text-zinc-500">
                        Relacionado con
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { value: "GENERAL", label: "General" },
                            { value: "BAND", label: "Banda" },
                            { value: "GIG", label: "Tocada" },
                          ] as const
                        ).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setMovementScope(option.value);

                              if (option.value !== "BAND") {
                                setMovementBandId("");
                              }

                              if (option.value !== "GIG") {
                                setMovementGigId("");
                              }
                            }}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                              movementScope === option.value
                                ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {movementScope === "BAND" && (
                        <div className="mt-3">
                          <label
                            htmlFor="movement-band"
                            className="mb-1.5 block text-xs font-medium text-zinc-500"
                          >
                            Banda
                          </label>

                          <select
                            id="movement-band"
                            value={movementBandId}
                            onChange={(event) =>
                              setMovementBandId(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white outline-none focus:border-purple-500"
                          >
                            <option value="">Selecciona una banda</option>

                            {bands.map((band) => (
                              <option key={band.id} value={band.id}>
                                {band.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {movementScope === "GIG" && (
                        <div className="mt-3">
                          <label
                            htmlFor="movement-gig"
                            className="mb-1.5 block text-xs font-medium text-zinc-500"
                          >
                            Tocada
                          </label>

                          <select
                            id="movement-gig"
                            value={movementGigId}
                            onChange={(event) =>
                              setMovementGigId(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white outline-none focus:border-purple-500"
                          >
                            <option value="">Selecciona una tocada</option>

                            {gigs
                              .slice()
                              .sort(
                                (first, second) =>
                                  parseLocalDate(second.date).getTime() -
                                  parseLocalDate(first.date).getTime(),
                              )
                              .map((gig) => (
                                <option key={gig.id} value={gig.id}>
                                  {fmtDate(gig.date)} · {gig.title} ·{" "}
                                  {gig.place}
                                  {gig.band_name ? ` · ${gig.band_name}` : ""}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      <p className="mt-1.5 text-[11px] text-zinc-600">
                        {movementScope === "GENERAL"
                          ? "Este movimiento contará en tus finanzas generales."
                          : movementScope === "BAND"
                            ? "Este movimiento contará para la banda seleccionada."
                            : "La banda se determinará automáticamente a partir de la tocada."}
                      </p>
                    </div>

                    {/* Descripción y fecha */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="movement-description"
                          className="mb-1.5 block text-xs font-medium text-zinc-500"
                        >
                          Descripción
                        </label>

                        <input
                          id="movement-description"
                          type="text"
                          placeholder="Opcional"
                          value={movementDescription}
                          onChange={(event) =>
                            setMovementDescription(event.target.value)
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="movement-date"
                          className="mb-1.5 block text-xs font-medium text-zinc-500"
                        >
                          Fecha
                        </label>

                        <input
                          id="movement-date"
                          type="date"
                          value={movementDate}
                          onChange={(event) =>
                            setMovementDate(event.target.value)
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingMovement || !movementAmount}
                      className={`w-full cursor-pointer font-bold ${
                        movementType === "INCOME"
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-red-600/80 hover:bg-red-600"
                      }`}
                    >
                      {savingMovement
                        ? "Guardando..."
                        : editingMovementId
                          ? "Guardar cambios"
                          : movementType === "INCOME"
                            ? "Registrar ingreso"
                            : "Registrar gasto"}
                    </Button>
                  </form>
                )}

                {/* Lista */}
                {filteredMovements.map((movement, index) => {
                  const isIncome = movement.type === "INCOME";
                  const isLast = index === movements.length - 1;

                  return (
                    <div
                      key={movement.id}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/20 ${
                        !isLast ? "border-b border-zinc-800/40" : ""
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isIncome ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp size={15} className="text-green-400" />
                        ) : (
                          <ShoppingBag size={14} className="text-red-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium text-zinc-300">
                            {movement.category}
                          </span>

                          {movement.description && (
                            <span className="truncate text-xs text-zinc-600">
                              · {movement.description}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-600">
                          <span suppressHydrationWarning>
                            {fmtDate(movement.date)}
                          </span>

                          {movement.gig_id ? (
                            <>
                              <span>·</span>

                              <span className="text-purple-400/70">
                                {movement.gig_title ?? "Tocada"}
                                {movement.gig_place
                                  ? ` · ${movement.gig_place}`
                                  : ""}
                              </span>

                              {movement.band_name ? (
                                <>
                                  <span>·</span>
                                  <span>{movement.band_name}</span>
                                </>
                              ) : null}
                            </>
                          ) : movement.band_id ? (
                            <>
                              <span>·</span>
                              <span className="text-blue-400/70">
                                {movement.band_name ?? "Banda"}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>·</span>
                              <span>General</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`text-sm font-bold ${
                            isIncome ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isIncome ? "+" : "−"}${fmt(Number(movement.amount))}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleEditMovement(movement)}
                          className="cursor-pointer text-zinc-700 transition-colors hover:text-purple-400"
                          title="Editar movimiento"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setMovementToDelete(movement)}
                          className="cursor-pointer text-zinc-700 transition-colors hover:text-red-400"
                          title="Eliminar movimiento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {movements.length === 0 && showMovementForm && (
                  <div className="py-6 text-center text-sm text-zinc-700">
                    Aún no hay movimientos registrados.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    loading={loading}
                    icon={<Banknote size={16} className="text-blue-400" />}
                    color="blue"
                    title="Tocadas por venir"
                    value={allFutureGigs.length.toString()}
                    sub="Próximos eventos agendados"
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
                          <p className="text-xs text-zinc-600 italic">
                            Por venir
                          </p>
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
                  <table className="w-full table-fixed text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[11px] uppercase text-zinc-600">
                        <th className="w-[42%] px-3 py-3 text-left font-semibold sm:w-auto sm:px-5">
                          Evento
                        </th>

                        <th className="hidden px-5 py-3 text-left font-semibold lg:table-cell">
                          Lugar
                        </th>

                        <th className="w-[30%] px-3 py-3 text-left font-semibold sm:w-auto sm:px-5">
                          Fecha
                        </th>

                        <th className="hidden px-5 py-3 text-right font-semibold sm:table-cell">
                          Horas
                        </th>

                        <th className="w-[28%] px-3 py-3 text-right font-semibold sm:w-auto sm:px-5">
                          Cobrado
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tableGigs.map((gig) => {
                        const isPast = parseLocalDate(gig.date) < today;
                        const ec = isPast ? effectiveCollected(gig) : null;

                        return (
                          <tr
                            key={gig.id}
                            className="border-b border-zinc-800/40 transition-colors last:border-0 hover:bg-zinc-800/20"
                          >
                            <td className="px-3 py-3 font-medium sm:px-5">
                              <div className="min-w-0">
                                <span className="block truncate text-zinc-200">
                                  {gig.title}
                                </span>

                                {gig.band_name && (
                                  <span className="mt-1 inline-block max-w-full truncate rounded-full border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">
                                    {gig.band_name}
                                  </span>
                                )}

                                <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-zinc-600 lg:hidden">
                                  <MapPin size={10} className="shrink-0" />
                                  {gig.place}
                                </span>
                              </div>
                            </td>

                            <td className="hidden px-5 py-3 text-zinc-500 lg:table-cell">
                              <span className="flex min-w-0 items-center gap-1">
                                <MapPin size={11} className="shrink-0" />
                                <span className="truncate">{gig.place}</span>
                              </span>
                            </td>

                            <td
                              className="px-3 py-3 text-zinc-500 capitalize sm:px-5"
                              suppressHydrationWarning
                            >
                              <span className="whitespace-nowrap">
                                {fmtDate(gig.date)}
                              </span>
                            </td>

                            <td className="hidden px-5 py-3 text-right text-zinc-500 sm:table-cell">
                              {Number(gig.hours).toLocaleString("en-US")}
                            </td>

                            <td className="px-3 py-3 text-right font-bold whitespace-nowrap sm:px-5">
                              {!isPast ? (
                                <span className="text-xs text-zinc-700">—</span>
                              ) : ec !== null ? (
                                <span className="text-green-400">
                                  ${fmt(ec)}
                                </span>
                              ) : (
                                <span className="text-xs italic text-zinc-700">
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
                        {/* Menos de 640 px: Evento + Fecha */}
                        <td
                          colSpan={2}
                          className="px-3 py-3.5 font-bold text-zinc-300 sm:hidden"
                        >
                          Total
                        </td>

                        {/* De 640 px a 1023 px: Evento + Fecha */}
                        <td
                          colSpan={2}
                          className="hidden px-5 py-3.5 font-bold text-zinc-300 sm:table-cell lg:hidden"
                        >
                          Total
                        </td>

                        {/* Desde 1024 px: Evento + Lugar + Fecha */}
                        <td
                          colSpan={3}
                          className="hidden px-5 py-3.5 font-bold text-zinc-300 lg:table-cell"
                        >
                          Total
                        </td>

                        <td className="hidden px-5 py-3.5 text-right text-zinc-500 sm:table-cell">
                          {tableHours.toLocaleString("en-US")} hrs
                        </td>

                        <td className="px-3 py-3.5 text-right font-bold whitespace-nowrap text-green-400 sm:px-5">
                          $
                          {fmt(
                            tableGigs
                              .filter((gig) => parseLocalDate(gig.date) < today)
                              .reduce(
                                (total, gig) =>
                                  total + (effectiveCollected(gig) ?? 0),
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

      {movementToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-movement-title"
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              if (!deletingMovement) {
                setMovementToDelete(null);
              }
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 size={20} className="text-red-400" />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-movement-title"
                  className="text-lg font-bold text-white"
                >
                  Eliminar movimiento
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <button
                type="button"
                disabled={deletingMovement}
                onClick={() => setMovementToDelete(null)}
                className="cursor-pointer text-zinc-600 transition-colors hover:text-white disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-200">
                    {movementToDelete.category}
                  </p>

                  {movementToDelete.description ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {movementToDelete.description}
                    </p>
                  ) : null}
                </div>

                <p
                  className={`shrink-0 text-base font-bold ${
                    movementToDelete.type === "INCOME"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {movementToDelete.type === "INCOME" ? "+" : "−"}$
                  {fmt(Number(movementToDelete.amount))}
                </p>
              </div>

              <div className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-600">
                <p>{fmtDate(movementToDelete.date)}</p>

                <p className="mt-1">
                  {movementToDelete.gig_id
                    ? [
                        movementToDelete.gig_title,
                        movementToDelete.gig_place,
                        movementToDelete.band_name,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Movimiento externo"}
                </p>
              </div>
            </div>

            {movementToDelete.gig_id ? (
              <p className="mt-4 text-xs leading-5 text-zinc-600">
                Sólo se eliminará este movimiento financiero. La tocada
                relacionada no será eliminada.
              </p>
            ) : null}

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={deletingMovement}
                onClick={() => setMovementToDelete(null)}
                className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={deletingMovement}
                onClick={() => void handleDeleteMovement()}
                className="flex-1 bg-red-600 font-bold text-white hover:bg-red-500"
              >
                {deletingMovement ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
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
