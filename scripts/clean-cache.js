const fs = require("fs");
const path = require("path");

const root = __dirname + "/..";

const cachePaths = [
  "apps/mobile/.expo",
  "apps/mobile/.cache",
  "apps/mobile/node_modules/.cache",
  "apps/web/.next",
  "apps/admin/.next",
  "node_modules/.cache",
  ".turbo"
];

console.log("🧹 Limpiando cachés...");

for (const rel of cachePaths) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    console.log(`   Borrando ${rel}`);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

console.log("✅ Cachés limpiados");
