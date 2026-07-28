export type SubscriptionPlan = {
  id: number;
  code: string;
  name: string;
  billingInterval: "MONTH" | "YEAR";
  intervalCount: number;
};

export type CurrentSubscription = {
  id: number;
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "EXPIRED";
  provider: "TRIAL" | "MANUAL" | "STRIPE";
  priceAmount: number;
  currency: string;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  endedAt: string | null;
  plan: SubscriptionPlan;
};

export type CurrentSubscriptionResponse = {
  hasAccess: boolean;
  subscription: CurrentSubscription | null;
};
