// api/get-upload-params.js
// Browser ko Cloudinary upload ke liye cloud_name + preset deta hai
// Koi sensitive secret expose nahi hoti (unsigned preset use ho raha hai)

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const cloudName    = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return res.status(500).json({
      error: 'Cloudinary credentials not configured in Vercel Environment Variables.',
    });
  }

  return res.status(200).json({ cloudName, uploadPreset });
}
