import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, ArrowRightLeft, CheckCircle, XCircle } from "lucide-react";
import { CallsTable } from "@/components/tables/calls-table";
import { LeadsTable } from "@/components/tables/leads-table";
import { ReportsTable } from "@/components/tables/reports-table";

export default function CCAgentDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: todayTask } = useQuery({
    queryKey: ["/api/tasks/today"],
  });

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your CC Agent dashboard</p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalCalls || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalLeads || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transferred Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalTransferredLeads || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              todayTask?.addLeadCompleted ? "task-completed" : "task-pending"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  todayTask?.addLeadCompleted ? "bg-green-500" : "bg-red-500"
                }`}>
                  {todayTask?.addLeadCompleted ? 
                    <CheckCircle className="h-4 w-4 text-white" /> : 
                    <XCircle className="h-4 w-4 text-white" />
                  }
                </div>
                <span className="font-medium">Add Lead (Min 5)</span>
              </div>
              <span className={`text-sm font-medium ${
                todayTask?.addLeadCompleted ? "text-green-600" : "text-red-600"
              }`}>
                {todayTask?.addLeadCount || 0}/5 {todayTask?.addLeadCompleted ? "Completed" : "Pending"}
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              todayTask?.transferLeadCompleted ? "task-completed" : "task-pending"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  todayTask?.transferLeadCompleted ? "bg-green-500" : "bg-red-500"
                }`}>
                  {todayTask?.transferLeadCompleted ? 
                    <CheckCircle className="h-4 w-4 text-white" /> : 
                    <XCircle className="h-4 w-4 text-white" />
                  }
                </div>
                <span className="font-medium">Transfer Lead (Min 3)</span>
              </div>
              <span className={`text-sm font-medium ${
                todayTask?.transferLeadCompleted ? "text-green-600" : "text-red-600"
              }`}>
                {todayTask?.transferLeadCount || 0}/3 {todayTask?.transferLeadCompleted ? "Completed" : "Pending"}
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              todayTask?.reportSubmitted ? "task-completed" : "task-pending"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  todayTask?.reportSubmitted ? "bg-green-500" : "bg-red-500"
                }`}>
                  {todayTask?.reportSubmitted ? 
                    <CheckCircle className="h-4 w-4 text-white" /> : 
                    <XCircle className="h-4 w-4 text-white" />
                  }
                </div>
                <span className="font-medium">Submit Report (Once per day)</span>
              </div>
              <span className={`text-sm font-medium ${
                todayTask?.reportSubmitted ? "text-green-600" : "text-red-600"
              }`}>
                {todayTask?.reportSubmitted ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tables based on current page */}
      <CallsTable />
      <LeadsTable />
      <ReportsTable />
    </div>
  );
}
