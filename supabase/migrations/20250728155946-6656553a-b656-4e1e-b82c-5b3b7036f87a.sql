-- Create a table to store face enrollment data
CREATE TABLE public.face_enrollment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  face_descriptor JSONB NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enrolled_by UUID REFERENCES public.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  confidence_threshold NUMERIC DEFAULT 0.6,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.face_enrollment ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own face enrollment" 
ON public.face_enrollment 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all face enrollments" 
ON public.face_enrollment 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role = 'admin'::user_role
));

CREATE POLICY "System can insert enrollments" 
ON public.face_enrollment 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_face_enrollment_user_id ON public.face_enrollment(user_id);
CREATE INDEX idx_face_enrollment_active ON public.face_enrollment(user_id, is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_face_enrollment_updated_at
BEFORE UPDATE ON public.face_enrollment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();