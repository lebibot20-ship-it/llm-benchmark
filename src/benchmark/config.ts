export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  openRouterId: string;
  region: "EU" | "US" | "Global";
  strengths: string[];
  recommended?: boolean;
  isNew?: boolean;
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
    ttft: number;
    tbt: number;
    totalTime: number;
    tokensIn: number;
    tokensOut: number;
  };
  timestamp: string;
}

// Latest models from OpenRouter (Feb 2025)
export const MODELS: ModelConfig[] = [
  {
    id: "gpt-5.3-codex",
    name: "GPT-5.3-Codex",
    provider: "OpenAI",
    openRouterId: "openai/gpt-5.3-codex",
    region: "US",
    strengths: ["Advanced coding", "Agentic workflows"],
    isNew: true,
  },
  {
    id: "gpt-5.2-chat",
    name: "GPT-5.2 Chat",
    provider: "OpenAI",
    openRouterId: "openai/gpt-5.2-chat",
    region: "US",
    strengths: ["Conversational", "Long context"],
    isNew: true,
  },
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    openRouterId: "anthropic/claude-opus-4",
    region: "Global",
    strengths: ["Best coding", "Complex reasoning"],
    isNew: true,
  },
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    openRouterId: "anthropic/claude-opus-4.6",
    region: "Global",
    strengths: ["Latest Opus", "Advanced reasoning"],
    isNew: true,
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    openRouterId: "anthropic/claude-sonnet-4",
    region: "Global",
    strengths: ["Balanced", "1M context"],
    isNew: true,
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    provider: "Google",
    openRouterId: "google/gemini-3.1-pro-preview",
    region: "Global",
    strengths: ["Frontier reasoning"],
    isNew: true,
  },
  {
    id: "kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    openRouterId: "moonshotai/kimi-k2.5",
    region: "Global",
    strengths: ["Long context", "Chinese & English", "Coding"],
    isNew: true,
  },
  {
    id: "minimax-m2.5",
    name: "MiniMax M2.5",
    provider: "MiniMax",
    openRouterId: "minimax/minimax-m2.5",
    region: "Global",
    strengths: ["Multilingual", "Reasoning"],
    isNew: true,
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    openRouterId: "anthropic/claude-3.5-sonnet",
    region: "Global",
    strengths: ["Support agent", "German"],
    recommended: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    openRouterId: "openai/gpt-4o",
    region: "US",
    strengths: ["All-rounder", "German"],
    recommended: true,
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    openRouterId: "mistralai/mistral-large",
    region: "EU",
    strengths: ["GDPR", "EU-hosted"],
    recommended: true,
  },
];

export const SUPPORT_PROMPTS: BenchmarkPrompt[] = [
  {
    id: "support-faq-1",
    category: "FAQ",
    name: "Password Reset",
    prompt: `You are a customer support agent.\n\nCustomer asks: "I forgot my password. How can I reset it?"\n\nRespond politely with step-by-step instructions.`,
    maxTokens: 500,
  },
  {
    id: "support-empathy-1",
    category: "Empathy",
    name: "Frustrated Customer",
    prompt: `A frustrated customer writes: "This is the third time your system lost my data! I'm really angry!"\n\nRespond with empathy and offer help.`,
    maxTokens: 500,
  },
];

export const GENERAL_PROMPTS: BenchmarkPrompt[] = [
  {
    id: "reasoning-1",
    category: "Reasoning",
    name: "Logic Puzzle",
    prompt: `A farmer has 17 sheep. All but 9 die. How many sheep remain?`,
    maxTokens: 500,
  },
  {
    id: "coding-1",
    category: "Coding",
    name: "FizzBuzz",
    prompt: `Write a TypeScript function that takes a number n and returns an array of strings from 1 to n where multiples of 3 are "Fizz", multiples of 5 are "Buzz", and multiples of both are "FizzBuzz".`,
    maxTokens: 500,
  },
  {
    id: "creative-writing-1",
    category: "Creative Writing",
    name: "Short Story Opening",
    prompt: `Write the opening paragraph of a mystery short story set in a small coastal town during a winter storm.`,
    maxTokens: 500,
  },
  {
    id: "factual-knowledge-1",
    category: "Factual Knowledge",
    name: "Science Explanation",
    prompt: `Explain how photosynthesis works in 3-4 sentences suitable for a high school student.`,
    maxTokens: 500,
  },
  {
    id: "translation-1",
    category: "Translation",
    name: "English to German",
    prompt: `Translate the following sentence to German: "Could you please help me find the nearest train station? I have a meeting at 3 PM and I don't want to be late."`,
    maxTokens: 500,
  },
  {
    id: "summarization-1",
    category: "Summarization",
    name: "Article Summary",
    prompt: `Summarize the following text in 2-3 sentences:\n\nThe global semiconductor shortage that began in 2020 has had far-reaching effects across multiple industries. Automakers were among the hardest hit, with many forced to halt production lines for weeks at a time. Consumer electronics companies also faced delays, leading to higher prices and longer wait times for products ranging from gaming consoles to smartphones. Governments around the world responded by announcing plans to invest billions in domestic chip manufacturing capacity, aiming to reduce dependence on a handful of Asian fabrication facilities.`,
    maxTokens: 500,
  },
];

export const QUICK_PROMPTS = SUPPORT_PROMPTS.slice(0, 1);
export const FULL_PROMPTS = SUPPORT_PROMPTS;
export const COMBINED_PROMPTS = [...SUPPORT_PROMPTS, ...GENERAL_PROMPTS];
