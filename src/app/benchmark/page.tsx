"use client";

import { useState } from "react";

export default function BenchmarkPage() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");

  const runBenchmark = async () => {
    setRunning(true);
    setOutput("Starting benchmark...\n");
    
    // This would actually run the benchmark
    // For now, just show instructions
    setOutput(prev => prev + `
To run the benchmark, use the CLI:

npm run benchmark

Or for a quick test:

npm run benchmark:quick

Make sure to set your OpenRouter API key:
export OPENROUTER_API_KEY=your_key_here
    `);
    
    setRunning(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1>🚀 Run Benchmark</h1>
      
      <div style={{ 
        background: "#f5f5f5", 
        padding: "30px", 
        borderRadius: "10px",
        marginTop: "30px"
      }}>
        <h3>CLI Usage</h3>
        
        <pre style={{ 
          background: "#333", 
          color: "#fff",
          padding: "20px",
          borderRadius: "5px",
          overflow: "auto"
        }}>
{`# Set your API key
export OPENROUTER_API_KEY=your_key_here

# Run full benchmark (all models, all prompts)
npm run benchmark

# Quick test (3 prompts only)
npm run benchmark:quick`}
        </pre>

        <h3 style={{ marginTop: "30px" }}>Configuration</h3>
        
        <p>Create a <code>.env.local</code> file:</p>
        
        <pre style={{ 
          background: "#f0f0f0", 
          padding: "15px",
          borderRadius: "5px"
        }}>
OPENROUTER_API_KEY=your_api_key_here
        </pre>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Tested Models</h3>
        <ul>
          {[
            "Anthropic Claude Opus 4.6",
            "OpenAI GPT-4o Latest", 
            "Google Gemini 2.5 Pro",
            "Meta Llama 3.3 70B",
            "Mistral Large 2",
            "Alibaba Qwen 2.5 72B",
            "DeepSeek V3",
          ].map(model => (
            <li key={model}>{model}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
