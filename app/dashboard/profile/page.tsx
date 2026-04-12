"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", last_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/users/me")
      .then(({ data }) => {
        setForm({ name: data.name, last_name: data.last_name });
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
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
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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
    </div>
  );
}
