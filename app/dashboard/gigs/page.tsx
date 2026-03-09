"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  X,
  Music,
  Pencil,
  Trash2,
} from "lucide-react";
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

type FormData = {
  title: string;
  place: string;
  date: string;
  time: string;
  amount: string;
  hours: string;
  notes: string;
};

const emptyForm: FormData = {
  title: "",
  place: "",
  date: "",
  time: "",
  amount: "",
  hours: "",
  notes: "",
};

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateInput(dateStr: string): string {
  return dateStr.split("T")[0];
}

function toTimeInput(timeStr: string): string {
  // "HH:MM:SS" → "HH:MM"
  return timeStr?.slice(0, 5) ?? "";
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

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

  const openCreate = () => {
    setEditingGig(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (gig: Gig) => {
    setEditingGig(gig);
    setFormData({
      title: gig.title,
      place: gig.place,
      date: toDateInput(gig.date),
      time: toTimeInput(String(gig.time)),
      amount: String(gig.amount),
      hours: String(gig.hours),
      notes: gig.notes ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGig(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGig) {
        await api.put(`/gigs/${editingGig.id}`, formData);
      } else {
        await api.post("/gigs", formData);
      }
      closeForm();
      fetchGigs();
    } catch (error) {
      alert(`Error al guardar la tocada: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta tocada? Esta acción no se puede deshacer."))
      return;
    setDeleting(id);
    try {
      await api.delete(`/gigs/${id}`);
      setGigs((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      alert(`Error al eliminar: ${error}`);
    } finally {
      setDeleting(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-1" /> Nueva Tocada
        </Button>
      </div>

      {/* Modal crear / editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingGig ? "Editar Tocada" : "Registrar Evento"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del evento (Ej: Boda Familia Perez)"
                value={formData.title}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Lugar / Salón"
                value={formData.place}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, place: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
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
                  value={formData.amount}
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Horas"
                  value={formData.hours}
                  className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  required
                />
              </div>
              <textarea
                placeholder="Notas (opcional)"
                value={formData.notes}
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500 resize-none"
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6"
              >
                {editingGig ? "Guardar Cambios" : "Guardar Tocada"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && gigs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <Music size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin tocadas registradas
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Aún no tienes eventos. Presiona &ldquo;Nueva Tocada&rdquo; para
            agregar el primero.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <GigSkeleton key={i} />)
          : gigs.map((gig) => {
              const gigDate = parseLocalDate(gig.date);
              const isPast = gigDate < today;

              return (
                <div
                  key={gig.id}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-purple-500/40 transition-all group relative"
                >
                  {/* Botones editar / borrar */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(gig)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(gig.id)}
                      disabled={deleting === gig.id}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-3 pr-14">
                    <h3 className="text-lg font-bold text-purple-400 leading-tight">
                      {gig.title}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border shrink-0 ${
                        isPast
                          ? "bg-zinc-700/30 text-zinc-500 border-zinc-700/50"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }`}
                    >
                      {isPast ? "Pasada" : "Próxima"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-600 shrink-0" />
                      {gig.place}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-600 shrink-0" />
                      <span className="capitalize">
                        {parseLocalDate(gig.date).toLocaleDateString("es-MX", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-600 shrink-0" />
                      {String(gig.time).slice(0, 5)} ({gig.hours} hrs)
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">
                        Pago Total
                      </p>
                      <span className="text-green-500 font-bold flex items-center gap-1 text-lg">
                        <DollarSign size={18} />
                        {Number(gig.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {gig.notes && (
                      <p className="text-xs text-zinc-600 italic max-w-[120px] text-right line-clamp-2">
                        {gig.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
