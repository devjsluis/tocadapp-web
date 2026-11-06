import type { Gig } from "../types/gig";

export function FreeHoursNote({ gig }: { gig: Gig }) {
  const hours = Number(gig.free_hours ?? 0);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  return <span className="text-xs text-purple-300"> · {hours} {hours === 1 ? "hora gratis" : "horas gratis"}</span>;
}
