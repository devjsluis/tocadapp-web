"use client";

import axios from "axios";
import { ArrowLeft, Eye, EyeOff, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/features/auth/services/auth.service";
import type { ApiError } from "@/types/auth";

export default function DeleteAccountPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!password.trim() || deleting) return;

    if (!confirming) {
      setConfirming(true);
      return;
    }

    try {
      setDeleting(true);

      await authService.deleteAccount(password);

      toast.success("Cuenta eliminada", {
        description: "Tu cuenta fue eliminada correctamente.",
      });

      router.replace("/login");
    } catch (error) {
      let message = "Revisa tu contraseña e intenta nuevamente.";

      if (axios.isAxiosError<ApiError>(error)) {
        message = error.response?.data?.error || message;
      }

      toast.error("No pudimos eliminar tu cuenta", {
        description: message,
      });

      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-zinc-300">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a tu perfil
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-400">
            Zona de peligro
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Eliminar cuenta
          </h1>

          <p className="mt-2 text-zinc-500">
            Esta acción es permanente y no se puede deshacer.
          </p>
        </div>

        <div className="mt-8 flex gap-4 rounded-2xl border border-red-900/50 bg-red-950/20 p-5">
          <TriangleAlert
            className="mt-0.5 shrink-0 text-red-400"
            size={24}
          />

          <div>
            <h2 className="font-semibold text-red-300">
              Antes de continuar
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Tu cuenta dejará de estar disponible y no podrás volver a iniciar
              sesión con ella. El historial compartido necesario para otras
              personas podrá conservarse de forma anonimizada.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <label
            htmlFor="delete-password"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400"
          >
            Confirma tu contraseña
          </label>

          <div className="relative mt-3">
            <Input
              id="delete-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setConfirming(false);
              }}
              disabled={deleting}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña actual"
              className="h-12 border-zinc-800 bg-zinc-900/50 pr-12 text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              disabled={deleting}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Necesitamos tu contraseña actual para confirmar que eres tú.
          </p>

          {confirming && (
            <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
              <p className="font-semibold text-red-300">
                ¿Seguro que quieres eliminar tu cuenta?
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Al continuar, iniciaremos la eliminación permanente de tu cuenta
                y de los datos personales que correspondan.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {confirming && (
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setConfirming(false)}
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Cancelar
              </Button>
            )}

            <Button
              type="button"
              disabled={deleting || !password.trim()}
              onClick={handleDelete}
              className="bg-red-600 font-bold text-white hover:bg-red-700"
            >
              <Trash2 size={18} />
              {deleting
                ? "Eliminando..."
                : confirming
                  ? "Sí, eliminar mi cuenta"
                  : "Eliminar mi cuenta"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
