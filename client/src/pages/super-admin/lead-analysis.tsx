import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, Users, Send, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadAnalysisPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !!user
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    enabled: !!user
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user
  });

  const ccAgents = users.filter((u: any) => u.role === "CC Agent");
  const croAgents = users.filter((u: any) => u.role === "CRO Agent");

  const getLeadsByAgent = () => {
    const agentLeads = ccAgents.map((agent: any) => ({
      agent: agent.name,
      total: leads.filter((lead: any) => lead.userId === agent.id).length,
      transferred: leads.filter((lead: any) => lead.userId === agent.id && lead.isTransferred).length
    }));
    return agentLeads;
  };

  const getRecentLeads = () => {
    return leads
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Analysis</h1>
        <p className="text-gray-600 mt-1">Comprehensive analysis of lead generation and conversion</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalLeads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferred Leads</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter((lead: any) => lead.isTransferred).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active CC Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ccAgents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CRO Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{croAgents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Lead generation and transfer statistics by agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getLeadsByAgent().map((agentData: any) => (
              <div key={agentData.agent} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{agentData.agent}</div>
                    <div className="text-sm text-gray-600">CC Agent</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{agentData.total}</div>
                    <div className="text-gray-600">Total Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{agentData.transferred}</div>
                    <div className="text-gray-600">Transferred</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">
                      {agentData.total > 0 ? Math.round((agentData.transferred / agentData.total) * 100) : 0}%
                    </div>
                    <div className="text-gray-600">Transfer Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest leads generated across all agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRecentLeads().map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${lead.isTransferred ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <div className="font-medium">{lead.customerName}</div>
                    <div className="text-sm text-gray-600">{lead.customerNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">
                      {users.find((u: any) => u.id === lead.userId)?.name || "Unknown"}
                    </div>
                    <div className="text-gray-600">Created by</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {lead.isTransferred ? "Transferred" : "Active"}
                    </div>
                    <div className="text-gray-600">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600">Date</div>
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