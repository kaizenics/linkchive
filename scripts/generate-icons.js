const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "..", "public", "icons");

function createSimpleIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#000000"/>
    <g transform="translate(${size * 0.25}, ${size * 0.25})">
      <rect x="${size * 0.09375}" y="${size * 0.1875}" width="${size * 0.0625}" height="${size * 0.1875}" rx="${size * 0.03125}" fill="#ffffff" transform="rotate(-45 ${size * 0.125} ${size * 0.28125})"/>
      <rect x="${size * 0.34375}" y="${size * 0.1875}" width="${size * 0.0625}" height="${size * 0.1875}" rx="${size * 0.03125}" fill="#ffffff" transform="rotate(45 ${size * 0.375} ${size * 0.28125})"/>
      <rect x="${size * 0.21875}" y="${size * 0.25}" width="${size * 0.0625}" height="${size * 0.0625}" rx="${size * 0.03125}" fill="#ffffff"/>
    </g>
  </svg>`;
  
  return svg;
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const iconContent = createSimpleIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, iconContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log("Icon generation completed! Note: These are SVG files.");
console.log(
  "For production, consider using proper PNG files generated from your design."
);
