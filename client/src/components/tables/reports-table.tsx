import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Search, Filter } from "lucide-react";
import { AddReportModal } from "@/components/modals/add-report-modal";
import { useState } from "react";

export function ReportsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"],
  });

  const filteredReports = reports?.filter((report: any) => {
    const matchesSearch = report.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || new Date(report.reportDate).toLocaleDateString().includes(dateFilter);
    return matchesSearch && matchesDate;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Section
          </CardTitle>
          <AddReportModal />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by agent name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No reports found</p>
            <p className="text-sm text-gray-500">Submit your first daily report to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">Agent Name</TableHead>
                <TableHead className="table-header">Online Calls</TableHead>
                <TableHead className="table-header">Offline Calls</TableHead>
                <TableHead className="table-header">Total Calls</TableHead>
                <TableHead className="table-header">Total Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report: any) => (
                <TableRow key={report.id} className="table-row">
                  <TableCell className="table-cell">
                    {new Date(report.reportDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="table-cell">
                    {report.user?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="table-cell">
                    <span className="text-green-600 font-medium">{report.onlineCall}</span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <span className="text-blue-600 font-medium">{report.offlineCall}</span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <span className="font-semibold">{report.onlineCall + report.offlineCall}</span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <span className="text-primary font-medium">{report.totalLeads}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {filteredReports.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Reports</p>
                <p className="font-semibold">{filteredReports.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Online Calls</p>
                <p className="font-semibold text-green-600">
                  {filteredReports.reduce((sum: number, report: any) => sum + report.onlineCall, 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Offline Calls</p>
                <p className="font-semibold text-blue-600">
                  {filteredReports.reduce((sum: number, report: any) => sum + report.offlineCall, 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Leads</p>
                <p className="font-semibold text-primary">
                  {filteredReports.reduce((sum: number, report: any) => sum + report.totalLeads, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
