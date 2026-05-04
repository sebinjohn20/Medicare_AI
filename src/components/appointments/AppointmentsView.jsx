"use client";

import { useState } from "react";
import { Calendar, Clock, Mail, Phone } from "lucide-react";
import { Card, Button, Badge, CalendarWidget } from "@/components/ui";
import { cn } from "@/lib/utils";
import { appointments, upcomingDays } from "@/data";

export default function AppointmentsView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("day");
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your schedule and bookings</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {["day", "week", "month"].map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                className={cn("text-xs sm:text-sm", view === v ? "bg-white text-gray-900 shadow-sm" : "")}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm"
          >
            + New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Panel */}
        <div className="lg:col-span-1">
          {/* Mobile: collapsible */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm mb-2 text-sm font-medium text-gray-700"
          >
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Calendar</span>
            <span className="text-gray-400 text-xs">{showCalendar ? "Hide" : "Show"}</span>
          </button>

          <div className={cn("lg:block", showCalendar ? "block" : "hidden lg:block")}>
            <Card className="p-4 sm:p-6">
              <CalendarWidget selected={selectedDate} onSelect={setSelectedDate} />
              <div className="mt-4 sm:mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Upcoming Days</h4>
                {upcomingDays.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{d.day}</p>
                      <p className="text-xs text-gray-500">{d.date}</p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">{d.count} appts</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{appointments.length} appointments</span>
              </div>
            </div>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{apt.time.split(" ")[0]}</p>
                    <p className="text-xs text-gray-400">{apt.time.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{apt.name}</p>
                      <Badge className={apt.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{apt.email}</span></span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 flex-shrink-0" />{apt.phone}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col sm:items-end items-center justify-between sm:justify-start gap-2">
                    <p className="text-sm font-medium text-gray-900">{apt.service}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />60 min
                    </p>
                  </div>
                  <div className="flex gap-2 sm:flex-col sm:gap-1.5 flex-shrink-0">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1">Edit</Button>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1">Cancel</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Total Today", value: appointments.length, color: "text-gray-900", bg: "bg-blue-50", iconColor: "text-blue-600" },
              { label: "Confirmed", value: appointments.filter((a) => a.status === "confirmed").length, color: "text-green-600", bg: "bg-green-50", iconColor: "text-green-600" },
              { label: "Pending", value: appointments.filter((a) => a.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50", iconColor: "text-yellow-600" },
            ].map((s, i) => (
              <Card key={i} className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={cn("text-xl sm:text-2xl font-bold mt-1", s.color)}>{s.value}</p>
                  </div>
                  <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center", s.bg)}>
                    <Calendar className={cn("w-5 h-5 sm:w-6 sm:h-6", s.iconColor)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
