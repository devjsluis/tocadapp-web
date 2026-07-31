import type { Gig } from "@/features/gigs/types/gig";

export interface GigMonthGroup {
  label: string;
  gigs: Gig[];
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getCalendarDays(calendarDate: Date): Date[] {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // JavaScript usa domingo = 0 y sábado = 6.
  const daysBeforeMonth = firstDayOfMonth.getDay();
  const daysAfterMonth = 6 - lastDayOfMonth.getDay();

  const calendarStart = new Date(year, month, 1 - daysBeforeMonth);
  const totalDays = daysBeforeMonth + lastDayOfMonth.getDate() + daysAfterMonth;

  return Array.from({ length: totalDays }, (_, index) => {
    return new Date(
      calendarStart.getFullYear(),
      calendarStart.getMonth(),
      calendarStart.getDate() + index,
    );
  });
}

export function toDateInput(dateStr: string): string {
  return dateStr.split("T")[0];
}

export function toTimeInput(timeStr: string): string {
  return timeStr?.slice(0, 5) ?? "";
}

export function formatMoney(value: number | string): string {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function groupGigsByMonth(gigs: Gig[]): GigMonthGroup[] {
  const map = new Map<string, Gig[]>();

  for (const gig of gigs) {
    const date = parseLocalDate(gig.date);

    const key = date.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });

    const monthGigs = map.get(key) ?? [];
    monthGigs.push(gig);
    map.set(key, monthGigs);
  }

  return Array.from(map.entries()).map(([label, monthGigs]) => ({
    label,
    gigs: monthGigs,
  }));
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = String(timeStr).slice(0, 5).split(":").map(Number);

  return hours * 60 + minutes;
}

export function gigsConflict(a: Gig, b: Gig): boolean {
  if (a.id === b.id) return false;
  if (a.date.split("T")[0] !== b.date.split("T")[0]) return false;

  const startA = timeToMinutes(a.time);
  const endA = startA + Number(a.hours) * 60;

  const startB = timeToMinutes(b.time);
  const endB = startB + Number(b.hours) * 60;

  return startA < endB && startB < endA;
}

export function getConflictingGigIds(gigs: Gig[]): Set<string> {
  const conflictingIds = new Set<string>();

  for (let firstIndex = 0; firstIndex < gigs.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < gigs.length;
      secondIndex += 1
    ) {
      const firstGig = gigs[firstIndex];
      const secondGig = gigs[secondIndex];

      if (gigsConflict(firstGig, secondGig)) {
        conflictingIds.add(firstGig.id);
        conflictingIds.add(secondGig.id);
      }
    }
  }

  return conflictingIds;
}
