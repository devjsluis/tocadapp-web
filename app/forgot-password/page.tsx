"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      let message = "Error al enviar el correo. Intenta de nuevo.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || message;
      }
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <NavbarLanding />
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md space-y-6 animate-[fadeUp_0.8s_ease-out]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Recuperar acceso
            </h2>
            <p className="text-zinc-400">
              Te enviaremos un enlace para resetear tu contraseña
            </p>
          </div>

          <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-10">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="text-purple-500" size={48} />
                <p className="text-white font-semibold text-lg">
                  Revisa tu correo
                </p>
                <p className="text-zinc-400 text-sm">
                  Si el correo está registrado, recibirás un enlace en breve. No
                  olvides revisar la carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                  >
                    Correo de recuperación
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus:border-purple-700"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800"
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              ← Volver al login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
