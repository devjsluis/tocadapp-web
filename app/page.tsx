import { Button } from "@/components/ui/button";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import Link from "next/link";
import {
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  Mail,
  Instagram,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-linear-to-br from-black to-zinc-900 px-4">
      <NavbarLanding />

      <main
        id="inicio"
        className="flex w-full flex-1 flex-col items-center justify-start gap-12 pt-40 pb-20"
      >
        <div className="flex w-full max-w-4xl animate-[fadeUp_0.8s_ease-out] flex-col items-center gap-6 text-center">
          <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-white md:text-7xl">
            Organiza todas tus{" "}
            <strong className="text-purple-700 italic">tocadas</strong>
          </h1>

          <p className="max-w-2xl px-2 text-base text-zinc-400 md:text-lg">
            Lleva tu agenda musical, controla tus cobros, administra tus bandas
            y evita conflictos de fechas desde un solo lugar.
          </p>
        </div>

        <div className="flex w-full animate-[fadeUp_0.8s_ease-out] flex-col gap-4 px-6 sm:w-auto sm:flex-row sm:px-0">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="xl"
              className="h-14 w-full border-2 border-purple-700 bg-purple-700 text-lg font-bold text-white hover:bg-purple-800"
            >
              Crear mi cuenta
            </Button>
          </Link>

          <Link href="#caracteristicas" className="w-full sm:w-auto">
            <Button
              size="xl"
              className="h-14 w-full border-2 border-white bg-black text-lg font-bold text-white hover:bg-neutral-900"
            >
              Conocer TocadApp
            </Button>
          </Link>
        </div>
      </main>

      <section
        id="caracteristicas"
        className="animate-[fadeUp_0.8s_ease-out] bg-zinc-900/30 px-8 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold text-white">
            Diseñado por <span className="text-purple-500">músicos</span> para
            músicos
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-purple-500" />}
              title="Agenda de tocadas"
              description="Consulta tus presentaciones en distintas vistas y mantén organizadas las fechas, horarios y lugares."
            />

            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-500" />}
              title="Bandas y músicos"
              description="Administra tus agrupaciones, integrantes y contactos musicales desde una misma cuenta."
            />

            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-purple-500" />}
              title="Control de cobros"
              description="Registra cuánto te corresponde, cuánto has cobrado y consulta el historial de tus ingresos musicales."
            />
          </div>
        </div>
      </section>

      <section
        id="precios"
        className="animate-[fadeUp_0.8s_ease-out] px-8 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Elige cómo pagar tu{" "}
              <span className="text-purple-500">TocadApp</span>
            </h2>

            <p className="mx-auto max-w-2xl text-zinc-400">
              Un solo plan completo para organizar tus tocadas, bandas e
              ingresos. Paga mes con mes o ahorra con el plan anual.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-purple-600 bg-linear-to-b from-purple-900/30 to-zinc-950 p-6 shadow-2xl shadow-purple-900/20 sm:p-8">
              <div className="absolute top-4 right-4 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                Plan completo
              </div>

              <h3 className="mb-2 pr-28 text-2xl font-bold text-white">
                TocadApp
              </h3>

              <p className="mb-8 text-sm text-purple-300/60">
                Organiza tu actividad musical desde cualquier dispositivo.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                  <p className="text-sm font-semibold text-zinc-400">
                    Plan mensual
                  </p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">$50</span>

                    <span className="text-sm text-zinc-500">MXN/mes</span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Paga mes con mes y cancela cuando quieras.
                  </p>
                </div>

                <div className="relative rounded-xl border border-purple-500 bg-purple-500/10 p-5">
                  <span className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                    Mejor precio
                  </span>

                  <p className="text-sm font-semibold text-purple-300">
                    Plan anual
                  </p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">$500</span>

                    <span className="text-sm text-zinc-400">MXN/año</span>
                  </div>

                  <p className="mt-3 text-xs font-medium text-green-400">
                    Ahorras $100 · Recibe 2 meses incluidos
                  </p>
                </div>
              </div>

              <ul className="mt-8 mb-8 grid gap-4 sm:grid-cols-2">
                <PricingItem text="Agenda personal de tocadas" />
                <PricingItem text="Vista de calendario, tarjetas y meses" />
                <PricingItem text="Registro y edición de cobros" />
                <PricingItem text="Control de ingresos personales" />
                <PricingItem text="Creación y administración de bandas" />
                <PricingItem text="Gestión de integrantes y contactos" />
                <PricingItem text="Detección de conflictos de fechas" />
                <PricingItem text="Confirmación de asistencia" />
                <PricingItem text="Acceso a futuras mejoras de TocadApp" />
              </ul>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/register?plan=monthly" className="w-full">
                  <Button
                    variant="outline"
                    className="h-12 w-full border-purple-500 bg-transparent font-bold text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
                  >
                    Elegir mensual
                  </Button>
                </Link>

                <Link href="/register?plan=annual" className="w-full">
                  <Button className="h-12 w-full bg-purple-700 font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600">
                    Elegir anual
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Sin contratos forzosos. Puedes elegir el periodo que más te
            convenga.
          </p>
        </div>
      </section>

      <section
        id="contacto"
        className="animate-[fadeUp_0.8s_ease-out] border-t border-zinc-800 bg-zinc-900/50 px-8 py-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            ¿Tienes alguna duda?
          </h2>

          <p className="mb-12 text-lg text-zinc-400">
            Escríbenos si necesitas ayuda o quieres compartir una sugerencia
            para mejorar TocadApp.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <ContactLink
              icon={<Mail />}
              label="Email"
              href="mailto:hola@tocadapp.com"
            />

            <ContactLink icon={<Instagram />} label="Instagram" href="#" />

            <ContactLink icon={<MessageSquare />} label="WhatsApp" href="#" />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-10 text-center text-sm text-zinc-600">
        © {new Date().getFullYear()} TocadApp. Todos los derechos reservados.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-black/40 p-8 transition-all hover:border-purple-500/30">
      <div className="mb-4 transition-transform group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>

      <p className="leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-zinc-300">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
      <span>{text}</span>
    </li>
  );
}

function ContactLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-3 text-white transition-colors hover:bg-purple-700"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
