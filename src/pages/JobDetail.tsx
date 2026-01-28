import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Briefcase,
  Loader2,
  CheckCircle2,
  Calendar,
  Users,
  Globe,
  BookmarkPlus,
  Share2
} from "lucide-react";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID is required");
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            name,
            logo_url,
            website,
            description,
            industry,
            size,
            location
          )
        `)
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingApplication } = useQuery({
    queryKey: ["application", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Must be logged in to apply");
      
      const { error } = await supabase.from("applications").insert({
        job_id: id,
        user_id: user.id,
        cover_letter: coverLetter || null,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setApplyDialogOpen(false);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["application", id, user?.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const formatSalary = (min?: number | null, max?: number | null, currency = "USD") => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    if (max) return `Up to ${formatter.format(max)}`;
    return null;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          <Briefcase className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-muted-foreground">
            This job may have been removed or doesn't exist.
          </p>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse other jobs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const hasApplied = !!existingApplication;
  const canApply = user && role === "job_seeker" && !hasApplied;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Back button */}
          <Button variant="ghost" className="mb-6 -ml-2" asChild>
            <Link to="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="font-display text-2xl font-bold">{job.title}</h1>
                      <p className="text-lg text-muted-foreground">
                        {job.companies?.name || "Company"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="secondary" className="gap-1 capitalize">
                    <Briefcase className="h-3 w-3" />
                    {job.employment_type?.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 capitalize">
                    <MapPin className="h-3 w-3" />
                    {job.location_type}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                  {job.experience_level && (
                    <Badge variant="secondary" className="gap-1 capitalize">
                      <Users className="h-3 w-3" />
                      {job.experience_level}
                    </Badge>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Posted {formatDate(job.created_at)}
                  </span>
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD") && (
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD")}
                    </span>
                  )}
                  {job.application_deadline && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Apply by {formatDate(job.application_deadline)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold mb-4">About this role</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Requirements</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Responsibilities</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                {hasApplied ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="mt-4 font-display font-semibold">Application Submitted</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You applied on {formatDate(existingApplication.created_at)}
                    </p>
                    <Badge className="mt-4 capitalize">
                      {existingApplication.status}
                    </Badge>
                    <Button className="mt-6 w-full" variant="outline" asChild>
                      <Link to="/dashboard">View My Applications</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-semibold">Ready to apply?</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {user 
                        ? role === "job_seeker"
                          ? "Submit your application and take the next step in your career."
                          : "You need a job seeker account to apply."
                        : "Sign in or create an account to apply for this position."
                      }
                    </p>
                    
                    {canApply ? (
                      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="mt-6 w-full">Apply Now</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Apply for {job.title}</DialogTitle>
                            <DialogDescription>
                              at {job.companies?.name || "Company"}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Cover Letter (Optional)
                              </label>
                              <Textarea
                                placeholder="Tell the recruiter why you're a great fit for this role..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows={6}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setApplyDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => applyMutation.mutate()}
                              disabled={applyMutation.isPending}
                            >
                              {applyMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Application"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button className="mt-6 w-full" asChild>
                        <Link to={user ? "/register" : "/login"}>
                          {user ? "Create Job Seeker Account" : "Sign In to Apply"}
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Company Card */}
              {job.companies && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">About the Company</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{job.companies.name}</p>
                        {job.companies.industry && (
                          <p className="text-sm text-muted-foreground">{job.companies.industry}</p>
                        )}
                      </div>
                    </div>
                    
                    {job.companies.description && (
                      <p className="text-sm text-muted-foreground">
                        {job.companies.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.companies.size && (
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {job.companies.size}
                        </Badge>
                      )}
                      {job.companies.location && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.companies.location}
                        </Badge>
                      )}
                    </div>
                    
                    {job.companies.website && (
                      <Button variant="outline" className="w-full mt-4" asChild>
                        <a href={job.companies.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          Visit Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}