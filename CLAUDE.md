# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM benchmarking tool that compares performance across multiple models via the OpenRouter API. Has two parts: a CLI benchmark runner and a Next.js dashboard for viewing results.

## Commands

```bash
# Run dev server (dashboard at http://localhost:3000)
npm run dev

# Run full benchmark (all models × all prompts)
npm run benchmark

# Run quick benchmark (first 3 prompts only)
npm run benchmark:quick

# Build for production
npm run build
```

Benchmarks require `OPENROUTER_API_KEY` set in environment or `.env.local`.

## Architecture

**Two separate entry points:**

1. **CLI Benchmark** (`src/benchmark/`) — Runs via `tsx`, not Next.js
   - `run.ts` — CLI entry point, parses args, invokes runner
   - `runner.ts` — `BenchmarkRunner` class: orchestrates model/prompt matrix, streams responses via OpenAI SDK pointed at OpenRouter (`https://openrouter.ai/api/v1`), measures TTFT/TBT/total time
   - `config.ts` — Model definitions (`MODELS`), prompt sets (`SUPPORT_PROMPTS`, `GENERAL_PROMPTS`, `COMBINED_PROMPTS`), TypeScript interfaces (`ModelConfig`, `BenchmarkPrompt`, `BenchmarkResult`)

2. **Next.js Dashboard** (`src/app/`) — App Router, pages at `/`, `/benchmark`, `/results`, `/prompts`
   - `results/page.tsx` — SSR, reads JSON files from `results/` directory (sorted by mtime)
   - `components/ResultsDashboard.tsx` — Client component with Recharts visualizations (latency, throughput, radar comparison tabs)

**Data flow:** CLI saves timestamped JSON to `results/` → Dashboard reads latest file from `results/` at request time.

## Key Technical Details

- OpenAI SDK is used as the API client (OpenRouter is OpenAI-compatible)
- Streaming is used to capture timing metrics: TTFT = time to first token, TBT = average time between tokens
- Input token count is estimated as `prompt.length / 4`
- 500ms delay between requests to avoid rate limits
- Results JSON files are gitignored
- Uses `pnpm` (has `pnpm-lock.yaml`)

## Known Issue

`runner.ts` imports `PROMPTS` from `config.ts`, but that name is not exported. The available exports are `QUICK_PROMPTS`, `FULL_PROMPTS`, and `COMBINED_PROMPTS`.
