"use client";

import { createContext, useContext } from "react";
import type { CurrentSubscription } from "../types/subscription";

type SubscriptionContextValue = {
  hasAccess: boolean;
  subscription: CurrentSubscription | null;
  loading: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

type SubscriptionProviderProps = SubscriptionContextValue & {
  children: React.ReactNode;
};

export function SubscriptionProvider({
  children,
  hasAccess,
  subscription,
  loading,
}: SubscriptionProviderProps) {
  return (
    <SubscriptionContext.Provider
      value={{
        hasAccess,
        subscription,
        loading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscription debe utilizarse dentro de SubscriptionProvider",
    );
  }

  return context;
}
