import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Phone, ArrowRightLeft, UserCheck, Plus, Upload, TrendingUp, PieChart } from "lucide-react";
import { useState } from "react";

export default function SuperAdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: ccAgents } = useQuery({
    queryKey: ["/api/users/cc-agents"],
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/reports"],
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CC Agent",
    officialNumber: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalLeads || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalCalls || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalAccounts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transferred Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalTransferredLeads || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lead Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">No</TableHead>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">Total Leads</TableHead>
                <TableHead className="table-header">Transferred Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="table-row">
                <TableCell className="table-cell">1</TableCell>
                <TableCell className="table-cell">{new Date().toLocaleDateString()}</TableCell>
                <TableCell className="table-cell">{analytics?.totalLeads || 0}</TableCell>
                <TableCell className="table-cell">{analytics?.totalTransferredLeads || 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Report Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Report Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary">Total Reports</h3>
              <p className="text-2xl font-bold text-gray-900">{reports?.length || 0}</p>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-secondary">Avg Calls/Day</h3>
              <p className="text-2xl font-bold text-gray-900">
                {reports?.length ? Math.round(reports.reduce((sum: number, report: any) => sum + (report.onlineCall + report.offlineCall), 0) / reports.length) : 0}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-600">Avg Leads/Day</h3>
              <p className="text-2xl font-bold text-gray-900">
                {reports?.length ? Math.round(reports.reduce((sum: number, report: any) => sum + report.totalLeads, 0) / reports.length) : 0}
              </p>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">Agent</TableHead>
                <TableHead className="table-header">Total Calls</TableHead>
                <TableHead className="table-header">Total Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report: any) => (
                <TableRow key={report.id} className="table-row">
                  <TableCell className="table-cell">
                    {new Date(report.reportDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="table-cell">
                    {report.user?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="table-cell">
                    {report.onlineCall + report.offlineCall}
                  </TableCell>
                  <TableCell className="table-cell">
                    {report.totalLeads}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Number Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Number Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ccAgents?.map((agent: any) => (
              <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">CC Agent</p>
                    </div>
                  </div>
                </div>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  className="mb-4"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    // TODO: Implement file upload
                    console.log("Upload numbers for", agent.name);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Numbers
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Account Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Account Management</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="modal-content max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                
                <form className="space-y-4">
                  <div className="form-group">
                    <Label htmlFor="name" className="form-label">Agent Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Full Name"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="email" className="form-label">Agent Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Email Address"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="officialNumber" className="form-label">Official Number</Label>
                    <Input
                      id="officialNumber"
                      type="tel"
                      value={newUser.officialNumber}
                      onChange={(e) => setNewUser({ ...newUser, officialNumber: e.target.value })}
                      placeholder="Phone Number"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="password" className="form-label">Create Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Password"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="confirmPassword" className="form-label">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                      placeholder="Confirm Password"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="profilePicture" className="form-label">Upload Profile Picture</Label>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <Label htmlFor="role" className="form-label">Select Account Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="CC Agent">CC Agent</SelectItem>
                        <SelectItem value="CRO Agent">CRO Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="btn-primary">
                    Create Account
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">Name</TableHead>
                <TableHead className="table-header">Email</TableHead>
                <TableHead className="table-header">Role</TableHead>
                <TableHead className="table-header">Status</TableHead>
                <TableHead className="table-header">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id} className="table-row">
                  <TableCell className="table-cell">{user.name}</TableCell>
                  <TableCell className="table-cell">{user.email}</TableCell>
                  <TableCell className="table-cell">
                    <span className={`role-badge ${
                      user.role === "Super Admin" ? "role-super-admin" :
                      user.role === "CC Agent" ? "role-cc-agent" : "role-cro-agent"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <span className={`status-badge ${user.isActive ? "status-active" : "status-inactive"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="table-cell">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-primary hover:text-primary/80">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
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
