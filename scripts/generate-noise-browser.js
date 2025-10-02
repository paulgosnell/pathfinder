const fs = require('fs');
const path = require('path');

// Create a base64 encoded PNG with subtle noise
const width = 200;
const height = 200;
const header = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // "IHDR" 
  0x00, 0x00, 0x00, 0xc8, // width (200)
  0x00, 0x00, 0x00, 0xc8, // height (200)
  0x08, // bit depth
  0x06, // color type (RGBA)
  0x00, // compression method
  0x00, // filter method
  0x00, // interlace method
  0x00, 0x00, 0x00, 0x00, // CRC (placeholder)
]);

// Generate IDAT chunk with noise
let pixelData = Buffer.alloc(width * height * 4 + height); // RGBA data + filter byte per row

// Fill with noise
for (let y = 0; y < height; y++) {
  pixelData[y * (width * 4 + 1)] = 0; // Filter byte (none)
  for (let x = 0; x < width; x++) {
    const offset = y * (width * 4 + 1) + x * 4 + 1;
    // Very subtle noise
    const noise = Math.floor(Math.random() * 10);
    
    // RGBA: White with some transparency
    pixelData[offset] = 255; // R
    pixelData[offset + 1] = 255; // G
    pixelData[offset + 2] = 255; // B
    pixelData[offset + 3] = noise; // A (very subtle noise)
  }
}

// Create a simpler noise texture
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Fill with very subtle noise
for (let x = 0; x < 200; x++) {
  for (let y = 0; y < 200; y++) {
    const value = Math.random() * 0.03; // Very subtle noise
    ctx.fillStyle = `rgba(0, 0, 0, ${value})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

// Export as base64 data URL
const dataURL = canvas.toDataURL('image/png');
console.log(dataURL);

fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'textures', 'noise.png'), 
  Buffer.from(dataURL.split(',')[1], 'base64')
);

console.log('Noise texture created at public/textures/noise.png');