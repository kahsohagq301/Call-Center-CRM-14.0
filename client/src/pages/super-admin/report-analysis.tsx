import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { PieChart, BarChart3, TrendingUp, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportAnalysisPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !!user
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user
  });

  const ccAgents = users.filter((u: any) => u.role === "CC Agent");

  const getReportsByAgent = () => {
    const agentReports = ccAgents.map((agent: any) => {
      const agentReports = reports.filter((report: any) => report.userId === agent.id);
      const totalCalls = agentReports.reduce((sum: number, report: any) => 
        sum + report.onlineCall + report.offlineCall, 0);
      const totalLeads = agentReports.reduce((sum: number, report: any) => 
        sum + report.totalLeads, 0);
      
      return {
        agent: agent.name,
        reports: agentReports.length,
        totalCalls,
        totalLeads,
        onlineCalls: agentReports.reduce((sum: number, report: any) => sum + report.onlineCall, 0),
        offlineCalls: agentReports.reduce((sum: number, report: any) => sum + report.offlineCall, 0)
      };
    });
    return agentReports;
  };

  const getRecentReports = () => {
    return reports
      .sort((a: any, b: any) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
      .slice(0, 10);
  };

  const getTotalStats = () => {
    const totalOnlineCalls = reports.reduce((sum: number, report: any) => sum + report.onlineCall, 0);
    const totalOfflineCalls = reports.reduce((sum: number, report: any) => sum + report.offlineCall, 0);
    const totalLeads = reports.reduce((sum: number, report: any) => sum + report.totalLeads, 0);
    
    return {
      totalOnlineCalls,
      totalOfflineCalls,
      totalCalls: totalOnlineCalls + totalOfflineCalls,
      totalLeads,
      totalReports: reports.length
    };
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading report analysis...</div>;
  }

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Report Analysis</h1>
        <p className="text-gray-600 mt-1">Comprehensive analysis of daily reports and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalOnlineCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalOfflineCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Agent */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Agent</CardTitle>
          <CardDescription>Call and lead metrics by individual agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getReportsByAgent().map((agentData: any) => (
              <div key={agentData.agent} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{agentData.agent}</div>
                    <div className="text-sm text-gray-600">{agentData.reports} reports submitted</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{agentData.totalCalls}</div>
                    <div className="text-gray-600">Total Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{agentData.onlineCalls}</div>
                    <div className="text-gray-600">Online</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{agentData.offlineCalls}</div>
                    <div className="text-gray-600">Offline</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{agentData.totalLeads}</div>
                    <div className="text-gray-600">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-600">
                      {agentData.totalCalls > 0 ? Math.round((agentData.totalLeads / agentData.totalCalls) * 100) : 0}%
                    </div>
                    <div className="text-gray-600">Conversion</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Latest daily reports from all agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRecentReports().map((report: any) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">
                      {users.find((u: any) => u.id === report.userId)?.name || "Unknown Agent"}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.reportDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{report.onlineCall}</div>
                    <div className="text-gray-600">Online</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{report.offlineCall}</div>
                    <div className="text-gray-600">Offline</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{report.totalLeads}</div>
                    <div className="text-gray-600">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      {report.onlineCall + report.offlineCall}
                    </div>
                    <div className="text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}