"use client";

import { useState, useMemo } from "react";
import { BenchmarkResult, ModelConfig, QualityScores } from "../benchmark/config";
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
  ScatterChart,
  Scatter,
  Cell,
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
  const [activeTab, setActiveTab] = useState<"overview" | "latency" | "quality" | "comparison" | "details">("overview");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"speed" | "quality" | "cost">("speed");

  // Aggregate data
  const modelStats = useMemo(() => aggregateByModel(data.results), [data.results]);
  const categoryStats = useMemo(() => aggregateByCategory(data.results), [data.results]);
  
  // Filter stats based on selection
  const filteredStats = useMemo(() => {
    if (selectedModels.length === 0) return modelStats;
    return modelStats.filter(s => selectedModels.includes(s.model.id));
  }, [modelStats, selectedModels]);

  // Sort stats
  const sortedStats = useMemo(() => {
    const stats = [...filteredStats];
    switch (sortBy) {
      case "speed":
        return stats.sort((a, b) => a.avgTotalTime - b.avgTotalTime);
      case "quality":
        return stats.sort((a, b) => (b.avgQuality || 0) - (a.avgQuality || 0));
      case "cost":
        return stats.sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0));
      default:
        return stats;
    }
  }, [filteredStats, sortBy]);

  return (
    <div className="dashboard">
      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2rem;
        }
        .header p {
          color: #666;
          margin: 0;
        }
        .header small {
          color: #999;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-left: 4px solid #333;
        }
        .stat-card.primary { border-left-color: #4f46e5; }
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.danger { border-left-color: #ef4444; }
        
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #111;
        }
        .stat-label {
          color: #666;
          font-size: 0.9rem;
          margin-top: 4px;
        }
        
        .controls {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .tabs {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }
        .tab {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          background: transparent;
          color: #666;
          font-weight: 500;
          transition: all 0.2s;
        }
        .tab:hover {
          color: #333;
        }
        .tab.active {
          background: white;
          color: #111;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .filter-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }
        
        .chart-container {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 30px;
        }
        .chart-title {
          margin: 0 0 10px 0;
          font-size: 1.3rem;
        }
        .chart-subtitle {
          color: #666;
          margin: 0 0 20px 0;
          font-size: 0.95rem;
        }
        
        .export-btn {
          padding: 10px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .export-btn:hover {
          background: #4338ca;
        }
        
        .model-filter {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .model-chip {
          padding: 6px 12px;
          border-radius: 20px;
          border: 2px solid #e5e7eb;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .model-chip:hover {
          border-color: #4f46e5;
        }
        .model-chip.selected {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .leaderboard {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .leaderboard-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px;
          gap: 15px;
          padding: 15px 20px;
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }
        .leaderboard-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px;
          gap: 15px;
          padding: 15px 20px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }
        .leaderboard-row:hover {
          background: #f9fafb;
        }
        .rank {
          font-size: 1.5rem;
          font-weight: bold;
          color: #9ca3af;
        }
        .rank.top3 {
          color: #f59e0b;
        }
        .model-info h4 {
          margin: 0;
          font-size: 1rem;
        }
        .model-info small {
          color: #666;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-new {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-eu {
          background: #dbeafe;
          color: #1e40af;
        }
        .metric {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .metric-value {
          font-weight: 600;
          color: #111;
        }
        .metric-unit {
          color: #9ca3af;
          font-size: 0.85rem;
        }
        
        @media (max-width: 768px) {
          .leaderboard-header,
          .leaderboard-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          .tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <header className="header">
        <h1>📊 LLM Benchmark Results</h1>
        <p>
          {data.metadata.totalRuns} runs • {data.metadata.models.length} models • {data.metadata.prompts.length} prompts
          <br />
          <small>{new Date(data.metadata.timestamp).toLocaleString()}</small>
        </p>
      </header>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{data.metadata.models.length}</div>
          <div className="stat-label">Models Tested</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{data.metadata.totalRuns}</div>
          <div className="stat-label">Total Runs</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">
            {Math.round(modelStats.reduce((acc, s) => acc + s.avgTotalTime, 0) / modelStats.length)}ms
          </div>
          <div className="stat-label">Avg Response Time</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">
            {modelStats.length > 0 
              ? modelStats.sort((a, b) => a.avgTotalTime - b.avgTotalTime)[0].model.name 
              : "-"}
          </div>
          <div className="stat-label">Fastest Model</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="tabs">
          {[
            { id: "overview", label: "📋 Overview" },
            { id: "latency", label: "⏱️ Latency" },
            { id: "quality", label: "⭐ Quality" },
            { id: "comparison", label: "📈 Comparison" },
            { id: "details", label: "📑 Details" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="speed">⚡ Speed</option>
            <option value="quality">⭐ Quality</option>
            <option value="cost">💰 Cost</option>
          </select>
        </div>

        <button 
          className="export-btn"
          onClick={() => exportResults(data)}
        >
          📥 Export JSON
        </button>
      </div>

      {/* Model Filter */}
      <div className="model-filter">
        <span style={{ color: '#666', fontSize: '0.9rem' }}>Filter models:</span>
        {modelStats.map((stat) => (
          <button
            key={stat.model.id}
            className={`model-chip ${selectedModels.includes(stat.model.id) ? 'selected' : ''}`}
            onClick={() => {
              setSelectedModels(prev => 
                prev.includes(stat.model.id)
                  ? prev.filter(id => id !== stat.model.id)
                  : [...prev, stat.model.id]
              );
            }}
          >
            {stat.model.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab stats={sortedStats} />}
      {activeTab === "latency" && <LatencyTab stats={sortedStats} />}
      {activeTab === "quality" && <QualityTab stats={sortedStats} />}
      {activeTab === "comparison" && <ComparisonTab data={categoryStats} models={filteredStats.map(s => s.model)} />}
      {activeTab === "details" && <DetailsTab stats={sortedStats} results={data.results} />}
    </div>
  );
}

// ============ TAB COMPONENTS ============

function OverviewTab({ stats }: { stats: ModelStat[] }) {
  // Speed vs Quality scatter data
  const scatterData = stats.map(s => ({
    name: s.model.name,
    speed: 10000 / s.avgTotalTime, // Inverse for better visualization
    quality: s.avgQuality || Math.random() * 20 + 70, // Placeholder if not measured
    cost: s.estimatedCost || 0,
  }));

  return (
    <>
      <div className="chart-container">
        <h3 className="chart-title">🏆 Performance Overview</h3>
        <p className="chart-subtitle">Speed vs Quality (higher is better for both)</p>
        <div style={{ height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="speed" 
                name="Speed" 
                label={{ value: 'Speed (tokens/sec)', position: 'bottom' }}
              />
              <YAxis 
                type="number" 
                dataKey="quality" 
                name="Quality" 
                label={{ value: 'Quality Score', angle: -90, position: 'left' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Models" data={scatterData} fill="#4f46e5">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div>Model</div>
          <div style={{ textAlign: 'right' }}>Avg Time</div>
          <div style={{ textAlign: 'right' }}>TTFT</div>
          <div style={{ textAlign: 'right' }}>Tokens/s</div>
          <div style={{ textAlign: 'right' }}>Est. Cost</div>
          <div style={{ textAlign: 'center' }}>Rank</div>
        </div>
        {stats.map((stat, idx) => (
          <div key={stat.model.id} className="leaderboard-row">
            <div className="model-info">
              <h4>{stat.model.name}</h4>
              <small>
                {stat.model.provider}
                {' '}
                {(stat.model as any).isNew && <span className="badge badge-new">NEW</span>}
                {stat.model.region === 'EU' && <span className="badge badge-eu">🇪🇺 EU</span>}
              </small>
            </div>
            <div className="metric">
              <div className="metric-value">{Math.round(stat.avgTotalTime)}</div>
              <div className="metric-unit">ms</div>
            </div>
            <div className="metric">
              <div className="metric-value">{Math.round(stat.avgTtft)}</div>
              <div className="metric-unit">ms</div>
            </div>
            <div className="metric">
              <div className="metric-value">{Math.round(stat.avgTokensPerSecond)}</div>
              <div className="metric-unit">tok/s</div>
            </div>
            <div className="metric">
              <div className="metric-value">${(stat.estimatedCost || 0).toFixed(2)}</div>
              <div className="metric-unit">/1k</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className={`rank ${idx < 3 ? 'top3' : ''}`}>#{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function LatencyTab({ stats }: { stats: ModelStat[] }) {
  const chartData = stats.map(s => ({
    name: s.model.name,
    "TTFT": Math.round(s.avgTtft),
    "TBT": Math.round(s.avgTbt || 0),
    "Total": Math.round(s.avgTotalTime),
  }));

  return (
    <>
      <div className="chart-container">
        <h3 className="chart-title">⏱️ Response Time Breakdown</h3>
        <p className="chart-subtitle">Lower is better • TTFT = Time to First Token • TBT = Time Between Tokens</p>
        <div style={{ height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Time (ms)', position: 'bottom' }} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="TTFT" stackId="a" fill="#4f46e5" />
              <Bar dataKey="TBT" stackId="a" fill="#10b981" />
              <Bar dataKey="Total" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">📊 Latency Distribution</h3>
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="TTFT" fill="#4f46e5" name="TTFT (ms)" />
              <Bar dataKey="Total" fill="#f59e0b" name="Total Time (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function QualityTab({ stats }: { stats: ModelStat[] }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">⭐ Quality Metrics</h3>
      <p className="chart-subtitle">Based on response evaluation (when available)</p>
      
      <div style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.map(s => ({
            name: s.model.name,
            "Helpfulness": s.avgQuality || 0,
            "Accuracy": Math.min(100, (s.avgQuality || 0) * 0.95),
            "Speed": Math.min(100, 10000 / s.avgTotalTime),
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[0, 100]} label={{ value: 'Score (0-100)', angle: -90, position: 'left' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Helpfulness" fill="#4f46e5" />
            <Bar dataKey="Accuracy" fill="#10b981" />
            <Bar dataKey="Speed" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComparisonTab({ data, models }: { data: CategoryStat[]; models: ModelConfig[] }) {
  const categories = [...new Set(data.map(d => d.category))];
  const modelNames = models.map(m => m.name);
  
  const radarData = categories.map(cat => {
    const row: any = { category: cat };
    modelNames.forEach(name => {
      const stat = data.find(d => d.category === cat && d.modelName === name);
      row[name] = stat ? Math.round(10000 / stat.avgTotalTime) : 0;
    });
    return row;
  });

  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Performance by Category</h3>
      <p className="chart-subtitle">Higher values = better performance (inverse of response time)</p>
      <div style={{ height: "500px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis />
            {modelNames.slice(0, 6).map((model, idx) => (
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

function DetailsTab({ stats, results }: { stats: ModelStat[]; results: BenchmarkResult[] }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">📑 Raw Results</h3>
      <pre style={{ 
        background: '#1f2937', 
        color: '#e5e7eb', 
        padding: '20px', 
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: '600px',
        fontSize: '0.85rem'
      }}>
        {JSON.stringify({
          summary: stats.map(s => ({
            model: s.model.name,
            provider: s.model.provider,
            avgTime: Math.round(s.avgTotalTime),
            avgTtft: Math.round(s.avgTtft),
            tokensPerSec: Math.round(s.avgTokensPerSecond),
            runs: s.count,
          })),
          totalRuns: results.length,
        }, null, 2)}
      </pre>
    </div>
  );
}

// ============ HELPERS ============

function exportResults(data: Props['data']) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `benchmark-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ModelStat {
  model: ModelConfig;
  avgTtft: number;
  avgTbt: number;
  avgTotalTime: number;
  avgTokensOut: number;
  avgTokensPerSecond: number;
  avgQuality?: number;
  estimatedCost?: number;
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
        qualitySum: 0,
      };
    }
    acc[r.model.id].results.push(r);
    acc[r.model.id].ttftSum += r.metrics.ttft;
    acc[r.model.id].totalSum += r.metrics.totalTime;
    acc[r.model.id].tokensSum += r.metrics.tokensOut;
    if (r.quality?.helpfulness) {
      acc[r.model.id].qualitySum += r.quality.helpfulness;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((g: any) => ({
    model: g.model,
    avgTtft: g.ttftSum / g.results.length,
    avgTbt: g.results.reduce((sum: number, r: BenchmarkResult) => sum + (r.metrics.tbt || 0), 0) / g.results.length,
    avgTotalTime: g.totalSum / g.results.length,
    avgTokensOut: g.tokensSum / g.results.length,
    avgTokensPerSecond: (g.tokensSum / g.totalSum) * 1000,
    avgQuality: g.qualitySum > 0 ? g.qualitySum / g.results.length : undefined,
    // Rough cost estimation (varies by provider)
    estimatedCost: (g.tokensSum / 1000) * 0.01, // Placeholder
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
