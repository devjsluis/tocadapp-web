import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eliminar cuenta | TocadApp",
  description:
    "Información para solicitar la eliminación de una cuenta de TocadApp y sus datos asociados.",
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-black to-zinc-950 px-5 py-12 text-zinc-300 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-purple-400 transition-colors hover:text-purple-300"
        >
          ← Volver a TocadApp
        </Link>

        <header className="mt-10 border-b border-zinc-800 pb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-purple-500">
            TocadApp
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Eliminación de cuenta
          </h1>

          <p className="mt-4 text-zinc-400">
            Puedes eliminar tu cuenta de TocadApp y solicitar la eliminación de
            los datos personales asociados a ella.
          </p>
        </header>

        <div className="space-y-10 py-10 leading-7">
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              Cómo eliminar tu cuenta
            </h2>

            <p>
              La eliminación puede realizarse directamente desde la aplicación
              móvil de TocadApp.
            </p>

            <ol className="mt-4 list-decimal space-y-2 pl-6">
              <li>Inicia sesión en TocadApp.</li>
              <li>Abre la sección de tu perfil.</li>
              <li>Selecciona la opción para eliminar tu cuenta.</li>
              <li>Confirma tu contraseña cuando se solicite.</li>
              <li>Confirma definitivamente la eliminación.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              Qué sucede al eliminar tu cuenta
            </h2>

            <p>
              Al completar la eliminación, tu cuenta deja de estar disponible y
              las sesiones asociadas se invalidan. Los datos personales que ya no
              sean necesarios se eliminan o desvinculan de tu identidad.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              Datos que pueden conservarse
            </h2>

            <p>
              Determinados registros pueden conservarse cuando sean necesarios
              para cumplir obligaciones legales, fiscales o contables, prevenir
              fraude, resolver disputas o preservar información histórica
              compartida con otros usuarios.
            </p>

            <p className="mt-3">
              Esto puede incluir determinados registros históricos relacionados
              con pagos, suscripciones o actividad realizada dentro de bandas
              compartidas, procurando eliminar o desvincular los datos personales
              que ya no sean necesarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              ¿Necesitas ayuda?
            </h2>

            <p>
              Si tienes problemas para eliminar tu cuenta desde la aplicación,
              puedes solicitar ayuda escribiendo a{" "}
              <a
                href="mailto:tocadapp@gmail.com"
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                tocadapp@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">
              Para obtener más información sobre cómo TocadApp trata y conserva
              los datos, consulta nuestra{" "}
              <Link
                href="/privacy"
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                Política de privacidad
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
