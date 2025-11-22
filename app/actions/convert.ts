'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

export interface ConvertImageResult {
  success: boolean;
  originalImageUrl?: string;
  convertedImageUrl?: string;
  error?: string;
}

/**
 * Server Action to upload and convert an image to black/white
 */
export async function convertImage(formData: FormData): Promise<ConvertImageResult> {
  try {
    const file = formData.get('image') as File;
    
    if (!file) {
      return { success: false, error: 'No image file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Image must be less than 10MB' };
    }

    const supabase = createAdminClient();
    
    // Convert image to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to black and white using sharp
    const convertedBuffer = await sharp(buffer)
      .greyscale()
      .threshold(128) // Convert to pure black/white
      .png()
      .toBuffer();

    // Generate unique file names
    const timestamp = Date.now();
    const originalFileName = `original-${timestamp}-${file.name}`;
    const convertedFileName = `converted-${timestamp}-${file.name.replace(/\.[^/.]+$/, '.png')}`;

    // Upload original image
    const { data: originalData, error: originalError } = await supabase.storage
      .from('images')
      .upload(originalFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (originalError) {
      return { success: false, error: `Failed to upload original image: ${originalError.message}` };
    }

    // Upload converted image
    const { data: convertedData, error: convertedError } = await supabase.storage
      .from('images')
      .upload(convertedFileName, convertedBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (convertedError) {
      return { success: false, error: `Failed to upload converted image: ${convertedError.message}` };
    }

    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(originalFileName);

    const { data: { publicUrl: convertedUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(convertedFileName);

    return {
      success: true,
      originalImageUrl: originalUrl,
      convertedImageUrl: convertedUrl,
    };
  } catch (error) {
    console.error('Error converting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

