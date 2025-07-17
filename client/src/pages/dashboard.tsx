import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import CCAgentDashboard from "./cc-agent-dashboard";
import CROAgentDashboard from "./cro-agent-dashboard";
import SuperAdminDashboard from "./super-admin-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case "CC Agent":
        return <CCAgentDashboard />;
      case "CRO Agent":
        return <CROAgentDashboard />;
      case "Super Admin":
        return <SuperAdminDashboard />;
      default:
        return <CCAgentDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
