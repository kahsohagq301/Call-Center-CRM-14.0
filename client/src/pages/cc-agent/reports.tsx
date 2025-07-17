import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Plus, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({
    onlineCall: 0,
    offlineCall: 0,
    totalLeads: 0
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user
  });

  const addReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const res = await apiRequest("POST", "/api/reports", reportData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setShowAddReport(false);
      setNewReport({ onlineCall: 0, offlineCall: 0, totalLeads: 0 });
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  });

  const handleAddReport = () => {
    addReportMutation.mutate(newReport);
  };

  const getTotalCalls = (report: any) => report.onlineCall + report.offlineCall;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Track your daily performance and submit reports</p>
        </div>
        <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Daily Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="onlineCall">Online Calls</Label>
                <Input
                  id="onlineCall"
                  type="number"
                  value={newReport.onlineCall}
                  onChange={(e) => setNewReport({ ...newReport, onlineCall: parseInt(e.target.value) || 0 })}
                  placeholder="Enter number of online calls"
                />
              </div>
              <div>
                <Label htmlFor="offlineCall">Offline Calls</Label>
                <Input
                  id="offlineCall"
                  type="number"
                  value={newReport.offlineCall}
                  onChange={(e) => setNewReport({ ...newReport, offlineCall: parseInt(e.target.value) || 0 })}
                  placeholder="Enter number of offline calls"
                />
              </div>
              <div>
                <Label htmlFor="totalLeads">Total Leads</Label>
                <Input
                  id="totalLeads"
                  type="number"
                  value={newReport.totalLeads}
                  onChange={(e) => setNewReport({ ...newReport, totalLeads: parseInt(e.target.value) || 0 })}
                  placeholder="Enter total leads generated"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddReport} disabled={addReportMutation.isPending}>
                  {addReportMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddReport(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum: number, report: any) => sum + getTotalCalls(report), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum: number, report: any) => sum + report.totalLeads, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Your submitted daily reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {new Date(report.reportDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{report.onlineCall}</div>
                      <div>Online Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">{report.offlineCall}</div>
                      <div>Offline Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{report.totalLeads}</div>
                      <div>Total Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">{getTotalCalls(report)}</div>
                      <div>Total Calls</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}