"use client";

import { useState } from "react";
import { AlertTriangle, Clock3, X } from "lucide-react";

import { useSubscription } from "../context/SubscriptionContext";

function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();

  const difference = end.getTime() - now.getTime();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.max(0, Math.ceil(difference / millisecondsPerDay));
}

function formatEndDate(endDate: string): string {
  return new Date(endDate).toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function SubscriptionExpirationBanner() {
  const { subscription } = useSubscription();
  const [visible, setVisible] = useState(true);

  if (
    !subscription ||
    subscription.provider === "TRIAL" ||
    subscription.status !== "ACTIVE"
  ) {
    return null;
  }

  const remainingDays = getRemainingDays(subscription.currentPeriodEnd);

  if (remainingDays > 7 || !visible) {
    return null;
  }

  const formattedEndDate = formatEndDate(subscription.currentPeriodEnd);

  return (
    <div className="relative rounded-2xl border border-amber-500/25 bg-linear-to-r from-amber-950/60 via-amber-900/20 to-zinc-900 p-4 pr-12 shadow-lg shadow-amber-950/10">
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X size={17} />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
          <AlertTriangle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-white">
              Tu suscripción está por vencer
            </h2>

            <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
              {remainingDays === 0
                ? "Vence hoy"
                : remainingDays === 1
                  ? "Vence mañana"
                  : `${remainingDays} días restantes`}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <Clock3 size={14} />
            Tu acceso termina el {formattedEndDate}.
          </p>
        </div>
      </div>
    </div>
  );
}
