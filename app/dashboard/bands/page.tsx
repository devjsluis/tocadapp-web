"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/axios";
import {
  Plus,
  Users2,
  Copy,
  Check,
  LogOut,
  Trash2,
  X,
  Shield,
  Music,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Band {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  owner_last_name: string;
  invite_code: string;
  is_owner: boolean;
  member_count: number;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  last_name: string;
  email: string;
  role: string;
  joined_at: string;
  can_create_gigs: boolean;
}

type ApiErrorResponse = {
  error?: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

const BandSkeleton = () => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="h-5 w-36 bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-24 bg-zinc-800 rounded" />
      </div>
      <div className="h-6 w-16 bg-zinc-800 rounded-full" />
    </div>
    <div className="h-3 w-full bg-zinc-800 rounded mt-4" />
  </div>
);

export default function BandsPage() {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [createData, setCreateData] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [membersModal, setMembersModal] = useState<{
    band: Band;
    members: Member[];
  } | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [bandToDelete, setBandToDelete] = useState<Band | null>(null);
  const [deletingBand, setDeletingBand] = useState(false);
  const [bandToLeave, setBandToLeave] = useState<Band | null>(null);
  const [leavingBand, setLeavingBand] = useState(false);

  const fetchBands = async () => {
    try {
      const { data } = await api.get("/bands");
      setBands(data.data);
    } catch {
      toast.error("Error al cargar bandas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBands();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/bands", createData);
      setBands((prev) => [...prev, data.data]);
      setShowCreateForm(false);
      setCreateData({ name: "", description: "" });
      toast.success("Banda creada");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al crear la banda"));
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/bands/join", { invite_code: joinCode });
      setShowJoinForm(false);
      setJoinCode("");
      toast.success("Te uniste a la banda");
      fetchBands();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Código inválido"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bandToDelete || deletingBand) return;

    setDeletingBand(true);

    try {
      await api.delete(`/bands/${bandToDelete.id}`);

      setBands((prev) => prev.filter((band) => band.id !== bandToDelete.id));

      toast.success("Banda eliminada");
      setBandToDelete(null);
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "No fue posible eliminar la banda"),
      );
    } finally {
      setDeletingBand(false);
    }
  };

  const handleLeave = async () => {
    if (!bandToLeave || leavingBand) return;

    setLeavingBand(true);

    try {
      await api.delete(`/bands/${bandToLeave.id}/leave`);

      setBands((prev) => prev.filter((band) => band.id !== bandToLeave.id));

      toast.success(`Saliste de ${bandToLeave.name}`);
      setBandToLeave(null);
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "No fue posible salir de la banda"),
      );
    } finally {
      setLeavingBand(false);
    }
  };

  const handleCopyCode = (band: Band) => {
    navigator.clipboard.writeText(band.invite_code);
    setCopiedId(band.id);
    toast.success("Código copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePermission = async (
    bandId: string,
    memberId: string,
    current: boolean,
  ) => {
    try {
      await api.patch(`/bands/${bandId}/members/${memberId}/permissions`, {
        can_create_gigs: !current,
      });
      setMembersModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === memberId ? { ...m, can_create_gigs: !current } : m,
          ),
        };
      });
      toast.success(!current ? "Permiso otorgado" : "Permiso removido");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error al actualizar permisos"));
    }
  };

  const openMembers = async (band: Band) => {
    setLoadingMembers(true);
    setMembersModal({ band, members: [] });
    try {
      const { data } = await api.get(`/bands/${band.id}/members`);
      setMembersModal({ band, members: data.data });
    } catch {
      toast.error("Error al cargar miembros");
    } finally {
      setLoadingMembers(false);
    }
  };

  const myBands = bands.filter((b) => b.is_owner);
  const joinedBands = bands.filter((b) => !b.is_owner);

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-0">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 border-b border-zinc-800/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-linear-to-r from-white to-zinc-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            Bandas
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Crea tu banda o únete a una con un código
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
          <Button
            onClick={() => setShowJoinForm(true)}
            variant="outline"
            className="h-11 w-full cursor-pointer border-zinc-700 bg-transparent px-3 text-white hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-300 sm:w-auto"
          >
            <Hash size={16} className="shrink-0 sm:mr-1" />

            <span className="hidden sm:inline">Unirme con código</span>
            <span className="sm:hidden">Unirme</span>
          </Button>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="h-11 w-full cursor-pointer bg-purple-600 px-3 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 sm:w-auto"
          >
            <Plus size={18} className="shrink-0 sm:mr-1" />

            <span className="hidden sm:inline">Nueva Banda</span>
            <span className="sm:hidden">Crear banda</span>
          </Button>
        </div>
      </div>

      {/* Modal crear */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
            <div className="mb-3 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">Crear Banda</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la banda *"
                value={createData.name}
                onChange={(e) =>
                  setCreateData({ ...createData, name: e.target.value })
                }
                required
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={createData.description}
                onChange={(e) =>
                  setCreateData({ ...createData, description: e.target.value })
                }
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500 resize-none"
              />
              <p className="text-xs text-zinc-500">
                Se generará un código de invitación automáticamente para que
                otros músicos puedan unirse.
              </p>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6 cursor-pointer"
              >
                {saving ? "Creando..." : "Crear Banda"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal unirse */}
      {showJoinForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
            <div className="mb-3 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>
            <button
              onClick={() => setShowJoinForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2">Unirme a una Banda</h2>
            <p className="text-zinc-500 text-sm mb-6">
              Pídele el código de 6 caracteres al encargado de la banda.
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Ej: AB3Z7K"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                required
                maxLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500 text-center text-2xl tracking-widest font-bold uppercase"
              />
              <Button
                type="submit"
                disabled={saving || joinCode.length < 6}
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6 cursor-pointer"
              >
                {saving ? "Uniéndome..." : "Unirme"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal miembros */}
      {membersModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
            <div className="mb-3 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>
            <button
              onClick={() => setMembersModal(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-1">{membersModal.band.name}</h2>
            <p className="text-zinc-500 text-sm mb-1">Integrantes</p>
            {membersModal.band.is_owner && (
              <p className="text-[11px] text-zinc-600 mb-5">
                Activa el permiso de un músico para que pueda agregar tocadas de
                banda.
              </p>
            )}
            {!membersModal.band.is_owner && <div className="mb-5" />}
            {loadingMembers ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-zinc-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {membersModal.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-zinc-800/50 space-y-2"
                  >
                    {/* Fila principal: avatar + nombre + rol */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                        {m.name[0]}
                        {m.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {m.name} {m.last_name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {m.email}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase shrink-0 ${
                          m.role === "leader"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-zinc-700/30 text-zinc-500 border-zinc-700/50"
                        }`}
                      >
                        {m.role === "leader" ? "Encargado" : "Músico"}
                      </span>
                    </div>

                    {/* Fila de permiso — solo visible para el encargado en filas de músicos */}
                    {membersModal.band.is_owner && m.role !== "leader" && (
                      <div className="flex items-center justify-between pl-11">
                        <span className="text-xs text-zinc-400">
                          Puede agregar tocadas de banda
                        </span>
                        <button
                          onClick={() =>
                            togglePermission(
                              membersModal.band.id,
                              m.id,
                              m.can_create_gigs,
                            )
                          }
                          title={
                            m.can_create_gigs ? "Quitar permiso" : "Dar permiso"
                          }
                          className="cursor-pointer shrink-0"
                        >
                          <div
                            className={`relative w-9 h-5 rounded-full transition-colors ${
                              m.can_create_gigs
                                ? "bg-purple-500"
                                : "bg-zinc-700"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                m.can_create_gigs
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {bandToDelete && (
        <div
          className="
      fixed inset-0 z-50 flex items-end justify-center
      bg-black/80 backdrop-blur-sm
      sm:items-center sm:p-4
    "
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-band-title"
          onClick={() => {
            if (!deletingBand) setBandToDelete(null);
          }}
        >
          <div
            className="
        relative w-full rounded-t-3xl border border-zinc-800
        bg-zinc-950 p-5 shadow-2xl
        sm:max-w-md sm:rounded-2xl sm:p-6
      "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>

            <button
              type="button"
              onClick={() => setBandToDelete(null)}
              disabled={deletingBand}
              className="
          absolute top-4 right-4 flex h-9 w-9 cursor-pointer
          items-center justify-center rounded-full text-zinc-500
          transition-colors hover:bg-zinc-800 hover:text-white
          disabled:cursor-not-allowed disabled:opacity-50
        "
              aria-label="Cerrar confirmación"
            >
              <X size={19} />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2 size={22} className="text-red-400" />
            </div>

            <h2
              id="delete-band-title"
              className="pr-10 text-xl font-bold text-white"
            >
              ¿Eliminar esta banda?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Vas a eliminar permanentemente{" "}
              <strong className="font-semibold text-white">
                {bandToDelete.name}
              </strong>
              .
            </p>

            <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/5 p-3">
              <p className="text-xs leading-5 text-red-300/80">
                Esta acción es irreversible. También podría afectar la
                información asociada a la banda, según el comportamiento
                configurado en el servidor.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={deletingBand}
                onClick={() => setBandToDelete(null)}
                className="h-11 cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={deletingBand}
                onClick={() => void handleDelete()}
                className="
            h-11 cursor-pointer bg-red-600 font-bold text-white
            hover:bg-red-700 disabled:cursor-not-allowed
          "
              >
                <Trash2 size={16} />

                {deletingBand ? "Eliminando..." : "Eliminar banda"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bandToLeave && (
        <div
          className="
      fixed inset-0 z-50 flex items-end justify-center
      bg-black/80 backdrop-blur-sm
      sm:items-center sm:p-4
    "
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-band-title"
          onClick={() => {
            if (!leavingBand) setBandToLeave(null);
          }}
        >
          <div
            className="
        relative w-full rounded-t-3xl border border-zinc-800
        bg-zinc-950 p-5 shadow-2xl
        sm:max-w-md sm:rounded-2xl sm:p-6
      "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>

            <button
              type="button"
              onClick={() => setBandToLeave(null)}
              disabled={leavingBand}
              className="
          absolute top-4 right-4 flex h-9 w-9 cursor-pointer
          items-center justify-center rounded-full text-zinc-500
          transition-colors hover:bg-zinc-800 hover:text-white
          disabled:cursor-not-allowed disabled:opacity-50
        "
              aria-label="Cerrar confirmación"
            >
              <X size={19} />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <LogOut size={22} className="text-orange-400" />
            </div>

            <h2
              id="leave-band-title"
              className="pr-10 text-xl font-bold text-white"
            >
              ¿Salir de esta banda?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Dejarás de formar parte de{" "}
              <strong className="font-semibold text-white">
                {bandToLeave.name}
              </strong>
              .
            </p>

            <div className="mt-4 rounded-xl border border-orange-500/15 bg-orange-500/5 p-3">
              <p className="text-xs leading-5 text-orange-200/80">
                Ya no podrás ver las nuevas tocadas de esta banda ni acceder a
                su información como integrante. Podrás volver a unirte si
                recibes otro código de invitación.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={leavingBand}
                onClick={() => setBandToLeave(null)}
                className="h-11 cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={leavingBand}
                onClick={() => void handleLeave()}
                className="
            h-11 cursor-pointer bg-orange-600 font-bold text-white
            hover:bg-orange-700 disabled:cursor-not-allowed
          "
              >
                <LogOut size={16} />

                {leavingBand ? "Saliendo..." : "Salir de la banda"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state global */}
      {!loading && bands.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <Users2 size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin bandas todavía
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Crea tu propia banda o únete a una con el código que te dé el
            encargado.
          </p>
        </div>
      )}

      {/* Mis bandas (soy encargado) */}
      {myBands.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-purple-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Mis Bandas
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <BandSkeleton key={i} />
                ))
              : myBands.map((band) => (
                  <div
                    key={band.id}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-lg leading-tight truncate">
                          {band.name}
                        </h3>
                        {band.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                            {band.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase ml-2 shrink-0">
                        Encargado
                      </span>
                    </div>

                    {/* Código de invitación */}
                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 mb-4">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                        Código de invitación
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold tracking-widest text-white">
                          {band.invite_code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(band)}
                          className="text-zinc-400 hover:text-purple-400 transition-colors p-1 cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedId === band.id ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => openMembers(band)}
                        className="text-xs text-zinc-400 hover:text-purple-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Music size={12} />
                        {band.member_count}{" "}
                        {band.member_count === 1 ? "integrante" : "integrantes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBandToDelete(band)}
                        className="
    flex cursor-pointer items-center gap-1 rounded-lg
    px-2 py-1 text-xs text-zinc-600
    transition-colors hover:bg-red-500/10 hover:text-red-400
    sm:opacity-0 sm:group-hover:opacity-100
  "
                        title="Eliminar banda"
                      >
                        <Trash2 size={15} />
                        <span className="sm:hidden">Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Bandas en las que participo */}
      {joinedBands.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Bandas en las que participo
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {joinedBands.map((band) => (
              <div
                key={band.id}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-lg leading-tight truncate">
                      {band.name}
                    </h3>
                    {band.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {band.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase ml-2 shrink-0">
                    Músico
                  </span>
                </div>

                <p className="text-xs text-zinc-500 mb-4">
                  Encargado: {band.owner_name} {band.owner_last_name}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => openMembers(band)}
                    className="text-xs text-zinc-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users2 size={12} />
                    {band.member_count}{" "}
                    {band.member_count === 1 ? "integrante" : "integrantes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBandToLeave(band)}
                    className="
    flex cursor-pointer items-center gap-1 rounded-lg
    px-2 py-1 text-xs text-zinc-600
    transition-colors hover:bg-red-500/10 hover:text-red-400
    sm:opacity-0 sm:group-hover:opacity-100
  "
                    title="Salir de la banda"
                  >
                    <LogOut size={13} />
                    Salir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
