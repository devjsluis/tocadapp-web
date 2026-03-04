"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Plus, Calendar, MapPin, Clock, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Gig {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  amount: number | string;
  hours: number | string;
  notes?: string;
}

const GigSkeleton = () => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-32 bg-zinc-800 rounded-md" />
      <div className="h-4 w-16 bg-zinc-800 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="h-3 w-full bg-zinc-800 rounded" />
      <div className="h-3 w-3/4 bg-zinc-800 rounded" />
      <div className="h-3 w-1/2 bg-zinc-800 rounded" />
    </div>
    <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
      <div className="space-y-1">
        <div className="h-2 w-10 bg-zinc-800 rounded" />
        <div className="h-5 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="h-8 w-16 bg-zinc-800 rounded-md" />
    </div>
  </div>
);

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    place: "",
    date: "",
    time: "",
    amount: "",
    hours: "",
    notes: "",
  });

  const fetchGigs = async () => {
    try {
      const { data } = await api.get("/gigs");
      setGigs(data.data);
    } catch (error) {
      console.error("Error al obtener tocadas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/gigs", formData);
      setShowForm(false);
      setFormData({
        title: "",
        place: "",
        date: "",
        time: "",
        amount: "",
        hours: "",
        notes: "",
      });
      fetchGigs();
    } catch (error) {
      alert(`Error al guardar la tocada ${error}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Mis Tocadas
          </h1>
          <p className="text-zinc-500 mt-1">
            Control de eventos y agenda musical
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-1" /> Nueva Tocada
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6">Registrar Evento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del evento (Ej: Boda Familia Perez)"
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Lugar / Salón"
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                onChange={(e) =>
                  setFormData({ ...formData, place: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
                <input
                  type="time"
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Monto $"
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Horas"
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500"
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6"
              >
                Guardar Tocada
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <GigSkeleton key={i} />)
          : gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-purple-500/40 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-purple-400">
                    {gig.title}
                  </h3>
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full uppercase font-bold">
                    Próxima
                  </span>
                </div>

                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-600" /> {gig.place}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-600" />{" "}
                    {new Date(gig.date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-600" /> {gig.time} (
                    {gig.hours} hrs)
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                      Pago Total
                    </p>
                    <span className="text-green-500 font-bold flex items-center gap-1 text-lg">
                      <DollarSign size={18} />{" "}
                      {Number(gig.amount).toLocaleString()}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-purple-500/10 hover:text-purple-400"
                  >
                    Detalles
                  </Button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
