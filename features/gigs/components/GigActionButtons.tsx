import { Lock, Pencil, Trash2 } from "lucide-react";

import type { Gig } from "@/features/gigs/types/gig";

interface GigActionButtonsProps {
  gig: Gig;
  onEdit: (gig: Gig) => void;
  onDelete: (gigId: string) => void;
}

export function GigActionButtons({
  gig,
  onEdit,
  onDelete,
}: GigActionButtonsProps) {
  if (!gig.is_owner) {
    return (
      <div
        className="flex items-center gap-1 text-zinc-600"
        title="Gig de banda (solo lectura)"
      >
        <Lock size={13} />
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onEdit(gig)}
        className="p-1.5 rounded-md text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
        title="Editar"
      >
        <Pencil size={14} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(gig.id)}
        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        title="Eliminar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
