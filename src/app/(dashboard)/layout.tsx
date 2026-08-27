import SidebarClient from "@/components/dashboard/SidebarClient";
import { requireWorkspace } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspaceId = await requireWorkspace();

  return (
    <div className="flex min-h-screen">
      <SidebarClient />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

