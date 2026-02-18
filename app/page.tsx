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
    <div className="min-h-screen flex flex-col justify-center bg-linear-to-br from-black to-zinc-900 px-4">
      <NavbarLanding />
      <main
        className="flex w-full flex-1 flex-col items-center justify-start gap-12 pt-40 pb-20"
        id="inicio"
      >
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 text-center animate-[fadeUp_0.8s_ease-out]">
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl leading-tight">
            Toma el control de tus{" "}
            <strong className="text-purple-700 italic">eventos</strong>
          </h1>
          <p className="max-w-2xl text-base text-zinc-400 md:text-lg px-2">
            Agenda tus presentaciones, compártelas con tu banda y lleva el
            control de tus ingresos y gastos de forma clara y segura.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full px-6 sm:px-0 sm:flex-row sm:w-auto animate-[fadeUp_0.8s_ease-out]">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="xl"
              className="w-full border-2 bg-purple-700 border-purple-700 text-white hover:bg-purple-800 font-bold text-lg h-14"
            >
              Empieza gratis
            </Button>
          </Link>
          <Button
            size="xl"
            className="w-full sm:w-auto border-2 bg-black text-white hover:bg-neutral-900 font-bold border-white text-lg h-14"
          >
            Ver demo
          </Button>
        </div>
      </main>

      {/* --- CARACTERÍSTICAS --- */}
      <section id="caracteristicas" className="py-24 px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-4xl font-bold text-center mb-16">
            Diseñado por <span className="text-purple-500">músicos</span> para
            músicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-10 h-10 text-purple-500" />}
              title="Agenda Inteligente"
              description="Visualiza todas tus tocadas en un solo lugar. Sincroniza fechas y lugares fácilmente."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-purple-500" />}
              title="Gestión de Banda"
              description="Añade a tus integrantes para que todos sepan cuándo y dónde es el próximo show."
            />
            <FeatureCard
              icon={<Wallet className="w-10 h-10 text-purple-500" />}
              title="Finanzas Claras"
              description="Calcula pagos, gastos de transporte y reparte las ganancias de forma transparente."
            />
          </div>
        </div>
      </section>

      {/* --- PRECIOS --- */}
      <section id="precios" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white text-4xl font-bold mb-4">
              Impulsa tu carrera{" "}
              <span className="text-purple-500">musical</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Únete gratis como músico o profesionaliza tu agrupación con
              nuestros planes de gestión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Músico Pro - El Anzuelo */}
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
              <h3 className="text-white text-xl font-bold mb-2">Músico</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Para los que buscan chamba y orden personal.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">Gratis</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <PricingItem text="Perfil con video y CV musical" />
                <PricingItem text="Buscador de 'Huesos' (vacantes)" />
                <PricingItem text="Agenda personal de eventos" />
                <PricingItem text="Control de ingresos personales" />
              </ul>
              <Button
                variant="outline"
                className="w-full border-zinc-700 text-black hover:bg-gray-200 font-bold py-6"
              >
                Crear mi perfil gratis
              </Button>
            </div>

            {/* Plan Banda Master - El que te dará los 100k */}
            <div className="p-8 rounded-2xl bg-linear-to-b from-purple-900/30 to-zinc-950 border-2 border-purple-600 relative overflow-hidden flex flex-col scale-105 shadow-2xl shadow-purple-900/20">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Más Popular
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                Dueño de Banda
              </h3>
              <p className="text-purple-300/60 text-sm mb-6">
                Control total de tu agrupación y finanzas.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">$149</span>
                <span className="text-zinc-400 font-medium text-lg">
                  MXN/mes
                </span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <PricingItem text="Integrantes ilimitados" />
                <PricingItem text="Calculadora de Reparto Automática" />
                <PricingItem text="Gestión de Gastos (Diesel, Comida)" />
                <PricingItem text="Confirmación de asistencia real" />
                <PricingItem text="Reportes PDF para transparencia" />
                <PricingItem text="Soporte prioritario 24/7" />
              </ul>
              <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 font-bold py-6 text-lg">
                Profesionalizar mi banda
              </Button>
            </div>
          </div>

          <p className="text-center text-zinc-500 mt-12 text-sm italic">
            * Sin contratos forzosos. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* --- CONTACTO --- */}
      <section
        id="contacto"
        className="py-24 px-8 bg-zinc-900/50 border-t border-zinc-800"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-4xl font-bold mb-6">¿Hablamos?</h2>
          <p className="text-zinc-400 mb-12 text-lg">
            Si tienes dudas, feedback o necesitas un plan para productoras,
            escríbenos.
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

      <footer className="py-10 text-center text-zinc-600 border-t border-zinc-900 text-sm">
        © {new Date().getFullYear()} Tocadapp. Todos los derechos reservados.
      </footer>
    </div>
  );
}

/* Componentes auxiliares para mantener el código limpio */

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
    <div className="p-8 rounded-xl bg-black/40 border border-zinc-800 hover:border-purple-500/30 transition-all group">
      <div className="mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-zinc-300">
      <CheckCircle2 className="w-5 h-5 text-purple-500" />
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
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800 text-white hover:bg-purple-700 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
