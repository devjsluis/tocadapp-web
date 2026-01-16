"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white md:text-6xl">
            TocadApp
          </h1>
          <p className="max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Agenda tus eventos, compártelos con tu banda y controla tus ingresos
            y tus gastos sin complicaciones.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            size="xl"
            onClick={redirectToLogin}
            className="border-2 border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-zinc-800 font-bold"
          >
            Empezar ahora
          </Button>
          <Button
            size="xl"
            className="border-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-300 font-bold dark:border-white"
          >
            Ver funcionamiento
          </Button>
        </div>

        <div className="grid w-full gap-6 pt-8 sm:grid-cols-3">
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                📅 Tocadas compartidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Lleva el control de los eventos que tienes con tu agrupación.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                🧑‍🎤 Agenda personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Registra tocadas extras y compromisos fuera de la banda.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                💰 Ingresos y gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Visualiza cuánto ganas al mes y en qué se va el dinero.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
