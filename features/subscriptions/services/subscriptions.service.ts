import { api } from "@/lib/axios";
import type {
  CheckoutPlanCode,
  CheckoutResponse,
  CurrentSubscriptionResponse,
} from "../types/subscription";

export const subscriptionsService = {
  async getCurrent(): Promise<CurrentSubscriptionResponse> {
    const response =
      await api.get<CurrentSubscriptionResponse>("/subscriptions/me");

    return response.data;
  },

  async createCheckout(planCode: CheckoutPlanCode): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>(
      "/subscriptions/checkout",
      { planCode },
    );

    return response.data;
  },

  async cancel(): Promise<void> {
    await api.post("/subscriptions/cancel");
  },

  async reactivate(): Promise<void> {
    await api.post("/subscriptions/reactivate");
  },
};
