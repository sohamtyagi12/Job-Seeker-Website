import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Filter,
  Briefcase,
  Loader2
} from "lucide-react";

const locationTypes = [
  { value: "all", label: "All Locations" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const employmentTypes = [
  { value: "all", label: "All Types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationType, setLocationType] = useState("all");
  const [employmentType, setEmploymentType] = useState("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", searchQuery, locationType, employmentType],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (locationType !== "all") {
        query = query.eq("location_type", locationType);
      }

      if (employmentType !== "all") {
        query = query.eq("employment_type", employmentType);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return posted.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Find Your Next Opportunity</h1>
            <p className="mt-2 text-muted-foreground">
              Browse through thousands of job listings from top companies
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, skill, or keyword..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger className="w-[160px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="w-[160px]">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Listings */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group block rounded-xl border border-border bg-card p-6 card-hover"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {job.companies?.name || "Company"}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(job.created_at)}
                          </span>
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD") && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                      <Badge variant="secondary" className="capitalize">
                        {job.employment_type?.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {job.location_type}
                      </Badge>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No jobs found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters to find more opportunities.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setLocationType("all");
                  setEmploymentType("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}