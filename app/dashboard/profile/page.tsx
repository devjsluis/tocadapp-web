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
  const [activeTab, setActiveTab] = useState<"profile" | "subscription">(
    "profile",
  );

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Mi cuenta
        </h1>
        <p className="text-zinc-500 mt-1">
          Administra tu información personal y tu suscripción.
        </p>
      </div>

      <div className="mb-8 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/70"
          }`}
        >
          Perfil
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "subscription"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/70"
          }`}
        >
          Suscripción
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-40 bg-zinc-800 rounded-lg" />
            <div className="h-12 bg-zinc-800 rounded-lg" />
            <div className="h-12 bg-zinc-800 rounded-lg" />
            <div className="h-12 bg-zinc-800 rounded-lg" />
          </div>
        </div>
      ) : activeTab === "profile" ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">
              Información personal
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Actualiza los datos visibles de tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">
                Nombre
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-zinc-800/80 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white transition-colors"
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
                className="w-full bg-zinc-800/80 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white transition-colors"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 font-bold px-7 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>

          <div className="my-8 h-px bg-zinc-800" />

          <div>
            <h2 className="text-xl font-bold text-white">Legal y cuenta</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Consulta la información legal de TocadApp y las opciones relacionadas
              con tu cuenta.
            </p>

            <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800">
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4 transition-colors hover:bg-zinc-800/70"
              >
                <div>
                  <p className="font-medium text-zinc-200">
                    Términos y Condiciones
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Condiciones de uso de TocadApp
                  </p>
                </div>
                <span className="text-zinc-500">↗</span>
              </a>

              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4 transition-colors hover:bg-zinc-800/70"
              >
                <div>
                  <p className="font-medium text-zinc-200">
                    Política de Privacidad
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Cómo tratamos y protegemos tu información
                  </p>
                </div>
                <span className="text-zinc-500">↗</span>
              </a>

              <a
                href="/delete-account"
                className="flex items-center justify-between bg-zinc-900/50 px-5 py-4 transition-colors hover:bg-zinc-800/70"
              >
                <div>
                  <p className="font-medium text-red-400">Eliminar cuenta</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Información sobre la eliminación de tu cuenta y tus datos
                  </p>
                </div>
                <span className="text-zinc-500">→</span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Tu suscripción</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Consulta el estado de tu plan y administra tu renovación.
            </p>
          </div>

          {subscription ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Tu plan actual
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white">
                      {subscription.plan.name}
                    </h3>

                    {subscription.provider === "STRIPE" && (
                      <p className="mt-1 text-zinc-400">
                        {formatPrice(
                          subscription.priceAmount,
                          subscription.currency,
                        )}{" "}
                        / {intervalLabel}
                      </p>
                    )}
                  </div>

                  <span className="w-fit rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                    {statusLabel}
                  </span>
                </div>

                <div className="my-7 h-px bg-zinc-800" />

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Estado
                    </p>
                    <p className="mt-2 font-medium text-zinc-200">
                      {subscription.cancelAtPeriodEnd
                        ? "Cancelación programada"
                        : statusLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {subscription.provider === "STRIPE" &&
                      !subscription.cancelAtPeriodEnd
                        ? "Próxima renovación"
                        : "Acceso hasta"}
                    </p>
                    <p className="mt-2 font-medium text-zinc-200">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {subscription.provider === "TRIAL" && (
                  <div className="mt-7 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <p className="text-sm text-zinc-300">
                      Estás disfrutando tu periodo de prueba de TocadApp.
                    </p>
                  </div>
                )}

                {subscription.provider === "MANUAL" && (
                  <div className="mt-7 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <p className="text-sm font-medium text-zinc-300">
                      Acceso administrado por TocadApp
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      No necesitas administrar ningún método de pago para este
                      acceso.
                    </p>
                  </div>
                )}

                {subscription.provider === "STRIPE" &&
                  subscription.cancelAtPeriodEnd && (
                    <div className="mt-7 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="font-medium text-amber-300">
                        Tu renovación está cancelada
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        No recibirás más cargos y podrás seguir usando TocadApp
                        hasta {formatDate(subscription.currentPeriodEnd)}.
                      </p>
                    </div>
                  )}
              </div>

              {subscription.provider === "STRIPE" &&
                subscription.status === "ACTIVE" && (
                  <div className="border-t border-zinc-800 bg-zinc-950/30 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-zinc-500">
                        {subscription.cancelAtPeriodEnd
                          ? "Puedes reactivar la renovación antes de que termine tu acceso."
                          : "Puedes cancelar cuando quieras y conservarás el periodo ya pagado."}
                      </p>

                      {subscription.cancelAtPeriodEnd ? (
                        <Button
                          type="button"
                          disabled={managingSubscription}
                          onClick={() => void handleReactivateSubscription()}
                          className="shrink-0 bg-purple-600 hover:bg-purple-700 cursor-pointer"
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
                          className="shrink-0 border-zinc-700 cursor-pointer"
                        >
                          {managingSubscription
                            ? "Procesando..."
                            : "Cancelar renovación"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <p className="font-medium text-white">
                No tienes una suscripción activa
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Elige un plan para continuar usando TocadApp.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
