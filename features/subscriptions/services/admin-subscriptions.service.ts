import { api } from "@/lib/axios";
import type {
  AdminSubscriptionsResponse,
  GrantManualSubscriptionInput,
  UpdateSubscriptionPaymentInput,
  UserSubscriptionPaymentsResponse,
} from "../types/admin-subscription";

export const adminSubscriptionsService = {
  async getAll(): Promise<AdminSubscriptionsResponse> {
    const response = await api.get<AdminSubscriptionsResponse>(
      "/admin/subscriptions",
    );

    return response.data;
  },

  async grantAccess(input: GrantManualSubscriptionInput) {
    const response = await api.post("/admin/subscriptions/grant", input);

    return response.data;
  },

  async getPayments(userId: number): Promise<UserSubscriptionPaymentsResponse> {
    const response = await api.get<UserSubscriptionPaymentsResponse>(
      `/admin/subscriptions/${userId}/payments`,
    );

    return response.data;
  },

  async updatePayment(
    paymentId: number,
    input: UpdateSubscriptionPaymentInput,
  ) {
    const response = await api.put(
      `/admin/subscriptions/payments/${paymentId}`,
      input,
    );

    return response.data;
  },

  async deletePayment(paymentId: number) {
    const response = await api.delete(
      `/admin/subscriptions/payments/${paymentId}`,
    );

    return response.data;
  },
};
