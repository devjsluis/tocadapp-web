"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Music,
  Calendar,
  MapPin,
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

function fmt(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const FinanceSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl animate-pulse">
    <div className="h-3 w-24 bg-zinc-800 rounded mb-3" />
    <div className="h-7 w-36 bg-zinc-800 rounded" />
    <div className="h-3 w-20 bg-zinc-800 rounded mt-2" />
  </div>
);

export default function FinancesPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/gigs");
        setGigs(data.data);
      } catch (error) {
        console.error("Error cargando finanzas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEarnings = gigs.reduce((acc, g) => acc + Number(g.amount), 0);
  const totalHours = gigs.reduce((acc, g) => acc + Number(g.hours), 0);
  const avgPerGig = gigs.length > 0 ? totalEarnings / gigs.length : 0;
  const avgPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;

  const byMonth = gigs.reduce<Record<string, { total: number; count: number }>>(
    (acc, gig) => {
      const d = new Date(gig.date);
      const key = d.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      });
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += Number(gig.amount);
      acc[key].count += 1;
      return acc;
    },
    {},
  );

  const monthEntries = Object.entries(byMonth);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b border-zinc-800/50 pb-6">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Finanzas
        </h1>
        <p className="text-zinc-500 mt-1">Resumen de ingresos y ganancias</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <FinanceSkeleton key={i} />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <DollarSign size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin datos financieros
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Aún no tienes tocadas registradas. Cuando agregues eventos, aquí
            verás tu resumen de ingresos.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Ganado"
              value={`$${fmt(totalEarnings)}`}
              icon={<DollarSign className="text-green-500" />}
              sub="Ingresos acumulados"
            />
            <StatCard
              title="Promedio por Tocada"
              value={`$${fmt(avgPerGig)}`}
              icon={<TrendingUp className="text-purple-500" />}
              sub={`${gigs.length} eventos`}
            />
            <StatCard
              title="Total de Horas"
              value={`${totalHours.toLocaleString("en-US")} hrs`}
              icon={<Clock className="text-blue-500" />}
              sub="Horas trabajadas"
            />
            <StatCard
              title="Ingreso por Hora"
              value={`$${fmt(avgPerHour)}`}
              icon={<BarChart3 className="text-yellow-500" />}
              sub="Promedio/hora"
            />
          </div>

          {/* Monthly breakdown */}
          {monthEntries.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                Por mes
              </h2>
              <div className="space-y-3">
                {monthEntries.map(([month, { total, count }]) => {
                  const pct =
                    totalEarnings > 0 ? (total / totalEarnings) * 100 : 0;
                  return (
                    <div key={month}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="capitalize text-zinc-300">{month}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-xs">
                            {count} {count === 1 ? "tocada" : "tocadas"}
                          </span>
                          <span className="font-bold text-green-400">
                            ${fmt(total)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gigs table */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Music size={18} className="text-purple-500" />
              Detalle por evento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                    <th className="pb-3 text-left font-semibold">Evento</th>
                    <th className="pb-3 text-left font-semibold">Lugar</th>
                    <th className="pb-3 text-left font-semibold">Fecha</th>
                    <th className="pb-3 text-right font-semibold">Horas</th>
                    <th className="pb-3 text-right font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.map((gig) => (
                    <tr
                      key={gig.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="py-3 text-zinc-200 font-medium">
                        {gig.title}
                      </td>
                      <td className="py-3 text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {gig.place}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500">
                        {new Date(gig.date).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-right text-zinc-400">
                        {Number(gig.hours).toLocaleString("en-US")}
                      </td>
                      <td className="py-3 text-right font-bold text-green-400">
                        ${fmt(Number(gig.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-zinc-300 font-bold">
                    <td className="pt-4" colSpan={3}>
                      Total
                    </td>
                    <td className="pt-4 text-right text-zinc-400">
                      {totalHours.toLocaleString("en-US")} hrs
                    </td>
                    <td className="pt-4 text-right text-green-400">
                      ${fmt(totalEarnings)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}

function StatCard({ title, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
      </div>
      <p className="text-zinc-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className="text-xs text-zinc-600 mt-2">{sub}</p>
    </div>
  );
}
