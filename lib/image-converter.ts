/**
 * Image conversion utilities
 * Converts images to black and white for 3D printing
 */

export async function convertImageToBlackWhite(
  imageFile: File
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and then to black/white (threshold)
        for (let i = 0; i < data.length; i += 4) {
          // Calculate grayscale value
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Apply threshold (128 is middle gray)
          const threshold = 128;
          const value = gray > threshold ? 255 : 0;
          
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          // data[i + 3] stays as alpha
        }
        
        // Put the modified data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not convert canvas to blob'));
            return;
          }
          
          const convertedFile = new File([blob], imageFile.name, {
            type: 'image/png',
          });
          
          resolve(convertedFile);
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Invalid image data'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Server-side image conversion using sharp-like approach
 * For Node.js/server environments
 */
export async function convertImageToBlackWhiteServer(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  // This is a simplified version - in production, you'd use sharp or similar
  // For now, we'll return the buffer as-is and handle conversion client-side
  // or use a proper image processing library
  return imageBuffer;
}

