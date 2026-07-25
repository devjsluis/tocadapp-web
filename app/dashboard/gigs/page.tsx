"use client";

import { useEffect, useState } from "react";
import { gigsService } from "@/features/gigs/services/gigs.service";
import { bandsService } from "@/features/bands/services/bands.service";
import type { Band } from "@/features/bands/types/band";
import type {
  Gig,
  GigFilter,
  GigFormData,
  SaveGigPayload,
  ViewMode,
} from "@/features/gigs/types/gig";
import {
  formatMoney,
  getConflictingGigIds,
  groupGigsByMonth,
  parseLocalDate,
  toDateInput,
  toTimeInput,
} from "@/features/gigs/utils/gig.utils";
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  Music,
  Plus,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BandBadge } from "@/features/gigs/components/BandBadge";
import { ConfirmDeleteModal } from "@/features/gigs/components/ConfirmDeleteModal";
import { GigSkeleton } from "@/features/gigs/components/GigSkeleton";
import { CalendarView } from "@/features/gigs/components/CalendarView";
import { GigActionButtons } from "@/features/gigs/components/GigActionButtons";
import { MonthView } from "@/features/gigs/components/MonthView";

const emptyForm: GigFormData = {
  title: "",
  place: "",
  date: "",
  time: "",
  hours: "",
  notes: "",
  band_id: "",
};

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [gigFilter, setGigFilter] = useState<GigFilter>("all");
  const [formData, setFormData] = useState<GigFormData>(emptyForm);
  const [collectedGig, setCollectedGig] = useState<Gig | null>(null);
  const [collectedAmount, setCollectedAmount] = useState("");

  const fetchGigs = async () => {
    try {
      const gigsData = await gigsService.getAll();
      setGigs(gigsData);
    } catch (error) {
      console.error("Error al obtener tocadas", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBands = async () => {
    try {
      const availableBands = await bandsService.getAvailableForGigCreation();
      setBands(availableBands);
    } catch (error) {
      console.error("Error al obtener bandas", error);
    }
  };

  useEffect(() => {
    fetchGigs();
    fetchBands();
  }, []);

  const conflictingIds = getConflictingGigIds(gigs);

  const now = new Date();

  const getGigDate = (gig: Gig) =>
    new Date(`${gig.date.split("T")[0]}T${gig.time}`);

  const upcomingCardGigs = gigs
    .filter((gig) => getGigDate(gig) >= now)
    .sort((a, b) => getGigDate(a).getTime() - getGigDate(b).getTime());

  const pastCardGigs = gigs
    .filter((gig) => getGigDate(gig) < now)
    .sort((a, b) => getGigDate(b).getTime() - getGigDate(a).getTime());

  const filteredCardGigs =
    gigFilter === "upcoming"
      ? upcomingCardGigs
      : gigFilter === "past"
        ? pastCardGigs
        : [...upcomingCardGigs, ...pastCardGigs];

  const monthSortedGigs = [...gigs].sort((a, b) => {
    const dateA = getGigDate(a);
    const dateB = getGigDate(b);

    if (gigFilter === "upcoming") {
      return dateA.getTime() - dateB.getTime();
    }

    return dateB.getTime() - dateA.getTime();
  });

  const filteredMonthGigs = monthSortedGigs.filter((gig) => {
    const gigDate = new Date(`${gig.date.split("T")[0]}T${gig.time}`);

    if (gigFilter === "upcoming") return gigDate >= now;
    if (gigFilter === "past") return gigDate < now;

    return true;
  });

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
      const payload: SaveGigPayload = {
        ...formData,
        amount: null,
        band_id: formData.band_id || null,
      };

      if (editingGig) {
        await gigsService.update(editingGig.id, payload);
      } else {
        await gigsService.create(payload);
      }

      closeForm();
      await fetchGigs();
    } catch (error) {
      console.error("Error al guardar la tocada:", error);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await gigsService.delete(confirmDeleteId);
      setGigs((prev) => prev.filter((g) => g.id !== confirmDeleteId));
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSetAttending = async (
    gigId: string,
    attending: boolean | null,
  ) => {
    try {
      await gigsService.setAttendance(gigId, attending);
      setGigs((prev) =>
        prev.map((g) =>
          g.id === gigId ? { ...g, my_attending: attending } : g,
        ),
      );
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
    }
  };

  const saveCollected = async (amount: number | null) => {
    if (!collectedGig) return;
    try {
      if (collectedGig.is_owner) {
        await gigsService.setOwnerCollectedAmount(collectedGig.id, amount);
        setGigs((prev) =>
          prev.map((g) =>
            g.id === collectedGig.id ? { ...g, collected_amount: amount } : g,
          ),
        );
      } else {
        await gigsService.setMemberCollectedAmount(collectedGig.id, amount);
        setGigs((prev) =>
          prev.map((g) =>
            g.id === collectedGig.id ? { ...g, my_collected: amount } : g,
          ),
        );
      }
      setCollectedGig(null);
      setCollectedAmount("");
    } catch (error) {
      console.error("Error al guardar cobro:", error);
    }
  };

  const openCollectedModal = (gig: Gig, amount = "") => {
    setCollectedGig(gig);
    setCollectedAmount(amount);
  };

  const handleSaveCollected = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = collectedAmount === "" ? null : Number(collectedAmount);
    saveCollected(amount);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthGroups = groupGigsByMonth(filteredMonthGigs);

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
          <Button
            onClick={openCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} className="mr-1" /> Nueva Tocada
          </Button>
        </div>
      </div>

      {!loading && gigs.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-full sm:w-fit">
            {[
              { key: "upcoming", label: "Próximas" },
              { key: "past", label: "Pasadas" },
              { key: "all", label: "Todas" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGigFilter(tab.key as GigFilter)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  gigFilter === tab.key
                    ? "bg-purple-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-full sm:w-fit">
            <button
              onClick={() => setViewMode("grid")}
              title="Vista en tarjetas"
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid size={16} className="mx-auto" />
            </button>

            <button
              onClick={() => setViewMode("month")}
              title="Vista por mes"
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "month"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <List size={16} className="mx-auto" />
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              title="Vista calendario"
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <CalendarDays size={16} className="mx-auto" />
            </button>
          </div>
        </div>
      )}

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
                  ...new Set(gigs.map((g) => g.place.trim()).filter(Boolean)),
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

      {/* Modal: registrar cobro en gig personal */}
      {collectedGig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => {
                setCollectedGig(null);
                setCollectedAmount("");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-yellow-400" />
              <h2 className="text-xl font-bold">Registrar cobro</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-1">
              <span className="text-white font-semibold">
                {collectedGig.title}
              </span>
            </p>
            <form onSubmit={handleSaveCollected} className="space-y-4 mt-4">
              <input
                type="number"
                placeholder="¿Cuánto cobraste? $"
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-yellow-500 text-white placeholder:text-zinc-500 text-xl font-bold"
                autoFocus
                min="0"
                step="0.01"
              />
              <div className="flex gap-2">
                {(collectedGig.is_owner
                  ? collectedGig.collected_amount != null
                  : collectedGig.my_collected != null) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => saveCollected(null)}
                    className="flex-1 border border-zinc-700 text-zinc-500 hover:text-red-400 cursor-pointer py-6"
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
        <ConfirmDeleteModal
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
            Tienes{" "}
            <strong>
              {conflictingIds.size / 2 >= 1
                ? Math.ceil(conflictingIds.size / 2)
                : 1}{" "}
              conflicto(s)
            </strong>{" "}
            de horario — dos o más tocadas se empalman el mismo día y hora.
          </p>
        </div>
      )}

      {/* ── Vista Grid ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <GigSkeleton key={i} />)
            : filteredCardGigs.map((gig) => {
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
                    <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <GigActionButtons
                        gig={gig}
                        onEdit={openEdit}
                        onDelete={setConfirmDeleteId}
                      />
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
                        {gig.band_name && <BandBadge name={gig.band_name} />}
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
                      {(() => {
                        const cobro = gig.is_owner
                          ? gig.collected_amount
                          : gig.my_collected;
                        const cobroNum = cobro != null ? Number(cobro) : null;
                        return (
                          <div className="space-y-2">
                            {gig.notes && (
                              <p className="text-xs text-zinc-600 italic line-clamp-2 mb-1">
                                {gig.notes}
                              </p>
                            )}
                            {cobroNum === null ? (
                              <button
                                onClick={() => {
                                  setCollectedGig(gig);
                                  setCollectedAmount("");
                                }}
                                className="text-xs text-zinc-600 hover:text-yellow-400 transition-colors cursor-pointer"
                              >
                                + Registrar cobro
                              </button>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-green-400 font-bold flex items-center gap-1 text-base">
                                  <CheckCircle2 size={14} />$
                                  {formatMoney(cobroNum)}
                                </span>
                                <button
                                  onClick={() => {
                                    setCollectedGig(gig);
                                    setCollectedAmount(String(cobroNum));
                                  }}
                                  className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                                >
                                  editar cobro
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
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
                                onClick={() =>
                                  handleSetAttending(gig.id, false)
                                }
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
                              {gig.my_attending
                                ? "Vas a esta"
                                : "No vas a esta"}
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
        <MonthView
          monthGroups={monthGroups}
          conflictingIds={conflictingIds}
          today={today}
          onEditGig={openEdit}
          onDeleteGig={setConfirmDeleteId}
          onSetAttending={handleSetAttending}
          onOpenCollected={openCollectedModal}
        />
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

      {viewMode === "calendar" && !loading && (
        <CalendarView
          gigs={gigs}
          gigFilter={gigFilter}
          conflictingIds={conflictingIds}
          onEditGig={openEdit}
          onDeleteGig={setConfirmDeleteId}
        />
      )}

      {deleting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full text-sm text-zinc-300 shadow-xl">
          Eliminando...
        </div>
      )}

      {viewMode === "calendar" && loading && (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-6 w-36 bg-zinc-800 rounded" />
              <div className="h-3 w-52 bg-zinc-800 rounded" />
            </div>

            <div className="flex gap-2">
              <div className="h-9 w-16 bg-zinc-800 rounded-lg" />
              <div className="h-9 w-9 bg-zinc-800 rounded-lg" />
              <div className="h-9 w-9 bg-zinc-800 rounded-lg" />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800">
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-20 sm:min-h-32 border-b border-r border-zinc-800 p-2"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
