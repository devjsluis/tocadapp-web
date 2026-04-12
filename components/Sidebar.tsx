"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import {
  LayoutDashboard,
  Music,
  Users,
  Users2,
  DollarSign,
  LogOut,
  UserCircle,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

const baseMenuItems: MenuItem[] = [
  { name: "Inicio", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Tocadas", icon: Music, href: "/dashboard/gigs" },
  { name: "Bandas", icon: Users2, href: "/dashboard/bands" },
  { name: "Finanzas", icon: DollarSign, href: "/dashboard/finances" },
  { name: "Mi Perfil", icon: UserCircle, href: "/dashboard/profile" },
];

const contactosItem: MenuItem = {
  name: "Contactos",
  icon: Users,
  href: "/dashboard/musicians",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    api
      .get("/bands")
      .then(({ data }) => {
        const hasOwnBand = data.data?.some((b: { is_owner: boolean }) => b.is_owner);
        setIsLeader(hasOwnBand);
      })
      .catch(() => {});
  }, []);

  const menuItems = isLeader
    ? [...baseMenuItems, contactosItem]
    : baseMenuItems;

  const handleLogout = () => {
    Cookies.remove("token");
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-800 flex-col h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-500 tracking-tight">
            TocadApp
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink key={item.name} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 px-2 py-3 z-50">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  pathname === item.href ? "text-purple-500" : "text-zinc-400",
                )}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="text-red-400 px-2 pb-1 cursor-pointer"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>
    </>
  );
}

interface NavLinkProps {
  item: MenuItem;
  pathname: string | null;
}

function NavLink({ item, pathname }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        pathname === item.href
          ? "bg-purple-500/10 text-purple-500"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}
