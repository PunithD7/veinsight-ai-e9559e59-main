import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, FileText, Pill, Activity, Stethoscope } from 'lucide-react';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface HistoryItem {
  id: string;
  type: 'appointment' | 'prescription' | 'report' | 'vitals';
  title: string;
  description: string;
  date: string;
  doctor_name?: string;
}

const PatientHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const historyItems: HistoryItem[] = [];

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: false })
        .limit(20);

      if (appointments) {
        const doctorIds = [...new Set(appointments.map(a => a.doctor_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', doctorIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        appointments.forEach(apt => {
          historyItems.push({
            id: apt.id,
            type: 'appointment',
            title: 'Appointment',
            description: `${apt.appointment_time} - ${apt.status}`,
            date: apt.appointment_date,
            doctor_name: profileMap.get(apt.doctor_id) || 'Doctor'
          });
        });
      }

      // Fetch prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (prescriptions) {
        const doctorIds = [...new Set(prescriptions.map(p => p.doctor_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', doctorIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        prescriptions.forEach(rx => {
          historyItems.push({
            id: rx.id,
            type: 'prescription',
            title: 'Prescription',
            description: rx.diagnosis,
            date: rx.created_at,
            doctor_name: profileMap.get(rx.doctor_id) || 'Doctor'
          });
        });
      }

      // Fetch reports
      const { data: reports } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reports) {
        reports.forEach(report => {
          historyItems.push({
            id: report.id,
            type: 'report',
            title: report.title,
            description: report.report_type.replace('_', ' '),
            date: report.created_at
          });
        });
      }

      // Fetch vitals
      const { data: vitals } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('patient_id', user?.id)
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (vitals) {
        vitals.forEach(vital => {
          const readings = [];
          if (vital.heart_rate) readings.push(`HR: ${vital.heart_rate}`);
          if (vital.blood_pressure_systolic) readings.push(`BP: ${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`);
          if (vital.temperature) readings.push(`Temp: ${vital.temperature}°F`);
          
          historyItems.push({
            id: vital.id,
            type: 'vitals',
            title: 'Vitals Recorded',
            description: readings.join(', ') || 'Vitals recorded',
            date: vital.recorded_at
          });
        });
      }

      // Sort by date
      historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(historyItems);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'prescription': return Pill;
      case 'report': return FileText;
      case 'vitals': return Activity;
      default: return History;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-primary text-primary-foreground';
      case 'prescription': return 'bg-accent text-accent-foreground';
      case 'report': return 'bg-success text-success-foreground';
      case 'vitals': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterByType = (type: string) => {
    if (type === 'all') return history;
    return history.filter(item => item.type === type);
  };

  return (
    <DashboardLayout title="Health History" navItems={patientNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">Health History</h2>
        <p className="text-muted-foreground">View your complete medical history and timeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{history.filter(h => h.type === 'appointment').length}</p>
            <p className="text-sm text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Pill className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{history.filter(h => h.type === 'prescription').length}</p>
            <p className="text-sm text-muted-foreground">Prescriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{history.filter(h => h.type === 'report').length}</p>
            <p className="text-sm text-muted-foreground">Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{history.filter(h => h.type === 'vitals').length}</p>
            <p className="text-sm text-muted-foreground">Vitals Records</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="appointment">Appointments</TabsTrigger>
              <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
              <TabsTrigger value="report">Reports</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>

            {['all', 'appointment', 'prescription', 'report', 'vitals'].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue}>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading history...</p>
                ) : filterByType(tabValue).length > 0 ? (
                  <div className="space-y-4">
                    {filterByType(tabValue).map((item, index) => {
                      const Icon = getIcon(item.type);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColor(item.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{item.title}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.doctor_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Stethoscope className="w-3 h-3 inline mr-1" />
                                {item.doctor_name}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(item.date), 'MMM d, yyyy')}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No records found</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PatientHistory;
