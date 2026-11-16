const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfxgqthch',
  api_key: process.env.CLOUDINARY_API_KEY || '999877737227879',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YvqtE-zfiSUcvSfunuKhSusAHF8',
});

/**
 * Uploads a base64 image data URI to Cloudinary and returns secure URL.
 */
const uploadToCloudinary = async (fileSource) => {
  try {
    const result = await cloudinary.uploader.upload(fileSource, {
      folder: 'e-booking-resources',
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};

