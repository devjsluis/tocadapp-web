"use client";

import axios from "axios";
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth.service";

type VerificationStatus = "loading" | "success" | "error";

type VerifyEmailClientProps = {
  token: string;
};

type VerificationApiError = {
  error?: string;
  code?: string;
};

export function VerifyEmailClient({ token }: VerifyEmailClientProps) {
  const [status, setStatus] = useState<VerificationStatus>("loading");

  const [message, setMessage] = useState(
    "Estamos confirmando tu correo electrónico.",
  );

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("El enlace no contiene un token de verificación.");
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (!active) return;

        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        if (!active) return;

        let errorMessage = "No fue posible confirmar tu correo.";

        if (axios.isAxiosError<VerificationApiError>(error)) {
          errorMessage = error.response?.data?.error || errorMessage;
        }

        setStatus("error");
        setMessage(errorMessage);
      }
    };

    void verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <NavbarLanding />

      <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-32">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl sm:p-10">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
              status === "success"
                ? "bg-green-500/10 text-green-400"
                : status === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-purple-500/10 text-purple-400"
            }`}
          >
            {status === "loading" && (
              <LoaderCircle size={32} className="animate-spin" />
            )}

            {status === "success" && <CheckCircle2 size={32} />}

            {status === "error" && <MailWarning size={32} />}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {status === "loading" && "Verificando correo"}

            {status === "success" && "Correo confirmado"}

            {status === "error" && "No se pudo confirmar"}
          </h1>

          <p className="mt-4 text-sm leading-6 text-zinc-400">{message}</p>

          {status === "success" && (
            <Link href="/login">
              <Button className="mt-7 h-12 w-full bg-purple-700 font-bold hover:bg-purple-800">
                Iniciar sesión
              </Button>
            </Link>
          )}

          {status === "error" && (
            <div className="mt-7 space-y-3">
              <Link href="/verify-email-required">
                <Button className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800">
                  Solicitar otro enlace
                </Button>
              </Link>

              <Link
                href="/login"
                className="block text-sm text-zinc-500 transition-colors hover:text-white"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
