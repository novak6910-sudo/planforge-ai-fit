import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";

const root = "/vercel/share/v0-project";

// Remove bun lockfile so npm takes over
const bunLock = `${root}/bun.lockb`;
if (existsSync(bunLock)) {
  unlinkSync(bunLock);
  console.log("Removed bun.lockb");
} else {
  console.log("bun.lockb not found, skipping.");
}

// Remove stale package-lock if present
const npmLock = `${root}/package-lock.json`;
if (existsSync(npmLock)) {
  unlinkSync(npmLock);
  console.log("Removed stale package-lock.json");
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
