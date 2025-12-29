import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Stethoscope, UserRound, HeartPulse, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'doctor' | 'nurse' | 'patient';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('patient');
  const [specialty, setSpecialty] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && role) {
      redirectToDashboard(role);
    }
  }, [user, role, loading]);

  const redirectToDashboard = (userRole: AppRole) => {
    switch (userRole) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message || 'Invalid email or password',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in',
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole, specialty);
        if (error) {
          toast({
            title: 'Signup Failed',
            description: error.message || 'Could not create account',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account',
          });
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Manage patients and appointments' },
    { id: 'nurse', label: 'Nurse', icon: HeartPulse, description: 'Assist with patient care' },
    { id: 'patient', label: 'Patient', icon: UserRound, description: 'Book appointments and view records' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center shadow-glow">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-gradient-medical">VeinSight AI</span>
          </div>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back to your healthcare portal' : 'Create your healthcare account'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection (Signup only) */}
            {!isLogin && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">I am a</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id as AppRole)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/10 shadow-medical'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 mx-auto mb-2 ${
                        selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className={`text-xs font-medium ${
                        selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                      }`}>{role.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Name (Signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Specialty (Doctor only) */}
            {!isLogin && selectedRole === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  type="text"
                  placeholder="e.g., Cardiology, General Practice"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full medical-gradient text-primary-foreground shadow-medical"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
