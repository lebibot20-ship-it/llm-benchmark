"use client";

import { useState } from "react";
import { BenchmarkResult } from "../../benchmark/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface Props {
  data: {
    metadata: {
      timestamp: string;
      totalRuns: number;
      models: string[];
      prompts: string[];
    };
    results: BenchmarkResult[];
  };
}

export default function ResultsDashboard({ data }: Props) {
  const [activeTab, setActiveTab] = useState<"latency" | "throughput" | "comparison">("latency");

  // Aggregate data by model
  const modelStats = aggregateByModel(data.results);
  const categoryStats = aggregateByCategory(data.results);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1>📊 Benchmark Results</h1>
        <p style={{ color: "#666" }}>
          {data.metadata.totalRuns} runs • {data.metadata.models.length} models • {data.metadata.prompts.length} prompts
          <br />
          <small>{new Date(data.metadata.timestamp).toLocaleString()}</small>
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {[
          { id: "latency", label: "⏱️ Latency" },
          { id: "throughput", label: "🚀 Throughput" },
          { id: "comparison", label: "📈 Comparison" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: activeTab === tab.id ? "#333" : "#f0f0f0",
              color: activeTab === tab.id ? "white" : "#333",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "latency" && <LatencyTab data={modelStats} />}
      {activeTab === "throughput" && <ThroughputTab data={modelStats} />}
      {activeTab === "comparison" && <ComparisonTab data={categoryStats} />}

      {/* Summary Table */}
      <SummaryTable stats={modelStats} />
    </div>
  );
}

function LatencyTab({ data }: { data: ModelStat[] }) {
  const chartData = data.map(d => ({
    name: d.model.name,
    "TTFT (ms)": Math.round(d.avgTtft),
    "Total (ms)": Math.round(d.avgTotalTime),
  }));

  return (
    <div>
      <h2>Time to First Token (TTFT)</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Lower is better. Measures how quickly the model starts responding.
      </p>
      
      <div style={{ height: "400px", marginBottom: "40px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="TTFT (ms)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Total Response Time</h2>
      <div style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total (ms)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ThroughputTab({ data }: { data: ModelStat[] }) {
  const chartData = data.map(d => ({
    name: d.model.name,
    "Tokens/sec": Math.round(d.avgTokensPerSecond),
    "Output Tokens": Math.round(d.avgTokensOut),
  }));

  return (
    <div>
      <h2>Throughput (Tokens per Second)</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Higher is better. Measures how fast the model generates text.
      </p>
      
      <div style={{ height: "400px", marginBottom: "40px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tokens/sec" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComparisonTab({ data }: { data: CategoryStat[] }) {
  const models = [...new Set(data.map(d => d.modelName))];
  const categories = [...new Set(data.map(d => d.category))];
  
  // Prepare data for radar chart
  const radarData = categories.map(cat => {
    const row: any = { category: cat };
    models.forEach(model => {
      const stat = data.find(d => d.category === cat && d.modelName === model);
      row[model] = stat ? Math.round(stat.avgTotalTime) : 0;
    });
    return row;
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28"];

  return (
    <div>
      <h2>Performance by Category</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Compare model performance across different task types.
      </p>
      
      <div style={{ height: "500px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis />
            {models.slice(0, 4).map((model, idx) => (
              <Radar
                key={model}
                name={model}
                dataKey={model}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={0.1}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryTable({ stats }: { stats: ModelStat[] }) {
  return (
    <div style={{ marginTop: "60px", overflowX: "auto" }}>
      <h2>Detailed Summary</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Model</th>
            <th style={{ padding: "12px", textAlign: "right" }}>Avg TTFT</th>
            <th style={{ padding: "12px", textAlign: "right" }}>Avg Total</th>
            <th style={{ padding: "12px", textAlign: "right" }}>Tokens/sec</th>
            <th style={{ padding: "12px", textAlign: "right" }}>Runs</th>
          </tr>
        </thead>
        <tbody>
          {stats
            .sort((a, b) => a.avgTotalTime - b.avgTotalTime)
            .map((stat) => (
              <tr key={stat.model.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>
                  <strong>{stat.model.name}</strong>
                  <br />
                  <small style={{ color: "#666" }}>{stat.model.provider}</small>
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {Math.round(stat.avgTtft)}ms
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {Math.round(stat.avgTotalTime)}ms
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {Math.round(stat.avgTokensPerSecond)}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {stat.count}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper types and functions
interface ModelStat {
  model: { id: string; name: string; provider: string };
  avgTtft: number;
  avgTotalTime: number;
  avgTokensOut: number;
  avgTokensPerSecond: number;
  count: number;
}

interface CategoryStat {
  category: string;
  modelName: string;
  avgTotalTime: number;
}

function aggregateByModel(results: BenchmarkResult[]): ModelStat[] {
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.model.id]) {
      acc[r.model.id] = { 
        model: r.model, 
        results: [],
        ttftSum: 0,
        totalSum: 0,
        tokensSum: 0,
      };
    }
    acc[r.model.id].results.push(r);
    acc[r.model.id].ttftSum += r.metrics.ttft;
    acc[r.model.id].totalSum += r.metrics.totalTime;
    acc[r.model.id].tokensSum += r.metrics.tokensOut;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((g: any) => ({
    model: g.model,
    avgTtft: g.ttftSum / g.results.length,
    avgTotalTime: g.totalSum / g.results.length,
    avgTokensOut: g.tokensSum / g.results.length,
    avgTokensPerSecond: (g.tokensSum / g.totalSum) * 1000,
    count: g.results.length,
  }));
}

function aggregateByCategory(results: BenchmarkResult[]): CategoryStat[] {
  return results.map(r => ({
    category: r.prompt.category,
    modelName: r.model.name,
    avgTotalTime: r.metrics.totalTime,
  }));
}
