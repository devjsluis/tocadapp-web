import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | TocadApp",
  description: "Términos y Condiciones de uso de TocadApp.",
};

export default function TermsPage() {
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
            Términos y Condiciones
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Última actualización: 29 de septiembre de 2026
          </p>
        </header>

        <div className="space-y-10 py-10 leading-7">
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              1. Aceptación de los términos
            </h2>
            <p>
              Al crear una cuenta o utilizar TocadApp, aceptas estos Términos y
              Condiciones. También reconoces que el tratamiento de tus datos
              personales se realiza conforme a nuestra{" "}
              <Link
                href="/privacy"
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              2. Descripción del servicio
            </h2>
            <p>
              TocadApp es una herramienta digital orientada principalmente a
              músicos y agrupaciones musicales. Permite organizar tocadas,
              bandas, integrantes, agenda, cobros, ingresos, gastos y otra
              información relacionada con la actividad musical.
            </p>
            <p className="mt-3">
              Podemos modificar, mejorar, incorporar o retirar funciones cuando
              sea necesario para mantener o desarrollar el servicio.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              3. Cuenta y seguridad
            </h2>
            <p>
              Debes proporcionar información válida al crear tu cuenta y eres
              responsable de mantener seguras tus credenciales de acceso.
            </p>
            <p className="mt-3">
              No debes utilizar cuentas ajenas sin autorización ni intentar
              acceder de forma indebida a cuentas, información, infraestructura
              o funciones de TocadApp.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              4. Periodo de prueba
            </h2>
            <p>
              TocadApp puede ofrecer un periodo de prueba gratuito. La duración y
              condiciones vigentes se mostrarán al usuario al registrarse o
              contratar el servicio.
            </p>
            <p className="mt-3">
              Al finalizar el periodo de prueba, determinadas funciones pueden
              requerir una suscripción activa para continuar utilizándose.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              5. Suscripciones y pagos
            </h2>
            <p>
              TocadApp puede ofrecer planes de suscripción mensual, anual u otras
              modalidades que se indiquen al momento de la contratación. El
              precio, moneda, periodo y condiciones aplicables se mostrarán antes
              de confirmar la compra.
            </p>
            <p className="mt-3">
              Dependiendo de la plataforma, los pagos pueden ser procesados por
              Stripe, Google Play, Apple u otro proveedor indicado durante la
              compra. El procesamiento del pago también estará sujeto a las
              condiciones del proveedor correspondiente.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              6. Renovación y cancelación
            </h2>
            <p>
              Cuando una suscripción tenga renovación automática, esta podrá
              renovarse al finalizar cada periodo salvo que sea cancelada de
              acuerdo con las opciones disponibles en TocadApp o en la plataforma
              mediante la cual fue contratada.
            </p>
            <p className="mt-3">
              Cuando corresponda, cancelar la renovación no elimina de inmediato
              el acceso ya pagado; el acceso puede mantenerse hasta finalizar el
              periodo vigente.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              7. Información registrada por el usuario
            </h2>
            <p>
              Eres responsable de la información que registras en TocadApp y de
              contar con autorización suficiente cuando incluyas información
              relacionada con otras personas.
            </p>
            <p className="mt-3">
              TocadApp proporciona herramientas para organizar información, pero
              los datos de ingresos, gastos, cobros, tocadas y demás registros
              introducidos por los usuarios dependen de la información que estos
              proporcionen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              8. Uso permitido
            </h2>
            <p>No debes utilizar TocadApp para:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Realizar actividades ilícitas o fraudulentas.</li>
              <li>Intentar vulnerar la seguridad del servicio.</li>
              <li>Interferir deliberadamente con su funcionamiento.</li>
              <li>Acceder sin autorización a información de otros usuarios.</li>
              <li>
                Utilizar el servicio de manera que infrinja derechos de terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              9. Disponibilidad del servicio
            </h2>
            <p>
              Procuramos mantener TocadApp disponible y funcionando
              correctamente, pero pueden producirse interrupciones por
              mantenimiento, actualizaciones, fallas técnicas, proveedores
              externos o circunstancias fuera de nuestro control.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              10. Responsabilidad sobre decisiones del usuario
            </h2>
            <p>
              TocadApp es una herramienta de organización y administración. La
              información mostrada por la aplicación no constituye asesoría
              contable, fiscal, financiera o legal.
            </p>
            <p className="mt-3">
              Cada usuario es responsable de verificar la información que utiliza
              para tomar decisiones profesionales, comerciales, fiscales o
              personales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              11. Eliminación de cuenta
            </h2>
            <p>
              Puedes eliminar tu cuenta mediante las opciones disponibles en
              TocadApp. La eliminación y conservación de información se realizará
              conforme a nuestra Política de Privacidad y a las obligaciones
              legales aplicables.
            </p>
            <p className="mt-3">
              Algunos registros históricos compartidos con otros usuarios o
              necesarios para obligaciones legales, fiscales o contables pueden
              conservarse de forma limitada o desvinculada de tus datos
              personales cuando corresponda.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              12. Propiedad intelectual
            </h2>
            <p>
              TocadApp, su software, diseño, identidad visual, marca y demás
              elementos propios del servicio están protegidos por las leyes
              aplicables. Estos términos no transfieren al usuario derechos de
              propiedad sobre dichos elementos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              13. Suspensión o terminación
            </h2>
            <p>
              Podemos limitar o suspender el acceso cuando exista uso fraudulento,
              abuso del servicio, incumplimiento grave de estos términos, riesgos
              de seguridad o cuando sea necesario para cumplir obligaciones
              legales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              14. Cambios a estos términos
            </h2>
            <p>
              Podemos actualizar estos Términos y Condiciones cuando cambien las
              funciones, modalidades de contratación o requisitos legales
              aplicables. La fecha de la versión vigente aparecerá al inicio de
              esta página.
            </p>
            <p className="mt-3">
              Cuando un cambio requiera una nueva aceptación del usuario, podremos
              solicitarla antes de continuar utilizando determinadas funciones
              del servicio.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">15. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos Términos y Condiciones, puedes
              escribirnos a{" "}
              <a
                href="mailto:tocadapp@gmail.com"
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                tocadapp@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="border-t border-zinc-800 py-8 text-sm text-zinc-600">
          © {new Date().getFullYear()} TocadApp. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
