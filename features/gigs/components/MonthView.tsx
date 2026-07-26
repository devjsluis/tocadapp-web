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
  onOpenCollected: (gig: Gig, amount?: string) => void;
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
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                {label}
              </h2>

              <div className="flex shrink-0 items-center gap-3">
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

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
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
                    className={`group px-4 py-4 transition-colors hover:bg-zinc-800/40 sm:px-5 ${
                      !isLast ? "border-b border-zinc-800/60" : ""
                    } ${
                      hasConflict && gig.my_attending === false
                        ? "opacity-50"
                        : hasConflict
                          ? "bg-yellow-500/3"
                          : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl ${
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
                          className="mt-0.5 text-[9px] uppercase opacity-70"
                          suppressHydrationWarning
                        >
                          {gigDate.toLocaleDateString("es-MX", {
                            weekday: "short",
                          })}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`min-w-0 truncate font-semibold ${
                              isPast ? "text-zinc-500" : "text-white"
                            }`}
                          >
                            {gig.title}
                          </p>

                          {gig.band_name && <BandBadge name={gig.band_name} />}

                          {hasConflict && (
                            <AlertTriangle
                              size={12}
                              className="shrink-0 text-yellow-500"
                            />
                          )}
                        </div>

                        <div className="mt-1 flex flex-col gap-1 text-xs text-zinc-600 sm:flex-row sm:items-center sm:gap-3">
                          <span className="flex min-w-0 items-center gap-1">
                            <MapPin size={11} className="shrink-0" />

                            <span className="truncate">{gig.place}</span>
                          </span>

                          <span className="flex shrink-0 items-center gap-1">
                            <Clock size={11} />
                            {String(gig.time).slice(0, 5)} · {gig.hours} hrs
                          </span>
                        </div>

                        {hasConflict && (
                          <div className="mt-2 flex items-center gap-2">
                            {gig.my_attending == null ? (
                              <>
                                <span className="text-[10px] text-yellow-500/70">
                                  ¿Vas?
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onSetAttending(gig.id, true)}
                                  className="cursor-pointer rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-green-500/20 hover:text-green-400"
                                >
                                  Sí
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onSetAttending(gig.id, false)}
                                  className="cursor-pointer rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <>
                                <span
                                  className={`flex items-center gap-1 text-[10px] font-semibold ${
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
                                  className="cursor-pointer text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
                                >
                                  cambiar
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        {collectedNumber === null ? (
                          <button
                            type="button"
                            onClick={() => onOpenCollected(gig)}
                            className="cursor-pointer text-xs text-zinc-600 transition-colors hover:text-yellow-400"
                          >
                            + Registrar cobro
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenCollected(gig, String(collectedNumber))
                            }
                            className="flex cursor-pointer flex-col items-end gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-800"
                          >
                            <span
                              className={`flex items-center gap-1 text-sm font-bold ${
                                isPast ? "text-green-500/70" : "text-green-400"
                              }`}
                            >
                              <CheckCircle2 size={12} />$
                              {formatMoney(collectedNumber)}
                            </span>

                            <span className="text-[10px] text-zinc-600">
                              editar cobro
                            </span>
                          </button>
                        )}

                        <div className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <GigActionButtons
                            gig={gig}
                            onEdit={onEditGig}
                            onDelete={onDeleteGig}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 sm:hidden">
                        <GigActionButtons
                          gig={gig}
                          onEdit={onEditGig}
                          onDelete={onDeleteGig}
                        />
                      </div>
                    </div>

                    <div className="mt-3 ml-14 sm:hidden">
                      {collectedNumber === null ? (
                        <button
                          type="button"
                          onClick={() => onOpenCollected(gig)}
                          className="flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 text-xs font-semibold text-yellow-500 transition-colors hover:bg-yellow-500/10"
                        >
                          + Registrar cobro
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCollected(gig, String(collectedNumber))
                          }
                          className="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-green-500/10 bg-green-500/5 px-3 transition-colors hover:bg-green-500/10"
                        >
                          <span className="flex items-center gap-1 text-sm font-bold text-green-400">
                            <CheckCircle2 size={13} />$
                            {formatMoney(collectedNumber)}
                          </span>

                          <span className="text-[10px] font-medium text-green-500/60">
                            editar cobro
                          </span>
                        </button>
                      )}
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
