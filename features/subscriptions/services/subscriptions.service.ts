import { api } from "@/lib/axios";
import type { CurrentSubscriptionResponse } from "../types/subscription";

export const subscriptionsService = {
  async getCurrent(): Promise<CurrentSubscriptionResponse> {
    const response =
      await api.get<CurrentSubscriptionResponse>("/subscriptions/me");

    return response.data;
  },
};
