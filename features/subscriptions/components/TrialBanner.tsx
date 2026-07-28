"use client";

import { Clock3, Sparkles } from "lucide-react";

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

export function TrialBanner() {
  const { subscription } = useSubscription();

  if (
    !subscription ||
    subscription.provider !== "TRIAL" ||
    subscription.status !== "ACTIVE"
  ) {
    return null;
  }

  const remainingDays = getRemainingDays(subscription.currentPeriodEnd);
  const formattedEndDate = formatEndDate(subscription.currentPeriodEnd);

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-linear-to-r from-purple-950/70 via-purple-900/30 to-zinc-900 p-4 shadow-lg shadow-purple-950/10">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
          <Sparkles size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-white">
              Estás usando la prueba gratuita
            </h2>

            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
              {remainingDays === 1
                ? "Último día"
                : `${remainingDays} días restantes`}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <Clock3 size={14} />
            Tu acceso gratuito termina el {formattedEndDate}.
          </p>
        </div>
      </div>
    </div>
  );
}
