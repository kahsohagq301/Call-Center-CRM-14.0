import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Phone, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CallsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddCall, setShowAddCall] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCall, setNewCall] = useState({
    customerNumber: "",
    category: ""
  });

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["/api/calls", user?.id],
    enabled: !!user
  });

  const addCallMutation = useMutation({
    mutationFn: async (callData: any) => {
      const res = await apiRequest("POST", "/api/calls", callData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      setShowAddCall(false);
      setNewCall({ customerNumber: "", category: "" });
      toast({
        title: "Success",
        description: "Call added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add call",
        variant: "destructive",
      });
    }
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/calls/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      toast({
        title: "Success",
        description: "Call updated successfully",
      });
    }
  });

  const handleAddCall = () => {
    if (!newCall.customerNumber) {
      toast({
        title: "Error",
        description: "Please enter customer number",
        variant: "destructive",
      });
      return;
    }
    addCallMutation.mutate(newCall);
  };

  const handleUpdateCall = (id: number, category: string) => {
    updateCallMutation.mutate({ id, category });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Interested": return "bg-green-100 text-green-800";
      case "Not Interested": return "bg-red-100 text-red-800";
      case "Busy": return "bg-yellow-100 text-yellow-800";
      case "No Answer": return "bg-gray-100 text-gray-800";
      case "Switched Off": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCalls = calls.filter((call: any) => {
    const matchesCategory = filterCategory === "all" || call.category === filterCategory;
    const matchesSearch = call.customerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calls Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your customer calls</p>
        </div>
        <Dialog open={showAddCall} onOpenChange={setShowAddCall}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Call
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerNumber">Customer Number</Label>
                <Input
                  id="customerNumber"
                  value={newCall.customerNumber}
                  onChange={(e) => setNewCall({ ...newCall, customerNumber: e.target.value })}
                  placeholder="Enter customer number"
                />
              </div>
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={newCall.category} onValueChange={(value) => setNewCall({ ...newCall, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="No Answer">No Answer</SelectItem>
                    <SelectItem value="Switched Off">Switched Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCall} disabled={addCallMutation.isPending}>
                  {addCallMutation.isPending ? "Adding..." : "Add Call"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddCall(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Interested">Interested</SelectItem>
            <SelectItem value="Not Interested">Not Interested</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
            <SelectItem value="No Answer">No Answer</SelectItem>
            <SelectItem value="Switched Off">Switched Off</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading calls...</div>
        ) : filteredCalls.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No calls found</p>
          </div>
        ) : (
          filteredCalls.map((call: any) => (
            <Card key={call.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{call.customerNumber}</CardTitle>
                    <CardDescription>
                      {new Date(call.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getCategoryColor(call.category || "Uncategorized")}>
                    {call.category || "Uncategorized"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Update Category:</Label>
                  <Select 
                    value={call.category || ""} 
                    onValueChange={(value) => handleUpdateCall(call.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Switched Off">Switched Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}