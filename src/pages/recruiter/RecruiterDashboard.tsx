import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Users, 
  Eye,
  FileText,
  TrendingUp,
  Plus,
  MapPin,
  Clock,
  Loader2,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["recruiter-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (name),
          applications (id, status)
        `)
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalApplications = jobs?.reduce((acc, job) => acc + (job.applications?.length || 0), 0) || 0;
  const activeJobs = jobs?.filter((j) => j.status === "open").length || 0;
  const draftJobs = jobs?.filter((j) => j.status === "draft").length || 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "open":
        return <Badge className="bg-success/20 text-success">Active</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      case "draft":
        return <Badge className="bg-warning/20 text-warning">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Recruiter"}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your job postings and review applications.
              </p>
            </div>
            <Button asChild>
              <Link to="/recruiter/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Jobs
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeJobs}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Drafts
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftJobs}</div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>
                Manage your jobs and view applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const applicationCount = job.applications?.length || 0;
                    const pendingCount = job.applications?.filter((a) => a.status === "pending").length || 0;
                    
                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{job.title}</h4>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Posted {formatDate(job.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center hidden sm:block">
                            <div className="text-lg font-semibold">{applicationCount}</div>
                            <div className="text-xs text-muted-foreground">Applications</div>
                          </div>
                          
                          {pendingCount > 0 && (
                            <Badge variant="secondary" className="hidden sm:flex">
                              {pendingCount} new
                            </Badge>
                          )}
                          
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/recruiter/jobs/${job.id}/applications`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/recruiter/jobs/${job.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Job
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-display font-semibold">No jobs posted yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first job posting to start receiving applications.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/recruiter/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                  </Button>
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