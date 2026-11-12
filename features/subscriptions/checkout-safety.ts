import type { CurrentSubscriptionResponse } from "./types/subscription";

export function canStartCheckout(state: {
  loading: boolean; checkoutLoading: boolean; confirmingCheckout: boolean;
  paymentUnconfirmed: boolean; subscriptionData: CurrentSubscriptionResponse | null;
}): boolean {
  return !state.loading && !state.checkoutLoading && !state.confirmingCheckout &&
    !state.paymentUnconfirmed && state.subscriptionData !== null && !state.subscriptionData.hasAccess;
}

export function checkoutErrorMessage(error: unknown): string {
  const code = (error as { response?: { data?: { code?: string } } } | null)?.response?.data?.code;
  if (code === "SUBSCRIPTION_ALREADY_EXISTS") return "Ya existe una suscripción o un pago en proceso. Comprueba tu suscripción antes de volver a pagar.";
  if (code === "CHECKOUT_RECONCILIATION_REQUIRED") return "Tu intento anterior necesita revisión. Contacta con soporte antes de volver a pagar.";
  return "No se pudo confirmar el inicio del pago. Puedes reintentar: se recuperará el mismo intento pendiente.";
}
