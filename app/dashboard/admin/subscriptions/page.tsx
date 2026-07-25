"use client";

import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
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

const toDateTimeLocalValue = (date: string) => {
  const parsedDate = new Date(date);

  const offset = parsedDate.getTimezoneOffset();
  const localDate = new Date(parsedDate.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
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
  const [amountMxn, setAmountMxn] = useState("49");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");

  const [editingPayment, setEditingPayment] =
    useState<SubscriptionPayment | null>(null);

  const [editAmountMxn, setEditAmountMxn] = useState("");
  const [editPaidAt, setEditPaidAt] = useState("");
  const [editAccessFrom, setEditAccessFrom] = useState("");
  const [editAccessUntil, setEditAccessUntil] = useState("");
  const [editReference, setEditReference] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [savingPayment, setSavingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(
    null,
  );

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
    handleCancelEditPayment();
    setSelectedUser(user);
    setMonths("1");
    setAccessUntil("");
    setAmountMxn("49");
    setPaymentReference("");
    setNotes("");
  };

  const handleGrantAccess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      toast.error("Selecciona un usuario");
      return;
    }

    const amount = Number(amountMxn);
    const amountInCents = Math.round(amount * 100);

    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("El monto no es válido");
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
        amount: amountInCents,
        currency: "MXN",

        ...(accessMode === "months"
          ? {
              months: Number(months),
            }
          : {
              accessUntil: new Date(accessUntil).toISOString(),
            }),

        paymentReference: paymentReference.trim() || undefined,

        notes: notes.trim() || undefined,
      });

      toast.success("Suscripción actualizada", {
        description: `Se concedió acceso a ${selectedUser.name}`,
      });

      await Promise.all([loadUsers(), loadPayments(selectedUser.user_id)]);

      setPaymentReference("");
      setNotes("");
    } catch (error) {
      toast.error("No se pudo actualizar la suscripción", {
        description: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditPayment = (payment: SubscriptionPayment) => {
    setEditingPayment(payment);

    setEditAmountMxn(String((payment.amount / 100).toFixed(2)));

    setEditPaidAt(toDateTimeLocalValue(payment.paid_at));

    setEditAccessFrom(toDateTimeLocalValue(payment.access_from));

    setEditAccessUntil(toDateTimeLocalValue(payment.access_until));

    setEditReference(payment.reference ?? "");
    setEditNotes(payment.notes ?? "");
  };

  const handleCancelEditPayment = () => {
    setEditingPayment(null);
    setEditAmountMxn("");
    setEditPaidAt("");
    setEditAccessFrom("");
    setEditAccessUntil("");
    setEditReference("");
    setEditNotes("");
  };

  const handleUpdatePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingPayment || !selectedUser) {
      return;
    }

    const amount = Number(editAmountMxn);
    const amountInCents = Math.round(amount * 100);

    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("El monto no es válido");
      return;
    }

    if (!editPaidAt || !editAccessFrom || !editAccessUntil) {
      toast.error("Completa todas las fechas");
      return;
    }

    const parsedAccessFrom = new Date(editAccessFrom);
    const parsedAccessUntil = new Date(editAccessUntil);

    if (parsedAccessUntil <= parsedAccessFrom) {
      toast.error("La fecha final debe ser posterior a la fecha inicial");
      return;
    }

    setSavingPayment(true);

    try {
      await adminSubscriptionsService.updatePayment(editingPayment.id, {
        amount: amountInCents,
        currency: editingPayment.currency,
        paidAt: new Date(editPaidAt).toISOString(),
        accessFrom: parsedAccessFrom.toISOString(),
        accessUntil: parsedAccessUntil.toISOString(),
        reference: editReference.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });

      toast.success("Pago actualizado");

      await Promise.all([loadPayments(selectedUser.user_id), loadUsers()]);

      handleCancelEditPayment();
    } catch (error) {
      toast.error("No se pudo actualizar el pago", {
        description: getErrorMessage(error),
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (payment: SubscriptionPayment) => {
    if (!selectedUser) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el pago de ${formatMoney(
        payment.amount,
        payment.currency,
      )}?`,
    );

    if (!confirmed) return;

    setDeletingPaymentId(payment.id);

    try {
      await adminSubscriptionsService.deletePayment(payment.id);

      toast.success("Pago eliminado");

      await Promise.all([loadPayments(selectedUser.user_id), loadUsers()]);

      if (editingPayment?.id === payment.id) {
        handleCancelEditPayment();
      }
    } catch (error) {
      toast.error("No se pudo eliminar el pago", {
        description: getErrorMessage(error),
      });
    } finally {
      setDeletingPaymentId(null);
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
            Administra el acceso y registra pagos manuales.
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
                  Podrás registrar un pago y conceder acceso.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGrantAccess} className="space-y-5">
                <div>
                  <p className="text-sm text-zinc-500">
                    Activar suscripción para
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

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto recibido en MXN</Label>

                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountMxn}
                    onChange={(event) => setAmountMxn(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia de pago</Label>

                  <Input
                    id="reference"
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="Ej. SPEI-123456"
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Información adicional del pago"
                    rows={3}
                    className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full bg-purple-700 font-semibold hover:bg-purple-800"
                >
                  {submitting ? "Registrando..." : "Registrar pago y activar"}
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

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">
                            {payment.provider}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleStartEditPayment(payment)}
                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            aria-label="Editar pago"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeletePayment(payment)}
                            disabled={deletingPaymentId === payment.id}
                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                            aria-label="Eliminar pago"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

          {editingPayment && (
            <Card className="border-purple-500/30 bg-zinc-900 p-5 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Editando pago</p>

                  <h2 className="text-lg font-semibold">
                    {formatMoney(
                      editingPayment.amount,
                      editingPayment.currency,
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCancelEditPayment}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdatePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editAmount">Monto recibido en MXN</Label>

                  <Input
                    id="editAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAmountMxn}
                    onChange={(event) => setEditAmountMxn(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPaidAt">Fecha del pago</Label>

                  <Input
                    id="editPaidAt"
                    type="datetime-local"
                    value={editPaidAt}
                    onChange={(event) => setEditPaidAt(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editAccessFrom">Acceso desde</Label>

                  <Input
                    id="editAccessFrom"
                    type="datetime-local"
                    value={editAccessFrom}
                    onChange={(event) => setEditAccessFrom(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editAccessUntil">Acceso hasta</Label>

                  <Input
                    id="editAccessUntil"
                    type="datetime-local"
                    value={editAccessUntil}
                    onChange={(event) => setEditAccessUntil(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editReference">Referencia</Label>

                  <Input
                    id="editReference"
                    value={editReference}
                    onChange={(event) => setEditReference(event.target.value)}
                    className="border-zinc-700 bg-zinc-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editNotes">Notas</Label>

                  <textarea
                    id="editNotes"
                    rows={3}
                    value={editNotes}
                    onChange={(event) => setEditNotes(event.target.value)}
                    className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditPayment}
                    className="flex-1 border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={savingPayment}
                    className="flex-1 bg-purple-700 hover:bg-purple-800"
                  >
                    <Save size={16} />
                    {savingPayment ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
