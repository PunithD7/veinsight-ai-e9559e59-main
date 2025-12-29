import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Activity,
  Pill,
  Apple,
  LogOut,
  Menu,
  X,
  Home,
  Syringe,
  Clock,
  HeartPulse,
  BookOpen,
  History,
  Scan,
  User,
  Settings,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

export const DashboardLayout = ({ children, title, navItems }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, role } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleColor = () => {
    switch (role) {
      case 'doctor': return 'from-primary to-accent';
      case 'nurse': return 'from-accent to-success';
      case 'patient': return 'from-secondary to-primary';
      default: return 'from-primary to-accent';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', getRoleColor())}>
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-display font-bold text-foreground">VeinSight</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-medical'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={cn('flex items-center gap-3 mb-4', !sidebarOpen && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-gradient-medical flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn('w-full justify-start text-muted-foreground hover:text-destructive', !sidebarOpen && 'justify-center')}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', getRoleColor())}>
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-display font-bold">VeinSight</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="lg:hidden fixed inset-0 z-40 bg-background pt-16"
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-destructive mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20',
          'pt-16 lg:pt-0'
        )}
      >
        {/* Page Header */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// Navigation items for each role
export const doctorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/doctor', icon: Home },
  { label: 'My Patients', href: '/doctor/patients', icon: Users },
  { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { label: 'Reports & Images', href: '/doctor/reports', icon: FileText },
  { label: 'Vein Analysis', href: '/doctor/vein-analysis', icon: Scan },
  { label: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
  { label: 'Diet Plans', href: '/doctor/diet-plans', icon: Apple },
  { label: 'Disease Library', href: '/diseases', icon: BookOpen },
];

export const nurseNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/nurse', icon: Home },
  { label: 'Appointment Queue', href: '/nurse/queue', icon: Clock },
  { label: 'Injection Assistance', href: '/nurse/injection', icon: Syringe },
  { label: 'Patient Vitals', href: '/nurse/vitals', icon: HeartPulse },
  { label: 'Procedure History', href: '/nurse/procedures', icon: History },
  { label: 'Disease Library', href: '/diseases', icon: BookOpen },
];

export const patientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient', icon: Home },
  { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
  { label: 'My Reports', href: '/patient/reports', icon: FileText },
  { label: 'My Vein Scans', href: '/patient/scans', icon: Scan },
  { label: 'Health History', href: '/patient/history', icon: History },
  { label: 'Diet & Wellness', href: '/patient/wellness', icon: Apple },
  { label: 'Disease Library', href: '/diseases', icon: BookOpen },
];
