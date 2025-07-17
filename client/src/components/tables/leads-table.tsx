import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, Edit, ArrowRightLeft, Trash2 } from "lucide-react";
import { AddLeadModal } from "@/components/modals/add-lead-modal";
import { TransferLeadModal } from "@/components/modals/transfer-lead-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function LeadsTable() {
  const { toast } = useToast();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead deleted",
        description: "Lead has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLeadMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leads...</p>
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
            <Users className="h-5 w-5" />
            Lead Section
          </CardTitle>
          <AddLeadModal />
        </div>
      </CardHeader>
      <CardContent>
        {leads?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No leads found</p>
            <p className="text-sm text-gray-500">Create your first lead to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">No.</TableHead>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">Customer Name</TableHead>
                <TableHead className="table-header">Customer Number</TableHead>
                <TableHead className="table-header">Status</TableHead>
                <TableHead className="table-header">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead: any, index: number) => (
                <TableRow key={lead.id} className="table-row">
                  <TableCell className="table-cell">{index + 1}</TableCell>
                  <TableCell className="table-cell">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="table-cell">{lead.customerName}</TableCell>
                  <TableCell className="table-cell">{lead.customerNumber}</TableCell>
                  <TableCell className="table-cell">
                    <span className={`status-badge ${lead.isTransferred ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {lead.isTransferred ? "Transferred" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!lead.isTransferred && (
                          <TransferLeadModal 
                            leadId={lead.id} 
                            leadCustomerName={lead.customerName}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transfer
                            </DropdownMenuItem>
                          </TransferLeadModal>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
