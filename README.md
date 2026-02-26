# LLM Benchmark

Performance & Accuracy Benchmarking Tool for Large Language Models via OpenRouter.

## Features

- Latency measurement (TTFT, TBT, total time)
- LLM-as-judge quality evaluation (Claude Haiku)
- Interactive dashboard with charts and heatmaps
- Multi-model comparison across prompt categories
- Context injection benchmark for agentic tool-calling scenarios

## Models

Tested by default (configurable in `src/benchmark/config.ts`):

| Tier | Models |
|------|--------|
| Frontier | GPT-5.3-Codex, GPT-5.2 Chat, Claude Opus 4/4.6, Gemini 3.1 Pro |
| Production | Claude Sonnet 4/4.6, Kimi K2.5, MiniMax M2.5, Mistral Large |
| Budget | Gemini 3 Flash, DeepSeek V3.2 |

## Installation

```bash
pnpm install
```

## Configuration

Create a `.env.local`:

```
OPENROUTER_API_KEY=your_api_key
```

Get a key at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

## Usage

### Standard Benchmark

Runs all models against all prompts, measures latency and quality:

```bash
# Full benchmark (all models x all prompts)
pnpm run benchmark

# Quick test (first 3 prompts only)
pnpm run benchmark:quick
```

### Context Injection Benchmark

Compares system prompt context strategies for agentic tool-calling with a mock Ordio workspace. Tests whether pre-loading workspace data into the system prompt reduces tool calls, iterations, and response time.

**4 strategies**: `baseline` (no context), `light` (~500 tokens), `full` (~3000 tokens), `summary` (~800 tokens)

**6 queries**: German workforce management tasks ranging from info retrieval to shift creation

```bash
# Full context benchmark (4 strategies x 6 queries x 3 runs = 72 runs)
pnpm run benchmark:context

# Quick mode (1 run per combo = 24 runs)
pnpm run benchmark:context -- --quick

# Test with a different model
pnpm run benchmark:context -- --quick --model mistralai/mistral-large-2512
```

### Dashboard

```bash
pnpm run dev
```

- `/results` — Standard benchmark results (latency, quality, heatmaps)
- `/context-results` — Context benchmark results (strategy comparison, tool call analysis, cost breakdown)
- `/prompts` — Test prompt overview
- `/benchmark` — Setup guide

## Test Categories

### Standard Benchmark
1. **FAQ** — Customer support responses
2. **Empathy** — Handling frustrated customers
3. **Reasoning** — Logical deductions
4. **Coding** — Code generation
5. **Creative Writing** — Creative writing tasks
6. **Factual Knowledge** — Knowledge queries
7. **Translation** — English to German
8. **Summarization** — Text summarization

### Context Benchmark
1. "Wer arbeitet morgen?" — Schedule lookup
2. "Zeige mir alle Mitarbeiter in Berlin" — Employee filtering
3. "Wie viele offene Schichten diese Woche?" — Open shift counting
4. "Erstelle Schichten fur alle nächsten Montag" — Shift creation (action)
5. "Schicke eine Nachricht an alle im Service" — Broadcast (action)
6. "Unterschied Minijob vs Vollzeit?" — General knowledge (no tools)

## Results

Results are saved as JSON to `results/` and visualized in the dashboard. Files are gitignored.

- `benchmark-{timestamp}.json` — Standard benchmark results
- `context-benchmark-{timestamp}.json` — Context benchmark results

## Architecture

```
src/
  benchmark/
    config.ts          — Model definitions, prompt sets, shared types
    runner.ts          — Standard benchmark runner (streaming, TTFT/TBT)
    run.ts             — CLI entry point for standard benchmark
    context-config.ts  — Mock workspace, tools, strategies, queries
    context-runner.ts  — Agentic loop runner with function calling
    context-run.ts     — CLI entry point for context benchmark
  app/
    results/           — Standard results page (SSR)
    context-results/   — Context results page (SSR)
    benchmark/         — Setup guide page
    prompts/           — Prompt overview page
  components/
    ResultsDashboard.tsx   — Standard benchmark charts
    ContextDashboard.tsx   — Context benchmark charts
```
