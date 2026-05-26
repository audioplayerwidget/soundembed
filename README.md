# SoundEmbed — Vercel Deploy Guide
# Sirf 2 credentials chahiye (Netlify ki zaroorat NAHI)

## Project Structure

```
soundembed/
├── index.html              ← Main app
├── player.html             ← Sample
├── api/
│   ├── upload-audio.js     ← Audio → Cloudinary pe upload
│   ├── deploy-player.js    ← Player HTML generate karta hai
│   └── player.js          ← Player serve karta hai (/api/player?id=xxx)
├── vercel.json
└── package.json
```

---

## Step 1 — GitHub pe upload karo

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUMHARA_USERNAME/soundembed.git
git push -u origin main
```

---

## Step 2 — Vercel pe deploy karo

1. vercel.com → Add New Project → GitHub repo select karo
2. Environment Variables mein sirf YEH 2 add karo:

   CLOUDINARY_CLOUD_NAME    = apna_cloud_name
   CLOUDINARY_UPLOAD_PRESET = apna_unsigned_preset

3. Deploy!

## Netlify Token ki ZAROORAT NAHI ✓
## Player Vercel pe hi serve hota hai ✓

---

## Credentials kahan se milenge

### Cloudinary (FREE account kaafi hai):
1. cloudinary.com → Sign up / Login
2. Dashboard → Cloud Name copy karo
3. Settings → Upload → Upload Presets → Add upload preset
   → Signing Mode: UNSIGNED → Save → Preset name copy karo

---

## Canva mein embed kaise karein

1. Audio upload karo → Generate Embed URL dabao
2. URL copy karo (format: https://your-app.vercel.app/api/player?id=p_xxx)
3. Canva open karo → Apps → "Embed" search karo → URL paste karo → Done!

---

## API Endpoints

POST /api/upload-audio    → Audio Cloudinary pe upload karta hai
POST /api/deploy-player   → Player generate karke URL deta hai
GET  /api/player?id=xxx   → Player HTML serve karta hai (Canva embed hoti hai)
