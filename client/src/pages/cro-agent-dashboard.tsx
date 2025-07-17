import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Inbox, Calendar } from "lucide-react";
import { useState } from "react";

export default function CROAgentDashboard() {
  const { data: receivedLeads } = useQuery({
    queryKey: ["/api/leads/received"],
  });

  const [selectedLead, setSelectedLead] = useState<any>(null);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your CRO Agent dashboard</p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Received Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receivedLeads?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Inbox className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receivedLeads?.filter((lead: any) => !lead.isProcessed)?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Received Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Received Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">Agent Name</TableHead>
                <TableHead className="table-header">Customer Number</TableHead>
                <TableHead className="table-header">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedLeads?.map((lead: any) => (
                <TableRow key={lead.id} className="table-row">
                  <TableCell className="table-cell">
                    {new Date(lead.transferredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="table-cell">
                    {lead.user?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="table-cell">
                    {lead.customerNumber}
                  </TableCell>
                  <TableCell className="table-cell">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="action-btn primary"
                          onClick={() => setSelectedLead(lead)}
                        >
                          Open
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="modal-content">
                        <DialogHeader>
                          <DialogTitle>Lead Details</DialogTitle>
                        </DialogHeader>
                        
                        {selectedLead && (
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">Customer Name</label>
                              <p className="text-sm text-gray-900">{selectedLead.customerName}</p>
                            </div>
                            
                            <div>
                              <label className="form-label">Customer Number</label>
                              <p className="text-sm text-gray-900">{selectedLead.customerNumber}</p>
                            </div>
                            
                            <div>
                              <label className="form-label">Notes</label>
                              <p className="text-sm text-gray-900">{selectedLead.description || "No notes available"}</p>
                            </div>
                            
                            {selectedLead.biodataFile && (
                              <div>
                                <label className="form-label">Biodata</label>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(selectedLead.biodataFile, '_blank')}
                                >
                                  Download Biodata
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
