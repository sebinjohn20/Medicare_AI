"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Plus, Bot, Phone } from "lucide-react";
import { Card, Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { cn, formatDate, formatTime, STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function UserDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments?limit=5")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAppointments(d.appointments); })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: Calendar, color: "blue" },
    { label: "Upcoming", value: appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length, icon: Clock, color: "violet" },
    { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, icon: CheckCircle, color: "green" },
    { label: "Cancelled", value: appointments.filter((a) => a.status === "cancelled").length, icon: XCircle, color: "red" },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600",
    green: "bg-green-50 text-green-600", red: "bg-red-50 text-red-600",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Here&apos;s your health overview for today.</p>
        </div>
        <Link href="/dashboard/book">
          <Button><Plus className="w-4 h-4" />Book Appointment</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 sm:p-5">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colorMap[s.color])}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "-" : s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500 to-violet-600 text-white border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Chat Receptionist</h3>
              <p className="text-xs text-blue-100">Book appointments via chat</p>
            </div>
          </div>
          <p className="text-sm text-blue-100 mb-4">Let our AI assistant help you find the right doctor and schedule your appointment instantly.</p>
          <Link href="/dashboard/ai-chat">
            <Button variant="secondary" size="sm" className="bg-white text-blue-700 hover:bg-blue-50 border-0">
              Start Chat
            </Button>
          </Link>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Call to Book</h3>
              <p className="text-xs text-emerald-100">24/7 voice appointment</p>
            </div>
          </div>
          <p className="text-sm text-emerald-100 mb-4">Call our AI receptionist anytime to book, modify or cancel your appointments by voice.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="tel:+911800MEDICARE"
               className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-sm font-semibold transition-all">
              <Phone className="w-3.5 h-3.5" />+91 1800-MEDICARE
            </a>
            <a href="https://wa.me/911234567890?text=Hi%2C%20I%20want%20to%20book%20an%20appointment"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#1ebe59] rounded-xl text-sm font-semibold transition-all">
              WhatsApp
            </a>
          </div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments yet"
            description="Book your first appointment with our AI receptionist"
            action={<Link href="/dashboard/book"><Button size="sm"><Plus className="w-4 h-4" />Book Now</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{a.doctorName || "Doctor"}</p>
                  <p className="text-xs text-gray-500">{a.specialty} • {formatDate(a.date)} at {formatTime(a.timeSlot)}</p>
                </div>
                <Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stethoscope({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
