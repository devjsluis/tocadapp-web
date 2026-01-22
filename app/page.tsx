"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavbarLanding } from "@/components/customized/NavbarLanding";

export default function Home() {
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16">
        <NavbarLanding />
        <div className="flex flex-col items-center gap-8 justify-between text-center">
          <h1 className="text-7xl font-bold tracking-tight text-white md:text-7xl">
            Toma el control de tus{" "}
            <strong className="text-purple-700 italic ">eventos</strong>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Agenda tus presentaciones, compártelas con tu banda y controla tus
            ingresos y tus gastos sin complicaciones, con esta herramienta
            diseñada para todos los músicos.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            size="xl"
            onClick={redirectToLogin}
            className="border-2 bg-lime-400 border-lime-400 text-black hover:bg-lime-500 font-bold text-lg"
          >
            Empieza gratis
          </Button>
          <Button
            size="xl"
            className="border-2 bg-black text-white hover:bg-neutral-900 font-bold border-white text-lg"
          >
            Ver demo
          </Button>
        </div>
      </main>
    </div>
  );
}
