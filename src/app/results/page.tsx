import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { BenchmarkResult } from "../benchmark/config";
import ResultsDashboard from "../components/ResultsDashboard";

interface BenchmarkData {
  metadata: {
    timestamp: string;
    totalRuns: number;
    models: string[];
    prompts: string[];
  };
  results: BenchmarkResult[];
}

function loadLatestResults(): BenchmarkData | null {
  const resultsDir = join(process.cwd(), "results");
  
  try {
    const files = readdirSync(resultsDir)
      .filter(f => f.endsWith(".json"))
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

export default function ResultsPage() {
  const data = loadLatestResults();

  if (!data) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <h1>📊 No Results Yet</h1>
        <p>Run a benchmark first:</p>
        <code style={{ 
          background: "#f5f5f5", 
          padding: "15px", 
          display: "block",
          borderRadius: "5px",
          marginTop: "20px"
        }}>
          npm run benchmark
        </code>
      </div>
    );
  }

  return <ResultsDashboard data={data} />;
}
