import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
}
