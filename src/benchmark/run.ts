import { BenchmarkRunner } from "./runner";

const args = process.argv.slice(2);
const quick = args.includes("--quick");

if (!process.env.OPENROUTER_API_KEY) {
  console.error("❌ OPENROUTER_API_KEY environment variable required");
  console.log("\nSet it with:");
  console.log("  export OPENROUTER_API_KEY=your_key_here");
  process.exit(1);
}

console.log("🚀 LLM Benchmark Tool");
console.log("====================\n");

const runner = new BenchmarkRunner({ quick });

runner.run()
  .then(() => {
    runner.printSummary();
    const filepath = runner.saveResults();
    console.log(`\n📊 View results in the dashboard: npm run dev`);
    console.log(`   Then open http://localhost:3000/results`);
  })
  .catch(err => {
    console.error("\n❌ Benchmark failed:", err);
    process.exit(1);
  });
