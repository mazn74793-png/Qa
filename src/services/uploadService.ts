/**
 * Cloudinary Upload Service
 * Allows direct client-side uploads without a backend.
 * Requires: Cloud Name and Unsigned Upload Preset.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsdcuy40a';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qa12345';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  try {
    console.log('Uploading to Cloudinary...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
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
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Catch:', error);
    throw error;
  }
};
