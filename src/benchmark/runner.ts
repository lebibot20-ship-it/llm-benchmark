import OpenAI from "openai";
import { 
  ModelConfig, 
  BenchmarkPrompt, 
  BenchmarkResult,
  MODELS,
  PROMPTS 
} from "./config";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/aduis/llm-benchmark",
    "X-Title": "LLM Benchmark Tool",
  },
});

interface RunOptions {
  quick?: boolean;
  models?: string[];
  outputDir?: string;
}

export class BenchmarkRunner {
  private results: BenchmarkResult[] = [];
  private options: RunOptions;

  constructor(options: RunOptions = {}) {
    this.options = options;
  }

  async run(): Promise<BenchmarkResult[]> {
    const models = MODELS.filter(m => 
      !this.options.models || this.options.models.includes(m.id)
    );
    
    const prompts = this.options.quick 
      ? PROMPTS.slice(0, 3) 
      : PROMPTS;

    console.log(`\n🚀 Starting Benchmark`);
    console.log(`Models: ${models.length} (${models.map(m => m.name).join(", ")})`);
    console.log(`Prompts: ${prompts.length}`);
    console.log(`Total runs: ${models.length * prompts.length}\n`);

    for (const model of models) {
      console.log(`\n📦 Testing: ${model.name}`);
      
      for (const prompt of prompts) {
        try {
          const result = await this.runSingle(model, prompt);
          this.results.push(result);
          
          // Progress indicator
          process.stdout.write(".");
          
          // Small delay to avoid rate limits
          await this.delay(500);
        } catch (error) {
          console.error(`\n❌ Error with ${model.name} - ${prompt.name}:`, error);
          this.results.push({
            model,
            prompt,
            response: `ERROR: ${error}`,
            metrics: {
              ttft: 0,
              tbt: 0,
              totalTime: 0,
              tokensIn: 0,
              tokensOut: 0,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    console.log("\n\n✅ Benchmark complete!");
    return this.results;
  }

  private async runSingle(
    model: ModelConfig,
    prompt: BenchmarkPrompt
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();
    let firstTokenTime: number | null = null;
    let lastTokenTime = startTime;
    let tokenCount = 0;
    let response = "";

    const stream = await openai.chat.completions.create({
      model: model.openRouterId,
      messages: [{ role: "user", content: prompt.prompt }],
      max_tokens: prompt.maxTokens || 1000,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      response += content;
      
      const now = Date.now();
      
      if (content && firstTokenTime === null) {
        firstTokenTime = now;
      }
      
      if (content) {
        tokenCount++;
        lastTokenTime = now;
      }
    }

    const endTime = Date.now();
    
    // Calculate metrics
    const ttft = firstTokenTime ? firstTokenTime - startTime : 0;
    const totalTime = endTime - startTime;
    const tbt = tokenCount > 1 ? (totalTime - ttft) / (tokenCount - 1) : 0;

    return {
      model,
      prompt,
      response,
      metrics: {
        ttft,
        tbt,
        totalTime,
        tokensIn: prompt.prompt.length / 4, // Rough estimate
        tokensOut: tokenCount,
      },
      timestamp: new Date().toISOString(),
    };
  }

  saveResults(outputDir = "./results"): string {
    const fs = require("fs");
    const path = require("path");
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `benchmark-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const data = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalRuns: this.results.length,
        models: [...new Set(this.results.map(r => r.model.name))],
        prompts: [...new Set(this.results.map(r => r.prompt.name))],
      },
      results: this.results,
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Results saved to: ${filepath}`);
    
    return filepath;
  }

  printSummary(): void {
    console.log("\n" + "=".repeat(80));
    console.log("BENCHMARK SUMMARY");
    console.log("=".repeat(80));

    // Group by model
    const byModel = this.groupBy(this.results, r => r.model.id);
    
    for (const [modelId, results] of Object.entries(byModel)) {
      const model = results[0].model;
      const avgTtft = results.reduce((s, r) => s + r.metrics.ttft, 0) / results.length;
      const avgTotal = results.reduce((s, r) => s + r.metrics.totalTime, 0) / results.length;
      const avgTokens = results.reduce((s, r) => s + r.metrics.tokensOut, 0) / results.length;

      console.log(`\n${model.name} (${model.provider})`);
      console.log(`  TTFT (avg): ${avgTtft.toFixed(0)}ms`);
      console.log(`  Total (avg): ${avgTotal.toFixed(0)}ms`);
      console.log(`  Tokens (avg): ${avgTokens.toFixed(0)}`);
    }

    console.log("\n" + "=".repeat(80));
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY environment variable required");
    console.log("\nSet it with:");
    console.log("  export OPENROUTER_API_KEY=your_key_here");
    process.exit(1);
  }

  const runner = new BenchmarkRunner({ quick });
  
  runner.run().then(() => {
    runner.printSummary();
    runner.saveResults();
  }).catch(err => {
    console.error("Benchmark failed:", err);
    process.exit(1);
  });
}
