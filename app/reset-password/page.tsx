"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Enlace inválido", {
        description: "No se encontró el token de recuperación.",
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      let message = "Error al resetear la contraseña. El enlace puede haber expirado.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || message;
      }
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <NavbarLanding />
        <main className="flex flex-1 items-center justify-center p-6 pt-32">
          <div className="w-full max-w-md space-y-6 text-center animate-[fadeUp_0.8s_ease-out]">
            <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-10">
              <div className="flex flex-col items-center gap-4">
                <XCircle className="text-red-500" size={48} />
                <p className="text-white font-semibold text-lg">Enlace inválido</p>
                <p className="text-zinc-400 text-sm">
                  Este enlace no es válido o ha expirado.
                </p>
                <Link href="/forgot-password">
                  <Button className="bg-purple-700 hover:bg-purple-800">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <NavbarLanding />
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md space-y-6 animate-[fadeUp_0.8s_ease-out]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Nueva contraseña
            </h2>
            <p className="text-zinc-400">Elige una contraseña segura</p>
          </div>

          <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-10">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="text-purple-500" size={48} />
                <p className="text-white font-semibold text-lg">
                  ¡Contraseña actualizada!
                </p>
                <p className="text-zinc-400 text-sm">
                  Redirigiendo al login en unos segundos...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                  >
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-zinc-900/50 border-zinc-800 text-white pr-12 focus:border-purple-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="confirm"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                  >
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus:border-purple-700"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800 mt-2"
                >
                  {loading ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </form>
            )}
          </div>

          {!success && (
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                ← Volver al login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
