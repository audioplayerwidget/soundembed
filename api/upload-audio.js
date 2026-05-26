// api/upload-audio.js
// Audio ko Cloudinary pe upload karta hai

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '55mb',
    },
  },
};

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { audioBase64, fileName } = req.body || {};

    if (!audioBase64 || !fileName) {
      return res.status(400).json({ error: 'audioBase64 aur fileName required hain' });
    }

    const cloudName    = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return res.status(500).json({
        error: 'Cloudinary credentials missing. Vercel Dashboard → Settings → Environment Variables mein CLOUDINARY_CLOUD_NAME aur CLOUDINARY_UPLOAD_PRESET add karo.',
      });
    }

    // Strip data URI prefix if present
    const base64Data = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const mimeType   = audioBase64.startsWith('data:')
      ? audioBase64.split(';')[0].replace('data:', '')
      : 'audio/mpeg';

    const binaryData = Buffer.from(base64Data, 'base64');

    // Unique public_id
    const safeFileName = fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    const publicId = `soundembed/${safeFileName}_${Date.now()}`;

    // Build multipart/form-data manually (Cloudinary needs this for binary)
    const boundary = '----SoundEmbedBoundary' + Math.random().toString(36).slice(2);

    const textPart = (name, value) =>
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;

    const filePart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
      'utf8'
    );

    const afterFile = Buffer.from(
      `\r\n${textPart('upload_preset', uploadPreset)}` +
      `${textPart('public_id', publicId)}` +
      `${textPart('resource_type', 'video')}` +
      `--${boundary}--\r\n`,
      'utf8'
    );

    const fullBody = Buffer.concat([filePart, binaryData, afterFile]);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method:  'POST',
        headers: {
          'Content-Type':   `multipart/form-data; boundary=${boundary}`,
          'Content-Length': String(fullBody.length),
        },
        body: fullBody,
      }
    );

    const rawText = await cloudRes.text();
    let cloudData;
    try {
      cloudData = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: 'Cloudinary response invalid: ' + rawText.slice(0, 300) });
    }

    if (!cloudRes.ok || cloudData.error) {
      return res.status(cloudRes.status).json({
        error: cloudData.error?.message || 'Cloudinary upload fail ho gaya',
      });
    }

    return res.status(200).json({
      audioUrl: cloudData.secure_url,
      publicId: cloudData.public_id,
      duration: cloudData.duration,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
