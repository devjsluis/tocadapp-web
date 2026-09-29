import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad | TocadApp",
  description:
    "Política de privacidad de TocadApp y tratamiento de datos personales.",
};

export default function PrivacyPage() {
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
            Política de privacidad
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Última actualización: 29 de septiembre de 2026
          </p>
        </header>

        <div className="space-y-10 py-10 leading-7">
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              1. Acerca de esta política
            </h2>

            <p>
              Esta Política de privacidad explica cómo TocadApp recopila,
              utiliza, almacena y protege información cuando utilizas nuestro
              sitio web, aplicación móvil y servicios relacionados.
            </p>

            <p className="mt-3">
              TocadApp es una herramienta para músicos que permite organizar
              presentaciones, bandas, integrantes, cobros, ingresos, gastos y
              otra información relacionada con su actividad musical.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              2. Información que recopilamos
            </h2>

            <p>
              Dependiendo de las funciones que utilices, podemos tratar las
              siguientes categorías de información:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-zinc-200">Datos de cuenta:</strong>{" "}
                nombre, apellido, correo electrónico y credenciales necesarias
                para autenticar tu cuenta. Las contraseñas se almacenan
                utilizando mecanismos de hash y no como texto legible.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información sobre tocadas:
                </strong>{" "}
                fechas, horarios, lugares, direcciones y datos relacionados con
                las presentaciones que registras.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información de ubicación de eventos:
                </strong>{" "}
                cuando registras el lugar de una tocada podemos almacenar la
                dirección, coordenadas geográficas y referencias de lugares
                necesarias para mostrar o identificar dicho evento. Esto no
                implica un seguimiento continuo de tu ubicación personal.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información de bandas y músicos:
                </strong>{" "}
                agrupaciones, integrantes, relaciones entre músicos, datos de
                contacto y otra información que tú o los miembros autorizados
                registren dentro de una banda.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información financiera registrada por el usuario:
                </strong>{" "}
                ingresos, gastos, cantidades, categorías, descripciones, fechas,
                cobros y su posible relación con una tocada o banda.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información de suscripción:
                </strong>{" "}
                plan contratado, proveedor de pago, importe, moneda, estado de
                la suscripción, periodos de acceso e identificadores de
                transacciones o suscripciones proporcionados por la plataforma
                de pago correspondiente.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Información técnica y de notificaciones:
                </strong>{" "}
                tokens necesarios para enviar notificaciones push, plataforma
                del dispositivo y datos técnicos necesarios para operar,
                proteger y mantener el servicio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              3. Cómo utilizamos la información
            </h2>

            <p>Utilizamos la información para:</p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Crear, autenticar y mantener tu cuenta.</li>
              <li>
                Proporcionar las funciones de agenda, bandas, músicos,
                asistencia y administración de tocadas.
              </li>
              <li>
                Registrar y mostrar la información financiera que tú decides
                guardar en TocadApp.
              </li>
              <li>Administrar periodos de prueba, suscripciones y pagos.</li>
              <li>
                Enviar correos relacionados con tu cuenta, como verificación o
                recuperación de acceso.
              </li>
              <li>
                Enviar notificaciones relacionadas con tocadas y funciones del
                servicio cuando estén habilitadas.
              </li>
              <li>
                Mantener la seguridad, prevenir abuso y solucionar problemas
                técnicos.
              </li>
              <li>Cumplir obligaciones legales aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              4. Pagos y suscripciones
            </h2>

            <p>
              TocadApp puede utilizar proveedores externos para procesar
              suscripciones y pagos. Dependiendo de la plataforma desde la que
              contrates el servicio, el pago puede ser procesado por Stripe,
              Google Play, Apple u otro proveedor que se indique al momento de
              la compra.
            </p>

            <p className="mt-3">
              TocadApp puede conservar información relacionada con el estado de
              la suscripción, importe, moneda, fechas e identificadores de la
              transacción necesarios para administrar el acceso y mantener el
              historial correspondiente. Los datos completos de tarjetas u otros
              instrumentos de pago son procesados por el proveedor de pago y no
              se almacenan directamente en TocadApp.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">5. Ubicación</h2>

            <p>
              TocadApp permite asociar lugares a las tocadas. Para esta función
              podemos utilizar servicios de mapas y almacenar datos como
              dirección, coordenadas y un identificador del lugar.
            </p>

            <p className="mt-3">
              Estos datos corresponden al lugar asociado al evento. TocadApp no
              utiliza esta función para realizar seguimiento continuo de la
              ubicación del usuario.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              6. Notificaciones
            </h2>

            <p>
              Si habilitas las notificaciones, podemos registrar un token
              asociado a tu dispositivo para enviarte avisos relacionados con
              TocadApp, por ejemplo recordatorios de presentaciones.
            </p>

            <p className="mt-3">
              Para la entrega de notificaciones podemos utilizar infraestructura
              proporcionada por Expo y los servicios de notificaciones
              correspondientes al sistema operativo del dispositivo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              7. Proveedores de servicios
            </h2>

            <p>
              Podemos utilizar proveedores tecnológicos externos únicamente
              cuando son necesarios para operar determinadas funciones de
              TocadApp. Estos pueden incluir servicios de infraestructura,
              correo electrónico, mapas, notificaciones y procesamiento de
              pagos.
            </p>

            <p className="mt-3">
              Entre los proveedores que TocadApp puede utilizar se encuentran
              Stripe para pagos web, Google y Google Play para mapas,
              distribución y pagos en Android, Apple para distribución y pagos
              en iOS, Expo para servicios relacionados con la aplicación móvil y
              notificaciones, y Brevo para el envío de correos electrónicos.
            </p>

            <p className="mt-3">
              No vendemos la información personal de nuestros usuarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              8. Conservación de información
            </h2>

            <p>
              Conservamos la información mientras sea necesaria para
              proporcionar TocadApp, mantener la seguridad del servicio,
              gestionar la cuenta y cumplir obligaciones legales, fiscales,
              contables o de resolución de disputas cuando correspondan.
            </p>

            <p className="mt-3">
              Algunos registros históricos relacionados con pagos, suscripciones
              o actividad compartida con otros usuarios pueden conservarse
              cuando sea necesario, procurando eliminar o desvincular los datos
              personales que ya no sean necesarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">9. Seguridad</h2>

            <p>
              Aplicamos medidas técnicas y organizativas destinadas a proteger
              la información contra acceso no autorizado, pérdida, alteración o
              divulgación indebida. Sin embargo, ningún sistema conectado a
              Internet puede garantizar seguridad absoluta.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              10. Eliminación de la cuenta
            </h2>

            <p>
              Puedes solicitar la eliminación de tu cuenta mediante las
              funciones disponibles en TocadApp. Al eliminarla, se eliminan o
              desvinculan los datos personales que ya no son necesarios y se
              invalidan las sesiones asociadas a la cuenta.
            </p>

            <p className="mt-3">
              Determinada información puede conservarse cuando sea necesaria
              para cumplir obligaciones legales o contables, prevenir fraude,
              resolver disputas o preservar registros históricos compartidos con
              otros usuarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              11. Tus decisiones y derechos
            </h2>

            <p>
              Puedes actualizar determinada información de tu cuenta desde
              TocadApp y puedes solicitar información, corrección o eliminación
              de datos personales cuando corresponda conforme a la legislación
              aplicable.
            </p>

            <p className="mt-3">
              También puedes administrar permisos del dispositivo, como las
              notificaciones, desde la configuración de tu sistema operativo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              12. Menores de edad
            </h2>

            <p>
              TocadApp no está dirigido específicamente a menores de edad. Si
              detectamos que se ha proporcionado información personal de un
              menor en contravención de la legislación aplicable, podremos tomar
              medidas para eliminarla.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">
              13. Cambios a esta política
            </h2>

            <p>
              Podemos actualizar esta Política de privacidad cuando cambien las
              funciones de TocadApp, nuestros proveedores o los requisitos
              legales aplicables. La fecha de actualización aparecerá al inicio
              de esta página.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-white">14. Contacto</h2>

            <p>
              Si tienes preguntas relacionadas con esta Política de privacidad o
              con el tratamiento de tus datos, puedes escribirnos a{" "}
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
