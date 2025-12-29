import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Droplets, Activity, Wind, Stethoscope, ChevronRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

const diseaseIcons: Record<string, any> = {
  'Diabetes': Droplets,
  'Hypertension': Activity,
  'Anemia': Droplets,
  'Heart Disease': Heart,
  'Kidney Disease': Activity,
  'Asthma': Wind,
};

const diseaseColors: Record<string, string> = {
  'Diabetes': 'from-blue-500 to-cyan-500',
  'Hypertension': 'from-red-500 to-orange-500',
  'Anemia': 'from-pink-500 to-rose-500',
  'Heart Disease': 'from-red-600 to-pink-500',
  'Kidney Disease': 'from-purple-500 to-indigo-500',
  'Asthma': 'from-teal-500 to-green-500',
};

const DiseasesLibrary = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('name');

      if (error) throw error;
      setDiseases(data || []);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBackPath = () => {
    switch (role) {
      case 'doctor': return '/doctor';
      case 'nurse': return '/nurse';
      case 'patient': return '/patient';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(getBackPath())}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-display font-bold mb-4">Disease Knowledge Center</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              Comprehensive medical information about common diseases, symptoms, treatments, and lifestyle recommendations.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search diseases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Disease Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredDiseases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease, index) => {
              const Icon = diseaseIcons[disease.name] || Stethoscope;
              const colorClass = diseaseColors[disease.name] || 'from-primary to-accent';

              return (
                <motion.div
                  key={disease.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/diseases/${disease.id}`}>
                    <div className="group glass-panel rounded-2xl overflow-hidden hover:shadow-medical-lg transition-all duration-300">
                      <div className={`h-32 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
                        <Icon className="w-16 h-16 text-white/80" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-display font-bold text-foreground">
                            {disease.name}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {disease.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {disease.symptoms.slice(0, 3).map((symptom, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                            >
                              {symptom}
                            </span>
                          ))}
                          {disease.symptoms.length > 3 && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                              +{disease.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No diseases found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseasesLibrary;
