import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Inbox, FileText, Phone, User, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReceivedLeadsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: receivedLeads = [], isLoading } = useQuery({
    queryKey: ["/api/leads/received", user?.id],
    enabled: !!user
  });

  const filteredLeads = receivedLeads.filter((lead: any) => {
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerNumber.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Received Leads</h1>
          <p className="text-gray-600 mt-1">Manage leads transferred to you</p>
        </div>
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

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Lead Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{receivedLeads.length}</div>
              <div className="text-sm text-gray-600">Total Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {receivedLeads.filter((lead: any) => lead.biodataFile).length}
              </div>
              <div className="text-sm text-gray-600">With Biodata</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {receivedLeads.filter((lead: any) => 
                  new Date(lead.transferredAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leads found</p>
          </div>
        ) : (
          filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {lead.customerName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3" />
                      {lead.customerNumber}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Received
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                      <p className="text-sm text-gray-600">{lead.description}</p>
                    </div>
                  )}
                  
                  {lead.biodataFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Biodata file available</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/uploads/${lead.biodataFile}`, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Transferred: {new Date(lead.transferredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>
                        From: {lead.user?.name || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`tel:${lead.customerNumber}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}