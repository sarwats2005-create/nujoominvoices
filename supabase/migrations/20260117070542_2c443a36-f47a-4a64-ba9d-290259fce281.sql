-- Create a table to store the map location (admin-controlled)
CREATE TABLE public.map_location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL DEFAULT 33.3152,
  longitude DECIMAL(11, 8) NOT NULL DEFAULT 44.3661,
  address TEXT DEFAULT 'Baghdad, Iraq',
  zoom_level INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.map_location ENABLE ROW LEVEL SECURITY;

-- Everyone can read the location
CREATE POLICY "Anyone can view map location"
ON public.map_location
FOR SELECT
USING (true);

-- Only admins can update the location
CREATE POLICY "Admins can update map location"
ON public.map_location
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert (if no record exists)
CREATE POLICY "Admins can insert map location"
ON public.map_location
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default location
INSERT INTO public.map_location (latitude, longitude, address, zoom_level)
VALUES (33.3152, 44.3661, 'Baghdad, Iraq', 12);

-- Add trigger for updated_at
CREATE TRIGGER update_map_location_updated_at
BEFORE UPDATE ON public.map_location
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();