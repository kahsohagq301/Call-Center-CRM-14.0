import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TransferLeadModalProps {
  leadId: number;
  leadCustomerName: string;
  children: React.ReactNode;
}

export function TransferLeadModal({ leadId, leadCustomerName, children }: TransferLeadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const { toast } = useToast();

  const { data: croAgents, isLoading: loadingAgents } = useQuery({
    queryKey: ["/api/users/cro-agents"],
    enabled: isOpen,
  });

  const transferLeadMutation = useMutation({
    mutationFn: async (data: { transferredTo: number }) => {
      const res = await apiRequest("PATCH", `/api/leads/${leadId}/transfer`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      toast({
        title: "Lead transferred",
        description: `Lead for ${leadCustomerName} has been transferred successfully.`,
      });
      setIsOpen(false);
      setSelectedAgent("");
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgent) {
      toast({
        title: "Please select an agent",
        description: "You must select a CRO agent to transfer the lead to.",
        variant: "destructive",
      });
      return;
    }
    
    transferLeadMutation.mutate({ transferredTo: parseInt(selectedAgent) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Lead
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Transferring lead for: <strong>{leadCustomerName}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <Label htmlFor="croAgent" className="form-label">Select CRO Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="form-select">
                <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select CRO Agent"} />
              </SelectTrigger>
              <SelectContent>
                {croAgents?.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name} ({agent.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loadingAgents && croAgents?.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No CRO agents available</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={transferLeadMutation.isPending || !selectedAgent}
          >
            {transferLeadMutation.isPending ? "Transferring..." : "Transfer Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
