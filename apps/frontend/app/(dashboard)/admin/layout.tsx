import { RoleGuard } from "@/components/auth/RoleGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";

const ADMIN_ROLE = "ADMIN";

export default function AdminLayoutWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard allowedRoles={[ADMIN_ROLE]}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
