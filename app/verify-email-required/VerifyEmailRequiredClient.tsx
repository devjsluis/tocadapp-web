"use client";

import axios from "axios";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail, RefreshCw } from "lucide-react";
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
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChangeEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNewEmail = newEmail.trim().toLowerCase();

    if (!normalizedNewEmail) {
      toast.error("Ingresa el nuevo correo");
      return;
    }

    if (normalizedNewEmail === normalizedEmail) {
      toast.error("Usa un correo diferente");
      return;
    }

    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    if (sending) return;

    setSending(true);

    try {
      const response = await authService.changeUnverifiedEmail(
        normalizedEmail,
        normalizedNewEmail,
        password,
      );

      setEmail(response.email);
      setNewEmail("");
      setPassword("");
      setShowPassword(false);
      setEditingEmail(false);
      setSent(response.emailSent);

      if (response.emailSent) {
        toast.success("Correo actualizado", {
          description: response.message,
        });
      } else {
        toast.warning("Correo actualizado", {
          description: response.message,
        });
      }
    } catch (error) {
      let message = "No fue posible actualizar el correo.";

      if (axios.isAxiosError<ApiError>(error)) {
        message = error.response?.data?.error || message;
      }

      toast.error("No se pudo actualizar", {
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
              readOnly
              className="h-12 cursor-default border-zinc-800 bg-zinc-900 text-zinc-300"
            />
          </div>

          {!editingEmail ? (
            <>
              <Button
                type="button"
                onClick={() => void handleSendVerification()}
                disabled={sending || !email.trim()}
                className="mt-5 h-12 w-full bg-purple-700 font-bold hover:bg-purple-800"
              >
                <RefreshCw
                  size={17}
                  className={sending ? "animate-spin" : ""}
                />

                {sending
                  ? "Enviando..."
                  : sent
                    ? "Reenviar correo"
                    : "Enviar correo de verificación"}
              </Button>

              <button
                type="button"
                onClick={() => setEditingEmail(true)}
                disabled={sending}
                className="mt-4 w-full text-center text-sm font-semibold text-purple-400 transition-colors hover:text-purple-300 disabled:opacity-50"
              >
                ¿Escribiste mal tu correo? Corregirlo
              </button>
            </>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="new-verification-email"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Nuevo correo electrónico
                </label>

                <Input
                  id="new-verification-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="h-12 border-zinc-800 bg-zinc-900 text-white"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="verification-password"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <Input
                    id="verification-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    className="h-12 border-zinc-800 bg-zinc-900 pr-12 text-white"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleChangeEmail();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => void handleChangeEmail()}
                disabled={
                  sending ||
                  !newEmail.trim() ||
                  !password ||
                  newEmail.trim().toLowerCase() === email.trim().toLowerCase()
                }
                className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800"
              >
                {sending
                  ? "Actualizando..."
                  : "Actualizar correo y enviar enlace"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setEditingEmail(false);
                  setNewEmail("");
                  setPassword("");
                  setShowPassword(false);
                }}
                disabled={sending}
                className="w-full text-center text-sm text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}

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
