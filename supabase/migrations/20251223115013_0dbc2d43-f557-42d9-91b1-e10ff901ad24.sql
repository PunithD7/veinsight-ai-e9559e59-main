-- Create diseases table for knowledge center
CREATE TABLE public.diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  causes TEXT[] NOT NULL DEFAULT '{}',
  precautions TEXT[] NOT NULL DEFAULT '{}',
  medicines TEXT[] NOT NULL DEFAULT '{}',
  recommended_foods TEXT[] NOT NULL DEFAULT '{}',
  avoid_foods TEXT[] NOT NULL DEFAULT '{}',
  lifestyle_advice TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  diagnosis TEXT NOT NULL,
  medications JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meals JSONB NOT NULL DEFAULT '[]',
  disease_id UUID REFERENCES public.diseases(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_reports table
CREATE TABLE public.medical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create procedure_notes table for nurses
CREATE TABLE public.procedure_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  nurse_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  procedure_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  vitals JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_vitals table
CREATE TABLE public.patient_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  recorded_by UUID NOT NULL,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  temperature DECIMAL(4,1),
  oxygen_saturation INTEGER,
  weight DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_recommendations table
CREATE TABLE public.health_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nurse_patient assignment table
CREATE TABLE public.nurse_patient (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nurse_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nurse_id, patient_id)
);

-- Enable RLS on all tables
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurse_patient ENABLE ROW LEVEL SECURITY;

-- Diseases policies (public read, staff write)
CREATE POLICY "Anyone can view diseases" ON public.diseases FOR SELECT USING (true);
CREATE POLICY "Doctors can insert diseases" ON public.diseases FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor'));
CREATE POLICY "Doctors can update diseases" ON public.diseases FOR UPDATE USING (has_role(auth.uid(), 'doctor'));

-- Prescriptions policies
CREATE POLICY "Patients can view their prescriptions" ON public.prescriptions FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view prescriptions they created" ON public.prescriptions FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());
CREATE POLICY "Doctors can update their prescriptions" ON public.prescriptions FOR UPDATE USING (doctor_id = auth.uid());

-- Diet plans policies
CREATE POLICY "Patients can view their diet plans" ON public.diet_plans FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view diet plans they created" ON public.diet_plans FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can create diet plans" ON public.diet_plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

-- Medical reports policies
CREATE POLICY "Patients can view their reports" ON public.medical_reports FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients can upload their reports" ON public.medical_reports FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Doctors can view patient reports" ON public.medical_reports FOR SELECT USING (
  has_role(auth.uid(), 'doctor') AND (doctor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM patient_doctor pd WHERE pd.doctor_id = auth.uid() AND pd.patient_id = medical_reports.patient_id
  ))
);
CREATE POLICY "Doctors can upload reports for patients" ON public.medical_reports FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor'));

-- Procedure notes policies
CREATE POLICY "Nurses can view their procedure notes" ON public.procedure_notes FOR SELECT USING (nurse_id = auth.uid());
CREATE POLICY "Nurses can create procedure notes" ON public.procedure_notes FOR INSERT WITH CHECK (has_role(auth.uid(), 'nurse') AND nurse_id = auth.uid());
CREATE POLICY "Doctors can view procedure notes for their patients" ON public.procedure_notes FOR SELECT USING (
  has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM patient_doctor pd WHERE pd.doctor_id = auth.uid() AND pd.patient_id = procedure_notes.patient_id
  )
);

-- Patient vitals policies
CREATE POLICY "Patients can view their vitals" ON public.patient_vitals FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Staff can view patient vitals" ON public.patient_vitals FOR SELECT USING (
  has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse')
);
CREATE POLICY "Staff can record vitals" ON public.patient_vitals FOR INSERT WITH CHECK (
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'nurse')) AND recorded_by = auth.uid()
);

-- Health recommendations policies
CREATE POLICY "Patients can view their recommendations" ON public.health_recommendations FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view their recommendations" ON public.health_recommendations FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can create recommendations" ON public.health_recommendations FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

-- Nurse patient assignment policies
CREATE POLICY "Nurses can view their assignments" ON public.nurse_patient FOR SELECT USING (nurse_id = auth.uid() OR patient_id = auth.uid());
CREATE POLICY "Doctors can assign nurses" ON public.nurse_patient FOR INSERT WITH CHECK (has_role(auth.uid(), 'doctor'));
CREATE POLICY "Doctors can remove nurse assignments" ON public.nurse_patient FOR DELETE USING (has_role(auth.uid(), 'doctor'));

-- Update appointments policies to include nurses
CREATE POLICY "Nurses can view appointments" ON public.appointments FOR SELECT USING (has_role(auth.uid(), 'nurse'));

