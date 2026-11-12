import axios from "axios";
import { api } from "@/lib/axios";

export type AccountingFilters = { month: string | null; from: string; to: string; provider: string; currency: string | null; status: string };
export const accountingStatusOptions = [
  ["all", "Todos los estados"], ["available", "Saldo disponible"], ["pending", "Saldo o transferencia pendiente"],
  ["paid", "Transferencia o comprobante pagado"], ["in_transit", "Transferencia en tránsito"],
  ["failed", "Transferencia fallida"], ["canceled", "Transferencia cancelada"],
  ["confirmed", "Liquidación conciliada (tiendas)"], ["registered", "Pago manual registrado"],
] as const;
export function accountingMonthDates(month: string) {
  return { from: month + "-01", to: new Date(Date.UTC(Number(month.slice(0,4)), Number(month.slice(5,7)), 0)).toISOString().slice(0,10) };
}
function validFilterDate(value: string) {
  return /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && new Date(value + "T00:00:00Z").toISOString().slice(0,10) === value;
}
export function accountingFilterQuery(filters: { mode: string; month: string; from: string; to: string; provider: string; currency: string; status: string }) {
  const params = new URLSearchParams();
  if (filters.mode === "month") {
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(filters.month)) throw Error("Selecciona un mes válido.");
    params.set("month", filters.month);
  } else {
    if (!validFilterDate(filters.from) || !validFilterDate(filters.to) || filters.from > filters.to) throw Error("Selecciona un rango válido: Desde debe ser anterior o igual a Hasta.");
    params.set("from", filters.from); params.set("to", filters.to);
  }
  if (!["ALL", "STRIPE", "APPLE", "GOOGLE_PLAY", "MANUAL"].includes(filters.provider) ||
    !accountingStatusOptions.some(([value]) => value === filters.status) ||
    (filters.currency && !/^[A-Z]{3}$/.test(filters.currency))) throw Error("La moneda debe tener tres letras, por ejemplo MXN, o quedar vacía para todas.");
  params.set("provider", filters.provider); if (filters.currency) params.set("currency", filters.currency); params.set("status", filters.status);
  return params.toString();
}
export type AccountingAccount = { id: number; username: string; displayName: string; active?: boolean; createdAt?: string };
export type AccountingMoney = { currency: string; grossMinor: number; feesMinor: number; refundsMinor: number; withheldMinor: number; netMinor: number; depositsMinor: number };
export type AccountingDocument = { id: number; month?: string; kind: string; filename: string; contentType: string; bytes: number; sha256: string; createdAt: string };
export type AccountingReport = {
  month: string | null; filters?: AccountingFilters; periodLabel?: string; partialMonths?: string[]; pendingProviderMonths?: { provider: string; month: string }[]; timezone: string; start: string; endExclusive: string; generatedAt: string; stripeMode: "live" | "test";
  stripe: { status: "not_selected" } | { status: "unavailable"; message: string } | {
    status: "available"; totals: AccountingMoney[];
    transactions: { id: string; date: string; type: string; category: string; currency: string; amountMinor: number; feeMinor: number; netMinor: number; status: string }[];
    payouts: { id: string; arrivalDate: string; currency: string; amountMinor: number; status: string }[];
    invoices: { id: string; number: string | null; paidAt: string; currency: string; amountMinor: number; pdfUrl: string | null }[];
  };
  manual: { id: number; amountMinor: number; currency: string; paidAt: string; reference: string | null }[];
  documents: AccountingDocument[];
  settlements: (AccountingMoney & { id: number; month?: string; provider: string; documentId: number; notes: string; updatedAt: string })[];
  pendingProviders: string[]; guidance: string;
};
// This client intentionally has no musician-token interceptor or refresh logic.
export const accountingApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "/api", withCredentials: true });
export const accountingClient = (admin: boolean) => admin ? api : accountingApi;
export const accountingPath = (admin: boolean) => admin ? "/admin/accounting" : "/accounting";
export const providerName = (provider: string) => ({ ALL: "Todas las fuentes", APPLE: "App Store", GOOGLE_PLAY: "Google Play", STRIPE: "Stripe", MANUAL: "Pagos manuales" }[provider] ?? provider);
const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "VND", "VUV", "XAF", "XOF", "XPF"]);
export function currencyDecimals(currency: string) { return zeroDecimalCurrencies.has(currency.toUpperCase()) ? 0 : 2; }
export function accountingMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: currencyDecimals(currency), maximumFractionDigits: currencyDecimals(currency) })
    .format(minor / 10 ** currencyDecimals(currency)) + " " + currency;
}
export function accountingMinor(input: string, currency: string): number {
  const digits = currencyDecimals(currency);
  if (!new RegExp("^\\d+(?:\\.\\d{1," + (digits || 1) + "})?$").test(input) || (!digits && input.includes("."))) throw Error("Usa importes positivos con punto decimal.");
  const [whole, fractional = ""] = input.split(".");
  const value = Number(whole) * 10 ** digits + Number(fractional.padEnd(digits, "0"));
  if (!Number.isSafeInteger(value) || value < 0 || value > 1000000000000) throw Error("Importe fuera de rango.");
  return value;
}
export function currentAccountingMonth() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return parts.find(p => p.type === "year")!.value + "-" + parts.find(p => p.type === "month")!.value;
}
export function accountingError(error: unknown) {
  if (axios.isAxiosError(error) && typeof error.response?.data?.error === "string") return error.response.data.error;
  return error instanceof Error && !axios.isAxiosError(error) ? error.message : "No se pudo completar la consulta. Intenta nuevamente.";
}
export async function downloadAccountingFile(admin: boolean, path: string, filename: string) {
  const response = await accountingClient(admin).get(accountingPath(admin) + path, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
