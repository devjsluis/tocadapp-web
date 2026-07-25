"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Band } from "@/features/bands/types/band";
import type { GigFormData } from "@/features/gigs/types/gig";

type GigFormModalProps = {
  formData: GigFormData;
  bands: Band[];
  places: string[];
  isEditing: boolean;
  saving: boolean;
  onFieldChange: <K extends keyof GigFormData>(
    field: K,
    value: GigFormData[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

export function GigFormModal({
  formData,
  bands,
  places,
  isEditing,
  saving,
  onFieldChange,
  onSubmit,
  onClose,
}: GigFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
          aria-label="Cerrar formulario"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "Editar Tocada" : "Registrar Evento"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del evento (Ej: Boda Familia Perez)"
            value={formData.title}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
            onChange={(event) => onFieldChange("title", event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Lugar / Salón"
            value={formData.place}
            list="places-list"
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
            onChange={(event) => onFieldChange("place", event.target.value)}
            required
          />

          <datalist id="places-list">
            {places.map((place) => (
              <option key={place} value={place} />
            ))}
          </datalist>

          {bands.length > 0 && (
            <select
              value={formData.band_id}
              onChange={(event) => onFieldChange("band_id", event.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
            >
              <option value="">Sin banda (tocada personal)</option>

              {bands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.name}
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date}
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
              onChange={(event) => onFieldChange("date", event.target.value)}
              required
            />

            <input
              type="time"
              value={formData.time}
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white"
              onChange={(event) => onFieldChange("time", event.target.value)}
              required
            />
          </div>

          <input
            type="number"
            placeholder="Horas"
            value={formData.hours}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
            onChange={(event) => onFieldChange("hours", event.target.value)}
            min="0"
            step="0.5"
            required
          />

          <textarea
            placeholder="Notas (opcional)"
            value={formData.notes}
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-purple-500 text-white placeholder:text-zinc-500 resize-none"
            onChange={(event) => onFieldChange("notes", event.target.value)}
          />

          <Button
            type="submit"
            disabled={saving}
            className="disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? "Guardando..."
              : isEditing
                ? "Guardar Cambios"
                : "Guardar Tocada"}
          </Button>
        </form>
      </div>
    </div>
  );
}
