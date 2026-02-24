# LLM Benchmark

Performance & Accuracy Benchmarking Tool für Large Language Models via OpenRouter.

## Features

- 🚀 Latenz-Messung (TTFT, TBT, Gesamtzeit)
- 🎯 Qualitätsbewertung der Antworten
- 📊 Interaktives Dashboard mit Charts
- 🔄 Vergleich mehrerer Modelle
- 📝 Automatisierte Testsequenzen

## Modelle

Standardmäßig werden getestet:
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

## Konfiguration

Erstelle eine `.env.local`:

```
OPENROUTER_API_KEY=dein_api_key
```

## Nutzung

### Benchmark ausführen
```bash
npm run benchmark
```

### Schneller Test (1 Prompt pro Modell)
```bash
npm run benchmark:quick
```

### Dashboard starten
```bash
npm run dev
```

## Test-Sequenz

Die Benchmarks umfassen:
1. **Reasoning** - Logische Schlussfolgerungen
2. **Coding** - Code-Generierung & Debugging
3. **Creative Writing** - Kreatives Schreiben
4. **Factual Knowledge** - Faktenwissen
5. **Translation** - Übersetzungen
6. **Summarization** - Zusammenfassungen

## Ergebnisse

Ergebnisse werden in `results/` gespeichert und im Dashboard visualisiert.
