"use client";

import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Music2,
  NotebookPen,
  Timer,
  Users,
  X,
} from "lucide-react";

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

const fieldClassName =
  "h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartY = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const closeWithAnimation = useCallback(() => {
    if (saving) return;

    setIsVisible(false);
    setDragOffset(0);
    setIsDragging(false);

    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose, saving]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeWithAnimation();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";

      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [closeWithAnimation]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (saving || event.pointerType === "mouse") return;

    dragStartY.current = event.clientY;
    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartY.current === null) return;

    const distance = event.clientY - dragStartY.current;

    setDragOffset(Math.max(0, distance));
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    event.currentTarget.releasePointerCapture(event.pointerId);

    const shouldClose = dragOffset > 120;

    dragStartY.current = null;
    setIsDragging(false);

    if (shouldClose) {
      closeWithAnimation();
      return;
    }

    setDragOffset(0);
  };
  return (
    <div
      className={`
    fixed inset-0 z-50
    flex items-end justify-center
    backdrop-blur-sm
    transition-colors duration-250
    sm:items-center sm:p-4
    ${isVisible ? "bg-black/80" : "bg-black/0"}
  `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gig-form-title"
      onClick={closeWithAnimation}
    >
      <div
        className={`
    gig-modal-panel
    relative flex max-h-[94dvh] w-full flex-col
    overflow-hidden rounded-t-3xl
    border border-zinc-800 bg-zinc-950
    shadow-2xl will-change-transform
    sm:max-w-lg sm:rounded-3xl
    ${
      isDragging
        ? "transition-none"
        : "transition-[transform,opacity] duration-250 ease-out"
    }
    ${
      isVisible
        ? "opacity-100 sm:translate-y-0 sm:scale-100"
        : "opacity-0 sm:translate-y-4 sm:scale-95"
    }
  `}
        style={
          {
            "--sheet-translate-y": isVisible ? `${dragOffset}px` : "100%",
          } as React.CSSProperties
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="
    flex touch-none cursor-grab justify-center
    py-3 active:cursor-grabbing sm:hidden
  "
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          aria-label="Desliza hacia abajo para cerrar"
        >
          <div
            className={`
      h-1.5 rounded-full transition-[width,background-color]
      ${isDragging ? "w-14 bg-zinc-500" : "w-10 bg-zinc-700"}
    `}
          />
        </div>

        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="gig-form-title" className="text-xl font-bold text-white">
              {isEditing ? "Editar tocada" : "Nueva tocada"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {isEditing
                ? "Actualiza la información del evento."
                : "Agrega los datos principales de tu presentación."}
            </p>
          </div>

          <button
            type="button"
            onClick={closeWithAnimation}
            disabled={saving}
            className="
              flex h-9 w-9 shrink-0 cursor-pointer items-center
              justify-center rounded-full text-zinc-500
              transition-colors hover:bg-zinc-800 hover:text-white
              disabled:cursor-not-allowed disabled:opacity-50
            "
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="gig-form"
          onSubmit={onSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
        >
          {/* Información principal */}
          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Información principal
            </legend>

            <FormField
              id="gig-title"
              label="Nombre del evento"
              icon={<Music2 size={16} />}
            >
              <input
                id="gig-title"
                type="text"
                placeholder="Ingrese el nombre del evento"
                value={formData.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                className={fieldClassName}
                autoFocus={!isEditing}
                required
              />
            </FormField>

            <FormField
              id="gig-place"
              label="Lugar"
              icon={<MapPin size={16} />}
              hint={
                places.length > 0
                  ? "Puedes elegir un lugar usado anteriormente."
                  : undefined
              }
            >
              <input
                id="gig-place"
                type="text"
                placeholder="Ingrese el lugar donde será el evento"
                value={formData.place}
                list="places-list"
                onChange={(event) => onFieldChange("place", event.target.value)}
                className={fieldClassName}
                required
              />

              <datalist id="places-list">
                {places.map((place) => (
                  <option key={place} value={place} />
                ))}
              </datalist>
            </FormField>

            {bands.length > 0 && (
              <FormField id="gig-band" label="Banda" icon={<Users size={16} />}>
                <select
                  id="gig-band"
                  value={formData.band_id}
                  onChange={(event) =>
                    onFieldChange("band_id", event.target.value)
                  }
                  className={`${fieldClassName} cursor-pointer`}
                >
                  <option value="">Tocada personal / sin banda</option>

                  {bands.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </fieldset>

          <div className="h-px bg-zinc-800" />

          {/* Fecha y horario */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Fecha y horario
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="gig-date"
                label="Fecha"
                icon={<CalendarDays size={16} />}
              >
                <input
                  id="gig-date"
                  type="date"
                  value={formData.date}
                  onChange={(event) =>
                    onFieldChange("date", event.target.value)
                  }
                  className={fieldClassName}
                  required
                />
              </FormField>

              <FormField
                id="gig-time"
                label="Hora de inicio"
                icon={<Clock3 size={16} />}
              >
                <input
                  id="gig-time"
                  type="time"
                  value={formData.time}
                  onChange={(event) =>
                    onFieldChange("time", event.target.value)
                  }
                  className={fieldClassName}
                  required
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField
                id="gig-hours"
                label="Duración estimada"
                icon={<Timer size={16} />}
                hint="Puedes usar medios, por ejemplo 4.5 horas."
              >
                <div className="relative">
                  <input
                    id="gig-hours"
                    type="number"
                    inputMode="decimal"
                    placeholder="4"
                    value={formData.hours}
                    onChange={(event) =>
                      onFieldChange("hours", event.target.value)
                    }
                    min="0.5"
                    step="0.5"
                    className={`${fieldClassName} pr-16`}
                    required
                  />

                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-zinc-500">
                    horas
                  </span>
                </div>
              </FormField>
            </div>
          </fieldset>

          <div className="h-px bg-zinc-800" />

          {/* Notas */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Información adicional
            </legend>

            <FormField
              id="gig-notes"
              label="Notas"
              icon={<NotebookPen size={16} />}
              hint="Opcional"
            >
              <textarea
                id="gig-notes"
                placeholder="Punto de reunión, vestimenta, indicaciones..."
                value={formData.notes}
                rows={3}
                onChange={(event) => onFieldChange("notes", event.target.value)}
                className="
                  w-full resize-none rounded-xl border border-zinc-700
                  bg-zinc-800/80 px-3 py-3 text-sm text-white
                  outline-none transition-colors placeholder:text-zinc-500
                  focus:border-purple-500 focus:ring-2
                  focus:ring-purple-500/10
                "
              />
            </FormField>
          </fieldset>
        </form>

        {/* Acciones fijas */}
        <div className="border-t border-zinc-800 bg-zinc-950/95 px-5 py-4 backdrop-blur-sm sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={closeWithAnimation}
              disabled={saving}
              className="
                h-12 cursor-pointer text-zinc-400
                hover:bg-zinc-800 hover:text-white
                sm:w-auto
              "
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="gig-form"
              disabled={saving}
              className="
                h-12 cursor-pointer bg-purple-600 px-6 font-bold
                text-white hover:bg-purple-700
                disabled:cursor-not-allowed disabled:opacity-60
                sm:min-w-40
              "
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar tocada"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
};

function FormField({ id, label, icon, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <span className="text-zinc-500">{icon}</span>
          {label}
        </label>

        {hint && (
          <span className="hidden text-[11px] text-zinc-600 sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}

      {hint && (
        <p className="text-[11px] leading-4 text-zinc-600 sm:hidden">{hint}</p>
      )}
    </div>
  );
}
