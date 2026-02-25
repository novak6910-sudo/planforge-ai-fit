import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import path from "path";

const root = "/vercel/share/v0-project";

console.log("=== NODE VERSION ===");
console.log(process.version);

console.log("\n=== ROOT FILES ===");
console.log(readdirSync(root).join("\n"));

console.log("\n=== CHECKING KEY PACKAGES ===");
const packages = [
  "@vitejs/plugin-react",
  "@vitejs/plugin-react-swc",
  "vite",
  "react",
  "react-dom",
];
for (const pkg of packages) {
  const p = path.join(root, "node_modules", pkg, "package.json");
  console.log(`${pkg}: ${existsSync(p) ? "EXISTS" : "MISSING"}`);
}

console.log("\n=== TRYING VITE BUILD ===");
try {
  const output = execSync("cd /vercel/share/v0-project && npx vite build 2>&1", {
    timeout: 60000,
    encoding: "utf8",
  });
  console.log(output);
} catch (err) {
  console.log("BUILD ERROR:");
  console.log(err.stdout || "");
  console.log(err.stderr || "");
  console.log(err.message || "");
}
