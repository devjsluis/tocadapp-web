"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";

import { BandBadge } from "@/features/gigs/components/BandBadge";
import { GigActionButtons } from "@/features/gigs/components/GigActionButtons";
import type { Gig } from "@/features/gigs/types/gig";
import { formatMoney, parseLocalDate } from "@/features/gigs/utils/gig.utils";

interface MonthGroup {
  label: string;
  gigs: Gig[];
}

interface MonthViewProps {
  monthGroups: MonthGroup[];
  conflictingIds: Set<string>;
  today: Date;
  onEditGig: (gig: Gig) => void;
  onDeleteGig: (gigId: string) => void;
  onSetAttending: (gigId: string, attending: boolean | null) => Promise<void>;
  onOpenCollected: (gig: Gig, amount: string) => void;
}

export function MonthView({
  monthGroups,
  conflictingIds,
  today,
  onEditGig,
  onDeleteGig,
  onSetAttending,
  onOpenCollected,
}: MonthViewProps) {
  return (
    <div className="space-y-8">
      {monthGroups.map(({ label, gigs: monthGigs }) => {
        const monthCollected = monthGigs.reduce((total, gig) => {
          const collected = gig.is_owner
            ? gig.collected_amount
            : gig.my_collected;

          return total + (collected != null ? Number(collected) : 0);
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

                {monthCollected > 0 && (
                  <span className="text-sm font-bold text-green-400">
                    ${formatMoney(monthCollected)}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              {monthGigs.map((gig, index) => {
                const gigDate = parseLocalDate(gig.date);
                const isPast = gigDate < today;
                const isLast = index === monthGigs.length - 1;
                const hasConflict = conflictingIds.has(gig.id);

                const collected = gig.is_owner
                  ? gig.collected_amount
                  : gig.my_collected;

                const collectedNumber =
                  collected != null ? Number(collected) : null;

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
                        {gigDate.getDate()}
                      </span>

                      <span
                        className="text-[9px] uppercase mt-0.5 opacity-70"
                        suppressHydrationWarning
                      >
                        {gigDate.toLocaleDateString("es-MX", {
                          weekday: "short",
                        })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-semibold truncate ${
                            isPast ? "text-zinc-500" : "text-white"
                          }`}
                        >
                          {gig.title}
                        </p>

                        {gig.band_name && <BandBadge name={gig.band_name} />}

                        {hasConflict && (
                          <AlertTriangle
                            size={12}
                            className="text-yellow-500 shrink-0"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {gig.place}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {String(gig.time).slice(0, 5)} · {gig.hours} hrs
                        </span>
                      </div>

                      {hasConflict && (
                        <div className="flex items-center gap-2 mt-1">
                          {gig.my_attending == null ? (
                            <>
                              <span className="text-[10px] text-yellow-500/70">
                                ¿Vas?
                              </span>

                              <button
                                type="button"
                                onClick={() => onSetAttending(gig.id, true)}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 text-zinc-500 cursor-pointer transition-colors"
                              >
                                Sí
                              </button>

                              <button
                                type="button"
                                onClick={() => onSetAttending(gig.id, false)}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 cursor-pointer transition-colors"
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <>
                              <span
                                className={`text-[10px] font-semibold flex items-center gap-1 ${
                                  gig.my_attending
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {gig.my_attending ? (
                                  <CheckCircle2 size={11} />
                                ) : (
                                  <XCircle size={11} />
                                )}

                                {gig.my_attending ? "Vas" : "No vas"}
                              </span>

                              <button
                                type="button"
                                onClick={() => onSetAttending(gig.id, null)}
                                className="text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                              >
                                cambiar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {collectedNumber !== null ? (
                      <span
                        className={`text-sm font-bold shrink-0 flex items-center gap-1 ${
                          isPast ? "text-green-500/70" : "text-green-400"
                        }`}
                      >
                        <CheckCircle2 size={12} />$
                        {formatMoney(collectedNumber)}
                      </span>
                    ) : isPast ? (
                      <button
                        type="button"
                        onClick={() => onOpenCollected(gig, "")}
                        className="text-xs text-zinc-700 hover:text-yellow-400 transition-colors shrink-0 cursor-pointer"
                      >
                        + Cobro
                      </button>
                    ) : null}

                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <GigActionButtons
                        gig={gig}
                        onEdit={onEditGig}
                        onDelete={onDeleteGig}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
