"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  LayoutDashboard,
  Music,
  Users,
  Users2,
  DollarSign,
  LogOut,
  UserCircle,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/features/auth/services/auth.service";

type CurrentUser = {
  id: number;
  email: string;
  name: string;
  last_name: string;
  role: string;
};
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

const subscriptionsAdminItem: MenuItem = {
  name: "Suscripciones",
  icon: CreditCard,
  href: "/dashboard/admin/subscriptions",
};

const isActiveRoute = (pathname: string | null, href: string) => {
  if (!pathname) return false;

  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [hasPendingBandRequests, setHasPendingBandRequests] = useState(false);

  useEffect(() => {
    api
      .get<CurrentUser>("/users/me")
      .then(({ data }) => {
        setCurrentUser(data);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBandIndicators = async () => {
      try {
        const { data } = await api.get("/bands");

        const ownedBands: { id: number | string; is_owner: boolean }[] =
          (data.data ?? []).filter(
            (band: { is_owner: boolean }) => band.is_owner,
          );

        if (cancelled) return;

        setIsLeader(ownedBands.length > 0);

        if (ownedBands.length === 0) {
          setHasPendingBandRequests(false);
          return;
        }

        const responses = await Promise.all(
          ownedBands.map((band) =>
            api.get(`/bands/${band.id}/join-requests`),
          ),
        );

        if (cancelled) return;

        setHasPendingBandRequests(
          responses.some(
            (response) => (response.data.data ?? []).length > 0,
          ),
        );
      } catch {
        // El indicador es complementario y no debe bloquear la navegación.
      }
    };

    void loadBandIndicators();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const menuItems = [
    ...baseMenuItems,
    ...(isLeader ? [contactosItem] : []),
    ...(currentUser?.role === "admin" ? [subscriptionsAdminItem] : []),
  ];

  const handleLogout = () => {
    authService.logout();
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
            <NavLink
              key={item.name}
              item={item}
              pathname={pathname}
              showNotification={
                item.href === "/dashboard/bands" && hasPendingBandRequests
              }
            />
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
                  isActiveRoute(pathname, item.href)
                    ? "text-purple-500"
                    : "text-zinc-400",
                )}
              >
                <span className="relative">
                  <Icon size={24} />
                  {item.href === "/dashboard/bands" &&
                  hasPendingBandRequests ? (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full border border-zinc-950 bg-amber-400" />
                  ) : null}
                </span>
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
  showNotification?: boolean;
}

function NavLink({
  item,
  pathname,
  showNotification = false,
}: NavLinkProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isActiveRoute(pathname, item.href)
          ? "bg-purple-500/10 text-purple-500"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
      )}
    >
      <span className="relative">
        <Icon size={20} />
        {showNotification ? (
          <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full border border-zinc-950 bg-amber-400" />
        ) : null}
      </span>
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}
