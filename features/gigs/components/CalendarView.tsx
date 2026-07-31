"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BandBadge } from "@/features/gigs/components/BandBadge";
import { GigActionButtons } from "@/features/gigs/components/GigActionButtons";
import type { Gig, GigFilter } from "@/features/gigs/types/gig";
import {
  formatMoney,
  getCalendarDays,
  isSameDay,
  parseLocalDate,
  timeToMinutes,
} from "@/features/gigs/utils/gig.utils";

type SlideDirection = "idle" | "next" | "previous";

interface CalendarViewProps {
  gigs: Gig[];
  gigFilter: GigFilter;
  conflictingIds: Set<string>;
  onEditGig: (gig: Gig) => void;
  onDeleteGig: (gigId: string) => void;
  onOpenCollected: (gig: Gig, amount?: string) => void;
}

export function CalendarView({
  gigs,
  gigFilter,
  conflictingIds,
  onEditGig,
  onDeleteGig,
  onOpenCollected,
}: CalendarViewProps) {
  const initialDate = new Date();

  const [calendarDate, setCalendarDate] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const [displayedDate, setDisplayedDate] = useState(calendarDate);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(
    initialDate,
  );

  const [slideDirection, setSlideDirection] = useState<SlideDirection>("idle");

  const [isSlideMoving, setIsSlideMoving] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const now = new Date();

  const getGigDate = (gig: Gig) =>
    new Date(`${gig.date.split("T")[0]}T${gig.time}`);

  const filteredCalendarGigs = gigs.filter((gig) => {
    const gigDate = getGigDate(gig);

    if (gigFilter === "upcoming") {
      return gigDate >= now;
    }

    if (gigFilter === "past") {
      return gigDate < now;
    }

    return true;
  });

  const getGigsForCalendarDay = (day: Date): Gig[] => {
    return filteredCalendarGigs
      .filter((gig) => isSameDay(parseLocalDate(gig.date), day))
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  };

  const selectedDayGigs = selectedCalendarDay
    ? getGigsForCalendarDay(selectedCalendarDay)
    : [];

  const nextCalendarDate = new Date(
    displayedDate.getFullYear(),
    displayedDate.getMonth() + 1,
    1,
  );

  const previousCalendarDate = new Date(
    displayedDate.getFullYear(),
    displayedDate.getMonth() - 1,
    1,
  );

  const currentCalendarDays = getCalendarDays(displayedDate);

  const incomingCalendarDays =
    slideDirection === "next"
      ? getCalendarDays(nextCalendarDate)
      : getCalendarDays(previousCalendarDate);

  const changeMonthWithAnimation = (
    direction: Exclude<SlideDirection, "idle">,
  ) => {
    if (slideDirection !== "idle") return;

    setSlideDirection(direction);
    setIsSlideMoving(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSlideMoving(true);
      });
    });

    window.setTimeout(() => {
      const amount = direction === "next" ? 1 : -1;

      setDisplayedDate((current) => {
        return new Date(current.getFullYear(), current.getMonth() + amount, 1);
      });

      setCalendarDate((current) => {
        return new Date(current.getFullYear(), current.getMonth() + amount, 1);
      });

      setSlideDirection("idle");
      setIsSlideMoving(false);
    }, 350);
  };

  const goToPreviousMonth = () => {
    changeMonthWithAnimation("previous");
  };

  const goToNextMonth = () => {
    changeMonthWithAnimation("next");
  };

  const goToCurrentMonth = () => {
    if (slideDirection !== "idle") return;

    const current = new Date();
    const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);

    setCalendarDate(currentMonth);
    setDisplayedDate(currentMonth);
    setSelectedCalendarDay(current);
  };

  const handleCalendarTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleCalendarTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;

    touchStartX.current = null;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      goToNextMonth();
    } else {
      goToPreviousMonth();
    }
  };

  const renderCalendarDays = (days: Date[], monthDate: Date) => {
    return days.map((day) => {
      const dayGigs = getGigsForCalendarDay(day);
      const hasGigs = dayGigs.length > 0;
      const isCurrentMonth = day.getMonth() === monthDate.getMonth();
      const isToday = isSameDay(day, new Date());

      const isSelected =
        selectedCalendarDay !== null && isSameDay(day, selectedCalendarDay);

      return (
        <button
          key={day.toISOString()}
          type="button"
          onClick={() => setSelectedCalendarDay(day)}
          className={`relative min-h-20 sm:min-h-32 border-b border-r border-zinc-800/70 p-1.5 sm:p-2 transition-colors cursor-pointer overflow-hidden ${
            isCurrentMonth
              ? "bg-zinc-950/20 hover:bg-zinc-800/50"
              : "bg-zinc-950/60"
          } ${
            isSelected
              ? "ring-1 ring-inset ring-purple-500 bg-purple-500/5"
              : ""
          }`}
        >
          <div className="flex justify-center mb-1.5">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-colors ${
                isToday
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-400/30"
                  : hasGigs
                    ? "bg-purple-600 text-white"
                    : isCurrentMonth
                      ? "text-zinc-300"
                      : "text-zinc-700"
              }`}
            >
              {day.getDate()}
            </span>
          </div>

          <div className="hidden sm:block space-y-1">
            {dayGigs.slice(0, 3).map((gig) => {
              const gigDate = getGigDate(gig);
              const isPast = gigDate < now;
              const hasConflict = conflictingIds.has(gig.id);

              let gigClass =
                "bg-purple-500/15 text-purple-300 border-purple-500/20";

              if (gig.my_attending === false) {
                gigClass =
                  "bg-red-500/10 text-red-400 border-red-500/20 opacity-60";
              } else if (hasConflict) {
                gigClass =
                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
              } else if (isPast) {
                gigClass = "bg-zinc-800 text-zinc-500 border-zinc-700";
              }

              return (
                <div
                  key={gig.id}
                  className={`truncate rounded-md border px-1.5 py-1 text-[10px] ${gigClass}`}
                  title={`${gig.title} · ${String(gig.time).slice(0, 5)}`}
                >
                  <span className="font-bold">
                    {String(gig.time).slice(0, 5)}
                  </span>{" "}
                  {gig.title}
                </div>
              );
            })}

            {dayGigs.length > 3 && (
              <div className="px-1 text-[10px] font-semibold text-zinc-500">
                +{dayGigs.length - 3} más
              </div>
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold capitalize text-white">
            {calendarDate.toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <p className="text-sm text-zinc-500">
            Selecciona un día para ver sus tocadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={goToCurrentMonth}
            className="border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            Hoy
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft size={18} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div
        onTouchStart={handleCalendarTouchStart}
        onTouchEnd={handleCalendarTouchEnd}
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 select-none touch-pan-y"
      >
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName) => (
            <div
              key={dayName}
              className="py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden">
          {slideDirection === "idle" ? (
            <div className="grid grid-cols-7">
              {renderCalendarDays(currentCalendarDays, displayedDate)}
            </div>
          ) : (
            <div
              className={`flex w-[200%] transform-gpu transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                slideDirection === "next"
                  ? isSlideMoving
                    ? "-translate-x-1/2"
                    : "translate-x-0"
                  : isSlideMoving
                    ? "translate-x-0"
                    : "-translate-x-1/2"
              }`}
            >
              {slideDirection === "previous" && (
                <div className="grid w-1/2 shrink-0 grid-cols-7">
                  {renderCalendarDays(
                    incomingCalendarDays,
                    previousCalendarDate,
                  )}
                </div>
              )}

              <div className="grid w-1/2 shrink-0 grid-cols-7">
                {renderCalendarDays(currentCalendarDays, displayedDate)}
              </div>

              {slideDirection === "next" && (
                <div className="grid w-1/2 shrink-0 grid-cols-7">
                  {renderCalendarDays(incomingCalendarDays, nextCalendarDate)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedCalendarDay && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-zinc-800">
            <div>
              <p className="font-bold capitalize text-white">
                {selectedCalendarDay.toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedDayGigs.length}{" "}
                {selectedDayGigs.length === 1 ? "tocada" : "tocadas"}
              </p>
            </div>
          </div>

          {selectedDayGigs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CalendarDays size={28} className="mx-auto mb-2 text-zinc-700" />

              <p className="text-sm text-zinc-500">
                No hay tocadas para este día.
              </p>
            </div>
          ) : (
            <div>
              {selectedDayGigs.map((gig, index) => {
                const gigDate = getGigDate(gig);
                const isPast = gigDate < now;
                const hasConflict = conflictingIds.has(gig.id);
                const collected = gig.is_owner
                  ? gig.collected_amount
                  : gig.my_collected;

                const collectedNumber =
                  collected != null ? Number(collected) : null;

                return (
                  <div
                    key={gig.id}
                    className={`flex items-start sm:items-center gap-3 px-4 sm:px-5 py-4 ${
                      index !== selectedDayGigs.length - 1
                        ? "border-b border-zinc-800"
                        : ""
                    } ${gig.my_attending === false ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        hasConflict
                          ? "bg-yellow-500/10 text-yellow-400"
                          : isPast
                            ? "bg-zinc-800 text-zinc-500"
                            : "bg-purple-500/15 text-purple-400"
                      }`}
                    >
                      <Clock size={14} />

                      <span className="text-[10px] font-bold mt-0.5">
                        {String(gig.time).slice(0, 5)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`font-semibold truncate ${
                            isPast ? "text-zinc-500" : "text-white"
                          }`}
                        >
                          {gig.title}
                        </p>

                        {gig.band_name && <BandBadge name={gig.band_name} />}

                        {hasConflict && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400">
                            <AlertTriangle size={10} />
                            Conflicto
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {gig.place}
                        </span>

                        <span>
                          {gig.hours}{" "}
                          {Number(gig.hours) === 1 ? "hora" : "horas"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                      {collectedNumber === null ? (
                        <button
                          type="button"
                          onClick={() => onOpenCollected(gig)}
                          className="inline-flex min-h-9 items-center rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-2.5 text-xs font-medium text-yellow-500 transition-colors hover:bg-yellow-500/10 cursor-pointer"
                        >
                          + Cobro
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCollected(gig, String(collectedNumber))
                          }
                          className="flex min-h-9 flex-col items-end justify-center rounded-lg px-2 transition-colors hover:bg-zinc-800 cursor-pointer"
                          title="Editar cobro"
                        >
                          <span className="flex items-center gap-1 text-sm font-bold text-green-400">
                            <CheckCircle2 size={12} />$
                            {formatMoney(collectedNumber)}
                          </span>

                          <span className="text-[10px] text-zinc-600">
                            Editar cobro
                          </span>
                        </button>
                      )}

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
          )}
        </div>
      )}
    </div>
  );
}
