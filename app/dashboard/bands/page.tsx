"use client";

import { useEffect, useState } from "react";
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al crear la banda");
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Código inválido");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (band: Band) => {
    if (!confirm(`¿Eliminar la banda "${band.name}"? Esto es irreversible.`))
      return;
    try {
      await api.delete(`/bands/${band.id}`);
      setBands((prev) => prev.filter((b) => b.id !== band.id));
      toast.success("Banda eliminada");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al eliminar");
    }
  };

  const handleLeave = async (band: Band) => {
    if (!confirm(`¿Salir de la banda "${band.name}"?`)) return;
    try {
      await api.delete(`/bands/${band.id}/leave`);
      setBands((prev) => prev.filter((b) => b.id !== band.id));
      toast.success("Saliste de la banda");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al salir");
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar permisos");
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Bandas
          </h1>
          <p className="text-zinc-500 mt-1">
            Crea tu banda o únete a una con un código
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowJoinForm(true)}
            variant="ghost"
            className="border border-zinc-700 hover:bg-zinc-800 cursor-pointer"
          >
            <Hash size={16} className="mr-1" /> Unirme con código
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus size={18} className="mr-1" /> Nueva Banda
          </Button>
        </div>
      </div>

      {/* Modal crear */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm relative">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setMembersModal(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-1">
              {membersModal.band.name}
            </h2>
            <p className="text-zinc-500 text-sm mb-1">Integrantes</p>
            {membersModal.band.is_owner && (
              <p className="text-[11px] text-zinc-600 mb-5">
                Activa el permiso de un músico para que pueda agregar tocadas de banda.
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
                        <p className="text-xs text-zinc-500 truncate">{m.email}</p>
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
                            m.can_create_gigs
                              ? "Quitar permiso"
                              : "Dar permiso"
                          }
                          className="cursor-pointer shrink-0"
                        >
                          <div
                            className={`relative w-9 h-5 rounded-full transition-colors ${
                              m.can_create_gigs ? "bg-purple-500" : "bg-zinc-700"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        onClick={() => handleDelete(band)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 p-1 cursor-pointer"
                        title="Eliminar banda"
                      >
                        <Trash2 size={15} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    onClick={() => handleLeave(band)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 flex items-center gap-1 text-xs cursor-pointer"
                    title="Salir de la banda"
                  >
                    <LogOut size={13} /> Salir
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
