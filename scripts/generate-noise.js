import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Create a 200x200 canvas with noise
const size = 200;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Create noise pattern
for (let x = 0; x < size; x++) {
  for (let y = 0; y < size; y++) {
    // Generate noise value between 0 and 255
    const value = Math.floor(Math.random() * 10); // Low intensity noise
    ctx.fillStyle = `rgba(0, 0, 0, ${value / 255 * 0.03})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

// Write to PNG file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(process.cwd(), 'public', 'textures', 'noise.png'), buffer);

console.log('Noise texture generated successfully!');