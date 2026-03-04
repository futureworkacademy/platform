import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, GraduationCap, Building2, Camera, Save, ArrowLeft, Bell, MessageSquare, LogOut, Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { profileUpdateSchema, type ProfileUpdate } from "@shared/schema";

interface Profile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  institution: string | null;
  department: string | null;
  teamId: string | null;
  isAdmin: string | null;
  notifyPhone: string | null;
  smsEnabled: boolean | null;
}

interface RoleInfo {
  role: string;
  isSuperAdmin: boolean;
  isClassAdmin: boolean;
}

const profileFormSchema = profileUpdateSchema.omit({ profileImageUrl: true });
type ProfileFormData = ProfileUpdate;

export default function Profile() {
  const { logout, isLoggingOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: roleInfo } = useQuery<RoleInfo>({
    queryKey: ["/api/my-role"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      company: "",
      institution: "",
      department: "",
      notifyPhone: "",
      smsEnabled: true,
    },
    values: profile ? {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      jobTitle: profile.jobTitle || "",
      company: profile.company || "",
      institution: profile.institution || "",
      department: profile.department || "",
      notifyPhone: profile.notifyPhone || "",
      smsEnabled: profile.smsEnabled ?? true,
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { profileImageUrl?: string }) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      ...data,
      profileImageUrl: previewUrl || profile?.profileImageUrl || undefined,
    });
  };

  const getInitials = () => {
    const first = profile?.firstName?.[0] || "";
    const last = profile?.lastName?.[0] || "";
    return (first + last).toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U";
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" data-testid="text-profile-title">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal and professional information
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => logout()} disabled={isLoggingOut} data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={previewUrl || profile?.profileImageUrl || ""} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-change-photo"
                >
                  <Camera className="h-3 w-3" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  data-testid="input-profile-photo"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {profile?.firstName || profile?.lastName 
                    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                    : "Set up your profile"}
                </CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Product Manager" {...field} data-testid="input-job-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acme Corp" {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Harvard Business School" {...field} data-testid="input-institution" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department / Program</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MBA Program" {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Communication Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="smsEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS Notifications</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Receive important reminders and alerts via text message
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-sms-enabled"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Always enabled - this is our primary way to reach you
                    </p>
                  </div>
                  <Switch checked={true} disabled data-testid="switch-email-enabled" />
                </div>
              </div>
            </CardContent>
          </Card>

          {(roleInfo?.isClassAdmin || roleInfo?.isSuperAdmin) && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Instructor Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Receive SMS alerts when students enroll</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifyPhone"
                  render={({ field }) => {
                    const formatPhoneNumber = (value: string) => {
                      // Strip all non-digit characters
                      const digits = value.replace(/\D/g, '');
                      
                      // If starts with 1 and has 11 digits, it's US format with country code
                      if (digits.startsWith('1') && digits.length === 11) {
                        return `+${digits}`;
                      }
                      // If exactly 10 digits, add +1 prefix
                      if (digits.length === 10) {
                        return `+1${digits}`;
                      }
                      // If starts with +, preserve it
                      if (value.startsWith('+')) {
                        return `+${digits}`;
                      }
                      return value;
                    };

                    const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                      field.onBlur();
                    };

                    return (
                      <FormItem>
                        <FormLabel>Phone for Signup Alerts</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="(515) 306-9319" 
                            {...field}
                            onBlur={handlePhoneBlur}
                            data-testid="input-notify-phone" 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Enter your 10-digit phone number (e.g., 5153069319). The +1 country code will be added automatically.
                        </p>
                      </FormItem>
                    );
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <DataRightsSection />
    </div>
  );
}

function DataRightsSection() {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: deletionStatus } = useQuery<{ request: { id: string; status: string; createdAt: string; processedAt: string | null } | null }>({
    queryKey: ["/api/user/deletion-status"],
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user/export-data", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to export data");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fwa-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Unable to export your data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/request-deletion");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/deletion-status"] });
      setShowDeleteConfirm(false);
      toast({
        title: "Deletion Request Submitted",
        description: "Your account deletion request has been submitted. An administrator will process it within 30 days.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Unable to submit deletion request.",
        variant: "destructive",
      });
    },
  });

  const hasPendingDeletion = deletionStatus?.request?.status === "pending";

  return (
    <>
      <Separator />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Your Data Rights</CardTitle>
            <p className="text-sm text-muted-foreground">Export your data or request account deletion per our privacy policy</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium" data-testid="text-export-label">Export My Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your personal data including profile, simulation decisions, and activity history as JSON
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              data-testid="button-export-data"
            >
              <Download className="mr-2 h-4 w-4" />
              {exportMutation.isPending ? "Exporting..." : "Export"}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium" data-testid="text-deletion-label">Request Account Deletion</p>
              <p className="text-sm text-muted-foreground">
                {hasPendingDeletion
                  ? "A deletion request is already pending and will be processed within 30 days."
                  : "Request permanent deletion of your account and all associated data"}
              </p>
            </div>
            {hasPendingDeletion ? (
              <Button variant="outline" disabled data-testid="button-deletion-pending">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Pending
              </Button>
            ) : showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  data-testid="button-cancel-deletion"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deletionMutation.mutate()}
                  disabled={deletionMutation.isPending}
                  data-testid="button-confirm-deletion"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletionMutation.isPending ? "Submitting..." : "Confirm"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="button-request-deletion"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
