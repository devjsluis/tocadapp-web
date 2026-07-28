"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

import { SubscriptionProvider } from "../context/SubscriptionContext";
import { subscriptionsService } from "../services/subscriptions.service";
import type { CurrentSubscription } from "../types/subscription";

type SubscriptionGuardProps = {
  children: React.ReactNode;
};

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  );

  const isAdminRoute = pathname.startsWith("/dashboard/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setHasAccess(true);
      setSubscription(null);
      setLoading(false);
      return;
    }

    let active = true;

    const validateSubscription = async () => {
      setLoading(true);

      try {
        const result = await subscriptionsService.getCurrent();

        if (!active) return;

        setHasAccess(result.hasAccess);
        setSubscription(result.subscription);

        if (!result.hasAccess && pathname !== "/subscription-required") {
          router.replace("/subscription-required");
        }
      } catch (error) {
        if (!active) return;

        setHasAccess(false);
        setSubscription(null);

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

  if (!hasAccess) {
    return null;
  }

  return (
    <SubscriptionProvider
      hasAccess={hasAccess}
      subscription={subscription}
      loading={loading}
    >
      {children}
    </SubscriptionProvider>
  );
}
