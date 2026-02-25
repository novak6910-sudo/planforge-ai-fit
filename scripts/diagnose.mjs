import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";

console.log("=== Project Structure ===");
console.log("Files in root:", readdirSync("/vercel/share/v0-project").join(", "));
console.log("Files in src:", readdirSync("/vercel/share/v0-project/src").join(", "));

console.log("\n=== Node version ===");
console.log(process.version);

console.log("\n=== Checking node_modules ===");
const hasSWC = existsSync("/vercel/share/v0-project/node_modules/@vitejs/plugin-react-swc");
const hasReact = existsSync("/vercel/share/v0-project/node_modules/@vitejs/plugin-react");
console.log("Has plugin-react-swc:", hasSWC);
console.log("Has plugin-react:", hasReact);

console.log("\n=== Checking package-lock / yarn.lock / pnpm-lock ===");
console.log("package-lock.json:", existsSync("/vercel/share/v0-project/package-lock.json"));
console.log("yarn.lock:", existsSync("/vercel/share/v0-project/yarn.lock"));
console.log("pnpm-lock.yaml:", existsSync("/vercel/share/v0-project/pnpm-lock.yaml"));
console.log("bun.lockb:", existsSync("/vercel/share/v0-project/bun.lockb"));

console.log("\n=== Attempting vite build with verbose output ===");
try {
  const output = execSync("cd /vercel/share/v0-project && npx vite build --debug 2>&1", { timeout: 30000 }).toString();
  console.log("Build output:", output.slice(0, 3000));
} catch (e) {
  console.log("Build error:", e.stdout?.toString().slice(0, 3000));
  console.log("Build stderr:", e.stderr?.toString().slice(0, 3000));
  console.log("Error message:", e.message?.slice(0, 1000));
}
