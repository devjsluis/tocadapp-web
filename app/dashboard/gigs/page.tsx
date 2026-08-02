"use client";

import { useEffect, useState } from "react";
import { bandsService } from "@/features/bands/services/bands.service";
import type { Band } from "@/features/bands/types/band";
import type { Gig, GigFilter, ViewMode } from "@/features/gigs/types/gig";
import {
  getConflictingGigIds,
  groupGigsByMonth,
} from "@/features/gigs/utils/gig.utils";
import {
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  List,
  Music,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/features/gigs/components/ConfirmDeleteModal";
import { GigSkeleton } from "@/features/gigs/components/GigSkeleton";
import { CalendarView } from "@/features/gigs/components/CalendarView";
import { MonthView } from "@/features/gigs/components/MonthView";
import { GridView } from "@/features/gigs/components/GridView";
import { CollectedAmountModal } from "@/features/gigs/components/CollectedAmountModal";
import { GigFormModal } from "@/features/gigs/components/GigFormModal";
import { useGigs } from "@/features/gigs/hooks/useGigs";
import { useGigForm } from "@/features/gigs/hooks/useGigForm";

export default function GigsPage() {
  const {
    gigs,
    loading,
    deleting,
    saveGig,
    deleteGig,
    setAttendance,
    setCollectedAmount: updateCollectedAmount,
  } = useGigs();

  const {
    showForm,
    formData,
    isEditing,
    saving,
    openCreate,
    openEdit,
    closeForm,
    updateField,
    submit,
  } = useGigForm({
    onSave: saveGig,
  });

  const [bands, setBands] = useState<Band[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [gigFilter, setGigFilter] = useState<GigFilter>("all");
  const [selectedBand, setSelectedBand] = useState("all");
  const [collectedGig, setCollectedGig] = useState<Gig | null>(null);
  const [collectedAmount, setCollectedAmount] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBands = async () => {
      try {
        const availableBands = await bandsService.getAvailableForGigCreation();

        if (!cancelled) {
          setBands(availableBands);
        }
      } catch (error) {
        console.error("Error al obtener bandas", error);
      }
    };

    void loadBands();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableBandNames = Array.from(
    new Set(
      gigs
        .map((gig) => gig.band_name?.trim())
        .filter((bandName): bandName is string => Boolean(bandName)),
    ),
  ).sort((first, second) => first.localeCompare(second, "es"));

  const bandFilteredGigs = gigs.filter((gig) => {
    if (selectedBand === "all") {
      return true;
    }

    if (selectedBand === "personal") {
      return !gig.band_name;
    }

    return gig.band_name === selectedBand;
  });

  const conflictingIds = getConflictingGigIds(bandFilteredGigs);
  const now = new Date();

  const getGigDate = (gig: Gig) =>
    new Date(`${gig.date.split("T")[0]}T${gig.time}`);

  const upcomingCardGigs = bandFilteredGigs
    .filter((gig) => getGigDate(gig) >= now)
    .sort((a, b) => getGigDate(a).getTime() - getGigDate(b).getTime());

  const pastCardGigs = bandFilteredGigs
    .filter((gig) => getGigDate(gig) < now)
    .sort((a, b) => getGigDate(b).getTime() - getGigDate(a).getTime());

  const filteredCardGigs =
    gigFilter === "upcoming"
      ? upcomingCardGigs
      : gigFilter === "past"
        ? pastCardGigs
        : [...upcomingCardGigs, ...pastCardGigs];

  const monthSortedGigs = [...bandFilteredGigs].sort((a, b) => {
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

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    const deleted = await deleteGig(confirmDeleteId);

    if (deleted) {
      setConfirmDeleteId(null);
    }
  };

  const saveCollected = async (amount: number | null) => {
    if (!collectedGig) return;

    const saved = await updateCollectedAmount(collectedGig, amount);

    if (saved) {
      setCollectedGig(null);
      setCollectedAmount("");
    }
  };

  const openCollectedModal = (gig: Gig, amount = "") => {
    setCollectedGig(gig);
    setCollectedAmount(amount);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthGroups = groupGigsByMonth(filteredMonthGigs);

  const availablePlaces = [
    ...new Set(gigs.map((gig) => gig.place.trim()).filter(Boolean)),
  ];

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
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1 lg:w-fit">
              {[
                { key: "upcoming", label: "Próximas" },
                { key: "past", label: "Pasadas" },
                { key: "all", label: "Todas" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setGigFilter(tab.key as GigFilter)}
                  className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors lg:flex-none ${
                    gigFilter === tab.key
                      ? "bg-purple-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-56 lg:w-auto">
                <label htmlFor="gig-band-filter" className="sr-only">
                  Filtrar por banda
                </label>

                <select
                  id="gig-band-filter"
                  value={selectedBand}
                  onChange={(event) => setSelectedBand(event.target.value)}
                  className="
              h-11 w-full cursor-pointer appearance-none rounded-xl
              border border-zinc-800 bg-zinc-900 px-3 pr-9
              text-sm text-zinc-300 outline-none
              transition-colors hover:border-zinc-700
              focus:border-purple-500
            "
                >
                  <option value="all">Todas las bandas</option>
                  <option value="personal">Tocadas personales</option>

                  {availableBandNames.map((bandName) => (
                    <option key={bandName} value={bandName}>
                      {bandName}
                    </option>
                  ))}
                </select>

                <Music
                  size={15}
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-600"
                />
              </div>

              <div className="flex w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1 sm:w-fit">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Vista en tarjetas"
                  className={`flex-1 cursor-pointer rounded-lg p-2 transition-colors sm:flex-none ${
                    viewMode === "grid"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <LayoutGrid size={16} className="mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  title="Vista por mes"
                  className={`flex-1 cursor-pointer rounded-lg p-2 transition-colors sm:flex-none ${
                    viewMode === "month"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <List size={16} className="mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  title="Vista calendario"
                  className={`flex-1 cursor-pointer rounded-lg p-2 transition-colors sm:flex-none ${
                    viewMode === "calendar"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <CalendarDays size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>

          {bandFilteredGigs.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">
                No hay tocadas para esta banda.
              </p>

              <button
                type="button"
                onClick={() => setSelectedBand("all")}
                className="mt-2 cursor-pointer text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Ver todas las tocadas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal crear / editar */}
      {showForm && (
        <GigFormModal
          formData={formData}
          bands={bands}
          places={availablePlaces}
          isEditing={isEditing}
          saving={saving}
          onFieldChange={updateField}
          onSubmit={submit}
          onClose={closeForm}
        />
      )}

      {/* Modal: registrar cobro en gig personal */}
      {collectedGig && (
        <CollectedAmountModal
          gig={collectedGig}
          amount={collectedAmount}
          onAmountChange={setCollectedAmount}
          onSave={saveCollected}
          onClose={() => {
            setCollectedGig(null);
            setCollectedAmount("");
          }}
        />
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
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <GigSkeleton key={index} />
              ))}
            </div>
          ) : (
            <GridView
              gigs={filteredCardGigs}
              conflictingIds={conflictingIds}
              today={today}
              onEditGig={openEdit}
              onDeleteGig={setConfirmDeleteId}
              onSetAttending={setAttendance}
              onOpenCollected={openCollectedModal}
            />
          )}
        </>
      )}

      {/* ── Vista Por Mes ── */}
      {viewMode === "month" && !loading && (
        <MonthView
          monthGroups={monthGroups}
          conflictingIds={conflictingIds}
          today={today}
          onEditGig={openEdit}
          onDeleteGig={setConfirmDeleteId}
          onSetAttending={setAttendance}
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
          gigs={bandFilteredGigs}
          gigFilter={gigFilter}
          conflictingIds={conflictingIds}
          onEditGig={openEdit}
          onDeleteGig={setConfirmDeleteId}
          onOpenCollected={openCollectedModal}
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
