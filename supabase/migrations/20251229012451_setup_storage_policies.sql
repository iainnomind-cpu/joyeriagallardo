/*
  # Storage Policies for Product Images

  ## Overview
  Configures Supabase Storage policies for the product-images bucket to allow:
  - Public read access (anyone can view images)
  - Authenticated write access (only admin can upload/delete images)

  ## Storage Policies
  
  ### 1. Public Read Policy
  - Allows anyone (authenticated or anonymous) to view product images
  - Required for displaying product images in the catalog
  
  ### 2. Authenticated Upload Policy
  - Allows authenticated users to upload product images
  - Only admin users should be authenticated in this system
  
  ### 3. Authenticated Delete Policy
  - Allows authenticated users to delete product images
  - Only admin users can remove images

  ## Security Notes
  - Images are publicly accessible via URL (required for public catalog)
  - Only authenticated admin users can upload or delete images
  - Storage bucket is configured as public for easy image serving
*/

-- Policy for public read access to product images
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Policy for authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Policy for authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
