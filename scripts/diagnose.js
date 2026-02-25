import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("=== NODE VERSION ===");
console.log(process.version);

console.log("\n=== PROJECT ROOT ===");
console.log(root);

console.log("\n=== ROOT FILES ===");
try { console.log(readdirSync(root).join("\n")); } catch(e) { console.log("ERROR:", e.message); }

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
  const output = execSync("npx vite build 2>&1", {
    cwd: root,
    timeout: 60000,
    encoding: "utf8",
  });
  console.log(output);
} catch (err) {
  console.log("BUILD STDOUT:", err.stdout || "(empty)");
  console.log("BUILD STDERR:", err.stderr || "(empty)");
  console.log("EXIT CODE:", err.status);
}
