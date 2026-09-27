"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tokenStorage } from "@/features/auth/storage/token-storage";
import { subscriptionsService } from "@/features/subscriptions/services/subscriptions.service";
import type {
  CheckoutPlanCode,
  CurrentSubscriptionResponse,
} from "@/features/subscriptions/types/subscription";

const MONTHLY_PRICE = 79;
const YEARLY_PRICE = 699;
const YEARLY_SAVINGS = MONTHLY_PRICE * 12 - YEARLY_PRICE;

export default function SubscriptionRequiredPage() {
  const router = useRouter();
  const [checkoutStatus, setCheckoutStatus] = useState<
    string | null | undefined
  >(undefined);
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);

  const [subscriptionData, setSubscriptionData] =
    useState<CurrentSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] =
    useState<CheckoutPlanCode>("TOCADAPP_YEARLY");

  const loadSubscription = useCallback(async () => {
    try {
      const result = await subscriptionsService.getCurrent();
      setSubscriptionData(result);

      if (result.hasAccess) {
        router.replace("/dashboard");
      }

      return result;
    } catch (error) {
      console.error("Error cargando la suscripción:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckoutStatus(params.get("checkout"));
  }, []);

  useEffect(() => {
    if (checkoutStatus === undefined) {
      return;
    }

    if (checkoutStatus !== "success") {
      void loadSubscription();
      return;
    }

    let cancelled = false;

    const confirmSubscription = async () => {
      setConfirmingCheckout(true);

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const result = await loadSubscription();

        if (cancelled || result?.hasAccess) {
          return;
        }

        if (attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      if (!cancelled) {
        setConfirmingCheckout(false);

        toast.info("Tu pago está siendo confirmado", {
          description:
            "Si acabas de pagar, espera unos segundos y comprueba tu suscripción.",
        });
      }
    };

    void confirmSubscription();

    return () => {
      cancelled = true;
    };
  }, [checkoutStatus, loadSubscription]);

  useEffect(() => {
    if (checkoutStatus !== "canceled") {
      return;
    }

    toast.info("Pago cancelado", {
      description: "No se realizó ningún cargo.",
    });

    router.replace("/subscription-required");
  }, [checkoutStatus, router]);

  const handleLogout = () => {
    tokenStorage.remove();
    router.replace("/login");
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSubscribe = async () => {
    if (checkoutLoading) return;

    try {
      setCheckoutLoading(true);

      const result = await subscriptionsService.createCheckout(selectedPlan);

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error("Error creando Checkout:", error);

      toast.error("No pudimos iniciar el pago", {
        description: "Intenta nuevamente en unos momentos.",
      });

      setCheckoutLoading(false);
    }
  };

  const handleCheckSubscription = async () => {
    setLoading(true);

    const result = await loadSubscription();

    if (result?.hasAccess) {
      toast.success("Suscripción encontrada", {
        description: "Tu acceso a TocadApp está activo.",
      });
      return;
    }

    toast.info("Aún no encontramos una suscripción activa.");
  };

  const subscription = subscriptionData?.subscription;

  const formattedExpiration = subscription?.currentPeriodEnd
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeZone: "America/Mexico_City",
      }).format(new Date(subscription.currentPeriodEnd))
    : null;

  const wasTrial = subscription?.provider === "TRIAL";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <CreditCard size={24} />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-purple-400 uppercase">
                TocadApp
              </p>
              <p className="text-sm text-zinc-500">
                Tu actividad musical en un solo lugar
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-2xl">
          <div className="border-b border-zinc-800 bg-linear-to-br from-purple-950/60 via-zinc-900 to-zinc-950 px-6 py-10 text-center sm:px-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
              <Sparkles size={24} />
            </div>

            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-purple-400 uppercase">
              Acceso completo
            </p>

            <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              {wasTrial
                ? "Tu prueba gratuita ha terminado"
                : "Continúa usando TocadApp"}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Organiza tus tocadas, bandas, músicos, cobros e ingresos con todas
              las herramientas de TocadApp.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            {!loading && formattedExpiration && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <CalendarDays
                  size={20}
                  className="mt-0.5 shrink-0 text-zinc-400"
                />

                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {wasTrial
                      ? "Tu periodo de prueba terminó el"
                      : "Tu acceso anterior terminó el"}
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-500">
                    {formattedExpiration}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedPlan("TOCADAPP_MONTHLY")}
                className={`cursor-pointer rounded-2xl border p-6 text-left transition-all ${
                  selectedPlan === "TOCADAPP_MONTHLY"
                    ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">Mensual</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Flexibilidad mes con mes
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      selectedPlan === "TOCADAPP_MONTHLY"
                        ? "border-purple-400 bg-purple-500 shadow-[inset_0_0_0_4px_#18181b]"
                        : "border-zinc-700"
                    }`}
                  />
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${MONTHLY_PRICE}</span>
                  <span className="text-sm text-zinc-500">MXN/mes</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("TOCADAPP_YEARLY")}
                className={`relative cursor-pointer rounded-2xl border p-6 text-left transition-all ${
                  selectedPlan === "TOCADAPP_YEARLY"
                    ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                }`}
              >
                <span className="absolute -top-3 left-5 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                  Ahorra ${YEARLY_SAVINGS}
                </span>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">Anual</p>
                    <p className="mt-1 text-sm text-purple-300">
                      La opción con mejor precio
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      selectedPlan === "TOCADAPP_YEARLY"
                        ? "border-purple-400 bg-purple-500 shadow-[inset_0_0_0_4px_#18181b]"
                        : "border-zinc-700"
                    }`}
                  />
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${YEARLY_PRICE}</span>
                  <span className="text-sm text-zinc-500">MXN/año</span>
                </div>

                <p className="mt-2 text-xs font-medium text-green-400">
                  Equivale a $58.25 MXN al mes
                </p>
              </button>
            </div>

            <div className="my-8 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-300 sm:grid-cols-2">
              {[
                "Agenda ilimitada de tocadas",
                "Calendario y vistas de eventos",
                "Control de cobros e ingresos",
                "Administración de bandas",
                "Gestión de músicos y contactos",
                "Acceso a futuras mejoras",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check
                    size={17}
                    className="shrink-0 text-purple-400"
                  />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mx-auto max-w-xl">
              <Button
                type="button"
                className="h-12 w-full bg-purple-700 font-semibold text-white hover:bg-purple-600"
                onClick={() => void handleSubscribe()}
                disabled={checkoutLoading || confirmingCheckout}
              >
                {confirmingCheckout
                  ? "Confirmando tu suscripción..."
                  : checkoutLoading
                    ? "Abriendo pago..."
                    : selectedPlan === "TOCADAPP_YEARLY"
                      ? "Continuar con el plan anual"
                      : "Continuar con el plan mensual"}
              </Button>

              <button
                type="button"
                disabled={loading}
                onClick={() => void handleCheckSubscription()}
                className="mt-4 w-full cursor-pointer text-center text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Comprobando..." : "Comprobar suscripción"}
              </button>

              <p className="mt-5 text-center text-xs leading-5 text-zinc-600">
                Podrás administrar o cancelar tu suscripción según el método de
                compra utilizado. Tus datos permanecerán guardados si tu
                suscripción termina.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
