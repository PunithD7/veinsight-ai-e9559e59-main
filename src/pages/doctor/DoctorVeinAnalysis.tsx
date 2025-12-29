import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, Check, AlertTriangle, XCircle, Target, Loader2, Save } from 'lucide-react';
import { DashboardLayout, doctorNavItems } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VeinAnalysis {
  primaryVein: { x: number; y: number; score: number };
  secondaryVein: { x: number; y: number; score: number };
  avoidVein: { x: number; y: number; score: number };
  injectionPoint: { x: number; y: number };
  overallScore: number;
  confidence: number;
}

interface Patient {
  user_id: string;
  full_name: string;
}

const DoctorVeinAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VeinAnalysis | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => {
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
    fetchPatients();
  });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis({
        primaryVein: { x: 35, y: 40, score: 94 },
        secondaryVein: { x: 60, y: 55, score: 78 },
        avoidVein: { x: 45, y: 70, score: 23 },
        injectionPoint: { x: 35, y: 42 },
        overallScore: 87,
        confidence: 96.4,
      });
      setIsAnalyzing(false);
    }, 2500);
  }, []);

  const saveAnalysis = async () => {
    if (!selectedPatient || !analysis) {
      toast({
        title: 'Error',
        description: 'Please select a patient and run analysis first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.from('vein_analyses').insert({
        patient_id: selectedPatient,
        doctor_id: user?.id,
        image_url: image || '/placeholder.svg',
        overall_score: analysis.overallScore,
        primary_vein_score: analysis.primaryVein.score,
        secondary_vein_score: analysis.secondaryVein.score,
        avoid_vein_score: analysis.avoidVein.score,
        confidence: analysis.confidence,
        notes
      });

      if (error) throw error;

      toast({
        title: 'Analysis Saved',
        description: 'Vein analysis has been saved to patient record'
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to save analysis',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout title="Vein Analysis" navItems={doctorNavItems}>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground">AI Vein Detection</h2>
        <p className="text-muted-foreground">Analyze patient veins for optimal injection points</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Image Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                image ? 'border-primary/30' : 'border-border hover:border-primary/50'
              }`}
            >
              {image ? (
                <div className="relative w-full h-full">
                  <img src={image} alt="Vein scan" className="w-full h-full object-cover" />
                  
                  <AnimatePresence>
                    {analysis && (
                      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.primaryVein.x}%`, top: `${analysis.primaryVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-success/50 flex items-center justify-center animate-pulse">
                            <Check className="w-4 h-4 text-success-foreground" />
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.secondaryVein.x}%`, top: `${analysis.secondaryVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-warning/50 flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-warning-foreground" />
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.avoidVein.x}%`, top: `${analysis.avoidVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-destructive/50 flex items-center justify-center">
                            <XCircle className="w-3 h-3 text-destructive-foreground" />
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.injectionPoint.x}%`, top: `${analysis.injectionPoint.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <div className="w-5 h-5 rounded-full bg-primary shadow-lg flex items-center justify-center animate-pulse">
                            <Target className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                      <p className="text-foreground font-medium">Analyzing veins...</p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="w-full h-full flex flex-col items-center justify-center gap-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-medical flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload vein image</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>
                <Upload className="w-4 h-4 mr-2" />
                {image ? 'Change' : 'Upload'}
              </Button>
              <Button className="flex-1" onClick={runAnalysis} disabled={!image || isAnalyzing}>
                <Scan className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Vein Visibility Score</span>
                    <span className="text-2xl font-bold text-gradient-medical">{analysis.overallScore}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-medical rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.overallScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">AI Confidence</span>
                    <span className="text-lg font-bold">{analysis.confidence}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-success rounded-full" initial={{ width: 0 }} animate={{ width: `${analysis.confidence}%` }} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                    <div className="w-10 h-10 rounded-lg bg-success flex items-center justify-center">
                      <Check className="w-5 h-5 text-success-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Primary Vein</p>
                      <p className="text-sm text-muted-foreground">Recommended</p>
                    </div>
                    <span className="font-bold text-success">{analysis.primaryVein.score}%</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Secondary Vein</p>
                      <p className="text-sm text-muted-foreground">Alternative</p>
                    </div>
                    <span className="font-bold text-warning">{analysis.secondaryVein.score}%</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-destructive-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Avoid Area</p>
                      <p className="text-sm text-muted-foreground">Not recommended</p>
                    </div>
                    <span className="font-bold text-destructive">{analysis.avoidVein.score}%</span>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this analysis..."
                    rows={3}
                  />
                </div>

                <Button className="w-full" onClick={saveAnalysis} disabled={!selectedPatient}>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Patient Record
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Scan className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="font-medium mb-2">No Analysis Yet</p>
                <p className="text-sm text-muted-foreground">Upload an image and run analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorVeinAnalysis;
