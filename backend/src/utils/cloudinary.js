const cloudinary = require('cloudinary').v2;

const cleanEnv = (val) => (val ? String(val).trim().replace(/^["']|["']$/g, '') : '');

const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) || 'dfxgqthch';
let apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY) || '327255887477451';

// Safeguard against old mismatched API key if still saved in host environment variables (e.g. Render)
if (apiKey === '999877737227879') {
  apiKey = '327255887477451';
}

const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET) || 'YvqtE-zfiSUcvSfunuKhSusAHF8';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
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
    console.error('[Cloudinary Upload Error]:', error.message || error);
    throw new Error('Cloudinary upload failed: ' + (error.message || 'Unknown error'));
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};

