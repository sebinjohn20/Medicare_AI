"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import { Card, Spinner, Button } from "@/components/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

// Placeholder data shown when DB has no appointments yet
const PLACEHOLDER_7 = [
  { date: "Mon", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Tue", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Wed", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Thu", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Fri", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Sat", total: 0, completed: 0, cancelled: 0, pending: 0 },
  { date: "Sun", total: 0, completed: 0, cancelled: 0, pending: 0 },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data7,    setData7]    = useState([]);
  const [data30,   setData30]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("7days");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/analytics?days=7").then((r) => r.json()),
      fetch("/api/analytics?days=30").then((r) => r.json()),
    ]).then(([d7, d30]) => {
      if (d7.success)  setData7(d7.data);
      if (d30.success) setData30(d30.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const activeData   = tab === "7days" ? data7  : data30;
  const displayData  = activeData.length > 0 ? activeData : PLACEHOLDER_7;
  const hasRealData  = activeData.some((d) => d.total > 0);

  const totals = (data30.length > 0 ? data30 : PLACEHOLDER_7).reduce(
    (acc, d) => ({
      total:     acc.total     + d.total,
      completed: acc.completed + d.completed,
      cancelled: acc.cancelled + d.cancelled,
      pending:   acc.pending   + d.pending,
    }),
    { total: 0, completed: 0, cancelled: 0, pending: 0 }
  );

  const pieData = [
    { name: "Completed", value: totals.completed },
    { name: "Pending",   value: totals.pending   },
    { name: "Cancelled", value: totals.cancelled  },
  ].filter((d) => d.value > 0);

  const summaryCards = [
    { label: "Total (30d)",  value: totals.total,     color: "text-blue-600  bg-blue-50  border-blue-100"   },
    { label: "Completed",    value: totals.completed, color: "text-green-600 bg-green-50 border-green-100"  },
    { label: "Pending",      value: totals.pending,   color: "text-amber-600 bg-amber-50 border-amber-100"  },
    { label: "Cancelled",    value: totals.cancelled, color: "text-red-600   bg-red-50   border-red-100"    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Appointment trends and insights</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* No-data banner */}
      {!loading && !hasRealData && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No appointment data yet</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Charts will populate automatically once patients start booking appointments.
              <a href="/admin/book" className="ml-1 underline font-medium">Book a test appointment →</a>
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <p className="text-3xl font-bold">{loading ? "—" : s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher + main bar chart */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">Daily Appointments</h3>
            <p className="text-xs text-gray-400 mt-0.5">Breakdown by status</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: "7days",  label: "7 days"  },
              { key: "30days", label: "30 days" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === t.key
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(v) => <span className="capitalize text-gray-600">{v}</span>}
                />
                <Bar dataKey="total"     name="total"     fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={40} />
                <Bar dataKey="completed" name="completed" fill="#10b981" radius={[4,4,0,0]} maxBarSize={40} />
                <Bar dataKey="pending"   name="pending"   fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={40} />
                <Bar dataKey="cancelled" name="cancelled" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Row 2: Line chart + Pie chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Line trend */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Appointment Trend</h3>
          <p className="text-xs text-gray-400 mb-5">Total appointments over time</p>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="total"     name="Total"     stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} fill="url(#gradComp)"  dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Pie / Donut */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Status Breakdown</h3>
          <p className="text-xs text-gray-400 mb-5">30-day distribution</p>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No appointments yet</p>
              <p className="text-xs text-gray-300">Data appears here after first booking</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
