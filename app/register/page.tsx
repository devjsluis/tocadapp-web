"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "musician",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.register(formData);

      toast.success("¡Cuenta creada!", {
        description: "Ya puedes iniciar sesión.",
      });
      router.push("/login");
    } catch (err) {
      let message = "Error al conectar con el servidor";

      if (axios.isAxiosError<ApiError>(err)) {
        message = err.response?.data?.error || message;
      }

      toast.error("Hubo un problema", { description: message });
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
              Crea tu <span className="text-purple-600">Cuenta</span>
            </h1>
            <p className="text-zinc-400">
              Únete a la comunidad de músicos más organizada
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-900/20 to-zinc-800/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    autoComplete="given-name"
                    required
                    placeholder="Ingresa tu nombre"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="lastName"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    required
                    placeholder="Ingresa tu apellido"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2 col-span-2">
                  <Label className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider">
                    Soy un...
                  </Label>
                  <Select
                    defaultValue={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus:ring-purple-700 transition-all">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectItem
                        value="musician"
                        className="focus:bg-purple-900/50 focus:text-white cursor-pointer"
                      >
                        Músico
                      </SelectItem>
                      <SelectItem
                        value="leader"
                        className="focus:bg-purple-900/50 focus:text-white cursor-pointer"
                      >
                        Encargado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 col-span-2">
                  <Label
                    htmlFor="email"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    Correo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="one-time-code"
                    placeholder="Ingresa tu correo electrónico"
                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2 col-span-2">
                  <Label
                    htmlFor="password"
                    className="text-zinc-400 ml-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Ingresa tu contraseña"
                      className="h-12 bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-purple-700 transition-all"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
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
                  className="col-span-2 h-12 w-full bg-purple-700 font-bold hover:bg-purple-800 text-white mt-4 text-lg shadow-[0_0_20px_rgba(126,34,206,0.3)] active:scale-[0.98] transition-all"
                >
                  {loading ? "Registrando..." : "Crear cuenta"}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="font-bold text-white hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Inicia sesión
            </Button>
          </p>
        </form>
      </main>
    </div>
  );
}
