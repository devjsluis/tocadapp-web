"use client";

import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSubscriptionsService } from "@/features/subscriptions/services/admin-subscriptions.service";
import type {
  AdminSubscriptionUser,
  SubscriptionPayment,
} from "@/features/subscriptions/types/admin-subscription";

type AccessMode = "months" | "date";

const formatMoney = (amount: number | null, currency = "MXN") => {
  if (amount === null) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount / 100);
};

const formatDate = (date: string | null) => {
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(date));
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ?? "No fue posible completar la operación"
    );
  }

  return "Ocurrió un error inesperado";
};

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<AdminSubscriptionUser[]>([]);
  const [selectedUser, setSelectedUser] =
    useState<AdminSubscriptionUser | null>(null);

  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);

  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [accessMode, setAccessMode] = useState<AccessMode>("months");

  const [months, setMonths] = useState("1");
  const [accessUntil, setAccessUntil] = useState("");

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const result = await adminSubscriptionsService.getAll();
      setUsers(result.subscriptions);

      setSelectedUser((current) => {
        if (!current) return null;

        return (
          result.subscriptions.find(
            (user) => user.user_id === current.user_id,
          ) ?? null
        );
      });
    } catch (error) {
      toast.error("No se pudieron cargar los usuarios", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadPayments = useCallback(async (userId: number) => {
    setLoadingPayments(true);

    try {
      const result = await adminSubscriptionsService.getPayments(userId);

      setPayments(result.payments);
    } catch (error) {
      setPayments([]);

      toast.error("No se pudo cargar el historial", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!selectedUser) {
      setPayments([]);
      return;
    }

    void loadPayments(selectedUser.user_id);
  }, [selectedUser, loadPayments]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return users;

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, users]);

  const activeUsers = users.filter((user) => user.has_access).length;

  const handleSelectUser = (user: AdminSubscriptionUser) => {
    setSelectedUser(user);
    setMonths("1");
    setAccessUntil("");
  };

  const handleGrantAccess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      toast.error("Selecciona un usuario");
      return;
    }

    if (accessMode === "months") {
      const parsedMonths = Number(months);

      if (!Number.isInteger(parsedMonths) || parsedMonths <= 0) {
        toast.error("Ingresa una cantidad válida de meses");
        return;
      }
    }

    if (accessMode === "date" && !accessUntil) {
      toast.error("Selecciona la fecha final de acceso");
      return;
    }

    setSubmitting(true);

    try {
      await adminSubscriptionsService.grantAccess({
        userId: selectedUser.user_id,
        planCode: "TOCADAPP_MONTHLY",

        ...(accessMode === "months"
          ? {
              months: Number(months),
            }
          : {
              accessUntil: new Date(accessUntil).toISOString(),
            }),
      });

      toast.success("Suscripción actualizada", {
        description: `Se concedió acceso a ${selectedUser.name}`,
      });

      await Promise.all([loadUsers(), loadPayments(selectedUser.user_id)]);
    } catch (error) {
      toast.error("No se pudo actualizar la suscripción", {
        description: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Suscripciones
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Administra el acceso manual y consulta el historial de pagos.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadUsers()}
          disabled={loadingUsers}
          className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
        >
          <RefreshCw size={16} className={loadingUsers ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
          <p className="text-sm text-zinc-400">Usuarios registrados</p>
          <p className="mt-2 text-3xl font-bold">{users.length}</p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
          <p className="text-sm text-zinc-400">Con acceso activo</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {activeUsers}
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
          <p className="text-sm text-zinc-400">Sin suscripción activa</p>
          <p className="mt-2 text-3xl font-bold text-zinc-300">
            {users.length - activeUsers}
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Usuarios</h2>

            <div className="relative mt-4">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o correo"
                className="border-zinc-700 bg-zinc-950 pl-10 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {loadingUsers ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Cargando usuarios...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No se encontraron usuarios.
              </p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUser?.user_id === user.user_id;

                return (
                  <button
                    key={user.user_id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="rounded-xl bg-zinc-800 p-2 text-zinc-300">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">{user.name}</p>
                          <p className="truncate text-sm text-zinc-500">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.has_access
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {user.has_access ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}

                        {user.has_access ? "Activo" : "Sin acceso"}
                      </div>
                    </div>

                    {user.current_period_end && (
                      <p className="mt-3 text-xs text-zinc-500">
                        Vence: {formatDate(user.current_period_end)}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
            {!selectedUser ? (
              <div className="py-12 text-center">
                <CreditCard size={36} className="mx-auto text-zinc-600" />

                <p className="mt-4 font-medium">Selecciona un usuario</p>

                <p className="mt-1 text-sm text-zinc-500">
                  Podrás conceder acceso manual a este usuario.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGrantAccess} className="space-y-5">
                <div>
                  <p className="text-sm text-zinc-500">
                    Otorgar acceso manual a
                  </p>
                  <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                  <p className="text-sm text-zinc-400">{selectedUser.email}</p>
                </div>

                {selectedUser.has_access && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-medium text-emerald-400">
                      Acceso activo
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Vence el {formatDate(selectedUser.current_period_end)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAccessMode("months")}
                    className={
                      accessMode === "months"
                        ? "border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                        : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
                    }
                  >
                    <Clock3 size={16} />
                    Por meses
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAccessMode("date")}
                    className={
                      accessMode === "date"
                        ? "border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                        : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
                    }
                  >
                    <CalendarDays size={16} />
                    Fecha exacta
                  </Button>
                </div>

                {accessMode === "months" ? (
                  <div className="space-y-2">
                    <Label htmlFor="months">Cantidad de meses</Label>

                    <Input
                      id="months"
                      type="number"
                      min="1"
                      max="120"
                      value={months}
                      onChange={(event) => setMonths(event.target.value)}
                      className="border-zinc-700 bg-zinc-950 text-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="accessUntil">Acceso hasta</Label>

                    <Input
                      id="accessUntil"
                      type="datetime-local"
                      value={accessUntil}
                      onChange={(event) => setAccessUntil(event.target.value)}
                      className="border-zinc-700 bg-zinc-950 text-white"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full bg-purple-700 font-semibold hover:bg-purple-800"
                >
                  {submitting ? "Otorgando..." : "Otorgar acceso"}
                </Button>
              </form>
            )}
          </Card>

          {selectedUser && (
            <Card className="border-zinc-800 bg-zinc-900 p-5 text-white">
              <div className="mb-4 flex items-center gap-2">
                <History size={19} className="text-purple-400" />
                <h2 className="text-lg font-semibold">Historial de pagos</h2>
              </div>

              {loadingPayments ? (
                <p className="py-6 text-center text-sm text-zinc-500">
                  Cargando historial...
                </p>
              ) : payments.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">
                  Este usuario todavía no tiene pagos.
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {formatMoney(payment.amount, payment.currency)}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDate(payment.paid_at)}
                          </p>
                        </div>

                        <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">
                          {payment.provider}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-zinc-400">
                        <p>Acceso: {formatDate(payment.access_from)}</p>
                        <p>Hasta: {formatDate(payment.access_until)}</p>

                        {payment.reference && (
                          <p>Referencia: {payment.reference}</p>
                        )}

                        {payment.notes && <p>Notas: {payment.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
