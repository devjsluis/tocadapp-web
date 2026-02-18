"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { authService } from "@/services/auth.service";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(formData);

      toast.success("¡Bienvenido!", {
        description: "Accediendo al dashboard",
      });

      router.push("/dashboard");
    } catch (err) {
      let message = "Credenciales incorrectas o error de servidor";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || message;
      }

      toast.error("Error al iniciar sesión", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-purple-500/30">
      <NavbarLanding />
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 animate-[fadeUp_0.8s_ease-out]"
        >
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                      <button
                        type="button"
                        className="text-xs text-purple-500 hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Ingresa tu contraseña"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-12 bg-zinc-900/50 border-zinc-800 text-white pr-12 focus-visible:ring-purple-700 transition-all placeholder:text-zinc-600"
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  disabled={loading}
                  className="h-12 w-full bg-purple-700 font-bold hover:bg-purple-800 text-white mt-2 shadow-[0_0_20px_rgba(126,34,206,0.3)] transition-all"
                >
                  {loading ? "Ingresando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-center text-sm text-zinc-500">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-bold text-white hover:text-gray-300 transition-colors cursor-pointer"
              >
                Regístrate gratis
              </Link>
            </p>
            <Link
              href="/"
              className="text-center text-sm text-zinc-500 hover:text-white transition-all bg-transparent hover:bg-transparent"
            >
              ← Volver a la página principal
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
