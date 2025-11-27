import { requireAdmin } from "@/lib/utils/auth";
import DashboardLayoutClient from "@/components/DashboardLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
