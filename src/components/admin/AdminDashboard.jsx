"use client";
import { useState, useEffect } from "react";
import { Calendar, CalendarPlus, Users, Stethoscope, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from "lucide-react";
import { Card, Badge, Spinner, Button } from "@/components/ui";
import { cn, formatDate, formatTime, STATUS_COLORS } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/analytics?days=7").then((r) => r.json()),
      fetch("/api/appointments?limit=8").then((r) => r.json()),
    ]).then(([statsData, analyticsData, apptsData]) => {
      if (statsData.success) setStats(statsData.stats);
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (apptsData.success) setRecentAppts(apptsData.appointments);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "blue", sub: `${stats.todayAppointments} today` },
    { label: "Pending Review", value: stats.pendingAppointments, icon: Clock, color: "amber", sub: "Need confirmation" },
    { label: "Completed Today", value: stats.completedAppointments, icon: CheckCircle, color: "green", sub: "Successful visits" },
    { label: "Total Patients", value: stats.totalUsers, icon: Users, color: "violet", sub: `${stats.totalDoctors} doctors` },
    { label: "Waiting Now", value: stats.waitingPatients, icon: AlertCircle, color: "orange", sub: "In queue today" },
    { label: "Cancelled", value: stats.cancelledAppointments, icon: XCircle, color: "red", sub: "All time" },
  ] : [];

  const colors = {
    blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600", violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hospital management overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/doctors">
            <Button variant="secondary" size="sm"><Stethoscope className="w-4 h-4" />Manage Doctors</Button>
          </Link>
          <Link href="/admin/book">
            <Button size="sm"><CalendarPlus className="w-4 h-4" />Book Appointment</Button>
          </Link>
          <Link href="/admin/appointments">
            <Button size="sm"><Calendar className="w-4 h-4" />All Appointments</Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", colors[s.color])}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-medium text-gray-700 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Patient Flow (Last 7 days)</h3>
          <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.length > 0 ? analytics : [{date:"Mon",total:0,completed:0,cancelled:0},{date:"Tue",total:0,completed:0,cancelled:0},{date:"Wed",total:0,completed:0,cancelled:0},{date:"Thu",total:0,completed:0,cancelled:0},{date:"Fri",total:0,completed:0,cancelled:0},{date:"Sat",total:0,completed:0,cancelled:0},{date:"Sun",total:0,completed:0,cancelled:0}]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[6,6,0,0]} maxBarSize={40} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6,6,0,0]} maxBarSize={40} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[6,6,0,0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Appointment Trends</h3>
          <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.length > 0 ? analytics : [{date:"Mon",total:0,pending:0},{date:"Tue",total:0,pending:0},{date:"Wed",total:0,pending:0},{date:"Thu",total:0,pending:0},{date:"Fri",total:0,pending:0},{date:"Sat",total:0,pending:0},{date:"Sun",total:0,pending:0}]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
          <Link href="/admin/appointments" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Patient", "Doctor", "Date & Time", "Type", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAppts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No appointments yet. Patients need to book.</td></tr>
              ) : recentAppts.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.doctorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.date)} {formatTime(a.timeSlot)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{a.type}</td>
                  <td className="px-6 py-4"><Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
