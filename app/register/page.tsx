"use client";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <NavbarLanding />
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md space-y-6 animate-[fadeUp_0.8s_ease-out]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white">
              Crea tu <span className="text-purple-600">Cuenta</span>
            </h1>
            <p className="text-zinc-400">
              Únete a la comunidad de músicos más organizada
            </p>
          </div>

          <div className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    autoComplete="given-name"
                    placeholder="Ingresa tu nombre"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="lastName"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                  >
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="Ingresa tu apellido"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                >
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="one-time-code"
                  placeholder="Ingresa tu correo electrónico"
                  className="h-12 bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-zinc-400 ml-1 text-xs font-semibold uppercase"
                >
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ingresa tu contraseña"
                  className="h-12 bg-zinc-900/50 border-zinc-800 text-white"
                />
              </div>
              <Button className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800 text-white mt-4 transition-all">
                Crear cuenta
              </Button>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-bold text-white hover:text-purple-400"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
