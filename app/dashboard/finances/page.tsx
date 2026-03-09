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
  Calendar,
  MapPin,
  Hourglass,
  Banknote,
  Star,
} from "lucide-react";

interface Gig {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  amount: number | string;
  hours: number | string;
}

type TableTab = "pasadas" | "proximas" | "todas";

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

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-zinc-800 rounded animate-pulse ${className}`} />
);

export default function FinancesPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TableTab>("pasadas");

  useEffect(() => {
    api
      .get("/gigs")
      .then(({ data }) => setGigs(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastGigs = gigs.filter((g) => parseLocalDate(g.date) < today);
  const futureGigs = gigs
    .filter((g) => parseLocalDate(g.date) >= today)
    .sort(
      (a, b) =>
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
    );

  // ── Métricas pasadas ──
  const earned = pastGigs.reduce((acc, g) => acc + Number(g.amount), 0);
  const earnedHours = pastGigs.reduce((acc, g) => acc + Number(g.hours), 0);
  const avgPerPastGig = pastGigs.length > 0 ? earned / pastGigs.length : 0;
  const avgPerHour = earnedHours > 0 ? earned / earnedHours : 0;

  // ── Métricas futuras ──
  const pending = futureGigs.reduce((acc, g) => acc + Number(g.amount), 0);
  const pendingHours = futureGigs.reduce((acc, g) => acc + Number(g.hours), 0);

  // ── Barra de progreso anual ──
  const currentYear = today.getFullYear();
  const yearGigs = gigs.filter((g) => parseLocalDate(g.date).getFullYear() === currentYear);
  const yearEarned = yearGigs
    .filter((g) => parseLocalDate(g.date) < today)
    .reduce((acc, g) => acc + Number(g.amount), 0);
  const yearTotal = yearGigs.reduce((acc, g) => acc + Number(g.amount), 0);
  const yearPct = yearTotal > 0 ? (yearEarned / yearTotal) * 100 : 0;

  // ── Comparativa mensual ──
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const prevMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const earnedThisMonth = pastGigs
    .filter((g) => {
      const d = parseLocalDate(g.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((acc, g) => acc + Number(g.amount), 0);

  const earnedPrevMonth = pastGigs
    .filter((g) => {
      const d = parseLocalDate(g.date);
      return (
        d.getMonth() === prevMonthDate.getMonth() &&
        d.getFullYear() === prevMonthDate.getFullYear()
      );
    })
    .reduce((acc, g) => acc + Number(g.amount), 0);

  const monthDiff =
    earnedPrevMonth > 0
      ? ((earnedThisMonth - earnedPrevMonth) / earnedPrevMonth) * 100
      : null;

  // ── Mejor mes ──
  const byMonth = new Map<string, { total: number; label: string }>();
  pastGigs.forEach((g) => {
    const d = parseLocalDate(g.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    const prev = byMonth.get(key);
    byMonth.set(key, { total: (prev?.total ?? 0) + Number(g.amount), label });
  });
  const bestMonth = [...byMonth.values()].sort((a, b) => b.total - a.total)[0] ?? null;

  // ── Tabla según tab ──
  const tableGigs =
    tab === "pasadas" ? pastGigs : tab === "proximas" ? futureGigs : gigs;
  const tableTotal = tableGigs.reduce((acc, g) => acc + Number(g.amount), 0);
  const tableHours = tableGigs.reduce((acc, g) => acc + Number(g.hours), 0);

  const isEmpty = !loading && gigs.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Finanzas
        </h1>
        <p className="text-zinc-600 text-sm mt-0.5">
          Ingresos realizados y proyección de lo que viene
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
            Cuando agregues tocadas, aquí verás tu resumen de ingresos.
          </p>
        </div>
      ) : (
        <>
          {/* ── Barra anual ── */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">
                  Progreso {currentYear}
                </p>
                <p className="text-sm text-zinc-300 mt-0.5">
                  <span className="text-green-400 font-bold">${fmt(yearEarned)}</span>
                  <span className="text-zinc-600"> ganados de </span>
                  <span className="font-semibold text-white">${fmt(yearTotal)}</span>
                  <span className="text-zinc-600"> contratados</span>
                </p>
              </div>
              <span className="text-2xl font-bold text-white">
                {yearPct.toFixed(0)}%
              </span>
            </div>
            {loading ? (
              <Skeleton className="h-3 w-full rounded-full" />
            ) : (
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                {/* Ganado */}
                <div
                  className="h-full bg-linear-to-r from-green-600 to-green-400 rounded-l-full transition-all duration-700"
                  style={{ width: `${yearPct}%` }}
                />
                {/* Pendiente */}
                <div
                  className="h-full bg-linear-to-r from-blue-700/60 to-blue-500/40 transition-all duration-700"
                  style={{ width: `${100 - yearPct}%` }}
                />
              </div>
            )}
            <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Ganado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500/60 inline-block" />
                Por cobrar
              </span>
            </div>
          </div>

          {/* ── Sección: Ya en tu bolsillo ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Ya en tu bolsillo
              </h2>
              <span className="text-xs text-zinc-700">
                · {pastGigs.length} tocadas realizadas
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                loading={loading}
                icon={<DollarSign size={16} className="text-green-400" />}
                color="green"
                title="Total ganado"
                value={`$${fmt(earned)}`}
                sub="Tocadas pasadas"
              />
              <Card
                loading={loading}
                icon={<TrendingUp size={16} className="text-purple-400" />}
                color="purple"
                title="Promedio / tocada"
                value={`$${fmt(avgPerPastGig)}`}
                sub={`${pastGigs.length} eventos`}
              />
              <Card
                loading={loading}
                icon={<Clock size={16} className="text-blue-400" />}
                color="blue"
                title="Horas tocadas"
                value={`${earnedHours.toLocaleString("en-US")} hrs`}
                sub="Tiempo trabajado"
              />
              <Card
                loading={loading}
                icon={<BarChart3 size={16} className="text-yellow-400" />}
                color="yellow"
                title="Ingreso / hora"
                value={`$${fmt(avgPerHour)}`}
                sub="Promedio real"
              />
            </div>

            {/* Comparativa y mejor mes */}
            {!loading && pastGigs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Este mes vs anterior */}
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
                      Este mes vs anterior
                    </p>
                    <p className="text-xl font-bold">
                      {earnedThisMonth > 0 ? `$${fmt(earnedThisMonth)}` : "$0.00"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 capitalize">
                      {monthDiff !== null ? (
                        <span
                          className={monthDiff >= 0 ? "text-green-500" : "text-red-400"}
                        >
                          {monthDiff >= 0 ? "+" : ""}
                          {monthDiff.toFixed(1)}% vs{" "}
                          {prevMonthDate.toLocaleDateString("es-MX", { month: "long" })}
                        </span>
                      ) : earnedPrevMonth === 0 ? (
                        "Sin datos del mes anterior"
                      ) : (
                        "Sin actividad este mes"
                      )}
                    </p>
                  </div>
                </div>

                {/* Mejor mes */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Star size={18} className="text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide mb-0.5">
                      Mejor mes
                    </p>
                    <p className="text-xl font-bold text-yellow-400">
                      ${fmt(bestMonth?.total ?? 0)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 capitalize">
                      {bestMonth?.label ?? "--"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Sección: Por cobrar ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Por cobrar
              </h2>
              <span className="text-xs text-zinc-700">
                · {futureGigs.length} tocadas próximas
              </span>
            </div>

            {futureGigs.length === 0 ? (
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
                    value={`$${fmt(pending)}`}
                    sub="Ingresos contratados"
                  />
                  <Card
                    loading={loading}
                    icon={<Music size={16} className="text-purple-400" />}
                    color="purple"
                    title="Tocadas agendadas"
                    value={futureGigs.length.toString()}
                    sub="Próximos eventos"
                  />
                  <Card
                    loading={loading}
                    icon={<Hourglass size={16} className="text-cyan-400" />}
                    color="cyan"
                    title="Horas agendadas"
                    value={`${pendingHours.toLocaleString("en-US")} hrs`}
                    sub="Tiempo comprometido"
                  />
                </div>

                {/* Lista de próximas */}
                <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  {futureGigs.map((gig, idx) => {
                    const d = parseLocalDate(gig.date);
                    const isLast = idx === futureGigs.length - 1;
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
                          <span className="text-[9px] text-blue-400/60 uppercase mt-0.5">
                            {d
                              .toLocaleDateString("es-MX", { month: "short" })
                              .replace(".", "")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {gig.title}
                          </p>
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
                          <p className="text-sm font-bold text-blue-300">
                            ${fmt(Number(gig.amount))}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            Pendiente
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
              {/* Tabs */}
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
                      ? `Realizadas (${pastGigs.length})`
                      : t === "proximas"
                        ? `Próximas (${futureGigs.length})`
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
                        <th className="px-5 py-3 text-right font-semibold">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableGigs.map((gig) => {
                        const isPast = parseLocalDate(gig.date) < today;
                        return (
                          <tr
                            key={gig.id}
                            className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors last:border-0"
                          >
                            <td className="px-5 py-3 font-medium text-zinc-200">
                              {gig.title}
                            </td>
                            <td className="px-5 py-3 text-zinc-500 hidden md:table-cell">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {gig.place}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-zinc-500 whitespace-nowrap capitalize">
                              {fmtDate(gig.date)}
                            </td>
                            <td className="px-5 py-3 text-right text-zinc-500 hidden sm:table-cell">
                              {Number(gig.hours).toLocaleString("en-US")}
                            </td>
                            <td className="px-5 py-3 text-right font-bold whitespace-nowrap">
                              <span
                                className={
                                  isPast ? "text-green-400" : "text-blue-400"
                                }
                              >
                                ${fmt(Number(gig.amount))}
                              </span>
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
                        <td className="px-5 py-3.5 text-right text-zinc-400 hidden sm:table-cell">
                          {tableHours.toLocaleString("en-US")} hrs
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-white">
                          ${fmt(tableTotal)}
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
