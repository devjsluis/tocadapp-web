"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { subscriptionsService } from "../services/subscriptions.service";

type SubscriptionGuardProps = {
  children: React.ReactNode;
};

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const isAdminRoute = pathname.startsWith("/dashboard/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setAllowed(true);
      setLoading(false);
      return;
    }

    let active = true;

    const validateSubscription = async () => {
      try {
        const result = await subscriptionsService.getCurrent();

        if (!active) return;

        if (result.hasAccess) {
          setAllowed(true);
          return;
        }

        if (pathname !== "/subscription-required") {
          router.replace("/subscription-required");
        }
      } catch (error) {
        if (!active) return;

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/login");
          return;
        }

        console.error("No fue posible validar la suscripción:", error);

        router.replace("/subscription-required");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void validateSubscription();

    return () => {
      active = false;
    };
  }, [isAdminRoute, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
          <p className="text-sm text-zinc-400">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}
