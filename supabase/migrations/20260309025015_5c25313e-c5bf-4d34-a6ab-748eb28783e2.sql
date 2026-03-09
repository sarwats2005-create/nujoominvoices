
-- Create public storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access since bucket is public
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
