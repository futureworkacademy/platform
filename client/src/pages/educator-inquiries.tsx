import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Phone, 
  Building2, 
  Download, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Search
} from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EducatorInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  inquiryType: string;
  message: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface RoleInfo {
  role: string;
  isSuperAdmin: boolean;
}

export default function EducatorInquiriesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<EducatorInquiry | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: roleInfo, isLoading: roleLoading } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const { data: inquiries = [], isLoading, refetch } = useQuery<EducatorInquiry[]>({
    queryKey: ["/api/super-admin/educator-inquiries"],
    enabled: roleInfo?.isSuperAdmin === true,
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async (data: { id: string; status?: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/super-admin/educator-inquiries/${data.id}`, {
        status: data.status,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/educator-inquiries"] });
      setDetailDialogOpen(false);
      toast({ title: "Inquiry updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update inquiry", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleExport = () => {
    window.open("/api/super-admin/educator-inquiries/export", "_blank");
    toast({ title: "Downloading CSV export..." });
  };

  const openDetail = (inquiry: EducatorInquiry) => {
    setSelectedInquiry(inquiry);
    setEditNotes(inquiry.notes || "");
    setEditStatus(inquiry.status);
    setDetailDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedInquiry) {
      updateInquiryMutation.mutate({
        id: selectedInquiry.id,
        status: editStatus,
        notes: editNotes,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> New</Badge>;
      case "contacted":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Contacted</Badge>;
      case "resolved":
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInquiryTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      demo_request: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pricing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      partnership: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    const labels: Record<string, string> = {
      demo_request: "Demo Request",
      pricing: "Pricing",
      partnership: "Partnership",
      general: "General",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[type] || colors.general}`}>
        {labels[type] || type}
      </span>
    );
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.institution?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter(i => i.status === "new").length,
    contacted: inquiries.filter(i => i.status === "contacted").length,
    resolved: inquiries.filter(i => i.status === "resolved").length,
  };

  if (roleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!roleInfo?.isSuperAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need Super Admin privileges to view this page.</p>
            <Link href="/dashboard">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/super-admin">
            <Button variant="ghost" size="icon" aria-label="Go back" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Educator Inquiries</h1>
            <p className="text-muted-foreground">Manage inquiries from the For Educators contact form</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
          data-testid="filter-all"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <div className="text-sm text-muted-foreground">All Inquiries</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "new" ? "ring-2 ring-destructive" : ""}`}
          onClick={() => setStatusFilter("new")}
          data-testid="filter-new"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{statusCounts.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "contacted" ? "ring-2 ring-secondary" : ""}`}
          onClick={() => setStatusFilter("contacted")}
          data-testid="filter-contacted"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{statusCounts.contacted}</div>
            <div className="text-sm text-muted-foreground">Contacted</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "resolved" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setStatusFilter("resolved")}
          data-testid="filter-resolved"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, institution, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {inquiries.length === 0 
                  ? "No educator inquiries yet" 
                  : "No inquiries match your search criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInquiries.map((inquiry) => (
            <Card 
              key={inquiry.id} 
              className="cursor-pointer hover-elevate transition-all"
              onClick={() => openDetail(inquiry)}
              data-testid={`inquiry-card-${inquiry.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold">{inquiry.name}</h3>
                      {getStatusBadge(inquiry.status)}
                      {getInquiryTypeBadge(inquiry.inquiryType)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {inquiry.email}
                      </span>
                      {inquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inquiry.phone}
                        </span>
                      )}
                      {inquiry.institution && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {inquiry.institution}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedInquiry?.name}</span>
              {selectedInquiry && getInquiryTypeBadge(selectedInquiry.inquiryType)}
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedInquiry && new Date(selectedInquiry.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedInquiry.institution && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Institution</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedInquiry.institution}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  className="mt-1"
                  rows={3}
                  data-testid="input-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateInquiryMutation.isPending}
              data-testid="button-save-inquiry"
            >
              {updateInquiryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
