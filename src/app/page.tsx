import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: "60px", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
          🏆 LLM Benchmark
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>
          Performance & Accuracy Testing for Large Language Models
        </p>
      </header>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        marginBottom: "60px"
      }}>
        <Card
          title="🚀 Run Benchmark"
          description="Execute benchmarks against multiple LLMs via OpenRouter"
          href="/benchmark"
        />
        <Card
          title="📊 View Results"
          description="Interactive dashboard with charts and comparisons"
          href="/results"
        />
        <Card
          title="📋 Test Prompts"
          description="View all test cases and their categories"
          href="/prompts"
        />
      </div>

      <section style={{ 
        background: "#f5f5f5", 
        padding: "30px", 
        borderRadius: "10px",
        marginBottom: "40px"
      }}>
        <h2>📦 Tested Models</h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginTop: "20px"
        }}>
          {[
            { name: "Claude Opus 4.6", provider: "Anthropic", color: "#d4a574" },
            { name: "GPT-4o Latest", provider: "OpenAI", color: "#74aa9c" },
            { name: "Gemini 2.5 Pro", provider: "Google", color: "#4285f4" },
            { name: "Llama 3.3 70B", provider: "Meta", color: "#0081fb" },
            { name: "Mistral Large 2", provider: "Mistral", color: "#fd7e14" },
            { name: "Qwen 2.5 72B", provider: "Alibaba", color: "#ff6a00" },
            { name: "DeepSeek V3", provider: "DeepSeek", color: "#4d6bfa" },
          ].map((model) => (
            <div 
              key={model.name}
              style={{
                background: "white",
                padding: "15px",
                borderRadius: "8px",
                borderLeft: `4px solid ${model.color}`
              }}
            >
              <strong>{model.name}</strong>
              <br />
              <span style={{ fontSize: "0.9rem", color: "#666" }}>{model.provider}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ 
        background: "#f5f5f5", 
        padding: "30px", 
        borderRadius: "10px" 
      }}>
        <h2>📝 Test Categories</h2>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "20px"
        }}>
          {[
            "Reasoning",
            "Coding",
            "Creative Writing", 
            "Factual Knowledge",
            "Translation",
            "Summarization",
            "Mathematics",
            "Analysis"
          ].map((cat) => (
            <span
              key={cat}
              style={{
                background: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.9rem"
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      <footer style={{ 
        marginTop: "60px", 
        paddingTop: "30px",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        color: "#666"
      }}>
        <p>Built with Next.js • Data from OpenRouter</p>
      </footer>
    </div>
  );
}

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link 
      href={href}
      style={{
        display: "block",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: "#666", marginBottom: 0 }}>{description}</p>
    </Link>
  );
}
