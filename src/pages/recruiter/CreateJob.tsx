import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  location_type: z.string(),
  employment_type: z.string(),
  salary_min: z.coerce.number().optional(),
  salary_max: z.coerce.number().optional(),
  experience_level: z.string().optional(),
  status: z.enum(["draft", "open"]),
});

type JobForm = z.infer<typeof jobSchema>;

export default function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");

  const { data: company } = useQuery({
    queryKey: ["my-company", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      location_type: "onsite",
      employment_type: "full_time",
      status: "open",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobForm) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase.from("jobs").insert({
        recruiter_id: user.id,
        company_id: company?.id || null,
        title: data.title,
        description: data.description,
        requirements: data.requirements || null,
        responsibilities: data.responsibilities || null,
        location: data.location,
        location_type: data.location_type,
        employment_type: data.employment_type,
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        experience_level: data.experience_level || null,
        skills: skills.length > 0 ? skills : null,
        benefits: benefits.length > 0 ? benefits : null,
        status: data.status as "draft" | "open",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posted successfully!");
      navigate("/recruiter/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job");
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !benefits.includes(benefitInput.trim())) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBenefits(benefits.filter((b) => b !== benefit));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          {/* Back button */}
          <Button variant="ghost" className="mb-6 -ml-2" asChild>
            <Link to="/recruiter/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Post a New Job</CardTitle>
              <CardDescription>
                Fill in the details below to create a new job posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior Frontend Engineer"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA"
                        {...register("location")}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Location Type</Label>
                      <Select
                        value={watch("location_type")}
                        onValueChange={(value) => setValue("location_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Employment Type</Label>
                      <Select
                        value={watch("employment_type")}
                        onValueChange={(value) => setValue("employment_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full-time</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select
                        value={watch("experience_level") || ""}
                        onValueChange={(value) => setValue("experience_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="lead">Lead / Manager</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-4">
                  <Label>Salary Range (USD)</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Minimum"
                        {...register("salary_min")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Maximum"
                        {...register("salary_max")}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, team, and what makes this opportunity exciting..."
                    rows={6}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the qualifications and experience required..."
                    rows={4}
                    {...register("requirements")}
                  />
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Describe the day-to-day responsibilities..."
                    rows={4}
                    {...register("responsibilities")}
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                    />
                    <Button type="button" variant="outline" onClick={addBenefit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="gap-1">
                          {benefit}
                          <button
                            type="button"
                            onClick={() => removeBenefit(benefit)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setValue("status", "draft");
                      handleSubmit((data) => createJobMutation.mutate(data))();
                    }}
                    disabled={createJobMutation.isPending}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Job"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}