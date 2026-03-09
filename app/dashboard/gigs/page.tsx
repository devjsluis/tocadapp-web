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
  LayoutGrid,
  List,
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

type ViewMode = "grid" | "month";

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
  return timeStr?.slice(0, 5) ?? "";
}

function fmtMoney(value: number | string): string {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Agrupa gigs por "Mes Año" manteniendo orden cronológico
function groupByMonth(gigs: Gig[]): { label: string; gigs: Gig[] }[] {
  const map = new Map<string, Gig[]>();
  for (const gig of gigs) {
    const d = parseLocalDate(gig.date);
    const key = d.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(gig);
  }
  return Array.from(map.entries()).map(([label, gigs]) => ({ label, gigs }));
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
    <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between">
      <div className="space-y-1">
        <div className="h-2 w-10 bg-zinc-800 rounded" />
        <div className="h-5 w-20 bg-zinc-800 rounded" />
      </div>
    </div>
  </div>
);

// Modal de confirmación de borrado
function ConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <h3 className="font-bold text-lg text-center mb-1">
          ¿Eliminar tocada?
        </h3>
        <p className="text-zinc-400 text-sm text-center mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 border border-zinc-700 hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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
      console.error("Error al guardar la tocada:", error);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/gigs/${confirmDeleteId}`);
      setGigs((prev) => prev.filter((g) => g.id !== confirmDeleteId));
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthGroups = groupByMonth(gigs);

  // Botones de acción reutilizables
  const ActionButtons = ({ gig }: { gig: Gig }) => (
    <div className="flex gap-1">
      <button
        onClick={() => openEdit(gig)}
        className="p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
        title="Editar"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => setConfirmDeleteId(gig.id)}
        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        title="Eliminar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Mis Tocadas
          </h1>
          <p className="text-zinc-500 mt-1">
            Control de eventos y agenda musical
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle de vista */}
          {!loading && gigs.length > 0 && (
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                title="Vista en tarjetas"
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("month")}
                title="Vista por mes"
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === "month"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          )}

          <Button
            onClick={openCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} className="mr-1" /> Nueva Tocada
          </Button>
        </div>
      </div>

      {/* Modal crear / editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
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
                list="places-list"
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, place: e.target.value })
                }
                required
              />
              <datalist id="places-list">
                {[...new Set(gigs.map((g) => g.place.trim()).filter(Boolean))].map(
                  (p) => <option key={p} value={p} />,
                )}
              </datalist>
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
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6 cursor-pointer"
              >
                {editingGig ? "Guardar Cambios" : "Guardar Tocada"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar borrado */}
      {confirmDeleteId && (
        <ConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
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

      {/* ── Vista Grid ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <GigSkeleton key={i} />)
            : gigs.map((gig) => {
                const isPast = parseLocalDate(gig.date) < today;
                return (
                  <div
                    key={gig.id}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-purple-500/40 transition-all group relative"
                  >
                    {/* Acciones hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButtons gig={gig} />
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
                        <Calendar
                          size={14}
                          className="text-zinc-600 shrink-0"
                        />
                        <span className="capitalize">
                          {parseLocalDate(gig.date).toLocaleDateString(
                            "es-MX",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
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
                          {fmtMoney(gig.amount)}
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
      )}

      {/* ── Vista Por Mes ── */}
      {viewMode === "month" && !loading && (
        <div className="space-y-8">
          {monthGroups.map(({ label, gigs: monthGigs }) => {
            const monthTotal = monthGigs.reduce(
              (acc, g) => acc + Number(g.amount),
              0,
            );
            return (
              <div key={label}>
                {/* Header del mes */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 capitalize">
                    {label}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">
                      {monthGigs.length}{" "}
                      {monthGigs.length === 1 ? "tocada" : "tocadas"}
                    </span>
                    <span className="text-sm font-bold text-green-400">
                      ${fmtMoney(monthTotal)}
                    </span>
                  </div>
                </div>

                {/* Filas de gigs */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  {monthGigs.map((gig, idx) => {
                    const d = parseLocalDate(gig.date);
                    const isPast = d < today;
                    const isLast = idx === monthGigs.length - 1;
                    return (
                      <div
                        key={gig.id}
                        className={`flex items-center gap-4 px-5 py-4 group hover:bg-zinc-800/40 transition-colors ${
                          !isLast ? "border-b border-zinc-800/60" : ""
                        }`}
                      >
                        {/* Día */}
                        <div
                          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                            isPast
                              ? "bg-zinc-800 text-zinc-500"
                              : "bg-purple-500/15 text-purple-400"
                          }`}
                        >
                          <span className="text-sm font-bold leading-none">
                            {d.getDate()}
                          </span>
                          <span className="text-[9px] uppercase mt-0.5 opacity-70">
                            {d.toLocaleDateString("es-MX", {
                              weekday: "short",
                            })}
                          </span>
                        </div>

                        {/* Info principal */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold truncate ${isPast ? "text-zinc-500" : "text-white"}`}
                          >
                            {gig.title}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {gig.place}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />{" "}
                              {String(gig.time).slice(0, 5)} · {gig.hours} hrs
                            </span>
                          </div>
                        </div>

                        {/* Monto */}
                        <span
                          className={`text-sm font-bold shrink-0 ${isPast ? "text-zinc-600" : "text-green-400"}`}
                        >
                          ${fmtMoney(gig.amount)}
                        </span>

                        {/* Acciones hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <ActionButtons gig={gig} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Skeleton vista mes */}
      {viewMode === "month" && loading && (
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-28 bg-zinc-800 rounded mb-3" />
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/60 last:border-0"
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-zinc-800 rounded" />
                      <div className="h-3 w-56 bg-zinc-800 rounded" />
                    </div>
                    <div className="h-4 w-20 bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indicador de borrado en proceso */}
      {deleting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full text-sm text-zinc-300 shadow-xl">
          Eliminando...
        </div>
      )}
    </div>
  );
}
