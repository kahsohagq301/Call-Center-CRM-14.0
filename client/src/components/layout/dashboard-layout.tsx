import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Inbox,
  TrendingUp,
  Upload,
  UserCog,
  PieChart
} from "lucide-react";
import logoImage from "@assets/logo.png_1752740209404.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case "CC Agent":
        return [
          { id: "/", icon: Home, label: "Dashboard" },
          { id: "/calls", icon: Phone, label: "Calls Section" },
          { id: "/leads", icon: Users, label: "Lead Section" },
          { id: "/reports", icon: BarChart3, label: "Report Section" },
        ];
      case "CRO Agent":
        return [
          { id: "/", icon: Home, label: "Dashboard" },
          { id: "/received-leads", icon: Inbox, label: "Received Leads" },
        ];
      case "Super Admin":
        return [
          { id: "/", icon: Home, label: "Dashboard" },
          { id: "/lead-analysis", icon: TrendingUp, label: "Lead Analysis" },
          { id: "/report-analysis", icon: PieChart, label: "Report Analysis" },
          { id: "/number-upload", icon: Upload, label: "Number Upload" },
          { id: "/account-management", icon: UserCog, label: "Account Management" },
        ];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo Left */}
          <div className="flex items-center">
            <img src={logoImage} alt="Company Logo" className="h-8 w-auto" />
          </div>
          
          {/* User Profile Right */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePicture || ""} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className={`text-xs font-medium ${
                  user.role === "Super Admin" ? "role-super-admin" :
                  user.role === "CC Agent" ? "role-cc-agent" : "role-cro-agent"
                }`}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen relative">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {getMenuItems().map((item) => {
                const Icon = item.icon;
                const isActive = location === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.id}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Settings and Logout at bottom */}
          <div className="absolute bottom-6 left-0 right-0 px-4 space-y-2">
            <button
              onClick={() => {/* TODO: Implement settings */}}
              className="sidebar-item"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
          
          {/* Logo at bottom right */}
          <div className="absolute bottom-6 right-6">
            <img src={logoImage} alt="Company Logo" className="h-6 w-auto opacity-50" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
