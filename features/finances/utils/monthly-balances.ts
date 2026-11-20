import { parseLocalDate } from "../../gigs/utils/gig.utils";

type GigCollection = {
  is_owner?: boolean;
  collected_amount?: number | string | null;
  my_collected?: number | string | null;
};

export type BalanceMovement = {
  date: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
};

export function effectiveCollected(gig: GigCollection): number | null {
  const value = gig.is_owner === false ? gig.my_collected : gig.collected_amount;
  if (value == null || value === "") return null;

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function getGigStartTime(gig: {
  date: string;
  time: string;
  starts_at?: string | null;
}): number {
  if (gig.starts_at) return new Date(gig.starts_at).getTime();

  const date = parseLocalDate(gig.date);
  const [hours, minutes = 0, seconds = 0] = (gig.time || "00:00").split(":").map(Number);
  date.setHours(hours, minutes, seconds, 0);
  return date.getTime();
}

export function getMonthlyBalances(
  pastGigs: (GigCollection & { date: string })[],
  movements: BalanceMovement[],
): Map<string, number> {
  const balances = new Map<string, number>();

  const add = (date: string, amount: number) => {
    const month = date.slice(0, 7);
    balances.set(month, (balances.get(month) ?? 0) + Math.round(amount * 100));
  };

  for (const gig of pastGigs) {
    const amount = effectiveCollected(gig);
    if (amount !== null) add(gig.date, amount);
  }

  for (const movement of movements) {
    const amount = Number(movement.amount);
    if (Number.isFinite(amount)) {
      add(movement.date, movement.type === "EXPENSE" ? -amount : amount);
    }
  }

  for (const [month, cents] of balances) {
    balances.set(month, cents / 100);
  }

  return balances;
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
