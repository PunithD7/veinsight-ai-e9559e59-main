import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertCircle, 
  Pill, 
  Apple, 
  XCircle, 
  Lightbulb, 
  Stethoscope,
  ChevronRight,
  Heart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  precautions: string[];
  medicines: string[];
  recommended_foods: string[];
  avoid_foods: string[];
  lifestyle_advice: string[];
}

export default function DiseaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDisease();
    }
  }, [id]);

  const fetchDisease = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDisease(data);
    } catch (error) {
      console.error('Error fetching disease:', error);
      navigate('/diseases');
    } finally {
      setLoading(false);
    }
  };

  const getBackPath = () => {
    switch (role) {
      case 'doctor': return '/doctor';
      case 'nurse': return '/nurse';
      case 'patient': return '/patient';
      default: return '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Disease not found</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'symptoms',
      title: 'Symptoms',
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      items: disease.symptoms
    },
    {
      id: 'causes',
      title: 'Causes',
      icon: Activity,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      items: disease.causes
    },
    {
      id: 'precautions',
      title: 'Precautions',
      icon: Heart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      items: disease.precautions
    },
    {
      id: 'medicines',
      title: 'Common Medicines',
      icon: Pill,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      items: disease.medicines
    },
    {
      id: 'recommended_foods',
      title: 'Recommended Foods',
      icon: Apple,
      color: 'text-success',
      bgColor: 'bg-success/10',
      items: disease.recommended_foods
    },
    {
      id: 'avoid_foods',
      title: 'Foods to Avoid',
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      items: disease.avoid_foods
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Advice',
      icon: Lightbulb,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      items: disease.lifestyle_advice
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/diseases')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold">{disease.name}</h1>
                <p className="text-primary-foreground/70">Comprehensive health information</p>
              </div>
            </div>
            
            <p className="text-primary-foreground/90 text-lg max-w-3xl mt-4">
              {disease.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="diet">Diet Plan</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Symptoms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {disease.symptoms.map((symptom, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <ChevronRight className="w-4 h-4 mt-1 text-warning flex-shrink-0" />
                        <span className="text-muted-foreground">{symptom}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Causes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-destructive" />
                    </div>
                    Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {disease.causes.map((cause, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <ChevronRight className="w-4 h-4 mt-1 text-destructive flex-shrink-0" />
                        <span className="text-muted-foreground">{cause}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Precautions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {disease.precautions.map((precaution, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <ChevronRight className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{precaution}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treatment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-accent" />
                  </div>
                  Common Medicines & Treatments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  The following medicines are commonly prescribed for {disease.name}. 
                  Always consult with a healthcare professional before taking any medication.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {disease.medicines.map((medicine, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-accent/5 border border-accent/20"
                    >
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-accent" />
                        <span className="font-medium">{medicine}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning-foreground flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> This information is for educational purposes only. 
                      Please consult your doctor for proper diagnosis and treatment.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diet">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommended Foods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Apple className="w-5 h-5 text-success" />
                    </div>
                    Recommended Foods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    These foods can help manage {disease.name} and improve overall health:
                  </p>
                  <ul className="space-y-3">
                    {disease.recommended_foods.map((food, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-success/5"
                      >
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-muted-foreground">{food}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Foods to Avoid */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    Foods to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Avoid or limit these foods to help manage {disease.name}:
                  </p>
                  <ul className="space-y-3">
                    {disease.avoid_foods.map((food, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-destructive/5"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">{food}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lifestyle">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-warning" />
                  </div>
                  Lifestyle Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Following these lifestyle recommendations can significantly help manage {disease.name} 
                  and improve your quality of life:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {disease.lifestyle_advice.map((advice, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-warning">{i + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{advice}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => navigate('/diseases')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <Button 
            className="bg-gradient-medical hover:opacity-90"
            onClick={() => navigate(getBackPath())}
          >
            Go to Dashboard
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
