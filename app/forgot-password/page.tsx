"use client";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
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
            <div className="grid gap-4">
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
                  className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus:border-purple-700"
                />
              </div>
              <Button className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800">
                Enviar enlace
              </Button>
            </div>
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
