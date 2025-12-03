const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = __dirname + "/..";

const pathsToDelete = [
  "node_modules",
  "apps/mobile/node_modules",
  "apps/web/node_modules",
  "apps/admin/node_modules",
  "apps/mobile/.expo",
  "apps/mobile/.expo-shared",
  "apps/mobile/.expo-env",
  "apps/mobile/.cache",
  "apps/web/.next",
  "apps/admin/.next"
];

for (const rel of pathsToDelete) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    console.log("Deleting", full);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

console.log("Reinstalling root deps...");
execSync("npm install", { stdio: "inherit" });
