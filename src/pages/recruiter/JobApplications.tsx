import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Mail, 
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Users
} from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-primary/20 text-primary", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "bg-warning/20 text-warning", icon: TrendingUp },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
  accepted: { label: "Accepted", color: "bg-success/20 text-success", icon: CheckCircle2 },
};

export default function JobApplications() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID is required");
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies (name)")
        .eq("id", id)
        .eq("recruiter_id", user?.id || "")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["job-applications", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone, location, skills, experience_years")
        .in("user_id", userIds);
      
      return data.map(app => ({
        ...app,
        profile: profiles?.find(p => p.user_id === app.user_id) || null
      }));

    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application status updated!");
      queryClient.invalidateQueries({ queryKey: ["job-applications", id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isLoading = jobLoading || appsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-muted-foreground">
            This job may have been removed or you don't have access.
          </p>
          <Button asChild className="mt-6">
            <Link to="/recruiter/dashboard">Back to Dashboard</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Back button */}
          <Button variant="ghost" className="mb-6 -ml-2" asChild>
            <Link to="/recruiter/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Job Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">{job.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {job.companies?.name} • {job.location}
            </p>
          </div>

          {/* Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Applications ({applications?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    Review and manage applications for this position
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => {
                    const config = statusConfig[application.status as ApplicationStatus || "pending"];
                    const StatusIcon = config.icon;
                    const profile = application.profile;
                    
                    return (
                      <div
                        key={application.id}
                        className="p-6 rounded-lg border border-border bg-card"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            
                            <div>
                              <h4 className="font-medium">
                                {profile?.full_name || "Anonymous Applicant"}
                              </h4>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {profile?.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {profile.email}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Applied {formatDate(application.created_at)}
                                </span>
                              </div>
                              
                              {profile?.skills && profile.skills.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {profile.skills.slice(0, 5).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {profile.skills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{profile.skills.length - 5}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {application.cover_letter && (
                                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                                  <h5 className="text-sm font-medium mb-2">Cover Letter</h5>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                            <Badge className={`gap-1 ${config.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                            
                            <Select
                              value={application.status || "pending"}
                              onValueChange={(value) => 
                                updateStatusMutation.mutate({
                                  applicationId: application.id,
                                  status: value as ApplicationStatus,
                                })
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-display font-semibold">No applications yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share your job posting to start receiving applications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}