import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, Utensils, Clock, ChevronRight, Leaf, Droplet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, patientNavItems } from '@/components/layouts/DashboardLayout';

interface DietPlan {
  id: string;
  title: string;
  description: string | null;
  meals: any;
  created_at: string;
}

const generalDietTips = [
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily. Water helps maintain body functions and keeps your skin healthy.',
    icon: Droplet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Eat More Vegetables',
    description: 'Fill half your plate with vegetables. They provide essential vitamins, minerals, and fiber.',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'Regular Meal Times',
    description: 'Eating at consistent times helps regulate blood sugar and metabolism.',
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    title: 'Balanced Nutrition',
    description: 'Include proteins, carbs, and healthy fats in every meal for sustained energy.',
    icon: Utensils,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

const sampleMealPlans = {
  breakfast: [
    { name: 'Oatmeal with fruits', calories: 300, protein: '8g', time: '7:00 AM' },
    { name: 'Greek yogurt parfait', calories: 250, protein: '15g', time: '7:30 AM' },
    { name: 'Whole grain toast with eggs', calories: 350, protein: '18g', time: '8:00 AM' }
  ],
  lunch: [
    { name: 'Grilled chicken salad', calories: 450, protein: '35g', time: '12:00 PM' },
    { name: 'Quinoa bowl with vegetables', calories: 400, protein: '12g', time: '12:30 PM' },
    { name: 'Whole wheat sandwich', calories: 380, protein: '22g', time: '1:00 PM' }
  ],
  dinner: [
    { name: 'Baked salmon with veggies', calories: 500, protein: '40g', time: '7:00 PM' },
    { name: 'Lean beef stir-fry', calories: 450, protein: '35g', time: '7:30 PM' },
    { name: 'Vegetable curry with rice', calories: 420, protein: '15g', time: '8:00 PM' }
  ],
  snacks: [
    { name: 'Mixed nuts', calories: 150, protein: '5g', time: '10:00 AM' },
    { name: 'Fresh fruit', calories: 100, protein: '1g', time: '3:00 PM' },
    { name: 'Hummus with vegetables', calories: 120, protein: '4g', time: '5:00 PM' }
  ]
};

export default function PatientWellness() {
  const { user } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWellnessData();
    }
  }, [user]);

  const fetchWellnessData = async () => {
    try {
      const [dietResponse, recResponse] = await Promise.all([
        supabase
          .from('diet_plans')
          .select('*')
          .eq('patient_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('health_recommendations')
          .select('*')
          .eq('patient_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      setDietPlans(dietResponse.data || []);
      setRecommendations(recResponse.data || []);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Diet & Wellness" navItems={patientNavItems}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-foreground">Diet & Wellness</h2>
          <p className="text-muted-foreground">Your personalized nutrition guide and health recommendations</p>
        </motion.div>

        {/* Diet Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {generalDietTips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-medical transition-shadow">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl ${tip.bgColor} flex items-center justify-center mb-4`}>
                    <tip.icon className={`w-6 h-6 ${tip.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="meals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="meals">Sample Meal Plans</TabsTrigger>
            <TabsTrigger value="personalized">My Diet Plans</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="meals">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(sampleMealPlans).map(([mealType, meals]) => (
                <Card key={mealType}>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      <Apple className="w-5 h-5 text-primary" />
                      {mealType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {meals.map((meal, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{meal.name}</h4>
                            <span className="text-xs text-muted-foreground">{meal.time}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{meal.calories} kcal</span>
                            <span>•</span>
                            <span>Protein: {meal.protein}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personalized">
            {dietPlans.length > 0 ? (
              <div className="space-y-6">
                {dietPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.title}</CardTitle>
                      {plan.description && (
                        <p className="text-muted-foreground">{plan.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Apple className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Personalized Diet Plans Yet</h3>
                  <p className="text-muted-foreground">
                    Your doctor will create personalized diet plans based on your health needs.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{rec.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2">{rec.description}</p>
                          <span className="text-xs text-muted-foreground">
                            Type: {rec.recommendation_type}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Leaf className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Health Recommendations Yet</h3>
                  <p className="text-muted-foreground">
                    Your doctor will add health recommendations based on your condition.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
