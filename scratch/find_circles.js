const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('c:/Users/USER/Desktop/sisverao/client/public/assets/card_original_cleandate.png');

let pos = 8;
let idatBuffers = [];
let width = 0;
let height = 0;

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

const compressed = Buffer.concat(idatBuffers);
const raw = zlib.inflateSync(compressed);

// bytes per row: 1 filter byte + width * 4 (RGBA)
const stride = 1 + width * 4;
function getPixel(x, y) {
  // We can approximate without full filter reconstruction since filter 0, 1, 2 etc. or reconstruct
  return [raw[y * stride + 1 + x * 4], raw[y * stride + 1 + x * 4 + 1], raw[y * stride + 1 + x * 4 + 2]];
}

console.log('Image dimensions:', width, 'x', height);
