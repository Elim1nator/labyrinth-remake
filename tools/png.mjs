// PNG read/write for tools/assets.mjs (Node's zlib only)
import zlib from 'zlib';
// decodePng reads what art tools save (greyscale, RGB, palette, with or without alpha; 1-16 bit) and returns 8-bit RGBA.
export function decodePng(buf, file = 'png') {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file}: not a PNG file`);
  let p = 8, w = 0, h = 0, depth = 0, ct = 0, inter = 0, pal = null, trns = null; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), ty = buf.toString('latin1', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (ty === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ct = data[9]; inter = data[12]; }
    else if (ty === 'PLTE') pal = data; else if (ty === 'tRNS') trns = data; else if (ty === 'IDAT') idat.push(data); else if (ty === 'IEND') break;
    p += 12 + len;
  }
  if (inter) throw new Error(`${file}: interlaced PNGs aren't supported; save it again with interlacing off`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct]; if (!ch) throw new Error(`${file}: unknown PNG colour type ${ct}`);
  const bpp = Math.max(1, (ch * depth) >> 3), stride = (w * ch * depth + 7) >> 3, raw = zlib.inflateSync(Buffer.concat(idat));
  const lines = []; let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], cur = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = cur[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255;
    }
    lines.push(cur); prev = cur;
  }
  const out = new Uint8Array(w * h * 4), max = (1 << Math.min(depth, 8)) - 1;
  const sample = (line, i) => depth === 16 ? line[i * 2] : depth === 8 ? line[i] : (line[(i * depth) >> 3] >> (8 - depth - ((i * depth) & 7))) & max;
  const scale = v => depth >= 8 ? v : Math.round(v * 255 / max);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const L = lines[y], o = (y * w + x) * 4; let r, g, b, a = 255;
    if (ct === 0) { const s = sample(L, x); r = g = b = scale(s); if (trns && trns.length >= 2 && s === (depth === 16 ? trns[0] : trns.readUInt16BE(0))) a = 0; }
    else if (ct === 2) { r = sample(L, x * 3); g = sample(L, x * 3 + 1); b = sample(L, x * 3 + 2); if (trns && trns.length >= 6 && r === (depth === 16 ? trns[0] : trns[1]) && g === (depth === 16 ? trns[2] : trns[3]) && b === (depth === 16 ? trns[4] : trns[5])) a = 0; }
    else if (ct === 3) { const i = sample(L, x); if (!pal || i * 3 + 2 >= pal.length) throw new Error(`${file}: palette index out of range`); r = pal[i * 3]; g = pal[i * 3 + 1]; b = pal[i * 3 + 2]; if (trns && i < trns.length) a = trns[i]; }
    else if (ct === 4) { r = g = b = sample(L, x * 2); a = sample(L, x * 2 + 1); }
    else { r = sample(L, x * 4); g = sample(L, x * 4 + 1); b = sample(L, x * 4 + 2); a = sample(L, x * 4 + 3); }
    out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
  }
  return { w, h, rgba: out };
}
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type, 'latin1'), data]), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
// encodePng writes 8-bit RGBA, non-interlaced, best filter per row (what the game's reader expects). Fully clear pixels are stored as 0,0,0,0.
export function encodePng(w, h, rgba) {
  const st = w * 4, raw = Buffer.alloc(h * (st + 1)), px = Buffer.from(rgba);
  for (let i = 0; i < px.length; i += 4) { if (px[i + 3] < 128) px.writeUInt32LE(0, i); else px[i + 3] = 255; }
  let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) {
    const cur = px.subarray(y * st, (y + 1) * st); let best = null, bestSum = Infinity, bestF = 0;
    for (let f = 0; f < 5; f++) {
      const row = Buffer.alloc(st); let sum = 0;
      for (let x = 0; x < st; x++) {
        const a = x >= 4 ? cur[x - 4] : 0, b = prev[x], c = x >= 4 ? prev[x - 4] : 0;
        let pr = 0; if (f === 1) pr = a; else if (f === 2) pr = b; else if (f === 3) pr = (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        const v = (cur[x] - pr) & 255; row[x] = v; sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = row; bestF = f; }
    }
    raw[y * (st + 1)] = bestF; best.copy(raw, y * (st + 1) + 1); prev = cur;
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9, memLevel: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