-- Add triggers for updated_at
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample diseases data
INSERT INTO public.diseases (name, description, symptoms, causes, precautions, medicines, recommended_foods, avoid_foods, lifestyle_advice) VALUES
('Diabetes', 'A chronic condition affecting how the body processes blood sugar (glucose).', 
  ARRAY['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
  ARRAY['Genetics', 'Obesity', 'Sedentary lifestyle', 'Poor diet', 'Age'],
  ARRAY['Regular blood sugar monitoring', 'Maintain healthy weight', 'Regular exercise', 'Healthy diet'],
  ARRAY['Metformin', 'Insulin', 'Sulfonylureas', 'GLP-1 receptor agonists'],
  ARRAY['Leafy greens', 'Whole grains', 'Fish', 'Nuts', 'Berries', 'Sweet potatoes'],
  ARRAY['Sugary drinks', 'White bread', 'Fried foods', 'Candy', 'Processed snacks'],
  ARRAY['Exercise 30 minutes daily', 'Monitor blood sugar regularly', 'Take medications as prescribed', 'Get regular checkups']),

('Hypertension', 'High blood pressure that can lead to severe health complications.',
  ARRAY['Headaches', 'Shortness of breath', 'Nosebleeds', 'Dizziness', 'Chest pain'],
  ARRAY['Genetics', 'High salt intake', 'Obesity', 'Stress', 'Lack of exercise', 'Smoking'],
  ARRAY['Reduce salt intake', 'Regular exercise', 'Maintain healthy weight', 'Limit alcohol'],
  ARRAY['ACE inhibitors', 'Beta blockers', 'Diuretics', 'Calcium channel blockers'],
  ARRAY['Bananas', 'Spinach', 'Oatmeal', 'Salmon', 'Garlic', 'Beets'],
  ARRAY['Salty foods', 'Red meat', 'Sugary foods', 'Alcohol', 'Caffeine'],
  ARRAY['Reduce stress', 'Quit smoking', 'Limit alcohol', 'Exercise regularly', 'Monitor blood pressure']),

('Anemia', 'A condition where you lack enough healthy red blood cells.',
  ARRAY['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands and feet'],
  ARRAY['Iron deficiency', 'Vitamin B12 deficiency', 'Chronic diseases', 'Genetic disorders'],
  ARRAY['Iron-rich diet', 'Regular blood tests', 'Vitamin supplements', 'Treat underlying conditions'],
  ARRAY['Iron supplements', 'Vitamin B12 injections', 'Folic acid', 'Erythropoietin'],
  ARRAY['Red meat', 'Spinach', 'Lentils', 'Eggs', 'Fortified cereals', 'Beans'],
  ARRAY['Tea with meals', 'Coffee with meals', 'Calcium-rich foods with iron'],
  ARRAY['Eat iron-rich foods', 'Pair iron with vitamin C', 'Get regular blood tests', 'Rest when tired']),

('Heart Disease', 'Various conditions affecting the heart structure and function.',
  ARRAY['Chest pain', 'Shortness of breath', 'Fatigue', 'Irregular heartbeat', 'Swelling in legs'],
  ARRAY['High cholesterol', 'High blood pressure', 'Smoking', 'Diabetes', 'Obesity', 'Family history'],
  ARRAY['Healthy diet', 'Regular exercise', 'No smoking', 'Manage stress', 'Control blood pressure'],
  ARRAY['Statins', 'Aspirin', 'Beta blockers', 'ACE inhibitors', 'Blood thinners'],
  ARRAY['Salmon', 'Olive oil', 'Nuts', 'Berries', 'Oatmeal', 'Green tea'],
  ARRAY['Trans fats', 'Fried foods', 'Red meat', 'Processed foods', 'Sugary drinks'],
  ARRAY['Exercise 150 minutes weekly', 'Maintain healthy weight', 'Manage stress', 'Sleep 7-8 hours']),

('Kidney Disease', 'Gradual loss of kidney function over time.',
  ARRAY['Fatigue', 'Swelling', 'Changes in urination', 'Nausea', 'Loss of appetite', 'Muscle cramps'],
  ARRAY['Diabetes', 'High blood pressure', 'Heart disease', 'Family history', 'Age'],
  ARRAY['Control blood sugar', 'Manage blood pressure', 'Reduce salt intake', 'Stay hydrated'],
  ARRAY['ACE inhibitors', 'Diuretics', 'Phosphate binders', 'Vitamin D supplements'],
  ARRAY['Cauliflower', 'Blueberries', 'Egg whites', 'Olive oil', 'Cabbage', 'Chicken'],
  ARRAY['High-sodium foods', 'Processed meats', 'Dark colas', 'Bananas', 'Oranges'],
  ARRAY['Monitor kidney function regularly', 'Stay hydrated', 'Avoid NSAIDs', 'Maintain healthy weight']),

('Asthma', 'A condition causing airways to narrow and swell.',
  ARRAY['Wheezing', 'Coughing', 'Shortness of breath', 'Chest tightness', 'Trouble sleeping'],
  ARRAY['Allergies', 'Respiratory infections', 'Air pollution', 'Exercise', 'Cold air', 'Stress'],
  ARRAY['Avoid triggers', 'Use inhalers correctly', 'Regular checkups', 'Keep rescue inhaler handy'],
  ARRAY['Inhaled corticosteroids', 'Long-acting beta agonists', 'Rescue inhalers', 'Montelukast'],
  ARRAY['Fruits', 'Vegetables', 'Whole grains', 'Fish', 'Ginger', 'Turmeric'],
  ARRAY['Sulfites', 'Processed foods', 'Shellfish', 'Dried fruits', 'Pickled foods'],
  ARRAY['Identify and avoid triggers', 'Use air purifier', 'Exercise regularly', 'Get flu vaccine']);