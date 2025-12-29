import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Plus, FileText, Clock } from 'lucide-react';
import { DashboardLayout, nurseNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

interface ProcedureNote {
  id: string;
  patient_id: string;
  procedure_type: string;
  notes: string;
  created_at: string;
  patient_name?: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

const procedureTypes = [
  'Blood Draw',
  'IV Insertion',
  'Medication Administration',
  'Wound Dressing',
  'Vital Signs Check',
  'Injection',
  'Catheter Care',
  'Patient Assessment',
  'Other'
];

const NurseProcedures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [procedures, setProcedures] = useState<ProcedureNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    procedure_type: '',
    notes: ''
  });

  useEffect(() => {
    fetchProcedures();
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

  const fetchProcedures = async () => {
    try {
      const { data } = await supabase
        .from('procedure_notes')
        .select('*')
        .eq('nurse_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const patientIds = [...new Set(data.map(p => p.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        setProcedures(data.map(proc => ({
          ...proc,
          patient_name: profileMap.get(proc.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase.from('procedure_notes').insert({
        patient_id: form.patient_id,
        nurse_id: user?.id || '',
        procedure_type: form.procedure_type,
        notes: form.notes
      });

      if (error) throw error;

      toast({
        title: 'Procedure Note Added',
        description: 'The procedure note has been saved'
      });
      setDialogOpen(false);
      setForm({ patient_id: '', procedure_type: '', notes: '' });
      fetchProcedures();
    } catch (error) {
      console.error('Error creating procedure note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save procedure note',
        variant: 'destructive'
      });
    }
  };

  const filteredProcedures = procedures.filter(proc =>
    proc.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proc.procedure_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProcedureColor = (type: string) => {
    const colors: Record<string, string> = {
      'Blood Draw': 'bg-destructive/10 text-destructive',
      'IV Insertion': 'bg-primary/10 text-primary',
      'Medication Administration': 'bg-accent/10 text-accent',
      'Wound Dressing': 'bg-warning/10 text-warning',
      'Vital Signs Check': 'bg-success/10 text-success',
      'Injection': 'bg-secondary/10 text-secondary-foreground'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <DashboardLayout title="Procedure History" navItems={nurseNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Procedure History</h2>
          <p className="text-muted-foreground">Track and document nursing procedures</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Procedure Note</DialogTitle>
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
                <div>
                  <Label>Procedure Type</Label>
                  <Select value={form.procedure_type} onValueChange={(v) => setForm({ ...form, procedure_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select procedure" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedureTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Describe the procedure and any observations..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!form.patient_id || !form.procedure_type || !form.notes}>
                  Save Procedure Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Procedures List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading procedures...</p>
        ) : filteredProcedures.length > 0 ? (
          filteredProcedures.map((proc, index) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{proc.patient_name}</h3>
                        <Badge className={getProcedureColor(proc.procedure_type)}>
                          {proc.procedure_type}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{proc.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(new Date(proc.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Procedure Notes</h3>
            <p className="text-muted-foreground">Start documenting procedures</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NurseProcedures;
