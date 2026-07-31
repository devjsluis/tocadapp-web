"use client";

import axios from "axios";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/features/auth/services/auth.service";

type VerifyEmailRequiredClientProps = {
  initialEmail: string;
  initiallySent: boolean;
};

type ApiError = {
  error?: string;
};

export function VerifyEmailRequiredClient({
  initialEmail,
  initiallySent,
}: VerifyEmailRequiredClientProps) {
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(initiallySent);

  const handleSendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Ingresa tu correo");
      return;
    }

    setSending(true);

    try {
      const response =
        await authService.resendEmailVerification(normalizedEmail);

      setSent(true);

      toast.success("Correo enviado", {
        description: response.message,
      });
    } catch (error) {
      let message = "No fue posible enviar el correo de verificación.";

      if (axios.isAxiosError<ApiError>(error)) {
        message = error.response?.data?.error || message;
      }

      toast.error("No se pudo enviar", {
        description: message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <NavbarLanding />

      <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-32">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
            {sent ? <CheckCircle2 size={32} /> : <Mail size={32} />}
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Revisa tu correo
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {sent
                ? "Enviamos un enlace para confirmar tu cuenta. Cuando lo abras podrás iniciar sesión en TocadApp."
                : "Tu correo electrónico todavía no está confirmado. Presiona el botón para recibir un enlace de verificación."}
            </p>
          </div>

          <div className="mt-7 space-y-2">
            <label
              htmlFor="verification-email"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Correo electrónico
            </label>

            <Input
              id="verification-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              className="h-12 border-zinc-800 bg-zinc-900 text-white"
            />
          </div>

          <Button
            type="button"
            onClick={() => void handleSendVerification()}
            disabled={sending}
            className="mt-5 h-12 w-full bg-purple-700 font-bold hover:bg-purple-800"
          >
            <RefreshCw size={17} className={sending ? "animate-spin" : ""} />

            {sending
              ? "Enviando..."
              : sent
                ? "Reenviar correo"
                : "Enviar correo de verificación"}
          </Button>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} />
            Volver a iniciar sesión
          </Link>

          <p className="mt-7 text-center text-xs leading-5 text-zinc-600">
            Revisa también las carpetas de spam, promociones o correo no
            deseado.
          </p>
        </section>
      </main>
    </div>
  );
}
