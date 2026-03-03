# Supabase Storage Setup for Image Uploads

This guide explains how to set up Supabase Storage to enable image uploads for social posts in SynergyFit.

## Prerequisites

- Supabase project (already set up)
- Supabase URL and Anon Key

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Name the bucket: `images`
6. Set **Public bucket** to enabled (so images can be accessed via public URLs)
7. Click **Create bucket**

## Step 2: Set Up Storage Policies

To allow authenticated users to upload images, you need to set up Row Level Security (RLS) policies:

1. In the Supabase Storage section, click on the `images` bucket
2. Go to **Policies**
3. Add the following policies:

### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

### Policy 2: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');
```

### Policy 3: Allow Users to Delete Their Own Images

```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Configure Environment Variables

### Server Environment (.env in root)

Make sure your root `.env` file contains:

```env
SUPABASE_URL=https://vgowgxuwwsxxqzdcgbsa.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### Client Environment (client/.env)

Create a `client/.env` file with:

```env
REACT_APP_SUPABASE_URL=https://vgowgxuwwsxxqzdcgbsa.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:** 
- Copy your actual Anon Key from Supabase Dashboard → Settings → API
- Never commit the `.env` file to version control
- The `.env.example` files show the required format

## Step 4: Folder Structure

Images will be stored in the following structure:
```
images/
  └── posts/
      ├── {userId}-{timestamp}.jpg
      ├── {userId}-{timestamp}.png
      └── ...
```

## Step 5: Verify Setup

After setting up:

1. Start both server and client:
   ```bash
   # In root directory
   npm start
   
   # In client directory
   cd client
   npm start
   ```

2. Navigate to Social Feed
3. Click "Create Post"
4. Add an image and create a post
5. The image should upload successfully and display in the post

## Troubleshooting

### "Error uploading image"
- Check that the `images` bucket exists
- Verify the bucket is set to public
- Check that RLS policies are correctly set up

### "Failed to load image"
- Check that the image was uploaded (go to Supabase Storage → images bucket)
- Verify the public URL is correct
- Check browser console for CORS errors

### "Authentication error"
- Make sure the user is logged in
- Verify REACT_APP_SUPABASE_ANON_KEY is correct in client/.env
- Check that the anon key has the correct permissions

## Image Upload Limits

Current limits in the application:
- **Max file size:** 5MB
- **Allowed formats:** All image formats (jpg, png, gif, webp, etc.)
- **Storage location:** Supabase Storage `images` bucket

To change these limits, edit the validation in `client/src/pages/Social.js`:

```javascript
// Validate file size (max 5MB)
if (file.size > 5 * 1024 * 1024) {
  showNotification('Image must be less than 5MB', 'error');
  return;
}
```

## Security Notes

- Images are stored with user ID in the filename for tracking
- Only authenticated users can upload images
- Users can only delete their own images
- Public read access allows anyone to view images (needed for social feed)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
