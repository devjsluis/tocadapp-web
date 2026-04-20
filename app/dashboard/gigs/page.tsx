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
  Users2,
  AlertTriangle,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Band {
  id: string;
  name: string;
  is_owner: boolean;
  can_create_gigs: boolean;
}

interface Gig {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  amount: number | string;
  hours: number | string;
  notes?: string;
  band_id?: string | null;
  band_name?: string | null;
  is_owner: boolean;
  my_amount?: number | null;
  my_collected?: number | null;
  collected_amount?: number | null;
  my_attending?: boolean | null;
}

type FormData = {
  title: string;
  place: string;
  date: string;
  time: string;
  amount: string;
  hours: string;
  notes: string;
  band_id: string;
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
  band_id: "",
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

function timeToMinutes(timeStr: string): number {
  const [h, m] = String(timeStr).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function gigsConflict(a: Gig, b: Gig): boolean {
  if (a.id === b.id) return false;
  if (a.date.split("T")[0] !== b.date.split("T")[0]) return false;
  const startA = timeToMinutes(String(a.time));
  const endA = startA + Number(a.hours) * 60;
  const startB = timeToMinutes(String(b.time));
  const endB = startB + Number(b.hours) * 60;
  return startA < endB && startB < endA;
}

function getConflictingIds(gigs: Gig[]): Set<string> {
  const conflicting = new Set<string>();
  for (let i = 0; i < gigs.length; i++) {
    for (let j = i + 1; j < gigs.length; j++) {
      if (gigsConflict(gigs[i], gigs[j])) {
        conflicting.add(gigs[i].id);
        conflicting.add(gigs[j].id);
      }
    }
  }
  return conflicting;
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

function BandBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
      <Users2 size={9} />
      {name}
    </span>
  );
}

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [earningsGig, setEarningsGig] = useState<Gig | null>(null);
  const [earningsAmount, setEarningsAmount] = useState("");
  const [earningsCollected, setEarningsCollected] = useState("");
  const [collectedGig, setCollectedGig] = useState<Gig | null>(null);
  const [collectedAmount, setCollectedAmount] = useState("");

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

  const fetchBands = async () => {
    try {
      const { data } = await api.get("/bands");
      setBands(data.data.filter((b: Band) => b.is_owner || b.can_create_gigs));
    } catch {
      // bands no crítico si falla
    }
  };

  useEffect(() => {
    fetchGigs();
    fetchBands();
  }, []);

  const conflictingIds = getConflictingIds(gigs);

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
      band_id: gig.band_id ?? "",
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
      const payload = {
        ...formData,
        band_id: formData.band_id || null,
      };
      if (editingGig) {
        await api.put(`/gigs/${editingGig.id}`, payload);
      } else {
        await api.post("/gigs", payload);
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

  const handleSetAttending = async (gigId: string, attending: boolean | null) => {
    try {
      await api.put(`/gigs/${gigId}/attending`, { attending });
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, my_attending: attending } : g)),
      );
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
    }
  };

  const handleSaveEarnings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earningsGig) return;
    try {
      const collected = earningsCollected === "" ? null : Number(earningsCollected);
      await api.put(`/gigs/${earningsGig.id}/my-earnings`, {
        amount: earningsAmount,
        collected_amount: collected,
      });
      setGigs((prev) =>
        prev.map((g) =>
          g.id === earningsGig.id
            ? { ...g, my_amount: Number(earningsAmount), my_collected: collected }
            : g,
        ),
      );
      setEarningsGig(null);
      setEarningsAmount("");
      setEarningsCollected("");
    } catch (error) {
      console.error("Error al guardar pago:", error);
    }
  };

  const saveCollected = async (amount: number | null) => {
    if (!collectedGig) return;
    try {
      await api.put(`/gigs/${collectedGig.id}/collected`, { amount });
      setGigs((prev) =>
        prev.map((g) =>
          g.id === collectedGig.id ? { ...g, collected_amount: amount } : g,
        ),
      );
      setCollectedGig(null);
      setCollectedAmount("");
    } catch (error) {
      console.error("Error al guardar cobro:", error);
    }
  };

  const handleSaveCollected = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = collectedAmount === "" ? null : Number(collectedAmount);
    saveCollected(amount);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthGroups = groupByMonth(gigs);

  const ActionButtons = ({ gig }: { gig: Gig }) => {
    if (!gig.is_owner) {
      return (
        <div className="flex items-center gap-1 text-zinc-600" title="Gig de banda (solo lectura)">
          <Lock size={13} />
        </div>
      );
    }
    return (
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
  };

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
                {[
                  ...new Set(
                    gigs.map((g) => g.place.trim()).filter(Boolean),
                  ),
                ].map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>

              {/* Selector de banda */}
              {bands.length > 0 && (
                <select
                  value={formData.band_id}
                  onChange={(e) =>
                    setFormData({ ...formData, band_id: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
                >
                  <option value="">Sin banda (tocada personal)</option>
                  {bands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}

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

      {/* Modal: mi pago en gig de banda */}
      {earningsGig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => { setEarningsGig(null); setEarningsAmount(""); setEarningsCollected(""); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={18} className="text-green-400" />
              <h2 className="text-xl font-bold">Mi pago</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-5">
              <span className="text-white font-semibold">{earningsGig.title}</span>
            </p>
            <form onSubmit={handleSaveEarnings} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">
                  Monto acordado
                </label>
                <input
                  type="number"
                  placeholder="$0.00"
                  value={earningsAmount}
                  onChange={(e) => setEarningsAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-green-500 text-white placeholder:text-zinc-500 text-xl font-bold"
                  autoFocus
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">
                  ¿Cuánto te han pagado ya? <span className="text-zinc-700 normal-case font-normal">(opcional)</span>
                </label>
                <input
                  type="number"
                  placeholder="$0.00"
                  value={earningsCollected}
                  onChange={(e) => setEarningsCollected(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-yellow-500 text-white placeholder:text-zinc-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 font-bold py-6 cursor-pointer mt-1"
              >
                Guardar
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: registrar cobro en gig personal */}
      {collectedGig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => { setCollectedGig(null); setCollectedAmount(""); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-yellow-400" />
              <h2 className="text-xl font-bold">Registrar cobro</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-1">
              <span className="text-white font-semibold">{collectedGig.title}</span>
            </p>
            <p className="text-xs text-zinc-600 mb-5">
              Monto acordado:{" "}
              <span className="text-zinc-400 font-semibold">
                ${fmtMoney(collectedGig.amount)}
              </span>
            </p>
            <form onSubmit={handleSaveCollected} className="space-y-4">
              <input
                type="number"
                placeholder="¿Cuánto has cobrado? $"
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-yellow-500 text-white placeholder:text-zinc-500 text-xl font-bold"
                autoFocus
                min="0"
                step="0.01"
              />
              {collectedAmount !== "" &&
                Number(collectedAmount) < Number(collectedGig.amount) && (
                <p className="text-xs text-yellow-500/80">
                  Falta por cobrar:{" "}
                  <span className="font-bold">
                    ${fmtMoney(Number(collectedGig.amount) - Number(collectedAmount))}
                  </span>
                </p>
              )}
              <div className="flex gap-2">
                {collectedGig.collected_amount != null && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setCollectedAmount(""); handleSaveCollected({ preventDefault: () => {} } as React.FormEvent); }}
                    className="flex-1 border border-zinc-700 text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    Borrar cobro
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 font-bold py-6 cursor-pointer"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Aviso de conflictos */}
      {conflictingIds.size > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
          <AlertTriangle
            size={16}
            className="text-yellow-500 shrink-0 mt-0.5"
          />
          <p className="text-sm text-yellow-400">
            Tienes <strong>{conflictingIds.size / 2 >= 1 ? Math.ceil(conflictingIds.size / 2) : 1} conflicto(s)</strong> de horario —
            dos o más tocadas se empalman el mismo día y hora.
          </p>
        </div>
      )}

      {/* ── Vista Grid ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <GigSkeleton key={i} />
              ))
            : gigs.map((gig) => {
                const isPast = parseLocalDate(gig.date) < today;
                const hasConflict = conflictingIds.has(gig.id);
                return (
                  <div
                    key={gig.id}
                    className={`bg-zinc-900 border p-5 rounded-xl transition-all group relative ${
                      hasConflict && gig.my_attending === false
                        ? "border-zinc-800 opacity-50 hover:opacity-80"
                        : hasConflict && gig.my_attending === true
                          ? "border-green-500/40 hover:border-green-500/60"
                          : hasConflict
                            ? "border-yellow-500/40 hover:border-yellow-500/60"
                            : "border-zinc-800 hover:border-purple-500/40"
                    }`}
                  >
                    {/* Acciones hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButtons gig={gig} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-start mb-3 pr-14">
                      <h3 className="text-lg font-bold text-purple-400 leading-tight w-full truncate">
                        {gig.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border shrink-0 ${
                            isPast
                              ? "bg-zinc-700/30 text-zinc-500 border-zinc-700/50"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }`}
                        >
                          {isPast ? "Pasada" : "Próxima"}
                        </span>
                        {gig.band_name && (
                          <BandBadge name={gig.band_name} />
                        )}
                        {hasConflict && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold flex items-center gap-1">
                            <AlertTriangle size={9} /> Conflicto
                          </span>
                        )}
                      </div>
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
                        <span className="capitalize" suppressHydrationWarning>
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

                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      {gig.is_owner ? (
                        // Gig propio: monto + estado de cobro
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                                Mi pago
                              </p>
                              <span className="text-green-500 font-bold flex items-center gap-1 text-lg">
                                <DollarSign size={18} />
                                {fmtMoney(gig.amount)}
                              </span>
                            </div>
                            {gig.notes && (
                              <p className="text-xs text-zinc-600 italic max-w-30 text-right line-clamp-2">
                                {gig.notes}
                              </p>
                            )}
                          </div>
                          {/* Estado de cobro */}
                          {gig.collected_amount == null ? (
                            <button
                              onClick={() => { setCollectedGig(gig); setCollectedAmount(""); }}
                              className="text-xs text-zinc-600 hover:text-yellow-400 transition-colors cursor-pointer"
                            >
                              + Registrar cobro
                            </button>
                          ) : Number(gig.collected_amount) >= Number(gig.amount) ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Cobrado completo
                              </span>
                              <button
                                onClick={() => { setCollectedGig(gig); setCollectedAmount(String(gig.collected_amount)); }}
                                className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                              >
                                editar
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-yellow-400">
                                  Cobrado ${fmtMoney(gig.collected_amount)} — falta ${fmtMoney(Number(gig.amount) - Number(gig.collected_amount))}
                                </span>
                                <button
                                  onClick={() => { setCollectedGig(gig); setCollectedAmount(String(gig.collected_amount)); }}
                                  className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors shrink-0 ml-2"
                                >
                                  editar
                                </button>
                              </div>
                              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (Number(gig.collected_amount) / Number(gig.amount)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : gig.my_amount != null ? (
                        // Gig de banda con monto personal registrado
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">
                              Mi pago
                            </p>
                            <span className="text-green-500 font-bold flex items-center gap-1 text-lg">
                              <DollarSign size={18} />
                              {fmtMoney(gig.my_amount)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEarningsGig(gig);
                              setEarningsAmount(String(gig.my_amount));
                              setEarningsCollected(gig.my_collected != null ? String(gig.my_collected) : "");
                            }}
                            className="text-[10px] text-zinc-600 hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      ) : (
                        // Gig de banda sin monto personal
                        <button
                          onClick={() => {
                            setEarningsGig(gig);
                            setEarningsAmount("");
                          }}
                          className="w-full text-center text-sm text-zinc-600 hover:text-green-400 transition-colors py-0.5 cursor-pointer border border-dashed border-zinc-800 hover:border-green-500/40 rounded-lg"
                        >
                          + ¿Cuánto te tocó?
                        </button>
                      )}
                    </div>

                    {/* Elección de asistencia en conflictos */}
                    {hasConflict && (
                      <div className="mt-3 pt-3 border-t border-yellow-500/20">
                        {gig.my_attending == null ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-yellow-500/80">
                              ¿Vas a ir a esta?
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSetAttending(gig.id, true)}
                                className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 text-zinc-400 transition-colors cursor-pointer"
                              >
                                Sí, voy
                              </button>
                              <button
                                onClick={() => handleSetAttending(gig.id, false)}
                                className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
                              >
                                No voy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold flex items-center gap-1.5 ${
                                gig.my_attending
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {gig.my_attending ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <XCircle size={13} />
                              )}
                              {gig.my_attending ? "Vas a esta" : "No vas a esta"}
                            </span>
                            <button
                              onClick={() => handleSetAttending(gig.id, null)}
                              className="text-[10px] text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors"
                            >
                              cambiar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      )}

      {/* ── Vista Por Mes ── */}
      {viewMode === "month" && !loading && (
        <div className="space-y-8">
          {monthGroups.map(({ label, gigs: monthGigs }) => {
            const monthTotal = monthGigs.reduce((acc, g) => {
              if (g.is_owner) return acc + Number(g.amount);
              if (g.my_amount != null) return acc + Number(g.my_amount);
              return acc;
            }, 0);
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
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

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                  {monthGigs.map((gig, idx) => {
                    const d = parseLocalDate(gig.date);
                    const isPast = d < today;
                    const isLast = idx === monthGigs.length - 1;
                    const hasConflict = conflictingIds.has(gig.id);
                    return (
                      <div
                        key={gig.id}
                        className={`flex items-center gap-4 px-5 py-4 group hover:bg-zinc-800/40 transition-colors ${
                          !isLast ? "border-b border-zinc-800/60" : ""
                        } ${
                          hasConflict && gig.my_attending === false
                            ? "opacity-50"
                            : hasConflict
                              ? "bg-yellow-500/3"
                              : ""
                        }`}
                      >
                        {/* Día */}
                        <div
                          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                            hasConflict
                              ? "bg-yellow-500/15 text-yellow-500"
                              : isPast
                                ? "bg-zinc-800 text-zinc-500"
                                : "bg-purple-500/15 text-purple-400"
                          }`}
                        >
                          <span className="text-sm font-bold leading-none">
                            {d.getDate()}
                          </span>
                          <span className="text-[9px] uppercase mt-0.5 opacity-70" suppressHydrationWarning>
                            {d.toLocaleDateString("es-MX", {
                              weekday: "short",
                            })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={`font-semibold truncate ${isPast ? "text-zinc-500" : "text-white"}`}
                            >
                              {gig.title}
                            </p>
                            {gig.band_name && (
                              <BandBadge name={gig.band_name} />
                            )}
                            {hasConflict && (
                              <AlertTriangle
                                size={12}
                                className="text-yellow-500 shrink-0"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-600">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {gig.place}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />{" "}
                              {String(gig.time).slice(0, 5)} · {gig.hours} hrs
                            </span>
                          </div>
                          {/* Elección compacta en conflicto */}
                          {hasConflict && (
                            <div className="flex items-center gap-2 mt-1">
                              {gig.my_attending == null ? (
                                <>
                                  <span className="text-[10px] text-yellow-500/70">¿Vas?</span>
                                  <button
                                    onClick={() => handleSetAttending(gig.id, true)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 text-zinc-500 cursor-pointer transition-colors"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    onClick={() => handleSetAttending(gig.id, false)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 cursor-pointer transition-colors"
                                  >
                                    No
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${gig.my_attending ? "text-green-400" : "text-red-400"}`}>
                                    {gig.my_attending ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                                    {gig.my_attending ? "Vas" : "No vas"}
                                  </span>
                                  <button
                                    onClick={() => handleSetAttending(gig.id, null)}
                                    className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                                  >
                                    cambiar
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Monto */}
                        {gig.is_owner ? (
                          <span className={`text-sm font-bold shrink-0 ${isPast ? "text-zinc-600" : "text-green-400"}`}>
                            ${fmtMoney(gig.amount)}
                          </span>
                        ) : gig.my_amount != null ? (
                          <span className={`text-sm font-bold shrink-0 ${isPast ? "text-zinc-600" : "text-green-400"}`}>
                            ${fmtMoney(gig.my_amount)}
                          </span>
                        ) : (
                          <button
                            onClick={() => { setEarningsGig(gig); setEarningsAmount(""); setEarningsCollected(""); }}
                            className="text-xs text-zinc-700 hover:text-green-400 transition-colors shrink-0 cursor-pointer"
                          >
                            + Mi pago
                          </button>
                        )}

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

      {deleting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full text-sm text-zinc-300 shadow-xl">
          Eliminando...
        </div>
      )}
    </div>
  );
}
