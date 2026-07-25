import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
          <Trash2 size={22} className="text-red-400" />
        </div>

        <h3 className="font-bold text-lg text-center mb-1">
          ¿Eliminar tocada?
        </h3>

        <p className="text-zinc-400 text-sm text-center mb-6">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 border border-zinc-700 hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
