import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Eye, Calendar, Info, Activity } from 'lucide-react';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface VeinScan {
  id: string;
  image_url: string;
  overall_score: number | null;
  primary_vein_score: number | null;
  secondary_vein_score: number | null;
  avoid_vein_score: number | null;
  confidence: number | null;
  notes: string | null;
  created_at: string;
  doctor_name?: string;
}

const PatientScans = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<VeinScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      const { data } = await supabase
        .from('vein_analyses')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const doctorIds = data.filter(s => s.doctor_id).map(s => s.doctor_id);
        let profileMap = new Map();
        
        if (doctorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', doctorIds);
          profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        }

        setScans(data.map(scan => ({
          ...scan,
          doctor_name: scan.doctor_id ? profileMap.get(scan.doctor_id) || 'Doctor' : 'Self Scan'
        })));
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'N/A';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <DashboardLayout title="My Vein Scans" navItems={patientNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">My Vein Scans</h2>
        <p className="text-muted-foreground">View your vein analysis history and results</p>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Understanding Your Vein Scans</h4>
              <p className="text-sm text-muted-foreground">
                Vein scans help medical professionals identify the best injection sites. 
                Primary veins (green) are optimal, secondary veins (yellow) are alternatives, 
                and avoid areas (red) should not be used for injections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading scans...</p>
        ) : scans.length > 0 ? (
          scans.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={scan.image_url || '/placeholder.svg'}
                    alt="Vein scan"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {scan.confidence && (
                    <Badge className="absolute top-2 right-2 bg-background/80">
                      {Math.round(scan.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(scan.created_at), 'MMM d, yyyy')}
                    </div>
                    <span className="text-xs text-muted-foreground">{scan.doctor_name}</span>
                  </div>

                  {scan.overall_score !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(scan.overall_score)}`}>
                          {scan.overall_score}% - {getScoreLabel(scan.overall_score)}
                        </span>
                      </div>
                      <Progress value={scan.overall_score} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded bg-success/10">
                      <p className="text-xs text-muted-foreground">Primary</p>
                      <p className="font-bold text-success">{scan.primary_vein_score || '-'}%</p>
                    </div>
                    <div className="text-center p-2 rounded bg-warning/10">
                      <p className="text-xs text-muted-foreground">Secondary</p>
                      <p className="font-bold text-warning">{scan.secondary_vein_score || '-'}%</p>
                    </div>
                    <div className="text-center p-2 rounded bg-destructive/10">
                      <p className="text-xs text-muted-foreground">Avoid</p>
                      <p className="font-bold text-destructive">{scan.avoid_vein_score || '-'}%</p>
                    </div>
                  </div>

                  {scan.notes && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scan.notes}</p>
                  )}

                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-3 h-3 mr-1" />
                    View Full Analysis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Scan className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vein Scans Yet</h3>
            <p className="text-muted-foreground">
              Your vein analysis results will appear here after your next appointment
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientScans;
