import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, FileText, Pill, Scan, Calendar, Upload, Eye } from 'lucide-react';
import { DashboardLayout, doctorNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

const DoctorPatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    report_type: 'lab_report',
    notes: '',
    file_url: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      const { data: patientRelations } = await supabase
        .from('patient_doctor')
        .select('patient_id')
        .eq('doctor_id', user?.id);

      if (patientRelations && patientRelations.length > 0) {
        const patientIds = patientRelations.map(pr => pr.patient_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', patientIds);
        
        setPatients(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async () => {
    if (!selectedPatient) return;
    
    try {
      const { error } = await supabase.from('medical_reports').insert({
        patient_id: selectedPatient.user_id,
        doctor_id: user?.id,
        title: reportForm.title,
        report_type: reportForm.report_type,
        notes: reportForm.notes,
        file_url: reportForm.file_url || '/placeholder.svg'
      });

      if (error) throw error;

      toast({
        title: 'Report Uploaded',
        description: `Report has been uploaded for ${selectedPatient.full_name}`
      });
      setReportDialogOpen(false);
      setReportForm({ title: '', report_type: 'lab_report', notes: '', file_url: '' });
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive'
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="My Patients" navItems={doctorNavItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Patient Management</h2>
          <p className="text-muted-foreground">View and manage your patients</p>
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
        </div>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Reports Uploaded</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading patients...</p>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-medical flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {patient.full_name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{patient.full_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Dialog open={reportDialogOpen && selectedPatient?.id === patient.id} onOpenChange={(open) => {
                      setReportDialogOpen(open);
                      if (open) setSelectedPatient(patient);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedPatient(patient)}>
                          <Upload className="w-3 h-3 mr-1" />
                          Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Report for {patient.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Report Title</Label>
                            <Input
                              value={reportForm.title}
                              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                              placeholder="e.g., Blood Test Results"
                            />
                          </div>
                          <div>
                            <Label>Report Type</Label>
                            <Select
                              value={reportForm.report_type}
                              onValueChange={(v) => setReportForm({ ...reportForm, report_type: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lab_report">Lab Report</SelectItem>
                                <SelectItem value="imaging">Imaging/X-Ray</SelectItem>
                                <SelectItem value="prescription">Prescription</SelectItem>
                                <SelectItem value="diagnosis">Diagnosis Report</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={reportForm.notes}
                              onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                              placeholder="Additional notes about the report..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>File URL (optional)</Label>
                            <Input
                              value={reportForm.file_url}
                              onChange={(e) => setReportForm({ ...reportForm, file_url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <Button onClick={handleUploadReport} className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Report
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="w-full">
                      <Pill className="w-3 h-3 mr-1" />
                      Rx
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Scan className="w-3 h-3 mr-1" />
                      Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No patients match your search.' : 'You have no patients yet.'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
