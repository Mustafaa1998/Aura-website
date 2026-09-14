// Converts the 240 source JPG frames to WebP in two sizes:
//   - desktop: public/frames/aura/frame_XXXX.webp        (2048px wide)
//   - mobile:  public/frames/aura-mobile/frame_XXXX.webp (1152px wide)
// The original JPGs are kept as a fallback. Run: node scripts/convert-frames.mjs
import { mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("public/frames/aura");
const OUT_DESKTOP = SRC; // webp lands next to the jpg
const OUT_MOBILE = path.resolve("public/frames/aura-mobile");

const DESKTOP = { width: 2048, quality: 80, effort: 4 };
const MOBILE = { width: 1152, quality: 74, effort: 4 };
const CONCURRENCY = 6;

async function main() {
  await mkdir(OUT_MOBILE, { recursive: true });
  const files = (await readdir(SRC)).filter((f) => f.endsWith(".jpg")).sort();
  if (files.length === 0) {
    console.error("No .jpg frames found in", SRC);
    process.exit(1);
  }
  console.log(`Converting ${files.length} frames → WebP (desktop ${DESKTOP.width}px, mobile ${MOBILE.width}px)`);

  let done = 0;
  const runOne = async (file) => {
    const base = file.replace(/\.jpg$/, ".webp");
    const input = path.join(SRC, file);
    const dOut = path.join(OUT_DESKTOP, base);
    const mOut = path.join(OUT_MOBILE, base);

    await sharp(input).resize({ width: DESKTOP.width, withoutEnlargement: true })
      .webp({ quality: DESKTOP.quality, effort: DESKTOP.effort }).toFile(dOut);
    await sharp(input).resize({ width: MOBILE.width, withoutEnlargement: true })
      .webp({ quality: MOBILE.quality, effort: MOBILE.effort }).toFile(mOut);

    done += 1;
    if (done % 24 === 0 || done === files.length) console.log(`  ${done}/${files.length}`);
  };

  // Simple concurrency pool.
  const queue = [...files];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await runOne(queue.shift());
  });
  await Promise.all(workers);

  // Report size savings.
  const dirSize = async (dir, ext) => {
    let total = 0;
    for (const f of await readdir(dir)) {
      if (ext && !f.endsWith(ext)) continue;
      total += (await stat(path.join(dir, f))).size;
    }
    return total;
  };
  const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";
  console.log("\nSizes:");
  console.log("  JPG (source):    ", mb(await dirSize(SRC, ".jpg")));
  console.log("  WebP desktop:    ", mb(await dirSize(OUT_DESKTOP, ".webp")));
  console.log("  WebP mobile:     ", mb(await dirSize(OUT_MOBILE, ".webp")));
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
