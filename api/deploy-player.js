// api/deploy-player.js
// Player HTML generate karke Vercel ke /public/players/ mein save karta hai
// Koi Netlify token ki zaroorat NAHI — sab Vercel pe hota hai

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

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
    const { audioUrl, title, color, style } = req.body || {};

    if (!audioUrl || !title) {
      return res.status(400).json({ error: 'audioUrl aur title required hain' });
    }

    const playerHtml = buildPlayerHtml(
      audioUrl,
      title,
      color || '#ffffff',
      style || 'circle'
    );

    // Unique player ID
    const playerId = 'p_' + Math.random().toString(36).slice(2, 12);

    // Vercel serverless functions ke paas /tmp write access hai
    const tmpDir = '/tmp/players';
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    const filePath = join(tmpDir, `${playerId}.html`);
    writeFileSync(filePath, playerHtml, 'utf8');

    // Player URL — same Vercel domain pe /api/player?id=xxx
    const host     = req.headers.host;
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const playerUrl = `${protocol}://${host}/api/player?id=${playerId}`;

    return res.status(200).json({ playerUrl });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

// ─── Player HTML Builder ──────────────────────────────────────────────────────
function buildPlayerHtml(audioSrc, title, color, style) {
  const radius = style === 'circle' ? '50%' : style === 'pill' ? '16px' : '10px';
  const t = escHtml(title);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;background:transparent!important;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.w{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.p{display:flex;align-items:center;gap:12px;padding:0 10px;width:100%;max-width:400px}
.btn{width:54px;height:54px;border-radius:${radius};background:rgba(255,255,255,0.13);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,0.24);display:grid;place-items:center;cursor:pointer;flex-shrink:0;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;box-shadow:0 4px 18px rgba(0,0,0,0.18)}
.btn:hover{transform:scale(1.1);box-shadow:0 6px 26px rgba(0,0,0,0.22)}
.btn:active{transform:scale(.94)}
.ip{display:block}.ipa{display:none}
.btn.pl .ip{display:none}.btn.pl .ipa{display:block}
.info{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.ttl{font-size:13px;font-weight:700;color:rgba(255,255,255,.93);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 6px rgba(0,0,0,.3);letter-spacing:-.1px}
.bar{height:3px;background:rgba(255,255,255,.18);border-radius:3px;cursor:pointer}
.fill{height:100%;background:${color};border-radius:3px;width:0%;transition:width .1s linear;position:relative}
.fill::after{content:'';position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:9px;height:9px;background:${color};border-radius:50%;opacity:0;transition:opacity .15s;box-shadow:0 0 4px rgba(0,0,0,.2)}
.bar:hover .fill::after{opacity:1}
.times{display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.44);font-family:monospace}
.vz{display:flex;align-items:flex-end;gap:2px;height:20px;flex-shrink:0}
.vb{width:3px;border-radius:2px;background:${color};opacity:.75;height:4px}
@keyframes v1{0%,100%{height:4px}50%{height:17px}}
@keyframes v2{0%,100%{height:7px}50%{height:13px}}
@keyframes v3{0%,100%{height:11px}50%{height:5px}}
@keyframes v4{0%,100%{height:5px}50%{height:18px}}
@keyframes v5{0%,100%{height:9px}50%{height:4px}}
.vb:nth-child(1){animation:v1 .7s ease-in-out infinite paused}
.vb:nth-child(2){animation:v2 .9s ease-in-out infinite paused}
.vb:nth-child(3){animation:v3 .6s ease-in-out infinite paused}
.vb:nth-child(4){animation:v4 .8s ease-in-out infinite paused}
.vb:nth-child(5){animation:v5 .75s ease-in-out infinite paused}
.vb.on{animation-play-state:running!important}
</style>
</head>
<body>
<div class="w"><div class="p">
  <button class="btn" id="btn" onclick="tog()">
    <svg class="ip" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 5L16 10L7 15V5Z" fill="${color}" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>
    <svg class="ipa" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5.5" y="4.5" width="3" height="11" rx="1.5" fill="${color}"/>
      <rect x="11.5" y="4.5" width="3" height="11" rx="1.5" fill="${color}"/>
    </svg>
  </button>
  <div class="info">
    <div class="ttl">${t}</div>
    <div class="bar" id="bar" onclick="sk(event)">
      <div class="fill" id="fill"></div>
    </div>
    <div class="times"><span id="cur">0:00</span><span id="dur">—:——</span></div>
  </div>
  <div class="vz">
    <div class="vb"></div><div class="vb"></div><div class="vb"></div>
    <div class="vb"></div><div class="vb"></div>
  </div>
</div></div>
<audio id="a" preload="metadata" crossorigin="anonymous" src="${escHtml(audioSrc)}"></audio>
<script>
const a=document.getElementById('a'),btn=document.getElementById('btn'),
fill=document.getElementById('fill'),cur=document.getElementById('cur'),
dur=document.getElementById('dur'),vbs=document.querySelectorAll('.vb');
function fm(s){if(!s||isNaN(s))return'0:00';return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
a.addEventListener('loadedmetadata',()=>{dur.textContent=fm(a.duration);});
a.addEventListener('timeupdate',()=>{if(!a.duration)return;fill.style.width=(a.currentTime/a.duration*100)+'%';cur.textContent=fm(a.currentTime);});
a.addEventListener('ended',()=>{btn.classList.remove('pl');fill.style.width='0%';cur.textContent='0:00';vbs.forEach(b=>b.classList.remove('on'));});
function tog(){if(a.paused){a.play().then(()=>{btn.classList.add('pl');vbs.forEach(b=>b.classList.add('on'));}).catch(()=>{});}else{a.pause();btn.classList.remove('pl');vbs.forEach(b=>b.classList.remove('on'));}}
function sk(e){if(!a.duration)return;const r=e.currentTarget.getBoundingClientRect();a.currentTime=((e.clientX-r.left)/r.width)*a.duration;}
document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();tog();}});
<\/script>
</body>
</html>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
