# LLM Benchmark

Performance & Accuracy Benchmarking Tool for Large Language Models via OpenRouter.

## Features

- 🚀 Latency measurement (TTFT, TBT, total time)
- 🎯 Response quality assessment
- 📊 Interactive dashboard with charts
- 🔄 Multi-model comparison
- 📝 Automated test sequences

## Models

Tested by default:
- Anthropic Claude Opus 4.6
- OpenAI GPT-4o / ChatGPT 5.3
- Google Gemini 2.5 Pro
- Meta Llama 3.3 70B
- Mistral Large 2
- Qwen 2.5 72B

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local`:

```
OPENROUTER_API_KEY=your_api_key
```

## Usage

### Run benchmark
```bash
npm run benchmark
```

### Quick test (1 prompt per model)
```bash
npm run benchmark:quick
```

### Start dashboard
```bash
npm run dev
```

## Test Sequence

The benchmarks cover:
1. **Reasoning** - Logical deductions
2. **Coding** - Code generation & debugging
3. **Creative Writing** - Creative writing tasks
4. **Factual Knowledge** - Knowledge queries
5. **Translation** - Language translation
6. **Summarization** - Text summarization

## Results

Results are saved to `results/` and visualized in the dashboard.
