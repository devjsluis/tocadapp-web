import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal contable | TocadApp",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
