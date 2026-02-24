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
];

export const QUICK_PROMPTS = SUPPORT_PROMPTS.slice(0, 1);
export const FULL_PROMPTS = SUPPORT_PROMPTS;
export const COMBINED_PROMPTS = [...SUPPORT_PROMPTS, ...GENERAL_PROMPTS];
