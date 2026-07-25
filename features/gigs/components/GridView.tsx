"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";

import { BandBadge } from "@/features/gigs/components/BandBadge";
import { GigActionButtons } from "@/features/gigs/components/GigActionButtons";
import type { Gig } from "@/features/gigs/types/gig";
import { formatMoney, parseLocalDate } from "@/features/gigs/utils/gig.utils";

interface GridViewProps {
  gigs: Gig[];
  conflictingIds: Set<string>;
  today: Date;
  onEditGig: (gig: Gig) => void;
  onDeleteGig: (gigId: string) => void;
  onSetAttending: (gigId: string, attending: boolean | null) => Promise<void>;
  onOpenCollected: (gig: Gig, amount?: string) => void;
}

export function GridView({
  gigs,
  conflictingIds,
  today,
  onEditGig,
  onDeleteGig,
  onSetAttending,
  onOpenCollected,
}: GridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gigs.map((gig) => {
        const isPast = parseLocalDate(gig.date) < today;
        const hasConflict = conflictingIds.has(gig.id);

        const collected = gig.is_owner
          ? gig.collected_amount
          : gig.my_collected;

        const collectedNumber = collected != null ? Number(collected) : null;

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
            <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <GigActionButtons
                gig={gig}
                onEdit={onEditGig}
                onDelete={onDeleteGig}
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
                    <AlertTriangle size={9} />
                    Conflicto
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
                <Calendar size={14} className="text-zinc-600 shrink-0" />

                <span className="capitalize" suppressHydrationWarning>
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

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="space-y-2">
                {gig.notes && (
                  <p className="text-xs text-zinc-600 italic line-clamp-2 mb-1">
                    {gig.notes}
                  </p>
                )}

                {collectedNumber === null ? (
                  <button
                    type="button"
                    onClick={() => onOpenCollected(gig)}
                    className="text-xs text-zinc-600 hover:text-yellow-400 transition-colors cursor-pointer"
                  >
                    + Registrar cobro
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-bold flex items-center gap-1 text-base">
                      <CheckCircle2 size={14} />${formatMoney(collectedNumber)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCollected(gig, String(collectedNumber))
                      }
                      className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                    >
                      editar cobro
                    </button>
                  </div>
                )}
              </div>
            </div>

            {hasConflict && (
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                {gig.my_attending == null ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-500/80">
                      ¿Vas a ir a esta?
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSetAttending(gig.id, true)}
                        className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 text-zinc-400 transition-colors cursor-pointer"
                      >
                        Sí, voy
                      </button>

                      <button
                        type="button"
                        onClick={() => onSetAttending(gig.id, false)}
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
                        gig.my_attending ? "text-green-400" : "text-red-400"
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
                      type="button"
                      onClick={() => onSetAttending(gig.id, null)}
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
  );
}
