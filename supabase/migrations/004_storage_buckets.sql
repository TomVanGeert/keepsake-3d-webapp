-- Create storage buckets for images and 3MF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('3mf-files', '3mf-files', true, 52428800, ARRAY['application/vnd.ms-package.3dmanufacturing-3dmodel+xml', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage buckets
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload 3mf files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read 3mf files" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public read access to images
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload 3MF files
CREATE POLICY "Authenticated users can upload 3mf files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '3mf-files');

-- Allow public read access to 3MF files
CREATE POLICY "Public can read 3mf files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = '3mf-files');

