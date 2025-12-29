import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'doctor' | 'nurse' | 'patient';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard
        switch (role) {
          case 'doctor':
            navigate('/doctor');
            break;
          case 'nurse':
            navigate('/nurse');
            break;
          case 'patient':
            navigate('/patient');
            break;
        }
      }
    }
  }, [user, role, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
};
