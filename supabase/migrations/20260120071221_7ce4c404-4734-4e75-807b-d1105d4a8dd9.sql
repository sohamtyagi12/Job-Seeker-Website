-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'job_seeker');

-- Create job status enum
CREATE TYPE public.job_status AS ENUM ('draft', 'open', 'closed');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    skills TEXT[],
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create companies table (for recruiters)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    description TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    location TEXT NOT NULL,
    location_type TEXT DEFAULT 'onsite',
    employment_type TEXT DEFAULT 'full_time',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    experience_level TEXT,
    skills TEXT[],
    benefits TEXT[],
    status job_status DEFAULT 'draft',
    application_deadline TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_url TEXT,
    cover_letter TEXT,
    status application_status DEFAULT 'pending',
    recruiter_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (job_id, user_id)
);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

-- Enable full-text search on jobs
CREATE INDEX idx_jobs_search ON public.jobs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles during signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by everyone"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Recruiters can create companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Company owners can update their company"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Company owners can delete their company"
ON public.companies FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for jobs
CREATE POLICY "Open jobs are viewable by everyone"
ON public.jobs FOR SELECT
USING (status = 'open' OR auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can create jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Recruiters can update own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = recruiter_id);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
ON public.applications FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
));

CREATE POLICY "Job seekers can create applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'job_seeker'));

CREATE POLICY "Recruiters can update applications for their jobs"
ON public.applications FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
));

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view own saved jobs"
ON public.saved_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
ON public.saved_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave jobs"
ON public.saved_jobs FOR DELETE
USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();