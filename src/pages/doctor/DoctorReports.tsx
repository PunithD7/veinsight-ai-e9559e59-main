import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Search, Eye, Download, Trash2, Image as ImageIcon } from 'lucide-react';
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

interface Report {
  id: string;
  patient_id: string;
  title: string;
  report_type: string;
  notes: string;
  file_url: string;
  created_at: string;
  patient_name?: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

const DoctorReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    patient_id: '',
    title: '',
    report_type: 'lab_report',
    notes: '',
    file_url: ''
  });

  useEffect(() => {
    fetchReports();
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

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const patientIds = [...new Set(data.map(r => r.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setReports(data.map(report => ({
          ...report,
          patient_name: profileMap.get(report.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async () => {
    try {
      const { error } = await supabase.from('medical_reports').insert({
        patient_id: reportForm.patient_id,
        doctor_id: user?.id,
        title: reportForm.title,
        report_type: reportForm.report_type,
        notes: reportForm.notes,
        file_url: reportForm.file_url || '/placeholder.svg'
      });

      if (error) throw error;

      toast({
        title: 'Report Uploaded',
        description: 'The report has been uploaded successfully'
      });
      setUploadOpen(false);
      setReportForm({ patient_id: '', title: '', report_type: 'lab_report', notes: '', file_url: '' });
      fetchReports();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive'
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'imaging': return ImageIcon;
      default: return FileText;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'lab_report': return 'bg-primary text-primary-foreground';
      case 'imaging': return 'bg-accent text-accent-foreground';
      case 'prescription': return 'bg-success text-success-foreground';
      case 'diagnosis': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Reports & Images" navItems={doctorNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Medical Reports</h2>
          <p className="text-muted-foreground">Upload and manage patient reports</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Patient</Label>
                  <Select
                    value={reportForm.patient_id}
                    onValueChange={(v) => setReportForm({ ...reportForm, patient_id: v })}
                  >
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
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>File URL</Label>
                  <Input
                    value={reportForm.file_url}
                    onChange={(e) => setReportForm({ ...reportForm, file_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button onClick={handleUploadReport} className="w-full" disabled={!reportForm.patient_id || !reportForm.title}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading reports...</p>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report, index) => {
            const Icon = getReportTypeIcon(report.report_type);
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getReportTypeColor(report.report_type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.patient_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {report.notes && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report.notes}</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
            <p className="text-muted-foreground">Upload reports for your patients</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorReports;
