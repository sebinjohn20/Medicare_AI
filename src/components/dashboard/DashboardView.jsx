"use client";

import { Phone, MessageSquare, Calendar, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  statsData,
  callsChartData,
  responseTimeData,
  recentActivities,
} from "@/data";

export default function DashboardView() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          const colorMap = {
            blue: "bg-blue-50 text-blue-600",
            purple: "bg-purple-50 text-purple-600",
            green: "bg-green-50 text-green-600",
            orange: "bg-orange-50 text-orange-600",
          };
          return (
            <Card key={i} className="p-4 sm:p-5 lg:p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                  className={cn("p-2 sm:p-3 rounded-xl", colorMap[stat.color])}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Calls Chart */}
        <Card className="p-4 sm:p-6 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Calls Overview
            </h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-auto">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="w-full h-[220px] sm:h-[260px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs sm:text-sm text-gray-500">
                Total Calls
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs sm:text-sm text-gray-500">Resolved</span>
            </div>
          </div>
        </Card>

        {/* Response Time */}
        <Card className="p-4 sm:p-6 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Avg Response Time
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>2.8s avg</span>
            </div>
          </div>
          <div className="w-full h-[220px] sm:h-[260px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
            Response time in seconds
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6 rounded-2xl">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivities.map((a, i) => (
            <div
              key={i}
              className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  a.type === "call"
                    ? "bg-blue-100"
                    : a.type === "chat"
                      ? "bg-purple-100"
                      : "bg-green-100",
                )}
              >
                {a.type === "call" ? (
                  <Phone className="w-5 h-5 text-blue-600" />
                ) : a.type === "chat" ? (
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                ) : (
                  <Calendar className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {a.user}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{a.action}</p>
              </div>
              <div className="flex xs:flex-col xs:items-end items-center gap-2 xs:gap-1">
                <Badge
                  className={
                    a.status === "success"
                      ? "bg-green-100 text-green-700"
                      : a.status === "active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                  }
                >
                  {a.status}
                </Badge>
                <p className="text-xs text-gray-400">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
