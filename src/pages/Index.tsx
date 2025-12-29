import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { VeinAnalysisPanel } from '@/components/VeinAnalysisPanel';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { MedicalDashboard } from '@/components/MedicalDashboard';
import { AppointmentBooking } from '@/components/AppointmentBooking';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'doctor': return '/doctor';
      case 'nurse': return '/nurse';
      case 'patient': return '/patient';
      default: return '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Auth Banner */}
      <div className="bg-gradient-medical py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-primary-foreground text-sm">
            Access your personalized healthcare dashboard
          </p>
          <div className="flex gap-3">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button size="sm" variant="secondary">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" variant="secondary">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-white/20 text-primary-foreground hover:bg-white/30">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <main>
        <HeroSection />
        <MedicalDashboard />
        <VeinAnalysisPanel />
        <VoiceAssistant />
        <AppointmentBooking />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
