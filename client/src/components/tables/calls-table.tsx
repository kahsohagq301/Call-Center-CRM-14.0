import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CallsTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast } = useToast();

  const { data: calls, isLoading } = useQuery({
    queryKey: ["/api/calls", categoryFilter],
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ id, category }: { id: number; category: string }) => {
      const res = await apiRequest("PATCH", `/api/calls/${id}`, { category });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      toast({
        title: "Call updated",
        description: "Call category has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (callId: number, category: string) => {
    updateCallMutation.mutate({ id: callId, category });
  };

  const handleCall = (number: string) => {
    // Open dialer or make call
    if (navigator.userAgent.includes("Mobile")) {
      window.open(`tel:${number}`, "_self");
    } else {
      // For desktop, you might want to integrate with a VoIP service
      toast({
        title: "Dialing",
        description: `Calling ${number}...`,
      });
    }
  };

  const filteredCalls = calls?.filter((call: any) => 
    call.customerNumber.includes(search)
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Calls Section
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="Switched Off">Switched Off</SelectItem>
              <SelectItem value="Busy">Busy</SelectItem>
              <SelectItem value="No Answer">No Answer</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="Interested">Interested</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/calls"] })}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="table-header">No.</TableHead>
              <TableHead className="table-header">Customer Number</TableHead>
              <TableHead className="table-header">Call</TableHead>
              <TableHead className="table-header">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.map((call: any, index: number) => (
              <TableRow key={call.id} className="table-row">
                <TableCell className="table-cell">{index + 1}</TableCell>
                <TableCell className="table-cell">{call.customerNumber}</TableCell>
                <TableCell className="table-cell">
                  <Button
                    size="sm"
                    className="btn-success"
                    onClick={() => handleCall(call.customerNumber)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </TableCell>
                <TableCell className="table-cell">
                  <Select
                    value={call.category || ""}
                    onValueChange={(value) => handleCategoryChange(call.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Switched Off">Switched Off</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                      <SelectItem value="Interested">Interested</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-700">
            Showing {filteredCalls.length} records
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="pagination-btn">
              Previous
            </Button>
            <Button size="sm" className="pagination-btn active">
              1
            </Button>
            <Button variant="outline" size="sm" className="pagination-btn">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
