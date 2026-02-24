export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  openRouterId: string;
}

export interface BenchmarkPrompt {
  id: string;
  category: string;
  name: string;
  prompt: string;
  expectedElements?: string[];
  maxTokens?: number;
}

export interface BenchmarkResult {
  model: ModelConfig;
  prompt: BenchmarkPrompt;
  response: string;
  metrics: {
    ttft: number; // Time to first token (ms)
    tbt: number;  // Time between tokens (ms)
    totalTime: number;
    tokensIn: number;
    tokensOut: number;
  };
  quality?: {
    score: number;
    completeness: number;
    accuracy: number;
  };
  timestamp: string;
}

// Modelle, die getestet werden
export const MODELS: ModelConfig[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    openRouterId: "anthropic/claude-opus-4-6-20251101",
  },
  {
    id: "gpt-4o-latest",
    name: "GPT-4o Latest",
    provider: "OpenAI",
    openRouterId: "openai/gpt-4o",
  },
  {
    id: "gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    openRouterId: "google/gemini-2.5-pro-preview-05-06",
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    openRouterId: "meta-llama/llama-3.3-70b-instruct",
  },
  {
    id: "mistral-large-2",
    name: "Mistral Large 2",
    provider: "Mistral",
    openRouterId: "mistralai/mistral-large-2",
  },
  {
    id: "qwen-2-5-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    openRouterId: "qwen/qwen-2.5-72b-instruct",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    openRouterId: "deepseek/deepseek-chat-v3",
  },
];

// Test-Prompts
export const PROMPTS: BenchmarkPrompt[] = [
  {
    id: "reasoning-1",
    category: "Reasoning",
    name: "Logik-Rätsel",
    prompt: `Ein Bauer hat 17 Schafe. Alle sterben außer 9. Wie viele Schafe hat der Bauer jetzt?

Erkläre deine Antwort Schritt für Schritt.`,
    expectedElements: ["9", "achten", "sterben", "überleben"],
    maxTokens: 500,
  },
  {
    id: "coding-1",
    category: "Coding",
    name: "Python Quicksort",
    prompt: `Schreibe eine effiziente Quicksort-Implementierung in Python.

Anforderungen:
- In-place Sortierung (möglichst wenig zusätzlicher Speicher)
- Zeitkomplexität O(n log n) im Durchschnitt
- Enthält type hints
- Mit Docstring und Kommentaren`,
    expectedElements: ["def", "quicksort", "partition", "pivot", "recursive"],
    maxTokens: 800,
  },
  {
    id: "creative-1",
    category: "Creative Writing",
    name: "Kurzgeschichte",
    prompt: `Schreibe einen Kurzgeschichten-Anfang (max. 150 Wörter) über einen Roboter, der in einem verlassenen Café erwacht.

Stil: Melancholisch, aber hoffnungsvoll`,
    expectedElements: ["Roboter", "Café", "verlassen"],
    maxTokens: 600,
  },
  {
    id: "factual-1",
    category: "Factual Knowledge",
    name: "Deutsche Geschichte",
    prompt: `Nenne die Hauptursachen für den Fall der Berliner Mauer im Jahr 1989.

Gib mindestens 3 konkrete Faktoren an und erkläre kurz deren Bedeutung.`,
    expectedElements: ["1989", "Mauer", "DDR", "Proteste", "Gorbatschow"],
    maxTokens: 600,
  },
  {
    id: "translation-1",
    category: "Translation",
    name: "Technische Übersetzung",
    prompt: `Übersetze folgenden technischen Text ins Deutsche:

"The API implements rate limiting using a token bucket algorithm. Each client is allocated a fixed number of tokens per minute. When a request is made, a token is consumed. If no tokens remain, the request is queued or rejected with a 429 status code."`,
    expectedElements: ["API", "Rate Limiting", "Token", "Algorithmus"],
    maxTokens: 400,
  },
  {
    id: "summary-1",
    category: "Summarization",
    name: "Text-Zusammenfassung",
    prompt: `Fasse folgenden Text in 3 Sätzen zusammen:

"Künstliche Intelligenz hat in den letzten Jahren enorme Fortschritte gemacht. Besonders Large Language Models wie GPT-4, Claude und Gemini können heute komplexe Aufgaben bewältigen, die noch vor wenigen Jahren als unmöglich galten. Diese Modelle werden trainiert, indem sie riesige Mengen an Textdaten analysieren und Muster in der Sprache erlernen. Die Anwendungsbereiche sind vielfältig: von automatischer Textübersetzung über Code-Generierung bis hin zu medizinischer Diagnostik. Kritiker warnen jedoch vor potenziellen Risiken wie Fehlinformationen, Urheberrechtsverletzungen und dem Verlust von Arbeitsplätzen."`,
    expectedElements: ["KI", "LLM", "Anwendungen", "Risiken"],
    maxTokens: 400,
  },
  {
    id: "math-1",
    category: "Mathematics",
    name: "Berechnung",
    prompt: `Berechne: Wie viele Möglichkeiten gibt es, aus einer Gruppe von 10 Personen ein Team von 4 Personen auszuwählen?

Zeige den Rechenweg mit der Binomialkoeffizienten-Formel.`,
    expectedElements: ["210", "C(10,4)", "10!", "4!", "6!"],
    maxTokens: 500,
  },
  {
    id: "analysis-1",
    category: "Analysis",
    name: "Stärken-/Schwächen-Analyse",
    prompt: `Vergleiche die Stärken und Schwächen von Python und JavaScript für Backend-Entwicklung.

Strukturiere deine Antwort in:
1. Python Stärken
2. Python Schwächen  
3. JavaScript Stärken
4. JavaScript Schwächen
5. Fazit: Wann welche Sprache?`,
    expectedElements: ["Python", "JavaScript", "Backend", "Node.js", "Django"],
    maxTokens: 800,
  },
];

// Schnelle Test-Sequenz (nur 3 Prompts)
export const QUICK_PROMPTS = PROMPTS.slice(0, 3);
