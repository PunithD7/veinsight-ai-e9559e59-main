import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Plus, Search, Eye, Utensils, Coffee, Sun, Moon } from 'lucide-react';
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

interface DietPlan {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  meals: any[];
  created_at: string;
  patient_name?: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

interface Meal {
  type: string;
  items: string;
  calories: string;
  notes: string;
}

const DoctorDietPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    title: '',
    description: ''
  });
  const [meals, setMeals] = useState<Meal[]>([
    { type: 'breakfast', items: '', calories: '', notes: '' },
    { type: 'lunch', items: '', calories: '', notes: '' },
    { type: 'dinner', items: '', calories: '', notes: '' }
  ]);

  useEffect(() => {
    fetchDietPlans();
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

  const fetchDietPlans = async () => {
    try {
      const { data } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const patientIds = [...new Set(data.map(d => d.patient_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', patientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setDietPlans(data.map(plan => ({
          ...plan,
          meals: Array.isArray(plan.meals) ? plan.meals : [],
          patient_name: profileMap.get(plan.patient_id) || 'Unknown Patient'
        })));
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMeal = (index: number, field: keyof Meal, value: string) => {
    const updated = [...meals];
    updated[index][field] = value;
    setMeals(updated);
  };

  const handleCreate = async () => {
    try {
      const validMeals = meals.filter(m => m.items.trim());
      const { error } = await supabase.from('diet_plans').insert([{
        patient_id: form.patient_id,
        doctor_id: user?.id || '',
        title: form.title,
        description: form.description,
        meals: validMeals as unknown as any
      }]);

      if (error) throw error;

      toast({
        title: 'Diet Plan Created',
        description: 'The diet plan has been saved'
      });
      setCreateOpen(false);
      setForm({ patient_id: '', title: '', description: '' });
      setMeals([
        { type: 'breakfast', items: '', calories: '', notes: '' },
        { type: 'lunch', items: '', calories: '', notes: '' },
        { type: 'dinner', items: '', calories: '', notes: '' }
      ]);
      fetchDietPlans();
    } catch (error) {
      console.error('Error creating diet plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create diet plan',
        variant: 'destructive'
      });
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      default: return Utensils;
    }
  };

  const filteredPlans = dietPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Diet Plans" navItems={doctorNavItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Diet Plans</h2>
          <p className="text-muted-foreground">Create personalized diet plans for patients</p>
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
                New Diet Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Diet Plan</DialogTitle>
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
                  <Label>Plan Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Diabetes Management Diet"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of the diet plan..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Meal Plan</Label>
                  <div className="space-y-3 mt-2">
                    {meals.map((meal, index) => {
                      const Icon = getMealIcon(meal.type);
                      return (
                        <div key={index} className="p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="font-medium capitalize">{meal.type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Textarea
                              placeholder="Food items..."
                              value={meal.items}
                              onChange={(e) => updateMeal(index, 'items', e.target.value)}
                              rows={2}
                              className="col-span-2"
                            />
                            <Input
                              placeholder="Calories"
                              value={meal.calories}
                              onChange={(e) => updateMeal(index, 'calories', e.target.value)}
                            />
                            <Input
                              placeholder="Notes"
                              value={meal.notes}
                              onChange={(e) => updateMeal(index, 'notes', e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={!form.patient_id || !form.title}>
                  Create Diet Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Diet Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-12">Loading...</p>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <Apple className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{plan.title}</h3>
                      <p className="text-sm text-muted-foreground">{plan.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(plan.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plan.description}</p>
                  )}

                  <div className="flex gap-2 mb-4">
                    {plan.meals.map((meal: any, i: number) => {
                      const Icon = getMealIcon(meal.type);
                      return (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs">
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{meal.type}</span>
                        </div>
                      );
                    })}
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
            <Apple className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Diet Plans</h3>
            <p className="text-muted-foreground">Create diet plans for your patients</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDietPlans;
