import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions";
import {
  MOCK_TOOLS,
  MOCK_TOOL_RESPONSES,
  CONTEXT_STRATEGIES,
  CONTEXT_QUERIES,
  ALL_STRATEGIES,
  type ContextStrategy,
  type ContextQuery,
} from "./context-config";
import { JUDGE_MODEL, type QualityScores } from "./config";
import type { ContextBenchmarkRun, ContextBenchmarkResult } from "./config";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || "",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/aduis/llm-benchmark",
        "X-Title": "LLM Context Benchmark",
      },
    });
  }
  return _openai;
}

const DEFAULT_MODEL = "openai/gpt-5.2";
const MAX_ITERATIONS = 15;

interface RunOptions {
  quick?: boolean;
  runsPerQuery?: number;
  strategies?: ContextStrategy[];
  model?: string;
}

export class ContextBenchmarkRunner {
  private runs: ContextBenchmarkRun[] = [];
  private options: RunOptions;

  constructor(options: RunOptions = {}) {
    this.options = options;
  }

  private get model(): string {
    return this.options.model || DEFAULT_MODEL;
  }

  async run(): Promise<ContextBenchmarkResult> {
    const strategies = this.options.strategies || ALL_STRATEGIES;
    const queries = CONTEXT_QUERIES;
    const runsPerQuery = this.options.quick ? 1 : (this.options.runsPerQuery || 3);
    const totalRuns = strategies.length * queries.length * runsPerQuery;

    console.log(`\n--- Context Injection Benchmark ---`);
    console.log(`Model: ${this.model} (via OpenRouter)`);
    console.log(`Strategies: ${strategies.join(", ")}`);
    console.log(`Queries: ${queries.length}`);
    console.log(`Runs per combo: ${runsPerQuery}`);
    console.log(`Total runs: ${totalRuns}\n`);

    let completedRuns = 0;

    for (const strategy of strategies) {
      console.log(`\n[${strategy.toUpperCase()}]`);

      for (const query of queries) {
        for (let runNum = 1; runNum <= runsPerQuery; runNum++) {
          try {
            const result = await this.runSingle(strategy, query, runNum);

            // LLM-as-judge quality evaluation
            const quality = await this.evaluateQuality(query, result.response);
            if (quality) {
              result.quality = quality;
            }

            this.runs.push(result);
            completedRuns++;

            const toolInfo = result.toolCalls.length > 0
              ? ` tools:[${result.toolCalls.join(",")}]`
              : " tools:none";
            process.stdout.write(
              `  ${query.id} #${runNum}: ${result.wallTimeMs}ms, ${result.llmIterations} iters${toolInfo}\n`
            );

            // Rate limit delay
            await this.delay(500);
          } catch (error) {
            console.error(`\n  ERROR ${query.id} #${runNum}:`, error);
            this.runs.push({
              strategy,
              query: query.query,
              queryId: query.id,
              queryCategory: query.category,
              runNumber: runNum,
              wallTimeMs: 0,
              toolCallCount: 0,
              toolCalls: [],
              llmIterations: 0,
              tokensIn: 0,
              tokensOut: 0,
              usedPlanning: false,
              response: `ERROR: ${error}`,
            });
            completedRuns++;
          }
        }
      }
    }

    console.log(`\n\nCompleted ${completedRuns}/${totalRuns} runs.`);

    return {
      metadata: {
        timestamp: new Date().toISOString(),
        model: this.model,
        strategies: strategies,
        queriesCount: queries.length,
        runsPerQuery,
        mockWorkspace: "Muster GmbH",
      },
      runs: this.runs,
    };
  }

