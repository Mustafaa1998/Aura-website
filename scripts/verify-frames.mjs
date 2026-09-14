import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "frames", "aura");
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".jpg")).sort();
if (files.length !== 240) {
  console.error(`Expected 240 frames, found ${files.length}.`);
  process.exit(1);
}
for (let i = 1; i <= 240; i++) {
  const expected = `frame_${String(i).padStart(4, "0")}.jpg`;
  if (files[i - 1] !== expected) {
    console.error(`Missing or misnamed frame: ${expected}`);
    process.exit(1);
  }
}
console.log("✓ 240 AURA frames verified.");
