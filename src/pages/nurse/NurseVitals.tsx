import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Search, Plus, Thermometer, Activity, Droplet, Scale } from 'lucide-react';
import { DashboardLayout, nurseNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Vital {
  id: string;
  patient_id: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  notes: string | null;
  recorded_at: string;
  patient_name?: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

const NurseVitals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    oxygen_saturation: '',
    weight: '',
    notes: ''
  });

  useEffect(() => {
    fetchVitals();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data: assignments } = await supabase
      .from('nurse_patient')
      .select('patient_id')
      .eq('nurse_id', user?.id);

    if (assignments && assignments.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', assignments.map(a => a.patient_id));
      setPatients(profiles || []);
    }
  };

  const fetchVitals = async () => {
    try {
      const { data } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('recorded_by', user?.id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (data) {
        const patientIds = [...new Set(data.map(v => v.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        setVitals(data.map(vital => ({
          ...vital,
          patient_name: profileMap.get(vital.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = async () => {
    try {
      const { error } = await supabase.from('patient_vitals').insert({
        patient_id: form.patient_id,
        recorded_by: user?.id || '',
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
        blood_pressure_systolic: form.blood_pressure_systolic ? parseInt(form.blood_pressure_systolic) : null,
        blood_pressure_diastolic: form.blood_pressure_diastolic ? parseInt(form.blood_pressure_diastolic) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        oxygen_saturation: form.oxygen_saturation ? parseInt(form.oxygen_saturation) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        notes: form.notes || null
      });

      if (error) throw error;

      toast({
        title: 'Vitals Recorded',
        description: 'Patient vitals have been saved successfully'
      });
      setDialogOpen(false);
      setForm({
        patient_id: '',
        heart_rate: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        temperature: '',
        oxygen_saturation: '',
        weight: '',
        notes: ''
      });
      fetchVitals();
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast({
        title: 'Error',
        description: 'Failed to record vitals',
        variant: 'destructive'
      });
    }
  };

  const filteredVitals = vitals.filter(vital =>
    vital.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Patient Vitals" navItems={nurseNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Patient Vitals</h2>
          <p className="text-muted-foreground">Record and monitor patient vital signs</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Vitals
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Patient Vitals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Patient</Label>
                  <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length > 0 ? (
                        patients.map(p => (
                          <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No assigned patients</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Heart Rate (bpm)</Label>
                    <Input
                      type="number"
                      value={form.heart_rate}
                      onChange={(e) => setForm({ ...form, heart_rate: e.target.value })}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <Label>Temperature (°F)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                      placeholder="98.6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>BP Systolic (mmHg)</Label>
                    <Input
                      type="number"
                      value={form.blood_pressure_systolic}
                      onChange={(e) => setForm({ ...form, blood_pressure_systolic: e.target.value })}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label>BP Diastolic (mmHg)</Label>
                    <Input
                      type="number"
                      value={form.blood_pressure_diastolic}
                      onChange={(e) => setForm({ ...form, blood_pressure_diastolic: e.target.value })}
                      placeholder="80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Oxygen Saturation (%)</Label>
                    <Input
                      type="number"
                      value={form.oxygen_saturation}
                      onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })}
                      placeholder="98"
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional observations..."
                    rows={2}
                  />
                </div>

                <Button onClick={handleRecord} className="w-full" disabled={!form.patient_id}>
                  Save Vitals
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vitals History */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading vitals...</p>
        ) : filteredVitals.length > 0 ? (
          filteredVitals.map((vital, index) => (
            <motion.div
              key={vital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{vital.patient_name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(vital.recorded_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {vital.heart_rate && (
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-destructive" />
                        <span className="text-sm">{vital.heart_rate} bpm</span>
                      </div>
                    )}
                    {vital.blood_pressure_systolic && (
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm">{vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}</span>
                      </div>
                    )}
                    {vital.temperature && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-warning" />
                        <span className="text-sm">{vital.temperature}°F</span>
                      </div>
                    )}
                    {vital.oxygen_saturation && (
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-accent" />
                        <span className="text-sm">{vital.oxygen_saturation}%</span>
                      </div>
                    )}
                    {vital.weight && (
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{vital.weight} kg</span>
                      </div>
                    )}
                  </div>
                  {vital.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{vital.notes}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <HeartPulse className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vitals Recorded</h3>
            <p className="text-muted-foreground">Start recording patient vitals</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NurseVitals;
