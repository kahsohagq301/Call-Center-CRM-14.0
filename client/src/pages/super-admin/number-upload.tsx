import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Users, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function NumberUploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignedTo, setAssignedTo] = useState("");

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["/api/number-uploads"],
    enabled: !!user
  });

  const { data: ccAgents = [] } = useQuery({
    queryKey: ["/api/users/cc-agents"],
    enabled: !!user
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/number-uploads", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Failed to upload numbers");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/number-uploads"] });
      setShowUpload(false);
      setSelectedFile(null);
      setAssignedTo("");
      toast({
        title: "Success",
        description: "Numbers uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload numbers",
        variant: "destructive",
      });
    }
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!assignedTo) {
      toast({
        title: "Error",
        description: "Please select an agent to assign numbers to",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("assignedTo", assignedTo);

    uploadMutation.mutate(formData);
  };

  const getTotalNumbers = () => {
    return uploads.reduce((sum: number, upload: any) => sum + (upload.numbers?.length || 0), 0);
  };

  const getNumbersByAgent = () => {
    const agentNumbers = ccAgents.map((agent: any) => {
      const agentUploads = uploads.filter((upload: any) => upload.assignedTo === agent.id);
      const totalNumbers = agentUploads.reduce((sum: number, upload: any) => sum + (upload.numbers?.length || 0), 0);
      return {
        agent: agent.name,
        uploads: agentUploads.length,
        totalNumbers
      };
    });
    return agentNumbers;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Number Upload</h1>
          <p className="text-gray-600 mt-1">Upload and manage phone numbers for agents</p>
        </div>
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Numbers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Phone Numbers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload a CSV file with phone numbers (one per line)
                </p>
              </div>
              <div>
                <Label htmlFor="assignedTo">Assign to Agent</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CC Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {ccAgents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)}>
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
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Numbers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalNumbers()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ccAgents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Numbers by Agent */}
      <Card>
        <CardHeader>
          <CardTitle>Numbers by Agent</CardTitle>
          <CardDescription>Phone number distribution across CC agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getNumbersByAgent().map((agentData: any) => (
              <div key={agentData.agent} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{agentData.agent}</div>
                    <div className="text-sm text-gray-600">CC Agent</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{agentData.uploads}</div>
                    <div className="text-gray-600">Uploads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{agentData.totalNumbers}</div>
                    <div className="text-gray-600">Numbers</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>Recent number uploads and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading uploads...</div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No uploads yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload: any) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{upload.fileName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{upload.numbers?.length || 0}</div>
                      <div className="text-gray-600">Numbers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {ccAgents.find((agent: any) => agent.id === upload.assignedTo)?.name || "Unknown"}
                      </div>
                      <div className="text-gray-600">Assigned to</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">
                        {user?.name || "Unknown"}
                      </div>
                      <div className="text-gray-600">Uploaded by</div>
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