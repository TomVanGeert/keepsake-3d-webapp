'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { generate3MFModelXML } from '@/lib/threeMFGenerator';
import sharp from 'sharp';
import JSZip from 'jszip';
import type { Size } from '@/types';

// Size dimensions in mm
const SIZE_DIMENSIONS: Record<Size, { width: number; height: number; depth: number }> = {
  small: { width: 40, height: 40, depth: 4 },
  medium: { width: 60, height: 60, depth: 5 },
  large: { width: 80, height: 80, depth: 6 },
};

export interface Generate3MFResult {
  success: boolean;
  threeMfFileUrl?: string;
  error?: string;
}

/**
 * Server Action to generate a 3MF file from a converted image
 */
export async function generate3MFFile(
  convertedImageUrl: string,
  size: Size
): Promise<Generate3MFResult> {
  try {
    const supabase = createAdminClient();
    
    // Download the converted image
    const imagePath = convertedImageUrl.split('/images/')[1];
    if (!imagePath) {
      return { success: false, error: 'Invalid image URL' };
    }

    const { data: imageData, error: downloadError } = await supabase.storage
      .from('images')
      .download(imagePath);

    if (downloadError || !imageData) {
      return { success: false, error: `Failed to download image: ${downloadError?.message}` };
    }

    // Convert to buffer and get image dimensions
    const arrayBuffer = await imageData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      return { success: false, error: 'Could not read image dimensions' };
    }

    // Get raw image data (grayscale)
    const { data: rawImageData, info } = await image
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Get dimensions
    const dimensions = SIZE_DIMENSIONS[size];
    
    // Generate 3MF model XML
    const modelXML = generate3MFModelXML({
      width: dimensions.width,
      height: dimensions.height,
      depth: dimensions.depth,
      imageData: new Uint8Array(rawImageData),
      imageWidth: info.width,
      imageHeight: info.height,
    });

    // Create proper 3MF ZIP structure
    const zip = new JSZip();
    
    // Add model file
    zip.file('3D/3dmodel.model', modelXML);
    
    // Add relationships
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/3dmanufacturing/core/2015/02/relationship" Target="/3D/3dmodel.model" Id="rel0" />
</Relationships>`);

    // Add content types
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`);

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `3mf-${size}-${timestamp}.3mf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('3mf-files')
      .upload(fileName, zipBuffer, {
        contentType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Failed to upload 3MF file: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('3mf-files')
      .getPublicUrl(fileName);

    return {
      success: true,
      threeMfFileUrl: publicUrl,
    };
  } catch (error) {
    console.error('Error generating 3MF file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

