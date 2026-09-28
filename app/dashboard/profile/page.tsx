"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { subscriptionsService } from "@/features/subscriptions/services/subscriptions.service";
import type { CurrentSubscriptionResponse } from "@/features/subscriptions/types/subscription";
import { toast } from "sonner";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount / 100);

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", last_name: "" });
  const [subscriptionData, setSubscriptionData] =
    useState<CurrentSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

  const loadSubscription = async () => {
    const result = await subscriptionsService.getCurrent();
    setSubscriptionData(result);
  };

  useEffect(() => {
    Promise.all([
      api.get("/users/me"),
      subscriptionsService.getCurrent(),
    ])
      .then(([profileResponse, subscriptionResponse]) => {
        setForm({
          name: profileResponse.data.name,
          last_name: profileResponse.data.last_name,
        });
        setSubscriptionData(subscriptionResponse);
      })
      .catch(() => {
        toast.error("Error al cargar perfil");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/users/me", form);
      toast.success("Perfil actualizado");
    } catch (err: unknown) {
      const message =
        isAxiosError<{ error?: string }>(err) && err.response?.data?.error
          ? err.response.data.error
          : "Error al guardar";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      "¿Quieres cancelar la renovación automática? Mantendrás el acceso hasta que termine tu periodo actual.",
    );

    if (!confirmed) return;

    setManagingSubscription(true);

    try {
      await subscriptionsService.cancel();
      await loadSubscription();

      toast.success("Renovación cancelada", {
        description:
          "Mantendrás el acceso hasta que termine tu periodo actual.",
      });
    } catch (err: unknown) {
      const message =
        isAxiosError<{ error?: string }>(err) && err.response?.data?.error
          ? err.response.data.error
          : "No se pudo cancelar la renovación";

      toast.error(message);
    } finally {
      setManagingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setManagingSubscription(true);

    try {
      await subscriptionsService.reactivate();
      await loadSubscription();

      toast.success("Renovación reactivada");
    } catch (err: unknown) {
      const message =
        isAxiosError<{ error?: string }>(err) && err.response?.data?.error
          ? err.response.data.error
          : "No se pudo reactivar la renovación";

      toast.error(message);
    } finally {
      setManagingSubscription(false);
    }
  };

  const subscription = subscriptionData?.subscription;

  const intervalLabel =
    subscription?.plan.billingInterval === "YEAR" ? "año" : "mes";

  const statusLabel =
    subscription?.status === "ACTIVE"
      ? "Activa"
      : subscription?.status === "PAST_DUE"
        ? "Pago pendiente"
        : subscription?.status === "CANCELED"
          ? "Cancelada"
          : "Expirada";

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <section>
        <div className="mb-8 border-b border-zinc-800/50 pb-6">
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-zinc-500 mt-1">Edita tu nombre de usuario</p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-zinc-800 rounded-lg" />
            <div className="h-10 bg-zinc-800 rounded-lg" />
            <div className="h-12 bg-zinc-800 rounded-lg mt-2" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">
                Nombre
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">
                Apellido
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                required
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6 cursor-pointer mt-2"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        )}
      </section>

      {!loading && subscription && (
        <section className="border-t border-zinc-800/50 pt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">Mi suscripción</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Consulta tu plan y administra tu acceso a TocadApp.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {subscription.plan.name}
                </p>

                {subscription.provider === "STRIPE" && (
                  <p className="text-sm text-zinc-400 mt-1">
                    {formatPrice(
                      subscription.priceAmount,
                      subscription.currency,
                    )}{" "}
                    / {intervalLabel}
                  </p>
                )}
              </div>

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                {statusLabel}
              </span>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
              {subscription.provider === "TRIAL" && (
                <p className="text-zinc-400">
                  Periodo de prueba hasta{" "}
                  <span className="text-zinc-200">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
              )}

              {subscription.provider === "MANUAL" && (
                <p className="text-zinc-400">
                  Acceso disponible hasta{" "}
                  <span className="text-zinc-200">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
              )}

              {subscription.provider === "STRIPE" &&
                subscription.cancelAtPeriodEnd && (
                  <>
                    <p className="font-medium text-amber-300">
                      Cancelación programada
                    </p>
                    <p className="text-zinc-400">
                      No recibirás más cargos. Mantendrás acceso hasta{" "}
                      <span className="text-zinc-200">
                        {formatDate(subscription.currentPeriodEnd)}
                      </span>
                      .
                    </p>
                  </>
                )}

              {subscription.provider === "STRIPE" &&
                !subscription.cancelAtPeriodEnd &&
                subscription.status === "ACTIVE" && (
                  <p className="text-zinc-400">
                    Próxima renovación:{" "}
                    <span className="text-zinc-200">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </p>
                )}
            </div>

            {subscription.provider === "STRIPE" &&
              subscription.status === "ACTIVE" && (
                <div className="border-t border-zinc-800 pt-4">
                  {subscription.cancelAtPeriodEnd ? (
                    <Button
                      type="button"
                      disabled={managingSubscription}
                      onClick={() => void handleReactivateSubscription()}
                      className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
                    >
                      {managingSubscription
                        ? "Procesando..."
                        : "Reactivar renovación"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={managingSubscription}
                      onClick={() => void handleCancelSubscription()}
                      className="w-full border-zinc-700 cursor-pointer"
                    >
                      {managingSubscription
                        ? "Procesando..."
                        : "Cancelar renovación"}
                    </Button>
                  )}
                </div>
              )}
          </div>
        </section>
      )}
    </div>
  );
}
