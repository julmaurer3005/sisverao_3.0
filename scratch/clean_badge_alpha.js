const fs = require('fs');
const zlib = require('zlib');

function cleanBadge(srcPath, destPath) {
  const buf = fs.readFileSync(srcPath);
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

  // Flood fill from all 4 borders to clear sky background
  const visited = new Uint8Array(width * height);
  const queue = [];
  function push(x, y) {
    if (x >= 0 && x < width && y >= 0 && y < height && !visited[y * width + x]) {
      visited[y * width + x] = 1;
      queue.push(x, y);
    }
  }

  // push border pixels
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];

    // White border has r > 240, g > 240, b > 240
    // Green inside has g > 110, r < 60
    const isWhite = r > 242 && g > 242 && b > 242;
    const isGreen = g > 110 && r < 80;

    if (!isWhite && !isGreen) {
      // It's sky or shadow outside the white border: make transparent!
      pixels[idx + 3] = 0;
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
    }
  }

  // Encode back to PNG
  const outRaw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    outRaw[y * stride] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        outRaw[y * stride + 1 + x * 4 + c] = pixels[(y * width + x) * 4 + c];
      }
    }
  }

  const deflated = zlib.deflateSync(outRaw);
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // calculate CRC
    const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const chunks = [
    pngHeader,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  fs.writeFileSync(destPath, Buffer.concat(chunks));
  console.log('Successfully cleaned badge and saved to', destPath);
}

// Simple CRC32
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

cleanBadge(
  'C:/Users/USER/.gemini/antigravity-ide/brain/301e9db2-4f4e-4169-9600-d60941c6e38f/.user_uploaded/media_1792794093150.png',
  'c:/Users/USER/Desktop/sisverao/client/public/assets/badge_guaritas_house.png'
);
fs.copyFileSync(
  'c:/Users/USER/Desktop/sisverao/client/public/assets/badge_guaritas_house.png',
  'c:/Users/USER/Desktop/sisverao/client/src/assets/badge_guaritas_house.png'
);
