import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Remove bun lockfile so npm takes over
const bunLock = resolve(root, "bun.lockb");
if (existsSync(bunLock)) {
  unlinkSync(bunLock);
  console.log("Removed bun.lockb");
}

// Generate a fresh package-lock.json
console.log("Running npm install to generate package-lock.json...");
try {
  execSync("npm install --package-lock-only --ignore-scripts", {
    cwd: root,
    stdio: "inherit",
  });
  console.log("package-lock.json generated successfully.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
