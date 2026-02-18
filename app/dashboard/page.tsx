"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Borramos la cookie para que el 'proxy.ts' nos bloquee la entrada
    Cookies.remove("token");

    // 2. Limpiamos el header de Axios por seguridad
    delete api.defaults.headers.common["Authorization"];

    // 3. Mandamos al usuario de vuelta a la landing o login
    router.push("/");

    // Opcional: Refrescar para limpiar estados globales
    router.refresh();
  };

  return (
    <div className="bg-black h-dvh text-white flex flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">
          Bienvenido al Dashboard
        </h1>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-zinc-500 hover:text-white transition-all bg-transparent hover:bg-transparent"
        onClick={() => router.push("/")}
      >
        ← Volver a la página principal
      </Button>
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="flex gap-2 items-center font-bold hover:scale-105 transition-transform"
      >
        <LogOut size={18} />
        Cerrar Sesión
      </Button>
    </div>
  );
}
