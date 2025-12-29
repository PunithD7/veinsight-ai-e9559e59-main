import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, Activity, Clock, TrendingUp, Scan, Pill } from 'lucide-react';
import { DashboardLayout, doctorNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel rounded-2xl p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
        {trend && (
          <p className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7 text-primary-foreground" />
      </div>
    </div>
  </motion.div>
);

const DoctorDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    completedScans: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch patient count
      const { count: patientCount } = await supabase
        .from('patient_doctor')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user?.id);

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user?.id)
        .eq('appointment_date', today);

      // Fetch recent appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('appointment_date', { ascending: true })
        .limit(5);

      // Fetch vein analyses count
      const { count: scansCount } = await supabase
        .from('vein_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user?.id);

      setStats({
        totalPatients: patientCount || 0,
        todayAppointments: todayCount || 0,
        pendingReports: 3, // Mock data
        completedScans: scansCount || 0,
      });

      setRecentAppointments(appointments || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Doctor Dashboard" navItems={doctorNavItems}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {profile?.full_name || 'Doctor'}
        </h2>
        <p className="text-muted-foreground">
          {profile?.specialty && `${profile.specialty} • `}
          Here's your practice overview for today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.totalPatients}
          trend="+12% this month"
          color="bg-gradient-medical"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={stats.todayAppointments}
          color="bg-primary"
        />
        <StatCard
          icon={FileText}
          label="Pending Reports"
          value={stats.pendingReports}
          color="bg-warning"
        />
        <StatCard
          icon={Scan}
          label="Vein Analyses"
          value={stats.completedScans}
          color="bg-success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Upcoming Appointments</CardTitle>
            <Link to="/doctor/appointments">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Patient Appointment</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.appointment_date} at {apt.appointment_time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'completed' ? 'bg-success/10 text-success' :
                      apt.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {apt.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming appointments
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/doctor/patients">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-3" />
                View Patients
              </Button>
            </Link>
            <Link to="/doctor/vein-analysis">
              <Button variant="outline" className="w-full justify-start">
                <Scan className="w-4 h-4 mr-3" />
                New Vein Analysis
              </Button>
            </Link>
            <Link to="/doctor/prescriptions">
              <Button variant="outline" className="w-full justify-start">
                <Pill className="w-4 h-4 mr-3" />
                Write Prescription
              </Button>
            </Link>
            <Link to="/diseases">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-3" />
                Disease Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
