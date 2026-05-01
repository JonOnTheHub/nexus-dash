import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ChatDrawer from "@/components/ai/ChatDrawer";
import SimulatorProvider from "@/components/providers/SimulatorProvider";
import PageTransition from "@/components/providers/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <ChatDrawer />
      <SimulatorProvider />
    </div>
  );
}