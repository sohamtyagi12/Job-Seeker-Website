import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Loader2,
  ArrowRight
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-primary/20 text-primary", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "bg-warning/20 text-warning", icon: TrendingUp },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
  accepted: { label: "Accepted", color: "bg-success/20 text-success", icon: CheckCircle2 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            employment_type,
            companies (
              name
            )
          )
        `)
        .eq("user_id", user.id)
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

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "pending").length || 0,
    reviewed: applications?.filter((a) => a.status === "reviewed").length || 0,
    shortlisted: applications?.filter((a) => a.status === "shortlisted").length || 0,
    accepted: applications?.filter((a) => a.status === "accepted").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your job applications and manage your career journey.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shortlisted
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.shortlisted}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accepted
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accepted}</div>
              </CardContent>
            </Card>
          </div>

          {/* Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>
                    Track the status of all your job applications
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link to="/jobs">
                    Find Jobs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
                </TabsList>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="all">
                      <ApplicationsList applications={applications || []} formatDate={formatDate} />
                    </TabsContent>
                    <TabsContent value="pending">
                      <ApplicationsList 
                        applications={(applications || []).filter((a) => a.status === "pending")} 
                        formatDate={formatDate}
                      />
                    </TabsContent>
                    <TabsContent value="shortlisted">
                      <ApplicationsList 
                        applications={(applications || []).filter((a) => a.status === "shortlisted")} 
                        formatDate={formatDate}
                      />
                    </TabsContent>
                    <TabsContent value="accepted">
                      <ApplicationsList 
                        applications={(applications || []).filter((a) => a.status === "accepted")} 
                        formatDate={formatDate}
                      />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

interface Application {
  id: string;
  status: string | null;
  created_at: string;
  cover_letter: string | null;
  jobs: {
    id: string;
    title: string;
    location: string;
    employment_type: string | null;
    companies: {
      name: string;
    } | null;
  } | null;
}

function ApplicationsList({ 
  applications, 
  formatDate 
}: { 
  applications: Application[];
  formatDate: (date: string) => string;
}) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 font-display font-semibold">No applications yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start applying to jobs to see your applications here.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const config = statusConfig[application.status || "pending"];
        const StatusIcon = config.icon;
        
        return (
          <Link
            key={application.id}
            to={`/jobs/${application.jobs?.id}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">
                {application.jobs?.title || "Unknown Job"}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {application.jobs?.companies?.name || "Company"}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {application.jobs?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Applied {formatDate(application.created_at)}
                </span>
              </div>
            </div>
            
            <Badge className={`shrink-0 gap-1 ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}