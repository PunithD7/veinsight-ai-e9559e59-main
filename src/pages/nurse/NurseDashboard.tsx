import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Syringe, HeartPulse, Activity, AlertCircle } from 'lucide-react';
import { DashboardLayout, nurseNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel rounded-2xl p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7 text-primary-foreground" />
      </div>
    </div>
  </motion.div>
);

const NurseDashboard = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    queueSize: 0,
    completedToday: 0,
    assignedPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      // Fetch assigned patients
      const { count: patientCount } = await supabase
        .from('nurse_patient')
        .select('*', { count: 'exact', head: true })
        .eq('nurse_id', user?.id);

      const queueSize = appointments?.filter(a => a.status === 'scheduled').length || 0;
      const completedToday = appointments?.filter(a => a.status === 'completed').length || 0;

      setAppointments(appointments || []);
      setStats({
        queueSize,
        completedToday,
        assignedPatients: patientCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Nurse Dashboard" navItems={nurseNavItems}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-display font-bold text-foreground">
          Welcome, {profile?.full_name || 'Nurse'}
        </h2>
        <p className="text-muted-foreground">
          Here's your shift overview for today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Clock}
          label="Queue Size"
          value={stats.queueSize}
          color="bg-primary"
        />
        <StatCard
          icon={Activity}
          label="Completed Today"
          value={stats.completedToday}
          color="bg-success"
        />
        <StatCard
          icon={Users}
          label="Assigned Patients"
          value={stats.assignedPatients}
          color="bg-accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Today's Appointment Queue</CardTitle>
            <Link to="/nurse/queue">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      apt.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      <Clock className={`w-5 h-5 ${
                        apt.status === 'completed' ? 'text-success' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Patient Appointment</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.appointment_time}
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
                No appointments scheduled for today
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
            <Link to="/nurse/injection">
              <Button variant="outline" className="w-full justify-start">
                <Syringe className="w-4 h-4 mr-3" />
                Injection Assistance
              </Button>
            </Link>
            <Link to="/nurse/vitals">
              <Button variant="outline" className="w-full justify-start">
                <HeartPulse className="w-4 h-4 mr-3" />
                Record Vitals
              </Button>
            </Link>
            <Link to="/nurse/procedures">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-3" />
                Procedure Notes
              </Button>
            </Link>
            <Link to="/diseases">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-3" />
                Disease Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
