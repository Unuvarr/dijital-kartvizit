// PWA ikonlarini brand gradient'i + stilize "K" ile uretir.
// Calistir: node scripts/generate-icons.mjs
import sharp from "sharp";

const PUBLIC = new URL("../public/", import.meta.url);
const toFs = (name) => new URL(name, PUBLIC).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const GRAD = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>`;

/** "any" purpose: yuvarlatilmis kose, K orta-buyuk. iOS/desktop iyi gorur. */
function svgAny(size) {
  const r = size * 0.22;
  const fontSize = size * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${GRAD}
  <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
        font-weight="700" font-size="${fontSize}" fill="#ffffff"
        letter-spacing="-0.04em">K</text>
</svg>`;
}

/** "maskable" purpose: tam kenar-kenar gradient, K %80 safe zone icinde. */
function svgMaskable(size) {
  const fontSize = size * 0.5; // %80 safe zone'da kalir
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${GRAD}
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
        font-weight="700" font-size="${fontSize}" fill="#ffffff"
        letter-spacing="-0.04em">K</text>
</svg>`;
}

async function render(svg, outPath, size) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log("✓", outPath);
}

await render(svgAny(192), toFs("icon-192.png"), 192);
await render(svgAny(512), toFs("icon-512.png"), 512);
await render(svgMaskable(512), toFs("icon-maskable-512.png"), 512);
await render(svgAny(32), toFs("icon-32.png"), 32);
console.log("Bitti.");
