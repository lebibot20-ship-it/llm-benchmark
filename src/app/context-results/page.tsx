import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { ContextBenchmarkResult } from "../../benchmark/config";
import ContextDashboard from "../../components/ContextDashboard";

function loadLatestContextResults(): ContextBenchmarkResult | null {
  const resultsDir = join(process.cwd(), "results");

  try {
    const files = readdirSync(resultsDir)
      .filter(f => f.startsWith("context-benchmark-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const latestFile = join(resultsDir, files[0]);
    const data = JSON.parse(readFileSync(latestFile, "utf-8"));
    return data;
  } catch {
    return null;
  }
}

export default function ContextResultsPage() {
  const data = loadLatestContextResults();

  if (!data) {
    return (
      <div className="page" style={{ maxWidth: 600, textAlign: "center", paddingTop: 80 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(139, 92, 246, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "1.5rem",
        }}>
          ?
        </div>
        <h1 className="page-title" style={{ textAlign: "center" }}>No Context Benchmark Results</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: "0.95rem", lineHeight: 1.5 }}>
          Run the context injection benchmark to compare system prompt strategies.
        </p>
        <pre className="code-block" style={{ textAlign: "left", display: "inline-block" }}>npm run benchmark:context</pre>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 16 }}>
          Quick mode: <code style={{ color: "var(--accent-teal)" }}>npm run benchmark:context:quick</code>
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 24 }}>
          Need help? Check the <Link href="/benchmark">setup guide</Link>.
        </p>
      </div>
    );
  }

  return <ContextDashboard data={data} />;
}
