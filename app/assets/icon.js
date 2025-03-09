const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const sourceIcon = path.join(__dirname, 'icon.png');
  
  // Generate .icns for macOS
  await sharp(sourceIcon)
    .resize(1024, 1024)
    .toFile(path.join(__dirname, 'icon.icns'));
  
  // Generate .ico for Windows
  await sharp(sourceIcon)
    .resize(256, 256)
    .toFile(path.join(__dirname, 'icon.ico'));
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
