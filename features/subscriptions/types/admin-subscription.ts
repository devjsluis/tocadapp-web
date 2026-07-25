export type AdminSubscriptionUser = {
  user_id: number;
  name: string;
  email: string;

  subscription_id: string | null;
  status: string | null;
  provider: string | null;
  price_amount: number | null;
  currency: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;

  plan_id: string | null;
  plan_code: string | null;
  plan_name: string | null;

  has_access: boolean;
};

export type AdminSubscriptionsResponse = {
  subscriptions: AdminSubscriptionUser[];
};

export type GrantManualSubscriptionInput = {
  userId: number;
  planCode: string;
  amount: number;
  currency: string;
  months?: number;
  accessUntil?: string;
  paymentReference?: string;
  notes?: string;
};

export type SubscriptionPayment = {
  id: number;
  subscription_id: number;
  provider: string;
  amount: number;
  currency: string;
  paid_at: string;
  access_from: string;
  access_until: string;
  reference: string | null;
  notes: string | null;
  registered_by_user_id: number | null;
  registered_by_name: string | null;
  registered_by_email: string | null;
  plan_code: string;
  plan_name: string;
};

export type UserSubscriptionPaymentsResponse = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  payments: SubscriptionPayment[];
};

export type UpdateSubscriptionPaymentInput = {
  amount: number;
  currency: string;
  paidAt: string;
  accessFrom: string;
  accessUntil: string;
  reference?: string;
  notes?: string;
};
