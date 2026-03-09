"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  Music,
  DollarSign,
  CalendarCheck,
  MapPin,
  ArrowUpRight,
  TrendingUp,
  CalendarClock,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Gig {
  id: string;
  title: string;
  amount: number | string;
  date: string;
  time: string;
  place: string;
  hours: number | string;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fmtMoney(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseLocalDate(dateStr).toLocaleDateString("es-MX", opts);
}

// Tooltip personalizado para la gráfica
const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-zinc-400 capitalize mb-1">{label}</p>
      <p className="font-bold text-green-400">${fmtMoney(payload[0].value)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalEarned = pastGigs.reduce((acc, g) => acc + Number(g.amount), 0);

  const thisMonthEarned = pastGigs
    .filter((g) => {
      const d = parseLocalDate(g.date);
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    })
    .reduce((acc, g) => acc + Number(g.amount), 0);

  const nextGig = futureGigs[0] ?? null;

  // Lugares más tocados (normalizados: trim + lowercase para contar, pero mostramos el texto original más común)
  const placeMap = new Map<string, { count: number; display: string }>();
  pastGigs.forEach((g) => {
    const key = g.place.trim().toLowerCase();
    const prev = placeMap.get(key);
    placeMap.set(key, {
      count: (prev?.count ?? 0) + 1,
      display: prev?.display ?? g.place.trim(),
    });
  });
  const topPlaces = [...placeMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxPlaceCount = topPlaces[0]?.count ?? 1;

  // Gráfica: ganancias por mes, últimos 6 meses
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const total = pastGigs
      .filter((g) => {
        const gd = parseLocalDate(g.date);
        return (
          gd.getMonth() === d.getMonth() && gd.getFullYear() === d.getFullYear()
        );
      })
      .reduce((acc, g) => acc + Number(g.amount), 0);
    return {
      mes: d
        .toLocaleDateString("es-MX", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
      total,
    };
  });

  const todayLabel = today.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header compacto ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            ¡Qué onda! 🎺
          </h1>
          <p className="text-zinc-600 text-sm capitalize">{todayLabel}</p>
        </div>
        <Link href="/dashboard/gigs">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 gap-1.5 cursor-pointer"
          >
            Nueva Tocada <ArrowUpRight size={15} />
          </Button>
        </Link>
      </div>

      {/* ── 4 Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          icon={<Music size={18} className="text-purple-400" />}
          title="Tocadas realizadas"
          value={pastGigs.length.toString()}
          sub={`${futureGigs.length} próximas`}
          color="purple"
        />
        <StatCard
          loading={loading}
          icon={<DollarSign size={18} className="text-green-400" />}
          title="Ganado total"
          value={`$${fmtMoney(totalEarned)}`}
          sub="Solo tocadas pasadas"
          color="green"
        />
        <StatCard
          loading={loading}
          icon={<TrendingUp size={18} className="text-blue-400" />}
          title="Este mes"
          value={`$${fmtMoney(thisMonthEarned)}`}
          sub={today.toLocaleDateString("es-MX", {
            month: "long",
            year: "numeric",
          })}
          color="blue"
        />
        <StatCard
          loading={loading}
          icon={<CalendarCheck size={18} className="text-yellow-400" />}
          title="Próximo evento"
          value={nextGig ? nextGig.title : "—"}
          sub={
            nextGig
              ? fmtDate(nextGig.date, { day: "numeric", month: "short", year: "numeric" })
              : "Sin eventos"
          }
          color="yellow"
          truncateValue
        />
      </div>

      {/* ── Gráfica + Top lugares ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfica de barras */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold">Ganancias por mes</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Últimos 6 meses</p>
            </div>
            <span className="text-xs text-zinc-600 bg-zinc-800 px-2.5 py-1 rounded-full">
              Solo pasadas
            </span>
          </div>
          {loading ? (
            <div className="h-[180px] bg-zinc-800/50 rounded-xl animate-pulse" />
          ) : pastGigs.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-zinc-700 text-sm">
              Sin datos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                barSize={28}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) =>
                    v === 0 ? "" : `$${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff06" }} />
                <Bar dataKey="total" fill="#a855f7" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top lugares */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} className="text-purple-400" />
            <h3 className="font-bold">Lugares top</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 w-32 bg-zinc-800 rounded mb-1.5" />
                  <div className="h-2 bg-zinc-800 rounded-full" />
                </div>
              ))}
            </div>
          ) : topPlaces.length === 0 ? (
            <p className="text-zinc-700 text-sm mt-6 text-center">
              Sin datos aún
            </p>
          ) : (
            <div className="space-y-4">
              {topPlaces.map((p, i) => (
                <div key={p.display}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-zinc-600 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-300 truncate">
                        {p.display}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0 ml-2">
                      {p.count} {p.count === 1 ? "vez" : "veces"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                      style={{ width: `${(p.count / maxPlaceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Próximas tocadas + CTA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximas tocadas */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-blue-400" />
              <h3 className="font-bold">Próximas tocadas</h3>
            </div>
            <Link
              href="/dashboard/gigs"
              className="text-xs text-zinc-500 hover:text-purple-400 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex gap-3 items-center py-2"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 bg-zinc-800 rounded" />
                    <div className="h-3 w-24 bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : futureGigs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-700 text-sm">Sin eventos próximos</p>
            </div>
          ) : (
            <div className="space-y-1">
              {futureGigs.slice(0, 3).map((gig) => {
                const d = parseLocalDate(gig.date);
                return (
                  <div
                    key={gig.id}
                    className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-400 leading-none">
                        {d.getDate()}
                      </span>
                      <span className="text-[9px] text-blue-400/60 uppercase">
                        {d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {gig.title}
                      </p>
                      <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {String(gig.time).slice(0, 5)} ·{" "}
                        <MapPin size={10} />
                        {gig.place}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-400 shrink-0">
                      ${fmtMoney(Number(gig.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-purple-900/50 to-zinc-900 border border-purple-500/20 p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">¿Salió un hueso nuevo?</h2>
            <p className="text-zinc-400 text-sm">
              Registra rápidamente la próxima fecha antes de que se te olvide.
            </p>
          </div>
          <Link href="/dashboard/gigs" className="mt-6 block">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2 cursor-pointer">
              Ir a Tocadas <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  color: "purple" | "green" | "blue" | "yellow";
  loading?: boolean;
  truncateValue?: boolean;
}

const colorMap = {
  purple: "bg-purple-500/10",
  green: "bg-green-500/10",
  blue: "bg-blue-500/10",
  yellow: "bg-yellow-500/10",
};

function StatCard({
  icon,
  title,
  value,
  sub,
  color,
  loading,
  truncateValue,
}: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
      <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-zinc-500 text-xs font-medium">{title}</p>
      {loading ? (
        <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse mt-1.5" />
      ) : (
        <h3
          className={`text-xl font-bold mt-1 ${truncateValue ? "truncate" : ""}`}
          title={truncateValue ? value : undefined}
        >
          {value}
        </h3>
      )}
      <p className="text-[11px] text-zinc-600 mt-1.5 capitalize truncate">
        {sub}
      </p>
    </div>
  );
}
