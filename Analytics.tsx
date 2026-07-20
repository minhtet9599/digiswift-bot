import React from "react";
import { motion } from "motion/react";
import { DollarSign, ShoppingCart, Users, AlertTriangle, TrendingUp, Tag } from "lucide-react";
import { AnalyticsSummary, CategoryType } from "../types.js";

interface AnalyticsProps {
  summary: AnalyticsSummary;
}

export default function Analytics({ summary }: AnalyticsProps) {
  // Find highest revenue point in history to scale our SVG line chart
  const maxRevenue = Math.max(...summary.salesHistory.map(h => h.revenue), 10);
  const maxSales = Math.max(...summary.salesHistory.map(h => h.sales), 1);

  // SVG dimensions for our custom sales trend chart
  const width = 600;
  const height = 180;
  const padding = 25;

  const points = summary.salesHistory.map((h, i) => {
    const x = padding + (i / (summary.salesHistory.length - 1)) * (width - padding * 2);
    const y = height - padding - (h.revenue / maxRevenue) * (height - padding * 2);
    return { x, y, label: h.date, val: h.revenue, sales: h.sales };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  const categoryLabels: Record<CategoryType, { name: string; color: string; bg: string }> = {
    subscription: { name: "Subscriptions", color: "text-emerald-500", bg: "bg-emerald-500" },
    coin: { name: "Game Coins", color: "text-indigo-500", bg: "bg-indigo-500" },
    vpn: { name: "VPN Accounts", color: "text-sky-500", bg: "bg-sky-500" },
    key: { name: "Digital Keys", color: "text-amber-500", bg: "bg-amber-500" }
  };

  const totalCatCount = Object.values(summary.categorySales).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <div id="analytics_dashboard" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Dashboard Overview</h2>
          <p className="text-xs text-gray-500">Real-time stats from Telegram bot and web orders.</p>
        </div>
        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-medium text-indigo-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          Live Bot Ingestion Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Revenue",
            value: `$${summary.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
            desc: "Net completed sales"
          },
          {
            title: "Completed Orders",
            value: summary.totalSalesCount,
            icon: ShoppingCart,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-100",
            desc: "Instant keys delivered"
          },
          {
            title: "Active Customers",
            value: summary.activeCustomersCount,
            icon: Users,
            color: "text-sky-600",
            bg: "bg-sky-50 border-sky-100",
            desc: "Unique chat clients"
          },
          {
            title: "Out of Stock",
            value: summary.outOfStockCount,
            icon: AlertTriangle,
            color: summary.outOfStockCount > 0 ? "text-amber-600" : "text-gray-500",
            bg: summary.outOfStockCount > 0 ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100",
            desc: "Products needing refill"
          }
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-500">{kpi.title}</span>
              <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{kpi.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Graph */}
        <div className="lg:col-span-2 bg-white p-5 border border-gray-100 rounded-xl shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900">7-Day Sales Trend</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">UTC Sales Log</span>
          </div>

          <div className="relative w-full overflow-hidden">
            {/* SVG Custom Line Chart */}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (height - padding * 2);
                const gridVal = maxRevenue - ratio * maxRevenue;
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 5}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      ${gridVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Area under line */}
              {areaD && (
                <path d={areaD} fill="url(#chartGradient)" />
              )}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots & Tooltips */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="#4f46e5"
                    className="opacity-0 hover:opacity-20 transition-opacity duration-200"
                  />
                  {/* Tooltip on hover */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <rect
                      x={Math.max(10, p.x - 45)}
                      y={p.y - 32}
                      width="90"
                      height="24"
                      rx="4"
                      fill="#1e293b"
                    />
                    <text
                      x={Math.max(10, p.x - 45) + 45}
                      y={p.y - 17}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ${p.val.toFixed(1)} ({p.sales} sales)
                    </text>
                  </g>
                  {/* X Axis Labels */}
                  <text
                    x={p.x}
                    y={height - 5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-xs space-y-5">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Category Distribution</h3>
          </div>

          <div className="space-y-4">
            {(Object.keys(categoryLabels) as CategoryType[]).map((cat) => {
              const sales = summary.categorySales[cat] || 0;
              const rev = summary.categoryRevenue[cat] || 0;
              const percentage = Math.round((sales / totalCatCount) * 100) || 0;
              const meta = categoryLabels[cat];

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700">{meta.name}</span>
                    <span className="text-gray-400 font-mono">
                      {sales} sold • <strong className="text-gray-900">${rev.toFixed(2)}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${meta.bg}`}
                    />
                  </div>
                  <div className="flex justify-end text-[10px] text-gray-400 font-mono">
                    {percentage}% share
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
