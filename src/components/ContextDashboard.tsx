"use client";

import { useState, useMemo } from "react";
import { ContextBenchmarkResult, ContextBenchmarkRun, QualityScores } from "../benchmark/config";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: ContextBenchmarkResult;
}

// ============ TYPES ============

interface StrategyStats {
  strategy: string;
  avgWallTime: number;
  avgToolCalls: number;
  avgLlmIterations: number;
  avgTokensIn: number;
  avgTokensOut: number;
  totalTokens: number;
  avgQuality: QualityAvg | null;
  runCount: number;
}

interface QualityAvg {
  helpfulness: number;
  relevance: number;
  coherence: number;
  accuracy: number;
  overall: number;
}

// ============ MAIN COMPONENT ============

export default function ContextDashboard({ data }: Props) {
  const strategyStats = useMemo(() => computeStrategyStats(data.runs), [data.runs]);
  const strategies = useMemo(() => [...new Set(data.runs.map(r => r.strategy))], [data.runs]);
  const queries = useMemo(() => {
    const seen = new Map<string, { id: string; query: string; category: string }>();
    data.runs.forEach(r => {
      if (!seen.has(r.queryId)) {
        seen.set(r.queryId, { id: r.queryId, query: r.query, category: r.queryCategory });
      }
    });
    return Array.from(seen.values());
  }, [data.runs]);

  const hasQuality = useMemo(() => data.runs.some(r => r.quality != null), [data.runs]);

  const bestStrategy = useMemo(() => {
    if (strategyStats.length === 0) return null;
    return [...strategyStats].sort((a, b) => a.avgToolCalls - b.avgToolCalls)[0];
  }, [strategyStats]);

  const fastestStrategy = useMemo(() => {
    if (strategyStats.length === 0) return null;
    return [...strategyStats].sort((a, b) => a.avgWallTime - b.avgWallTime)[0];
  }, [strategyStats]);

  const dateStr = new Date(data.metadata.timestamp).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="dashboard">
      <style jsx global>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 20px;
          font-family: var(--font-sans);
        }
        .header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .header-meta {
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          margin: 0;
        }
        .header-actions {
          margin-left: auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-card);
          padding: 14px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
        }
        .stat-card.primary::before { background: var(--accent-blue); }
        .stat-card.success::before { background: var(--accent-teal); }
        .stat-card.warning::before { background: var(--accent-amber); }
        .stat-card.purple::before { background: var(--accent-purple); }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
          font-family: var(--font-mono);
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-sublabel {
          color: var(--text-secondary);
          font-size: 0.75rem;
          margin-top: 1px;
        }
        .export-btn {
          padding: 6px 14px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.15s;
          font-family: var(--font-sans);
        }
        .export-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        .section {
          margin-bottom: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .section-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .section-subtitle {
          color: var(--text-muted);
          margin: 2px 0 0 0;
          font-size: 0.8rem;
        }
        .chart-container {
          background: var(--bg-card);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .chart-title {
          margin: 0 0 2px 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .chart-subtitle {
          color: var(--text-muted);
          margin: 0 0 16px 0;
          font-size: 0.8rem;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .three-col {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .leaderboard-card {
          background: var(--bg-card);
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .leaderboard-table thead th {
          padding: 10px 14px;
          background: var(--bg-elevated);
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: right;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .leaderboard-table thead th:first-child {
          text-align: left;
        }
        .leaderboard-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.1s;
        }
        .leaderboard-table tbody tr:last-child {
          border-bottom: none;
        }
        .leaderboard-table tbody tr:hover {
          background: var(--bg-elevated);
        }
        .leaderboard-table tbody td {
          padding: 10px 14px;
          font-variant-numeric: tabular-nums;
          font-family: var(--font-mono);
          text-align: right;
          color: var(--text-primary);
          font-size: 0.85rem;
        }
        .leaderboard-table tbody td:first-child {
          text-align: left;
          font-family: var(--font-sans);
          font-weight: 500;
        }
        .metric-unit {
          color: var(--text-muted);
          font-size: 0.7rem;
          margin-left: 2px;
        }
        .strategy-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .strategy-baseline { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
        .strategy-light { background: rgba(20, 184, 166, 0.15); color: var(--accent-teal); }
        .strategy-full { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
        .strategy-summary { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); }
        .heatmap-wrapper {
          overflow-x: auto;
        }
        .heatmap-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 600px;
        }
        .heatmap-table th {
          padding: 10px 12px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          text-align: center;
          white-space: nowrap;
        }
        .heatmap-table td {
          padding: 8px 12px;
          border: 1px solid var(--border);
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-variant-numeric: tabular-nums;
        }
        .heatmap-table td:first-child {
          text-align: left;
          font-weight: 500;
          font-family: var(--font-sans);
          background: var(--bg-card);
          position: sticky;
          left: 0;
          white-space: nowrap;
        }
        .toggle-group {
          display: flex;
          gap: 2px;
          background: var(--bg-card);
          padding: 3px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        .toggle-btn {
          padding: 5px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.75rem;
          transition: all 0.15s;
          font-family: var(--font-sans);
        }
        .toggle-btn.active {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        @media (max-width: 900px) {
          .two-col, .three-col {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 4px;
          }
          .header-actions {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <h1>Context Benchmark</h1>
        <p className="header-meta">
          GPT-5.2 &middot; Muster GmbH &middot; {data.metadata.strategies.length} strategies &middot; {data.metadata.queriesCount} queries &middot; {data.runs.length} runs &middot; {dateStr}
        </p>
        <div className="header-actions">
          <button className="export-btn" onClick={() => exportResults(data)}>
            Export JSON
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{data.metadata.strategies.length}</div>
          <div className="stat-label">Strategies Tested</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{data.runs.length}</div>
          <div className="stat-label">Total Runs</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">
            {bestStrategy ? bestStrategy.avgToolCalls.toFixed(1) : "-"}
          </div>
          <div className="stat-label">Fewest Avg Tool Calls</div>
          {bestStrategy && <div className="stat-sublabel">{bestStrategy.strategy}</div>}
        </div>
        <div className="stat-card purple">
          <div className="stat-value">
            {fastestStrategy ? `${Math.round(fastestStrategy.avgWallTime)}ms` : "-"}
          </div>
          <div className="stat-label">Fastest Avg Time</div>
          {fastestStrategy && <div className="stat-sublabel">{fastestStrategy.strategy}</div>}
        </div>
      </div>

      {/* Strategy comparison table */}
      <div className="section">
        <StrategyComparisonTable stats={strategyStats} hasQuality={hasQuality} />
      </div>

      {/* Bar charts */}
      <div className="section">
        <BarChartSection stats={strategyStats} />
      </div>

      {/* Per-query heatmap */}
      <div className="section">
        <QueryHeatmap runs={data.runs} strategies={strategies} queries={queries} />
      </div>

      {/* Quality comparison */}
      {hasQuality && (
        <div className="section">
          <QualitySection stats={strategyStats} />
        </div>
      )}

      {/* Token cost analysis */}
      <div className="section">
        <TokenCostSection stats={strategyStats} />
      </div>
    </div>
  );
}

// ============ CHART THEME ============

const axisStyle = { fill: '#5a5a6e', fontSize: 12 };
const gridStyle = { stroke: '#1e1e2e' };
const tooltipStyle = {
  contentStyle: { background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '6px', color: '#e4e4e7', fontSize: '0.85rem' },
  itemStyle: { color: '#e4e4e7' },
  labelStyle: { color: '#8b8b9e' },
};

const STRATEGY_COLORS: Record<string, string> = {
  baseline: "#3b82f6",
  light: "#14b8a6",
  full: "#f59e0b",
  summary: "#8b5cf6",
};

// ============ SECTION COMPONENTS ============

function StrategyComparisonTable({ stats, hasQuality }: { stats: StrategyStats[]; hasQuality: boolean }) {
  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Strategy Comparison</h2>
          <p className="section-subtitle">Average metrics per context strategy</p>
        </div>
      </div>
      <div className="leaderboard-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Strategy</th>
              <th>Avg Time</th>
              <th>Avg Tool Calls</th>
              <th>Avg LLM Iters</th>
              <th>Avg Tokens In</th>
              <th>Avg Tokens Out</th>
              {hasQuality && <th>Quality</th>}
              <th>Runs</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.strategy}>
                <td>
                  <span className={`strategy-badge strategy-${s.strategy}`}>
                    {s.strategy}
                  </span>
                </td>
                <td>
                  {Math.round(s.avgWallTime)}<span className="metric-unit">ms</span>
                </td>
                <td>{s.avgToolCalls.toFixed(1)}</td>
                <td>{s.avgLlmIterations.toFixed(1)}</td>
                <td>{Math.round(s.avgTokensIn).toLocaleString()}</td>
                <td>{Math.round(s.avgTokensOut).toLocaleString()}</td>
                {hasQuality && (
                  <td style={{ color: qualityColor(s.avgQuality?.overall) }}>
                    {s.avgQuality ? `${s.avgQuality.overall.toFixed(1)}` : "-"}
                    <span className="metric-unit">/10</span>
                  </td>
                )}
                <td style={{ color: "var(--text-secondary)" }}>{s.runCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BarChartSection({ stats }: { stats: StrategyStats[] }) {
  const toolCallData = useMemo(() =>
    stats.map(s => ({ name: s.strategy, value: parseFloat(s.avgToolCalls.toFixed(1)) })),
    [stats]
  );

  const iterationData = useMemo(() =>
    stats.map(s => ({ name: s.strategy, value: parseFloat(s.avgLlmIterations.toFixed(1)) })),
    [stats]
  );

  const timeData = useMemo(() =>
    stats.map(s => ({ name: s.strategy, value: Math.round(s.avgWallTime) })),
    [stats]
  );

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Performance Comparison</h2>
          <p className="section-subtitle">Lower is better for all metrics</p>
        </div>
      </div>
      <div className="three-col">
        <div className="chart-container">
          <h3 className="chart-title">Avg Tool Calls</h3>
          <p className="chart-subtitle">Fewer = less API overhead</p>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolCallData} margin={{ left: 10, right: 10, top: 5, bottom: 20 }}>
                <CartesianGrid {...gridStyle} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [value, "Tool Calls"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tool Calls">
                  {toolCallData.map((entry) => (
                    <Cell key={entry.name} fill={STRATEGY_COLORS[entry.name] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Avg LLM Iterations</h3>
          <p className="chart-subtitle">Fewer = faster conversation loop</p>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={iterationData} margin={{ left: 10, right: 10, top: 5, bottom: 20 }}>
                <CartesianGrid {...gridStyle} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [value, "Iterations"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Iterations">
                  {iterationData.map((entry) => (
                    <Cell key={entry.name} fill={STRATEGY_COLORS[entry.name] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Avg Wall Time</h3>
          <p className="chart-subtitle">Total time including all API calls</p>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ left: 10, right: 10, top: 5, bottom: 20 }}>
                <CartesianGrid {...gridStyle} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}ms`, "Wall Time"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Wall Time (ms)">
                  {timeData.map((entry) => (
                    <Cell key={entry.name} fill={STRATEGY_COLORS[entry.name] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function QueryHeatmap({
  runs,
  strategies,
  queries,
}: {
  runs: ContextBenchmarkRun[];
  strategies: string[];
  queries: Array<{ id: string; query: string; category: string }>;
}) {
  const [metric, setMetric] = useState<"toolCalls" | "time" | "iterations">("toolCalls");

  const avgMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const strategy of strategies) {
      for (const query of queries) {
        const matching = runs.filter(
          r => r.strategy === strategy && r.queryId === query.id && r.wallTimeMs > 0
        );
        if (matching.length === 0) continue;
        let value: number;
        switch (metric) {
          case "toolCalls":
            value = avg(matching.map(r => r.toolCallCount));
            break;
          case "time":
            value = avg(matching.map(r => r.wallTimeMs));
            break;
          case "iterations":
            value = avg(matching.map(r => r.llmIterations));
            break;
        }
        map.set(`${strategy}:${query.id}`, value);
      }
    }
    return map;
  }, [runs, strategies, queries, metric]);

  const { min, max } = useMemo(() => {
    const values = Array.from(avgMap.values());
    return {
      min: Math.min(...values, 0),
      max: Math.max(...values, 1),
    };
  }, [avgMap]);

  const shortQueryName = (q: { id: string; query: string }) => {
    if (q.query.length > 30) return q.query.substring(0, 28) + "...";
    return q.query;
  };

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Per-Query Breakdown</h2>
          <p className="section-subtitle">
            {metric === "toolCalls"
              ? "Average tool calls per strategy x query — green is fewer, red is more"
              : metric === "time"
                ? "Average wall time (ms) — green is fast, red is slow"
                : "Average LLM iterations — green is fewer, red is more"}
          </p>
        </div>
        <div className="toggle-group">
          <button className={`toggle-btn ${metric === "toolCalls" ? "active" : ""}`} onClick={() => setMetric("toolCalls")}>
            Tool Calls
          </button>
          <button className={`toggle-btn ${metric === "time" ? "active" : ""}`} onClick={() => setMetric("time")}>
            Time (ms)
          </button>
          <button className={`toggle-btn ${metric === "iterations" ? "active" : ""}`} onClick={() => setMetric("iterations")}>
            Iterations
          </button>
        </div>
      </div>
      <div className="chart-container">
        <div className="heatmap-wrapper">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Strategy</th>
                {queries.map(q => (
                  <th key={q.id} title={q.query}>{shortQueryName(q)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strategies.map(strategy => (
                <tr key={strategy}>
                  <td>
                    <span className={`strategy-badge strategy-${strategy}`}>{strategy}</span>
                  </td>
                  {queries.map(q => {
                    const value = avgMap.get(`${strategy}:${q.id}`);
                    if (value == null) return <td key={q.id} style={{ color: "var(--text-muted)" }}>&mdash;</td>;
                    const bg = heatmapColor(value, min, max);
                    const display = metric === "time" ? Math.round(value) : value.toFixed(1);
                    return (
                      <td key={q.id} style={{ background: bg, color: "var(--text-primary)" }}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function QualitySection({ stats }: { stats: StrategyStats[] }) {
  const qualityData = useMemo(() => {
    return stats
      .filter(s => s.avgQuality)
      .map(s => ({
        name: s.strategy,
        Helpfulness: parseFloat(s.avgQuality!.helpfulness.toFixed(1)),
        Relevance: parseFloat(s.avgQuality!.relevance.toFixed(1)),
        Coherence: parseFloat(s.avgQuality!.coherence.toFixed(1)),
        Accuracy: parseFloat(s.avgQuality!.accuracy.toFixed(1)),
      }));
  }, [stats]);

  if (qualityData.length === 0) return null;

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Quality Scores</h2>
          <p className="section-subtitle">LLM-as-Judge evaluation (1-10 scale, higher is better)</p>
        </div>
      </div>
      <div className="chart-container">
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData} margin={{ left: 10, right: 40, top: 5, bottom: 20 }}>
              <CartesianGrid {...gridStyle} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={axisStyle} />
              <YAxis domain={[0, 10]} tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#8b8b9e', fontSize: '0.85rem' }} />
              <Bar dataKey="Helpfulness" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Relevance" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Coherence" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Accuracy" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function TokenCostSection({ stats }: { stats: StrategyStats[] }) {
  // GPT-5.2 pricing estimate (per 1M tokens via OpenRouter)
  const INPUT_PRICE_PER_M = 2.00;
  const OUTPUT_PRICE_PER_M = 8.00;

  const costData = useMemo(() => {
    return stats.map(s => {
      const inputCost = (s.avgTokensIn / 1_000_000) * INPUT_PRICE_PER_M;
      const outputCost = (s.avgTokensOut / 1_000_000) * OUTPUT_PRICE_PER_M;
      return {
        name: s.strategy,
        "Input Cost": parseFloat((inputCost * 1000).toFixed(3)),
        "Output Cost": parseFloat((outputCost * 1000).toFixed(3)),
        totalCost: inputCost + outputCost,
        avgTokensIn: Math.round(s.avgTokensIn),
        avgTokensOut: Math.round(s.avgTokensOut),
      };
    });
  }, [stats]);

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Token Cost Analysis</h2>
          <p className="section-subtitle">Estimated cost per request (GPT-5.2 pricing: $2/M input, $8/M output)</p>
        </div>
      </div>
      <div className="two-col">
        <div className="leaderboard-card">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Strategy</th>
                <th>Avg Tokens In</th>
                <th>Avg Tokens Out</th>
                <th>Est. Cost/Req</th>
              </tr>
            </thead>
            <tbody>
              {costData.map(c => (
                <tr key={c.name}>
                  <td>
                    <span className={`strategy-badge strategy-${c.name}`}>{c.name}</span>
                  </td>
                  <td>{c.avgTokensIn.toLocaleString()}</td>
                  <td>{c.avgTokensOut.toLocaleString()}</td>
                  <td>${(c.totalCost * 100).toFixed(2)}<span className="metric-unit">c</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Cost Breakdown</h3>
          <p className="chart-subtitle">Per-request cost in millicents (input vs output)</p>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ left: 10, right: 10, top: 5, bottom: 20 }}>
                <CartesianGrid {...gridStyle} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} label={{ value: "m$", position: "insideLeft", ...axisStyle }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#8b8b9e', fontSize: '0.85rem' }} />
                <Bar dataKey="Input Cost" stackId="cost" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Output Cost" stackId="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

// ============ HELPERS ============

function computeStrategyStats(runs: ContextBenchmarkRun[]): StrategyStats[] {
  const grouped: Record<string, ContextBenchmarkRun[]> = {};
  for (const run of runs) {
    if (!grouped[run.strategy]) grouped[run.strategy] = [];
    grouped[run.strategy].push(run);
  }

  return Object.entries(grouped).map(([strategy, stratRuns]) => {
    const valid = stratRuns.filter(r => r.wallTimeMs > 0);
    if (valid.length === 0) {
      return {
        strategy,
        avgWallTime: 0,
        avgToolCalls: 0,
        avgLlmIterations: 0,
        avgTokensIn: 0,
        avgTokensOut: 0,
        totalTokens: 0,
        avgQuality: null,
        runCount: stratRuns.length,
      };
    }

    const qualityRuns = valid.filter(r => r.quality);
    let avgQuality: QualityAvg | null = null;
    if (qualityRuns.length > 0) {
      const h = avg(qualityRuns.map(r => r.quality!.helpfulness));
      const rel = avg(qualityRuns.map(r => r.quality!.relevance));
      const c = avg(qualityRuns.map(r => r.quality!.coherence));
      const a = avg(qualityRuns.map(r => r.quality!.accuracy));
      avgQuality = { helpfulness: h, relevance: rel, coherence: c, accuracy: a, overall: (h + rel + c + a) / 4 };
    }

    return {
      strategy,
      avgWallTime: avg(valid.map(r => r.wallTimeMs)),
      avgToolCalls: avg(valid.map(r => r.toolCallCount)),
      avgLlmIterations: avg(valid.map(r => r.llmIterations)),
      avgTokensIn: avg(valid.map(r => r.tokensIn)),
      avgTokensOut: avg(valid.map(r => r.tokensOut)),
      totalTokens: valid.reduce((s, r) => s + r.tokensIn + r.tokensOut, 0),
      avgQuality,
      runCount: valid.length,
    };
  });
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function qualityColor(score?: number): string {
  if (score == null) return "var(--text-muted)";
  if (score >= 8) return "#22c55e";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

function heatmapColor(value: number, min: number, max: number): string {
  if (max === min) return "transparent";
  const ratio = (value - min) / (max - min);
  const hue = (1 - ratio) * 120; // 120 = green, 0 = red
  return `hsla(${Math.round(hue)}, 60%, 35%, 0.35)`;
}

function exportResults(data: ContextBenchmarkResult) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `context-benchmark-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
