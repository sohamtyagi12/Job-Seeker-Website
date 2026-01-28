import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Search, 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Building2,
  MapPin,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featuredJobs = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$150k - $200k",
    type: "Full-time",
    tags: ["React", "TypeScript", "Node.js"],
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignStudio",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    tags: ["Figma", "UI/UX", "Design Systems"],
    posted: "1 day ago",
  },
  {
    id: "3",
    title: "Backend Developer",
    company: "DataFlow Inc",
    location: "New York, NY",
    salary: "$130k - $180k",
    type: "Full-time",
    tags: ["Python", "PostgreSQL", "AWS"],
    posted: "3 days ago",
  },
];

const stats = [
  { label: "Active Jobs", value: "10,000+", icon: Briefcase },
  { label: "Companies Hiring", value: "2,500+", icon: Building2 },
  { label: "Job Seekers", value: "100,000+", icon: Users },
  { label: "Successful Hires", value: "25,000+", icon: TrendingUp },
];

const benefits = [
  "Track all your applications in one place",
  "Get notified when your status changes",
  "Never miss a deadline or follow-up",
  "Analyze your job search progress",
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30 py-20 lg:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium animate-fade-in">
                🚀 Over 10,000+ jobs waiting for you
              </Badge>
              
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up">
                Find Your Dream Job &{" "}
                <span className="gradient-text">Track Every Step</span>
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-slide-up stagger-1">
                The modern job application tracker that helps you organize your search, 
                stay on top of applications, and land your next opportunity.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-glow" asChild>
                  <Link to="/jobs">
                    <Search className="h-5 w-5" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-display text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="py-20">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="font-display text-3xl font-bold">Featured Jobs</h2>
                <p className="mt-2 text-muted-foreground">
                  Discover opportunities at top companies
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/jobs">
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job, index) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-6 card-hover animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{job.company}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border">
                    <span className="font-display font-semibold text-primary">
                      {job.salary}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Why JobTracker Pro?
                </Badge>
                <h2 className="font-display text-3xl font-bold lg:text-4xl">
                  Everything you need to{" "}
                  <span className="gradient-text">land your dream job</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Stop juggling spreadsheets and email threads. Our platform gives you 
                  the tools to organize, track, and optimize your job search.
                </p>
                
                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit, index) => (
                    <li 
                      key={benefit} 
                      className="flex items-center gap-3 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10">
                  <Button size="lg" className="gap-2" asChild>
                    <Link to="/register">
                      Start Tracking Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 lg:p-12">
                  <div className="h-full rounded-xl bg-card shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/50">
                      <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-destructive" />
                        <div className="h-3 w-3 rounded-full bg-warning" />
                        <div className="h-3 w-3 rounded-full bg-success" />
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {["Applied", "Interview", "Offer"].map((status, i) => (
                        <div key={status} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                          <div className={`h-3 w-3 rounded-full ${
                            i === 0 ? "bg-primary" : i === 1 ? "bg-warning" : "bg-success"
                          }`} />
                          <div className="flex-1">
                            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                            <div className="mt-2 h-3 w-20 rounded bg-muted/50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg border border-border animate-float">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 lg:p-16">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
              
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                  Ready to accelerate your career?
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  Join thousands of job seekers who are tracking their applications 
                  and landing their dream jobs faster.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="w-full sm:w-auto gap-2 shadow-lg"
                    asChild
                  >
                    <Link to="/register">
                      Create Free Account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    asChild
                  >
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}