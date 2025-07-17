import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Send, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LeadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddLead, setShowAddLead] = useState(false);
  const [showTransferLead, setShowTransferLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLead, setNewLead] = useState({
    customerName: "",
    customerNumber: "",
    description: "",
    biodataFile: null as File | null
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads", user?.id],
    enabled: !!user
  });

  const { data: croAgents = [] } = useQuery({
    queryKey: ["/api/users/cro-agents"],
    enabled: !!user
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: FormData) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        body: leadData
      });
      if (!res.ok) throw new Error("Failed to add lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setShowAddLead(false);
      setNewLead({ customerName: "", customerNumber: "", description: "", biodataFile: null });
      toast({
        title: "Success",
        description: "Lead added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead",
        variant: "destructive",
      });
    }
  });

  const transferLeadMutation = useMutation({
    mutationFn: async ({ leadId, transferTo }: { leadId: number; transferTo: number }) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/transfer`, { transferTo });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setShowTransferLead(false);
      setSelectedLead(null);
      toast({
        title: "Success",
        description: "Lead transferred successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer lead",
        variant: "destructive",
      });
    }
  });

  const handleAddLead = () => {
    if (!newLead.customerName || !newLead.customerNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("customerName", newLead.customerName);
    formData.append("customerNumber", newLead.customerNumber);
    formData.append("description", newLead.description);
    if (newLead.biodataFile) {
      formData.append("biodataFile", newLead.biodataFile);
    }

    addLeadMutation.mutate(formData);
  };

  const handleTransferLead = (transferTo: number) => {
    if (!selectedLead) return;
    transferLeadMutation.mutate({ leadId: selectedLead.id, transferTo });
  };

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerNumber.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your leads</p>
        </div>
        <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newLead.customerName}
                  onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerNumber">Customer Number *</Label>
                <Input
                  id="customerNumber"
                  value={newLead.customerNumber}
                  onChange={(e) => setNewLead({ ...newLead, customerNumber: e.target.value })}
                  placeholder="Enter customer number"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newLead.description}
                  onChange={(e) => setNewLead({ ...newLead, description: e.target.value })}
                  placeholder="Enter lead description"
                />
              </div>
              <div>
                <Label htmlFor="biodataFile">Biodata File (Optional)</Label>
                <Input
                  id="biodataFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setNewLead({ ...newLead, biodataFile: e.target.files?.[0] || null })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddLead} disabled={addLeadMutation.isPending}>
                  {addLeadMutation.isPending ? "Adding..." : "Add Lead"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddLead(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name or number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leads found</p>
          </div>
        ) : (
          filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{lead.customerName}</CardTitle>
                    <CardDescription>{lead.customerNumber}</CardDescription>
                  </div>
                  <Badge className={lead.isTransferred ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {lead.isTransferred ? "Transferred" : "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                  )}
                  
                  {lead.biodataFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Biodata attached</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                  
                  {!lead.isTransferred && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowTransferLead(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Transfer to CRO
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transfer Lead Dialog */}
      <Dialog open={showTransferLead} onOpenChange={setShowTransferLead}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Transfer lead for <strong>{selectedLead?.customerName}</strong> to:</p>
            <Select onValueChange={(value) => handleTransferLead(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select CRO Agent" />
              </SelectTrigger>
              <SelectContent>
                {croAgents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name} ({agent.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTransferLead(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}