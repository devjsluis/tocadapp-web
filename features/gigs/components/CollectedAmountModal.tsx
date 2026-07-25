"use client";

import type { FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Gig } from "@/features/gigs/types/gig";

interface CollectedAmountModalProps {
  gig: Gig;
  amount: string;
  onAmountChange: (amount: string) => void;
  onSave: (amount: number | null) => Promise<void>;
  onClose: () => void;
}

export function CollectedAmountModal({
  gig,
  amount,
  onAmountChange,
  onSave,
  onClose,
}: CollectedAmountModalProps) {
  const hasExistingAmount = gig.is_owner
    ? gig.collected_amount != null
    : gig.my_collected != null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = amount === "" ? null : Number(amount);

    void onSave(parsedAmount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
          aria-label="Cerrar modal de cobro"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={18} className="text-yellow-400" />
          <h2 className="text-xl font-bold">Registrar cobro</h2>
        </div>

        <p className="text-zinc-500 text-sm mb-1">
          <span className="text-white font-semibold">{gig.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="number"
            placeholder="¿Cuánto cobraste? $"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:border-yellow-500 text-white placeholder:text-zinc-500 text-xl font-bold"
            autoFocus
            min="0"
            step="0.01"
          />

          <div className="flex gap-2">
            {hasExistingAmount && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void onSave(null)}
                className="flex-1 border border-zinc-700 text-zinc-500 hover:text-red-400 cursor-pointer py-6"
              >
                Borrar cobro
              </Button>
            )}

            <Button
              type="submit"
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 font-bold py-6 cursor-pointer"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
