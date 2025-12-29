import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Video } from 'lucide-react';
import { DashboardLayout, doctorNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  patient_name?: string;
}

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('appointment_date', { ascending: true });

      // Fetch patient names
      if (data) {
        const patientIds = [...new Set(data.map(a => a.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setAppointments(data.map(apt => ({
          ...apt,
          patient_name: profileMap.get(apt.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Appointment Updated',
        description: `Appointment marked as ${status}`
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const todayAppointments = appointments.filter(a => 
    a.appointment_date === format(new Date(), 'yyyy-MM-dd')
  );
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.appointment_date) > new Date() && a.status === 'scheduled'
  );
  const pastAppointments = appointments.filter(a => 
    new Date(a.appointment_date) < new Date() || a.status === 'completed'
  );

  const AppointmentCard = ({ apt }: { apt: Appointment }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{apt.patient_name}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(apt.appointment_date), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {apt.appointment_time}
          </span>
        </div>
        {apt.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{apt.notes}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          apt.status === 'completed' ? 'bg-success/10 text-success' :
          apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/10 text-primary'
        }`}>
          {apt.status}
        </span>
        {apt.status === 'scheduled' && (
          <>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateAppointmentStatus(apt.id, 'completed')}>
              <Check className="w-4 h-4 text-success" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}>
              <X className="w-4 h-4 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout title="Appointments" navItems={doctorNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">Appointment Schedule</h2>
        <p className="text-muted-foreground">Manage your patient appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-panel border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center">
                <Check className="w-5 h-5 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center">
                <Video className="w-5 h-5 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : todayAppointments.length > 0 ? (
                todayAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">No appointments today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Past Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastAppointments.length > 0 ? (
                pastAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">No past appointments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
