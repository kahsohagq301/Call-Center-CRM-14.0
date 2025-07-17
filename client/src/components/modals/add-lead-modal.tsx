import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AddLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerNumber: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const addLeadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create lead");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      toast({
        title: "Lead created",
        description: "Lead has been created successfully.",
      });
      setIsOpen(false);
      setFormData({ customerName: "", customerNumber: "", description: "" });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to create lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("customerName", formData.customerName);
    data.append("customerNumber", formData.customerNumber);
    data.append("description", formData.description);
    
    if (selectedFile) {
      data.append("biodataFile", selectedFile);
    }
    
    addLeadMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (1-10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.includes("pdf") && !file.type.includes("word") && !file.type.includes("document")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <Label htmlFor="customerName" className="form-label">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter customer name"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="customerNumber" className="form-label">Customer Number</Label>
            <Input
              id="customerNumber"
              type="tel"
              value={formData.customerNumber}
              onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
              placeholder="With country code (e.g., +1234567890)"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="biodataFile" className="form-label">Customer Biodata</Label>
            <div className="space-y-2">
              <Input
                id="biodataFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="form-input"
              />
              <p className="text-xs text-gray-500">PDF/Word documents, 1-10MB</p>
              {selectedFile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Upload className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="description" className="form-label">Description/Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional notes or description"
              className="form-textarea"
              rows={4}
            />
          </div>
          
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={addLeadMutation.isPending}
          >
            {addLeadMutation.isPending ? "Creating..." : "Submit Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
