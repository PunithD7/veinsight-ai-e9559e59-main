import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Eye, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Report {
  id: string;
  title: string;
  report_type: string;
  notes: string | null;
  file_url: string;
  created_at: string;
  doctor_id: string | null;
  doctor_name?: string;
}

const PatientReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    report_type: 'lab_report',
    notes: '',
    file_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const doctorIds = data.filter(r => r.doctor_id).map(r => r.doctor_id);
        let profileMap = new Map();
        
        if (doctorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', doctorIds);
          profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        }

        setReports(data.map(report => ({
          ...report,
          doctor_name: report.doctor_id ? profileMap.get(report.doctor_id) || 'Doctor' : 'Self Uploaded'
        })));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const { error } = await supabase.from('medical_reports').insert({
        patient_id: user?.id || '',
        title: form.title,
        report_type: form.report_type,
        notes: form.notes || null,
        file_url: form.file_url || '/placeholder.svg'
      });

      if (error) throw error;

      toast({
        title: 'Report Uploaded',
        description: 'Your report has been saved successfully'
      });
      setUploadOpen(false);
      setForm({ title: '', report_type: 'lab_report', notes: '', file_url: '' });
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

  const handleDelete = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('medical_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report Deleted',
        description: 'The report has been removed'
      });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive'
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    return type === 'imaging' ? ImageIcon : FileText;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'lab_report': 'bg-primary text-primary-foreground',
      'imaging': 'bg-accent text-accent-foreground',
      'prescription': 'bg-success text-success-foreground',
      'diagnosis': 'bg-warning text-warning-foreground'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <DashboardLayout title="My Reports" navItems={patientNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">My Medical Reports</h2>
          <p className="text-muted-foreground">View and manage your medical reports and documents</p>
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
              <DialogTitle>Upload Medical Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Blood Test Results - January 2025"
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={form.report_type} onValueChange={(v) => setForm({ ...form, report_type: v })}>
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
                <Label>Notes (optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes about this report..."
                  rows={2}
                />
              </div>
              <div>
                <Label>File URL</Label>
                <Input
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleUpload} className="w-full" disabled={!form.title}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading reports...</p>
        ) : reports.length > 0 ? (
          reports.map((report, index) => {
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
                        <p className="text-sm text-muted-foreground capitalize">{report.report_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.created_at), 'MMM d, yyyy')} • {report.doctor_name}
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the report.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(report.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-4">Upload your medical reports or wait for your doctor to share them</p>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Report
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientReports;
