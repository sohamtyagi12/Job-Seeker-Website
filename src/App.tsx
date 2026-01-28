import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import JobApplications from "./pages/recruiter/JobApplications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            
            {/* Job Seeker Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["job_seeker"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Recruiter Routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/new" element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <CreateJob />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/:id/applications" element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <JobApplications />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;