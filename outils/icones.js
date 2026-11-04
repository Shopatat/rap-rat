// Génère les icônes de l'appli (node outils/icones.js) : une tranche de fromage à trous,
// croquée en haut par les deux dents du rat. Aucun module à installer.
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = b => { let c = -1; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const BG = [6, 4, 3];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = t => Math.max(0, Math.min(1, t));

// one sample of the picture, in 0..1 coordinates; pad = empty border around the slice
function sample(x, y, pad) {
  const a = pad, b = 1 - pad, s = b - a;
  if (x < a || x > b || y < a || y > b) return BG;
  const u = (x - a) / s, v = (y - a) / s;                       // position on the slice
  // the bite: two straight incisor marks coming down from the top edge
  const teeth = [[.6, .2], [.73, .26]], tw = .065;
  for (const [cx, len] of teeth) {
    const vc = len - tw;
    if (Math.abs(u - cx) < tw && v < vc) return BG;
    if (Math.hypot(u - cx, v - vc) < tw) return BG;
  }
  // holes seen from above the middle: the dark way through slides toward the centre
  const holes = [[.27, .3, .075], [.5, .55, .1], [.24, .7, .06], [.76, .68, .08], [.42, .2, .035], [.62, .82, .04], [.82, .45, .035]];
  for (const [hx, hy, r] of holes) {
    const d = Math.hypot(u - hx, v - hy);
    if (d < r) {
      const dx = .5 - hx, dy = .5 - hy, dl = Math.hypot(dx, dy) || 1;
      const off = Math.min(.9, dl * 1.6) * r;
      const ex = hx + dx / dl * off, ey = hy + dy / dl * off;
      if (Math.hypot(u - ex, v - ey) < r * .92) return [8, 3, 0];
      const t = clamp(((u - hx) * -dx / dl + (v - hy) * -dy / dl) / r * .5 + .5);   // lit on the outer side
      return mix([112, 52, 10], [238, 166, 68], t);
    }
    if (d < r * 1.35) {
      const g = 1 - (d - r) / (r * .35);
      const base = cheese(u, v);
      return mix(base, [252, 214, 124], g * .35);
    }
  }
  return cheese(u, v);
}
function cheese(u, v) {
  const d = clamp(Math.hypot(u - .5, v - .48) / .72);
  return d < .5 ? mix([232, 173, 68], [220, 146, 52], d / .5) : mix([220, 146, 52], [187, 101, 36], (d - .5) / .5);
}

function render(size, pad) {
  const rgb = Buffer.alloc(size * size * 3), S = 3;
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let acc = [0, 0, 0];
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const c = sample((px + (sx + .5) / S) / size, (py + (sy + .5) / S) / size, pad);
      acc = acc.map((v, i) => v + c[i]);
    }
    const o = (py * size + px) * 3;
    for (let i = 0; i < 3; i++) rgb[o + i] = Math.round(acc[i] / (S * S));
  }
  return png(size, size, rgb);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
const list = [['icon-192.png', 192, .1], ['icon-512.png', 512, .1], ['icon-maskable-512.png', 512, .2], ['apple-touch-icon.png', 180, .1], ['favicon-32.png', 32, .04]];
for (const [name, size, pad] of list) { fs.writeFileSync(path.join(out, name), render(size, pad)); console.log('icons/' + name); }
