/**
 * 3MF File Generator
 * Generates 3MF files from black/white images for 3D printing
 */

export interface ThreeMFGenerationOptions {
  width: number;  // in mm
  height: number; // in mm
  depth: number;  // in mm (thickness of keychain)
  imageData: Uint8Array; // Black and white image data
  imageWidth: number;
  imageHeight: number;
}

/**
 * Generate 3MF model XML from image data
 */
export function generate3MFModelXML(options: ThreeMFGenerationOptions): string {
  const { width, height, depth, imageData, imageWidth, imageHeight } = options;
  
  // Generate vertices and triangles from the image data
  const vertices: string[] = [];
  const triangles: string[] = [];
  
  const scaleX = width / imageWidth;
  const scaleY = height / imageHeight;
  const pixelSize = Math.min(scaleX, scaleY);
  
  // Create a simplified mesh - create geometry only for white pixels
  let vertexIndex = 0;
  const vertexMap = new Map<string, number>();
  
  // Sample the image to reduce complexity
  const sampleRate = Math.max(1, Math.floor(imageWidth / 100)); // Sample every Nth pixel
  
  for (let y = 0; y < imageHeight; y += sampleRate) {
    for (let x = 0; x < imageWidth; x += sampleRate) {
      const pixelIndex = (y * imageWidth + x);
      const grayValue = imageData[pixelIndex] || 0;
      
      // Only create geometry for white pixels (raised areas)
      if (grayValue > 128) {
        const xPos = (x * scaleX) - (width / 2);
        const yPos = (y * scaleY) - (height / 2);
        const zPos = depth * 0.5; // Raise white pixels
        
        const key = `${Math.floor(xPos * 10)}_${Math.floor(yPos * 10)}`;
        
        if (!vertexMap.has(key)) {
          // Create vertices for a small raised square
          const w = pixelSize * 0.8;
          const h = pixelSize * 0.8;
          const d = depth * 0.3;
          
          // Front face vertices
          vertices.push(`        <vertex x="${xPos - w}" y="${yPos - h}" z="${zPos + d}" />`);
          vertices.push(`        <vertex x="${xPos + w}" y="${yPos - h}" z="${zPos + d}" />`);
          vertices.push(`        <vertex x="${xPos + w}" y="${yPos + h}" z="${zPos + d}" />`);
          vertices.push(`        <vertex x="${xPos - w}" y="${yPos + h}" z="${zPos + d}" />`);
          
          // Back face vertices
          vertices.push(`        <vertex x="${xPos - w}" y="${yPos - h}" z="${zPos}" />`);
          vertices.push(`        <vertex x="${xPos + w}" y="${yPos - h}" z="${zPos}" />`);
          vertices.push(`        <vertex x="${xPos + w}" y="${yPos + h}" z="${zPos}" />`);
          vertices.push(`        <vertex x="${xPos - w}" y="${yPos + h}" z="${zPos}" />`);
          
          // Create triangles for the cube
          const baseIdx = vertexIndex;
          
          // Front face
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 1}" v3="${baseIdx + 2}" />`);
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 2}" v3="${baseIdx + 3}" />`);
          
          // Back face
          triangles.push(`        <triangle v1="${baseIdx + 4}" v2="${baseIdx + 6}" v3="${baseIdx + 5}" />`);
          triangles.push(`        <triangle v1="${baseIdx + 4}" v2="${baseIdx + 7}" v3="${baseIdx + 6}" />`);
          
          // Top face
          triangles.push(`        <triangle v1="${baseIdx + 3}" v2="${baseIdx + 2}" v3="${baseIdx + 6}" />`);
          triangles.push(`        <triangle v1="${baseIdx + 3}" v2="${baseIdx + 6}" v3="${baseIdx + 7}" />`);
          
          // Bottom face
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 5}" v3="${baseIdx + 1}" />`);
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 4}" v3="${baseIdx + 5}" />`);
          
          // Right face
          triangles.push(`        <triangle v1="${baseIdx + 1}" v2="${baseIdx + 5}" v3="${baseIdx + 6}" />`);
          triangles.push(`        <triangle v1="${baseIdx + 1}" v2="${baseIdx + 6}" v3="${baseIdx + 2}" />`);
          
          // Left face
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 7}" v3="${baseIdx + 4}" />`);
          triangles.push(`        <triangle v1="${baseIdx}" v2="${baseIdx + 3}" v3="${baseIdx + 7}" />`);
          
          vertexMap.set(key, vertexIndex);
          vertexIndex += 8;
        }
      }
    }
  }
  
  // If no vertices were created, create a simple base plate
  if (vertices.length === 0) {
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;
    
    vertices.push(`        <vertex x="${-w}" y="${-h}" z="${d}" />`);
    vertices.push(`        <vertex x="${w}" y="${-h}" z="${d}" />`);
    vertices.push(`        <vertex x="${w}" y="${h}" z="${d}" />`);
    vertices.push(`        <vertex x="${-w}" y="${h}" z="${d}" />`);
    vertices.push(`        <vertex x="${-w}" y="${-h}" z="${-d}" />`);
    vertices.push(`        <vertex x="${w}" y="${-h}" z="${-d}" />`);
    vertices.push(`        <vertex x="${w}" y="${h}" z="${-d}" />`);
    vertices.push(`        <vertex x="${-w}" y="${h}" z="${-d}" />`);
    
    triangles.push(`        <triangle v1="0" v2="1" v3="2" />`);
    triangles.push(`        <triangle v1="0" v2="2" v3="3" />`);
    triangles.push(`        <triangle v1="4" v2="6" v3="5" />`);
    triangles.push(`        <triangle v1="4" v2="7" v3="6" />`);
    triangles.push(`        <triangle v1="3" v2="2" v3="6" />`);
    triangles.push(`        <triangle v1="3" v2="6" v3="7" />`);
    triangles.push(`        <triangle v1="0" v2="5" v3="1" />`);
    triangles.push(`        <triangle v1="0" v2="4" v3="5" />`);
    triangles.push(`        <triangle v1="1" v2="5" v3="6" />`);
    triangles.push(`        <triangle v1="1" v2="6" v3="2" />`);
    triangles.push(`        <triangle v1="0" v2="7" v3="4" />`);
    triangles.push(`        <triangle v1="0" v2="3" v3="7" />`);
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertices.join('\n')}
        </vertices>
        <triangles>
${triangles.join('\n')}
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;
}
