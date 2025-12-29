import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Search, Eye, Trash2 } from 'lucide-react';
import { DashboardLayout, doctorNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Prescription {
  id: string;
  patient_id: string;
  diagnosis: string;
  medications: any[];
  notes: string;
  created_at: string;
  patient_name?: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    notes: ''
  });
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    const { data: relations } = await supabase
      .from('patient_doctor')
      .select('patient_id')
      .eq('doctor_id', user?.id);

    if (relations) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', relations.map(r => r.patient_id));
      setPatients(profiles || []);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const patientIds = [...new Set(data.map(p => p.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setPrescriptions(data.map(rx => ({
          ...rx,
          medications: Array.isArray(rx.medications) ? rx.medications : [],
          patient_name: profileMap.get(rx.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    try {
      const validMeds = medications.filter(m => m.name.trim());
      const { error } = await supabase.from('prescriptions').insert([{
        patient_id: form.patient_id,
        doctor_id: user?.id || '',
        diagnosis: form.diagnosis,
        medications: validMeds as unknown as any,
        notes: form.notes
      }]);

      if (error) throw error;

      toast({
        title: 'Prescription Created',
        description: 'The prescription has been saved'
      });
      setCreateOpen(false);
      setForm({ patient_id: '', diagnosis: '', notes: '' });
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive'
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Prescriptions" navItems={doctorNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Prescriptions</h2>
          <p className="text-muted-foreground">Create and manage patient prescriptions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Prescription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Patient</Label>
                  <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Diagnosis</Label>
                  <Textarea
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="Patient diagnosis..."
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Medications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {medications.map((med, index) => (
                      <div key={index} className="p-3 rounded-lg border bg-muted/30">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Input
                            placeholder="Medicine name"
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Dosage (e.g., 500mg)"
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Frequency (e.g., twice daily)"
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Duration (e.g., 7 days)"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            />
                            {medications.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMedication(index)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional instructions..."
                    rows={2}
                  />
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={!form.patient_id || !form.diagnosis}>
                  Create Prescription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading...</p>
        ) : filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((rx, index) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{rx.patient_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{rx.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(rx.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    {rx.medications.slice(0, 3).map((med: any, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        • {med.name} - {med.dosage}
                      </p>
                    ))}
                    {rx.medications.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{rx.medications.length - 3} more</p>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Pill className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Prescriptions</h3>
            <p className="text-muted-foreground">Create prescriptions for your patients</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
