import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorVeinAnalysis from "./pages/doctor/DoctorVeinAnalysis";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorDietPlans from "./pages/doctor/DoctorDietPlans";

// Nurse pages
import NurseDashboard from "./pages/nurse/NurseDashboard";
import NurseQueue from "./pages/nurse/NurseQueue";
import NurseInjection from "./pages/nurse/NurseInjection";
import NurseVitals from "./pages/nurse/NurseVitals";
import NurseProcedures from "./pages/nurse/NurseProcedures";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientReports from "./pages/patient/PatientReports";
import PatientScans from "./pages/patient/PatientScans";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientWellness from "./pages/patient/PatientWellness";

// Disease pages
import DiseasesLibrary from "./pages/diseases/DiseasesLibrary";
import DiseaseDetail from "./pages/diseases/DiseaseDetail";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/diseases" element={<DiseasesLibrary />} />
            <Route path="/diseases/:id" element={<DiseaseDetail />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/reports" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorReports /></ProtectedRoute>} />
            <Route path="/doctor/vein-analysis" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorVeinAnalysis /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />
            <Route path="/doctor/diet-plans" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDietPlans /></ProtectedRoute>} />
            
            {/* Nurse Routes */}
            <Route path="/nurse" element={<ProtectedRoute allowedRoles={['nurse']}><NurseDashboard /></ProtectedRoute>} />
            <Route path="/nurse/queue" element={<ProtectedRoute allowedRoles={['nurse']}><NurseQueue /></ProtectedRoute>} />
            <Route path="/nurse/injection" element={<ProtectedRoute allowedRoles={['nurse']}><NurseInjection /></ProtectedRoute>} />
            <Route path="/nurse/vitals" element={<ProtectedRoute allowedRoles={['nurse']}><NurseVitals /></ProtectedRoute>} />
            <Route path="/nurse/procedures" element={<ProtectedRoute allowedRoles={['nurse']}><NurseProcedures /></ProtectedRoute>} />
            
            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['patient']}><PatientReports /></ProtectedRoute>} />
            <Route path="/patient/scans" element={<ProtectedRoute allowedRoles={['patient']}><PatientScans /></ProtectedRoute>} />
            <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientHistory /></ProtectedRoute>} />
            <Route path="/patient/wellness" element={<ProtectedRoute allowedRoles={['patient']}><PatientWellness /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
