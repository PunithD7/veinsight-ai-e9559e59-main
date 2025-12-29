import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Scan, Activity, Clock, Apple, BookOpen, Plus } from 'lucide-react';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';
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

const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalReports: 0,
    veinScans: 0,
    prescriptions: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch upcoming appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments, count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('patient_id', user?.id)
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true });

      // Fetch reports count
      const { count: reportCount } = await supabase
        .from('medical_reports')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user?.id);

      // Fetch vein scans count
      const { count: scanCount } = await supabase
        .from('vein_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user?.id);

      // Fetch prescriptions
      const { data: prescriptions, count: prescriptionCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact' })
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        upcomingAppointments: appointmentCount || 0,
        totalReports: reportCount || 0,
        veinScans: scanCount || 0,
        prescriptions: prescriptionCount || 0,
      });

      setUpcomingAppointments(appointments?.slice(0, 3) || []);
      setRecentPrescriptions(prescriptions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Patient Dashboard" navItems={patientNavItems}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-display font-bold text-foreground">
          Welcome, {profile?.full_name || 'Patient'}
        </h2>
        <p className="text-muted-foreground">
          Your health dashboard at a glance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          color="bg-primary"
        />
        <StatCard
          icon={FileText}
          label="Medical Reports"
          value={stats.totalReports}
          color="bg-accent"
        />
        <StatCard
          icon={Scan}
          label="Vein Scans"
          value={stats.veinScans}
          color="bg-success"
        />
        <StatCard
          icon={Activity}
          label="Prescriptions"
          value={stats.prescriptions}
          color="bg-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Upcoming Appointments</CardTitle>
            <Link to="/patient/appointments">
              <Button size="sm" className="medical-gradient text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Book New
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt, index) => (
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
                      <p className="font-medium">Doctor Appointment</p>
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
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Link to="/patient/appointments">
                  <Button className="medical-gradient text-primary-foreground">
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/patient/appointments">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-3" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/patient/reports">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-3" />
                Upload Reports
              </Button>
            </Link>
            <Link to="/patient/scans">
              <Button variant="outline" className="w-full justify-start">
                <Scan className="w-4 h-4 mr-3" />
                View Vein Scans
              </Button>
            </Link>
            <Link to="/patient/wellness">
              <Button variant="outline" className="w-full justify-start">
                <Apple className="w-4 h-4 mr-3" />
                Diet & Wellness
              </Button>
            </Link>
            <Link to="/diseases">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-3" />
                Disease Library
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentPrescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <p className="font-medium mb-2">{prescription.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No prescriptions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
