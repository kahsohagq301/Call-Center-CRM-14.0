import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Download } from "lucide-react";
import { useState } from "react";

export default function SuperAdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: ccAgents } = useQuery({
    queryKey: ["/api/users/cc-agents"],
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/reports"],
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: calls } = useQuery({
    queryKey: ["/api/calls"],
  });

  const { data: numberUploads } = useQuery({
    queryKey: ["/api/number-uploads"],
  });

  // Simple report generation function
  const generatePDFReport = (userId: number, userName: string) => {
    const stats = getUserStats(userId);
    const reportData = `
Daily Report - ${userName}
Date: ${new Date().toLocaleDateString()}

Summary:
- Total Calls: ${stats.totalCalls}
- Total Leads: ${stats.totalLeads}
- Transferred Leads: ${stats.transferredLeads}
- Total Reports: ${stats.totalReports}
- Number Uploads: ${stats.totalNumberUploads}
    `;
    
    // Create a blob and download
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}_daily_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to get user statistics
  const getUserStats = (userId: number) => {
    const userReports = reports?.filter((report: any) => report.userId === userId) || [];
    const userCalls = calls?.filter((call: any) => call.userId === userId) || [];
    const userLeads = leads?.filter((lead: any) => lead.userId === userId) || [];
    const userNumberUploads = numberUploads?.filter((upload: any) => upload.assignedTo === userId) || [];
    
    const totalCalls = userCalls.length;
    const totalOnlineCalls = userReports.reduce((sum: number, report: any) => sum + (report.onlineCall || 0), 0);
    const totalOfflineCalls = userReports.reduce((sum: number, report: any) => sum + (report.offlineCall || 0), 0);
    const totalLeads = userLeads.length;
    const transferredLeads = userLeads.filter((lead: any) => lead.isTransferred).length;
    const totalReports = userReports.length;
    const totalNumberUploads = userNumberUploads.reduce((sum: number, upload: any) => {
      return sum + (Array.isArray(upload.numbers) ? upload.numbers.length : 0);
    }, 0);
    
    return {
      totalCalls: totalCalls + totalOnlineCalls + totalOfflineCalls,
      totalLeads,
      transferredLeads,
      totalReports,
      totalNumberUploads
    };
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>
      
      {/* Comprehensive Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Agent Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">No</TableHead>
                  <TableHead className="table-header">Date</TableHead>
                  <TableHead className="table-header">Total Leads</TableHead>
                  <TableHead className="table-header">Transferred Leads</TableHead>
                  <TableHead className="table-header">Total Reports</TableHead>
                  <TableHead className="table-header">Total Calls</TableHead>
                  <TableHead className="table-header">NU</TableHead>
                  <TableHead className="table-header">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ccAgents?.map((agent: any, index: number) => {
                  const stats = getUserStats(agent.id);
                  return (
                    <TableRow key={agent.id} className="table-row">
                      <TableCell className="table-cell">{index + 1}</TableCell>
                      <TableCell className="table-cell">{new Date().toLocaleDateString()}</TableCell>
                      <TableCell className="table-cell">{stats.totalLeads}</TableCell>
                      <TableCell className="table-cell">{stats.transferredLeads}</TableCell>
                      <TableCell className="table-cell">{stats.totalReports}</TableCell>
                      <TableCell className="table-cell">{stats.totalCalls}</TableCell>
                      <TableCell className="table-cell">{stats.totalNumberUploads}</TableCell>
                      <TableCell className="table-cell">
                        <Button
                          size="sm"
                          onClick={() => generatePDFReport(agent.id, agent.name)}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}