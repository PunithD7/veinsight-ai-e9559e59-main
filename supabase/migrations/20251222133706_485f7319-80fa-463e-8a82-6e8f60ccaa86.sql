-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  specialty TEXT, -- For doctors
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create patient_doctor relationships
CREATE TABLE public.patient_doctor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (patient_id, doctor_id)
);

-- Create vein_analyses table to store analysis history
CREATE TABLE public.vein_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID,
  image_url TEXT NOT NULL,
  primary_vein_score INTEGER,
  secondary_vein_score INTEGER,
  avoid_vein_score INTEGER,
  overall_score INTEGER,
  confidence DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_doctor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vein_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view their patients profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'doctor') AND
    EXISTS (
      SELECT 1 FROM public.patient_doctor pd
      WHERE pd.doctor_id = auth.uid() AND pd.patient_id = profiles.user_id
    )
  );

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Patient-doctor relationship policies
CREATE POLICY "Doctors can view their patient relationships"
  ON public.patient_doctor FOR SELECT
  USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Doctors can add patients"
  ON public.patient_doctor FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

CREATE POLICY "Doctors can remove patients"
  ON public.patient_doctor FOR DELETE
  USING (public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

-- Vein analyses policies
CREATE POLICY "Patients can view their own analyses"
  ON public.vein_analyses FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view analyses of their patients"
  ON public.vein_analyses FOR SELECT
  USING (
    public.has_role(auth.uid(), 'doctor') AND
    (doctor_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.patient_doctor pd
      WHERE pd.doctor_id = auth.uid() AND pd.patient_id = vein_analyses.patient_id
    ))
  );

CREATE POLICY "Doctors can insert analyses for their patients"
  ON public.vein_analyses FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid()
  );

CREATE POLICY "Patients can insert their own analyses"
  ON public.vein_analyses FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Users can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- Create storage bucket for vein images
INSERT INTO storage.buckets (id, name, public) VALUES ('vein-images', 'vein-images', true);

-- Storage policies
CREATE POLICY "Anyone can view vein images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vein-images');

CREATE POLICY "Authenticated users can upload vein images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vein-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vein-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();