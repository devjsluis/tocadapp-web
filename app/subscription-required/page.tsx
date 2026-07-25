"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { tokenStorage } from "@/features/auth/storage/token-storage";
import { subscriptionsService } from "@/features/subscriptions/services/subscriptions.service";
import type { CurrentSubscriptionResponse } from "@/features/subscriptions/types/subscription";

export default function SubscriptionRequiredPage() {
  const router = useRouter();

  const [subscriptionData, setSubscriptionData] =
    useState<CurrentSubscriptionResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const result = await subscriptionsService.getCurrent();
        setSubscriptionData(result);

        if (result.hasAccess) {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Error cargando la suscripción:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadSubscription();
  }, [router]);

  const handleLogout = () => {
    tokenStorage.remove();
    router.replace("/login");
  };

  const formattedExpiration = subscriptionData?.subscription?.currentPeriodEnd
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeZone: "America/Mexico_City",
      }).format(new Date(subscriptionData.subscription.currentPeriodEnd))
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <section className="w-full max-w-lg">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
              <CreditCard size={28} />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut size={16} />
              Cerrar sesión
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
              TocadApp mensual
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Activa tu suscripción
            </h1>

            <p className="text-zinc-400">
              Lleva el control de tus tocadas, pagos, bandas y músicos desde un
              solo lugar.
            </p>
          </div>

          <div className="my-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">$49</span>
              <span className="pb-1 text-zinc-400">MXN al mes</span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <Check size={17} className="text-purple-400" />
                Agenda ilimitada de tocadas
              </div>

              <div className="flex items-center gap-3">
                <Check size={17} className="text-purple-400" />
                Control de cobros y finanzas
              </div>

              <div className="flex items-center gap-3">
                <Check size={17} className="text-purple-400" />
                Administración de bandas y músicos
              </div>
            </div>
          </div>

          {!loading && formattedExpiration && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <CalendarDays size={20} className="mt-0.5 text-zinc-400" />

              <div>
                <p className="text-sm font-medium">
                  Tu acceso anterior venció o vencerá el
                </p>
                <p className="text-sm text-zinc-400">{formattedExpiration}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              className="h-12 w-full bg-purple-700 font-semibold hover:bg-purple-800"
              onClick={() => {
                window.location.href =
                  "https://wa.me/523411378792?text=Hola,%20quiero%20activar%20mi%20suscripción%20de%20TocadApp";
              }}
            >
              Solicitar activación
            </Button>

            <p className="text-center text-xs leading-relaxed text-zinc-500">
              Por ahora, los pagos se verifican manualmente mediante
              transferencia. Después de confirmar el pago se habilitará tu
              cuenta.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