  private async runSingle(
    strategy: ContextStrategy,
    query: ContextQuery,
    runNumber: number
  ): Promise<ContextBenchmarkRun> {
    const systemPrompt = CONTEXT_STRATEGIES[strategy];
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query.query },
    ];

    let iterations = 0;
    const toolCalls: string[] = [];
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let usedPlanning = false;
    const startTime = Date.now();

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await getOpenAI().chat.completions.create({
        model: this.model,
        messages,
        tools: MOCK_TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
      });

      // Track token usage
      if (response.usage) {
        totalTokensIn += response.usage.prompt_tokens;
        totalTokensOut += response.usage.completion_tokens;
      }

      const msg = response.choices[0].message;

      // Add assistant message to conversation
      messages.push(msg as ChatCompletionMessageParam);

      // Check if there are tool calls
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        // No tool calls — final response
        break;
      }

      // Execute each tool call
      for (const tc of msg.tool_calls) {
        const toolName = tc.function.name;
        toolCalls.push(toolName);

        if (toolName === "submit_plan") {
          usedPlanning = true;
        }

        // Get mock response
        const handler = MOCK_TOOL_RESPONSES[toolName];
        let result: string;
        if (handler) {
          try {
            const args = JSON.parse(tc.function.arguments || "{}");
            result = handler(args);
          } catch {
            result = JSON.stringify({ error: `Failed to parse arguments for ${toolName}` });
          }
        } else {
          result = JSON.stringify({ error: `Unknown tool: ${toolName}` });
        }

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
    }

    // Extract final response text
    const lastMessage = messages[messages.length - 1];
    const responseText = lastMessage.role === "assistant"
      ? (lastMessage as { content?: string | null }).content || ""
      : "[No final response]";

    return {
      strategy,
      query: query.query,
      queryId: query.id,
      queryCategory: query.category,
      runNumber,
      wallTimeMs: Date.now() - startTime,
      toolCallCount: toolCalls.length,
      toolCalls,
      llmIterations: iterations,
      tokensIn: totalTokensIn,
      tokensOut: totalTokensOut,
      usedPlanning,
      response: responseText,
    };
  }

  private async evaluateQuality(
    query: ContextQuery,
    response: string
  ): Promise<QualityScores | undefined> {
    if (!response || response.startsWith("ERROR:") || response === "[No final response]") {
      return undefined;
    }

    try {
      const judgePrompt = `Rate this AI assistant response on a scale of 1-10 for each dimension.

## User Query (German):
${query.query}

## Context:
The AI assistant helps managers with shift planning in the Ordio workforce management platform.
The query category is: ${query.category}

## Response:
${response}

## Dimensions:
- helpfulness: How useful and actionable is the response for the manager?
- relevance: Does it directly and completely address the query?
- coherence: Is it well-organized, clearly written, and in proper German?
- accuracy: Is the information correct and the task properly completed?

Return ONLY valid JSON: {"helpfulness":N,"relevance":N,"coherence":N,"accuracy":N}`;

      const completion = await getOpenAI().chat.completions.create({
        model: JUDGE_MODEL,
        messages: [{ role: "user", content: judgePrompt }],
        max_tokens: 100,
        temperature: 0,
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) return undefined;

      const jsonMatch = content.match(/\{[^}]+\}/);
      if (!jsonMatch) return undefined;

      const scores = JSON.parse(jsonMatch[0]);

      for (const key of ["helpfulness", "relevance", "coherence", "accuracy"] as const) {
        if (typeof scores[key] !== "number" || scores[key] < 1 || scores[key] > 10) {
          return undefined;
        }
      }

      await this.delay(300);

      return {
        helpfulness: scores.helpfulness,
        relevance: scores.relevance,
        coherence: scores.coherence,
        accuracy: scores.accuracy,
        judgeModel: JUDGE_MODEL,
      };
    } catch (error) {
      console.warn(`\n  [judge failed: ${error}]`);
      return undefined;
    }
  }

  saveResults(outputDir = "./results"): string {
    const fs = require("fs");
    const path = require("path");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `context-benchmark-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const result: ContextBenchmarkResult = {
      metadata: {
        timestamp: new Date().toISOString(),
        model: this.model,
        strategies: this.options.strategies || ALL_STRATEGIES,
        queriesCount: CONTEXT_QUERIES.length,
        runsPerQuery: this.options.quick ? 1 : (this.options.runsPerQuery || 3),
        mockWorkspace: "Muster GmbH",
      },
      runs: this.runs,
    };

    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(`\nResults saved to: ${filepath}`);
    return filepath;
  }

  printSummary(): void {
    console.log("\n" + "=".repeat(90));
    console.log("CONTEXT BENCHMARK SUMMARY");
    console.log("=".repeat(90));

    const strategies = [...new Set(this.runs.map(r => r.strategy))];

    // Header
    console.log(
      "\n" +
      pad("Strategy", 12) +
      pad("Avg Time", 12) +
      pad("Avg Tools", 12) +
      pad("Avg Iters", 12) +
      pad("Avg Tok In", 12) +
      pad("Avg Tok Out", 12) +
      pad("Quality", 10)
    );
    console.log("-".repeat(82));

    for (const strategy of strategies) {
      const strategyRuns = this.runs.filter(r => r.strategy === strategy);
      const validRuns = strategyRuns.filter(r => r.wallTimeMs > 0);
      if (validRuns.length === 0) continue;

      const avgTime = avg(validRuns.map(r => r.wallTimeMs));
      const avgTools = avg(validRuns.map(r => r.toolCallCount));
      const avgIters = avg(validRuns.map(r => r.llmIterations));
      const avgTokIn = avg(validRuns.map(r => r.tokensIn));
      const avgTokOut = avg(validRuns.map(r => r.tokensOut));

      const qualityRuns = validRuns.filter(r => r.quality);
      const avgQuality = qualityRuns.length > 0
        ? avg(qualityRuns.map(r => {
            const q = r.quality!;
            return (q.helpfulness + q.relevance + q.coherence + q.accuracy) / 4;
          }))
        : null;

      console.log(
        pad(strategy, 12) +
        pad(`${Math.round(avgTime)}ms`, 12) +
        pad(avgTools.toFixed(1), 12) +
        pad(avgIters.toFixed(1), 12) +
        pad(Math.round(avgTokIn).toString(), 12) +
        pad(Math.round(avgTokOut).toString(), 12) +
        pad(avgQuality ? `${avgQuality.toFixed(1)}/10` : "-", 10)
      );
    }

    // Per-query breakdown
    console.log("\n\nPER-QUERY TOOL CALLS (avg):");
    console.log("-".repeat(82));
    const queries = [...new Set(this.runs.map(r => r.queryId))];
    const header = pad("Query", 25) + strategies.map(s => pad(s, 12)).join("");
    console.log(header);
    console.log("-".repeat(25 + strategies.length * 12));

    for (const qid of queries) {
      let line = pad(qid, 25);
      for (const strategy of strategies) {
        const runs = this.runs.filter(r => r.queryId === qid && r.strategy === strategy && r.wallTimeMs > 0);
        const avgToolCount = runs.length > 0 ? avg(runs.map(r => r.toolCallCount)) : 0;
        line += pad(avgToolCount.toFixed(1), 12);
      }
      console.log(line);
    }

    console.log("\n" + "=".repeat(90));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}
