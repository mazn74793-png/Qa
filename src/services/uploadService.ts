/**
 * Cloudinary Upload Service
 * Allows direct client-side uploads without a backend.
 * Requires: Cloud Name and Unsigned Upload Preset.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Determine resource type
  // Use 'raw' for PDFs to avoid Cloudinary trying to process them as images
  let resourceType = 'auto';
  const isPdf = file.type === 'application/pdf' || 
                file.name.toLowerCase().endsWith('.pdf') ||
                file.name.toLowerCase().includes('.pdf');
                
  if (isPdf) {
    resourceType = 'raw';
  }

  try {
    console.log(`Cloudinary: Uploading "${file.name}" (Type: ${file.type}) as ${resourceType}...`);
    
    // Explicitly set resource_type in formData as well
    if (resourceType !== 'auto') {
      formData.append('resource_type', resourceType);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    const data = await response.json();
    console.log('Cloudinary Upload Success:', data.secure_url);
    
    // For PDFs, if Cloudinary returns an 'image' URL, it might not open as a document.
    // Cloudinary 'auto' usually returns the correct URL in data.secure_url.
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Catch:', error);
    throw error;
  }
};
