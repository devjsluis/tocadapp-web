"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Plus, Users, Phone, Music, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Musician {
  id: string;
  name: string;
  instrument?: string;
  phone?: string;
  notes?: string;
}

const MusicianSkeleton = () => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-zinc-800" />
      <div>
        <div className="h-4 w-28 bg-zinc-800 rounded mb-1" />
        <div className="h-3 w-20 bg-zinc-800 rounded" />
      </div>
    </div>
    <div className="h-3 w-24 bg-zinc-800 rounded mt-3" />
  </div>
);

export default function MusiciansPage() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    instrument: "",
    phone: "",
    notes: "",
  });

  const fetchMusicians = async () => {
    try {
      const { data } = await api.get("/musicians");
      setMusicians(data.data);
    } catch (error) {
      console.error("Error al obtener músicos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/musicians", formData);
      setShowForm(false);
      setFormData({ name: "", instrument: "", phone: "", notes: "" });
      fetchMusicians();
    } catch (error) {
      alert(`Error al guardar músico: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este músico?")) return;
    setDeleting(id);
    try {
      await api.delete(`/musicians/${id}`);
      setMusicians((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      alert(`Error al eliminar: ${error}`);
    } finally {
      setDeleting(null);
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Contactos
          </h1>
          <p className="text-zinc-500 mt-1">Músicos con los que trabajas</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-1" /> Agregar Músico
        </Button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">Agregar Músico</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo *"
                value={formData.name}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Instrumento (Ej: Trompeta, Guitarra)"
                value={formData.instrument}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, instrument: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.phone}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <textarea
                placeholder="Notas adicionales"
                value={formData.notes}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500 resize-none"
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6"
              >
                Guardar Músico
              </Button>
            </form>
          </div>
        </div>
      )}

      {!loading && musicians.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-900 rounded-full mb-4">
            <Users size={40} className="text-zinc-700" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-1">
            Sin contactos registrados
          </h3>
          <p className="text-zinc-600 text-sm max-w-xs">
            Agrega los músicos con los que trabajas para tenerlos siempre a la
            mano.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <MusicianSkeleton key={i} />
            ))
          : musicians.map((musician) => (
              <div
                key={musician.id}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-purple-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                      {initials(musician.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">
                        {musician.name}
                      </h3>
                      {musician.instrument && (
                        <p className="text-xs text-purple-400 mt-0.5 flex items-center gap-1">
                          <Music size={10} />
                          {musician.instrument}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(musician.id)}
                    disabled={deleting === musician.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {(musician.phone || musician.notes) && (
                  <div className="mt-4 space-y-2 text-sm text-zinc-500 border-t border-zinc-800 pt-3">
                    {musician.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={13} className="text-zinc-600" />
                        {musician.phone}
                      </p>
                    )}
                    {musician.notes && (
                      <p className="text-zinc-600 text-xs italic line-clamp-2">
                        {musician.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
