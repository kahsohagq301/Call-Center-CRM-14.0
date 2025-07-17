import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, BarChart3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AddReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    onlineCall: "",
    offlineCall: "",
    totalLeads: "",
  });
  const { toast } = useToast();

  const addReportMutation = useMutation({
    mutationFn: async (data: { onlineCall: number; offlineCall: number; totalLeads: number }) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      toast({
        title: "Report submitted",
        description: "Your daily report has been submitted successfully.",
      });
      setIsOpen(false);
      setFormData({ onlineCall: "", offlineCall: "", totalLeads: "" });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      onlineCall: parseInt(formData.onlineCall) || 0,
      offlineCall: parseInt(formData.offlineCall) || 0,
      totalLeads: parseInt(formData.totalLeads) || 0,
    };
    
    addReportMutation.mutate(data);
  };

  const totalCalls = (parseInt(formData.onlineCall) || 0) + (parseInt(formData.offlineCall) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </Button>
      </DialogTrigger>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Add Daily Report
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <Label htmlFor="onlineCall" className="form-label">Online Calls</Label>
            <Input
              id="onlineCall"
              type="number"
              min="0"
              value={formData.onlineCall}
              onChange={(e) => setFormData({ ...formData, onlineCall: e.target.value })}
              placeholder="Enter number of online calls"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="offlineCall" className="form-label">Offline Calls</Label>
            <Input
              id="offlineCall"
              type="number"
              min="0"
              value={formData.offlineCall}
              onChange={(e) => setFormData({ ...formData, offlineCall: e.target.value })}
              placeholder="Enter number of offline calls"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="totalLeads" className="form-label">Total Leads</Label>
            <Input
              id="totalLeads"
              type="number"
              min="0"
              value={formData.totalLeads}
              onChange={(e) => setFormData({ ...formData, totalLeads: e.target.value })}
              placeholder="Enter total number of leads"
              className="form-input"
              required
            />
          </div>
          
          {totalCalls > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Total Calls:</strong> {totalCalls} 
                <span className="text-gray-500 ml-2">
                  ({formData.onlineCall || 0} online + {formData.offlineCall || 0} offline)
                </span>
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={addReportMutation.isPending}
          >
            {addReportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
