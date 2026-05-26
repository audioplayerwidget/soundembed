// api/player.js
// /api/player?id=p_xxxxxxxx pe player HTML serve karta hai
// Canva mein yahi URL embed hoti hai

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const { id } = req.query;

  // Basic validation — sirf alphanumeric + underscore
  if (!id || !/^p_[a-z0-9]+$/i.test(id)) {
    return res.status(400).send('Invalid player ID');
  }

  const filePath = join('/tmp/players', `${id}.html`);

  if (!existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"/><title>Player Not Found</title></head>
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0c0c0e;color:#888;">
        <div style="text-align:center">
          <p style="font-size:14px">Player not found or expired.</p>
          <p style="font-size:12px;margin-top:6px;">Please generate a new embed URL.</p>
        </div>
      </body>
      </html>
    `);
  }

  const html = readFileSync(filePath, 'utf8');

  // Headers for Canva embedding
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache for 1 year
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  return res.status(200).send(html);
}
