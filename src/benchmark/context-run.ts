import { readFileSync } from "fs";
import { join } from "path";
import { ContextBenchmarkRunner } from "./context-runner";

// Load .env.local (tsx doesn't auto-load it like Next.js does)
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = value;
  }
} catch {}

const args = process.argv.slice(2);
const quick = args.includes("--quick");

// Parse --model flag (e.g. --model mistralai/mistral-large-2512)
const modelIdx = args.indexOf("--model");
const model = modelIdx !== -1 && args[modelIdx + 1] ? args[modelIdx + 1] : undefined;

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY environment variable required");
  console.log("\nSet it with:");
  console.log("  export OPENROUTER_API_KEY=your_key_here");
  process.exit(1);
}

console.log("Context Injection Benchmark");
console.log("===========================\n");
console.log(`Comparing 4 context strategies with ${model || "GPT-5.2"} + mock Ordio tools`);
if (quick) {
  console.log("Mode: QUICK (1 run per combination)");
} else {
  console.log("Mode: FULL (3 runs per combination)");
}

const runner = new ContextBenchmarkRunner({ quick, model });

runner.run()
  .then(() => {
    runner.printSummary();
    const filepath = runner.saveResults();
    console.log(`\nView results in the dashboard: npm run dev`);
    console.log(`Then open http://localhost:3000/context-results`);
  })
  .catch(err => {
    console.error("\nBenchmark failed:", err);
    process.exit(1);
  });
