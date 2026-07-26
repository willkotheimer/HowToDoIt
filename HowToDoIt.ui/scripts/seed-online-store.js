// One-off: compress the Online Store source photos (images-seeds4/40x-y.png,
// already named by seed code) → public/seed/40x-y.jpg at 1000px wide, ~72 quality
// to match the existing seed set. Re-run after replacing any source PNG.
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../images-seeds4');
const OUT = path.resolve(__dirname, '../public/seed');

(async () => {
  const files = fs.readdirSync(SRC).filter((f) => /^40\d-\d\.png$/.test(f)).sort();
  for (const file of files) {
    const code = path.basename(file, '.png');
    const img = await Jimp.read(path.join(SRC, file));
    if (img.bitmap.width > 1000) img.resize(1000, Jimp.AUTO);
    img.quality(72);
    const dest = path.join(OUT, `${code}.jpg`);
    await img.writeAsync(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${code}.jpg  ${img.bitmap.width}x${img.bitmap.height}  ${kb}KB`);
  }
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
