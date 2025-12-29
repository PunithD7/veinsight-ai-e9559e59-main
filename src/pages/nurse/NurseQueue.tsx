import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout, nurseNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  patient_name?: string;
  doctor_name?: string;
}

const NurseQueue = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (data) {
        const patientIds = [...new Set(data.map(a => a.patient_id))];
        const doctorIds = [...new Set(data.map(a => a.doctor_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', [...patientIds, ...doctorIds]);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        setAppointments(data.map(apt => ({
          ...apt,
          patient_name: profileMap.get(apt.patient_id) || 'Unknown Patient',
          doctor_name: profileMap.get(apt.doctor_id) || 'Unknown Doctor'
        })));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Appointment Queue" navItems={nurseNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">Today's Queue</h2>
        <p className="text-muted-foreground">Manage patient appointments for {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'scheduled').length}</p>
              <p className="text-sm text-muted-foreground">Waiting</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'in_progress').length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="text-sm text-muted-foreground">Total Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading appointments...</p>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-medical flex items-center justify-center text-primary-foreground font-bold">
                      {apt.patient_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.patient_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {apt.appointment_time} • Dr. {apt.doctor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(apt.status)}
                    <Button variant="outline" size="sm">Check In</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Appointments Today</h3>
              <p className="text-muted-foreground">The queue is empty for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default NurseQueue;
