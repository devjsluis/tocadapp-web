"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  Music,
  DollarSign,
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Gig {
  id: string;
  title: string;
  amount: number | string;
  date: string;
  place: string;
}

// Parsea la fecha sin depender del timezone del navegador
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalGigs: 0,
    totalEarnings: 0,
    nextGig: null as Gig | null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/gigs");
        const gigs: Gig[] = data.data;

        const total = gigs.reduce(
          (acc: number, curr: Gig) => acc + Number(curr.amount),
          0,
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextGig =
          gigs
            .filter((g) => parseLocalDate(g.date) >= today)
            .sort(
              (a, b) =>
                parseLocalDate(a.date).getTime() -
                parseLocalDate(b.date).getTime(),
            )[0] ?? null;

        setStats({ totalGigs: gigs.length, totalEarnings: total, nextGig });
      } catch (error) {
        console.error("Error cargando dashboard", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          ¡Qué onda! 🎺
        </h1>
        <p className="text-zinc-500 mt-1">
          Este es el resumen de TocadApp para hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total de Tocadas"
          value={stats.totalGigs.toString()}
          icon={<Music className="text-purple-500" />}
          description="Eventos registrados"
        />
        <StatCard
          title="Ganancias Totales"
          value={`$${stats.totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="text-green-500" />}
          description="Monto acumulado bruto"
        />
        <StatCard
          title="Próximo Evento"
          value={stats.nextGig ? stats.nextGig.title : "Sin eventos próximos"}
          icon={<CalendarIcon className="text-blue-500" />}
          description={stats.nextGig ? formatDate(stats.nextGig.date) : "--"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-linear-to-br from-purple-900/40 to-zinc-900 border border-purple-500/20 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">¿Salió un hueso nuevo?</h2>
            <p className="text-zinc-400 mb-6">
              Registra rápidamente la próxima fecha.
            </p>
          </div>
          <Link href="/dashboard/gigs">
            <Button className="w-fit bg-purple-600 hover:bg-purple-700 gap-2 px-6 py-6 text-lg rounded-xl">
              Ir a Tocadas <ArrowUpRight size={20} />
            </Button>
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Actividad Reciente</h3>
            <TrendingUp size={18} className="text-zinc-500" />
          </div>
          <div className="space-y-4">
            {stats.totalGigs === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-10">
                No hay actividad aún.
              </p>
            ) : (
              <p className="text-zinc-400 text-sm italic">
                Tienes {stats.totalGigs} eventos registrados. ¡A darle!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
      </div>
      <div>
        <p className="text-zinc-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        <p className="text-xs text-zinc-600 mt-2 capitalize">{description}</p>
      </div>
    </div>
  );
}
