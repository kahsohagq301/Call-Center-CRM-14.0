import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CallsPage from "@/pages/cc-agent/calls";
import LeadsPage from "@/pages/cc-agent/leads";
import ReportsPage from "@/pages/cc-agent/reports";
import ReceivedLeadsPage from "@/pages/cro-agent/received-leads";
import LeadAnalysisPage from "@/pages/super-admin/lead-analysis";
import ReportAnalysisPage from "@/pages/super-admin/report-analysis";
import NumberUploadPage from "@/pages/super-admin/number-upload";
import AccountManagementPage from "@/pages/super-admin/account-management";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/calls" component={CallsPage} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/received-leads" component={ReceivedLeadsPage} />
      <ProtectedRoute path="/lead-analysis" component={LeadAnalysisPage} />
      <ProtectedRoute path="/report-analysis" component={ReportAnalysisPage} />
      <ProtectedRoute path="/number-upload" component={NumberUploadPage} />
      <ProtectedRoute path="/account-management" component={AccountManagementPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
