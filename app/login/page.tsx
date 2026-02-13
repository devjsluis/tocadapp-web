"use client";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-purple-500/30">
      <NavbarLanding />
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md space-y-6 animate-[fadeUp_0.8s_ease-out]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white">
              Bienvenido a{" "}
              <span className="bg-linear-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                Tocadapp
              </span>
            </h1>
            <p className="text-zinc-400">
              La mejor aplicación para tus eventos musicales
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-900/20 to-zinc-800/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative grid gap-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl backdrop-blur-xl">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label
                    htmlFor="email"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="new-email"
                    placeholder="Ingresa tu correo electrónico"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 focus-visible:border-purple-700 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label
                      htmlFor="password"
                      className="text-zinc-400 text-xs font-semibold uppercase tracking-wider"
                    >
                      Contraseña
                    </Label>
                    <Link href="/forgot-password">
                      <button className="text-xs text-purple-500 hover:text-purple-400 transition-colors cursor-pointer">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Ingresa tu contraseña"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 focus-visible:border-purple-700 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <Button className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800 text-white mt-4 text-lg shadow-[0_0_20px_rgba(126,34,206,0.3)] active:scale-[0.98] transition-all">
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-center text-sm text-zinc-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register">
                <button className="font-bold text-white hover:text-gray-300 transition-colors cursor-pointer">
                  Regístrate gratis
                </button>
              </Link>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-white transition-all bg-transparent hover:bg-transparent"
              onClick={() => router.push("/")}
            >
              ← Volver a la página principal
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
