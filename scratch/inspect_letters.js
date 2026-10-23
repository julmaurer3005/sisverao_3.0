const fs = require('fs');
const zlib = require('zlib');

// Parse PNG without external dependencies
function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let idatBuffers = [];
  let width = 0, height = 0;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatBuffers.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idatBuffers));
  const stride = 1 + width * 4;
  const pixels = Buffer.alloc(width * height * 4);

  // Unfilter
  for (let y = 0; y < height; y++) {
    const filterType = raw[y * stride];
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        const rawIdx = y * stride + 1 + x * 4 + c;
        const outIdx = (y * width + x) * 4 + c;
        let val = raw[rawIdx];
        const a = x > 0 ? pixels[(y * width + (x - 1)) * 4 + c] : 0;
        const b = y > 0 ? pixels[((y - 1) * width + x) * 4 + c] : 0;
        const cVal = (x > 0 && y > 0) ? pixels[((y - 1) * width + (x - 1)) * 4 + c] : 0;
        if (filterType === 1) val = (val + a) & 0xff;
        else if (filterType === 2) val = (val + b) & 0xff;
        else if (filterType === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
        else if (filterType === 4) {
          const p = a + b - cVal;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - cVal);
          let pr;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = b;
          else pr = cVal;
          val = (val + pr) & 0xff;
        }
        pixels[outIdx] = val;
      }
    }
  }
  return { width, height, pixels };
}

const img = decodePNG('c:/Users/USER/Desktop/sisverao/client/public/assets/original_logo_crop.png');

function getPixel(x, y) {
  const idx = (y * img.width + x) * 4;
  return [img.pixels[idx], img.pixels[idx+1], img.pixels[idx+2], img.pixels[idx+3]];
}

// Find 'a' bounds
let minX = 999, maxX = 0, minY = 999, maxY = 0;
for (let y = 35; y < 85; y++) {
  for (let x = 160; x < 210; x++) {
    const [r, g, b] = getPixel(x, y);
    if (r > 200 && b < 60) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`Letter 'a': X from ${minX} to ${maxX}, Y from ${minY} to ${maxY}`);

// Find 'OPERAÇÃO'
minX = 999; maxX = 0; minY = 999; maxY = 0;
for (let y = 35; y < 85; y++) {
  for (let x = 210; x < 450; x++) {
    const [r, g, b] = getPixel(x, y);
    if (r > 200 && b < 60) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`'OPERAÇÃO': X from ${minX} to ${maxX}, Y from ${minY} to ${maxY}`);
