import { Sidebar } from "@/components/Sidebar";
import { SubscriptionGuard } from "@/features/subscriptions/components/SubscriptionGuard";
import { TrialBanner } from "@/features/subscriptions/components/TrialBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionGuard>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-white md:flex-row">
        <Sidebar />

        <main className="mb-16 flex-1 overflow-y-auto p-4 md:mb-0 md:p-8">
          <div className="space-y-6">
            <TrialBanner />
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}
