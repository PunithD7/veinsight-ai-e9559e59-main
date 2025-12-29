-- Allow safe deletion of medical reports by their owner (doctor who uploaded) or the patient

-- Doctors can delete reports they created
CREATE POLICY "Doctors can delete reports they created"
ON public.medical_reports
FOR DELETE
USING (
  has_role(auth.uid(), 'doctor'::app_role)
  AND doctor_id = auth.uid()
);

-- Patients can delete their own reports
CREATE POLICY "Patients can delete their own reports"
ON public.medical_reports
FOR DELETE
USING (
  patient_id = auth.uid()
);
