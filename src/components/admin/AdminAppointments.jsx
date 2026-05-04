"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Search, Trash2, Edit2, Check,
  CalendarPlus, Filter, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Card, Badge, Button, EmptyState, Modal, Select, Spinner } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatTime, STATUS_COLORS, cn } from "@/lib/utils";

const STATUSES  = ["all", "pending", "confirmed", "completed", "cancelled"];
const BOOKED_VIA_COLORS = {
  manual:  "bg-blue-50 text-blue-600",
  admin:   "bg-violet-50 text-violet-600",
  chatbot: "bg-emerald-50 text-emerald-600",
  call:    "bg-amber-50 text-amber-600",
};

export default function AdminAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState("all");
  const [search, setSearch]                 = useState("");
  const [editModal, setEditModal]           = useState(null);
  const [deleteModal, setDeleteModal]       = useState(null);
  const [editStatus, setEditStatus]         = useState("");
  const [saving, setSaving]                 = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (filter !== "all") params.set("status", filter);
    if (search)           params.set("search", search);
    fetch(`/api/appointments?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setAppointments(d.appointments); })
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchAll, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchAll, search]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/appointments/${editModal._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: editStatus }),
      });
      const data = await res.json();
      if (data.success) { toast("Status updated", "success"); setEditModal(null); fetchAll(); }
      else toast(data.message, "error");
    } catch { toast("Failed to update", "error"); }
    finally   { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/appointments/${deleteModal._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast("Appointment deleted", "success"); setDeleteModal(null); fetchAll(); }
      else toast(data.message, "error");
    } catch { toast("Failed to delete", "error"); }
    finally   { setSaving(false); }
  };

  // Stats bar
  const counts = STATUSES.slice(1).reduce((acc, s) => ({
    ...acc,
    [s]: appointments.filter((a) => a.status === s).length,
  }), {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {appointments.length} total records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/admin/book">
            <Button size="sm">
              <CalendarPlus className="w-4 h-4" /> Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Mini stat strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending",   key: "pending",   color: "text-amber-600 bg-amber-50 border-amber-100"  },
          { label: "Confirmed", key: "confirmed",  color: "text-blue-600 bg-blue-50 border-blue-100"     },
          { label: "Completed", key: "completed",  color: "text-green-600 bg-green-50 border-green-100"  },
          { label: "Cancelled", key: "cancelled",  color: "text-red-600 bg-red-50 border-red-100"        },
        ].map(({ label, key, color }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            className={cn(
              "rounded-2xl border p-3 text-left transition-all hover:shadow-sm",
              color,
              filter === key ? "ring-2 ring-offset-1 ring-current" : "",
            )}
          >
            <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or doctor…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm
              outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all",
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Table ── */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments found"
            description="Book the first appointment using the button above."
            action={
              <Link href="/admin/book">
                <Button size="sm"><CalendarPlus className="w-4 h-4" />Book Appointment</Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Patient","Doctor","Specialty","Date","Time","Type","Via","Status","Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5
                          uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        {a.patientName}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{a.doctorName}</td>
                      <td className="px-4 py-3.5 text-gray-500">{a.specialty}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(a.date)}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatTime(a.timeSlot)}</td>
                      <td className="px-4 py-3.5 text-gray-500 capitalize">{a.type}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          BOOKED_VIA_COLORS[a.bookedVia] || "bg-gray-100 text-gray-600",
                        )}>
                          {a.bookedVia || "manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditModal(a); setEditStatus(a.status); }}
                            title="Edit status"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(a)}
                            title="Delete"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {appointments.map((a) => (
                <div key={a._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.patientName}</p>
                      <p className="text-xs text-blue-600 truncate">{a.doctorName} · {a.specialty}</p>
                    </div>
                    <Badge className={cn("flex-shrink-0", STATUS_COLORS[a.status])}>{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>📅 {formatDate(a.date)}</span>
                    <span>🕐 {formatTime(a.timeSlot)}</span>
                    <span className="capitalize">📋 {a.type}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full capitalize",
                      BOOKED_VIA_COLORS[a.bookedVia] || "bg-gray-100 text-gray-600",
                    )}>
                      {a.bookedVia || "manual"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setEditModal(a); setEditStatus(a.status); }}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal(a)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:underline font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Update Appointment">
        {editModal && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-1.5 text-sm">
              <p><span className="text-gray-500">Patient:</span> <span className="font-semibold">{editModal.patientName}</span></p>
              <p><span className="text-gray-500">Doctor:</span>  <span className="font-semibold">{editModal.doctorName}</span></p>
              <p><span className="text-gray-500">Date:</span>    <span className="font-semibold">{formatDate(editModal.date)} at {formatTime(editModal.timeSlot)}</span></p>
            </div>

            <Select
              label="Update Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {["pending","confirmed","completed","cancelled"].map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Select>

            {/* Status hint */}
            <div className={cn(
              "px-4 py-3 rounded-xl text-xs font-medium border",
              STATUS_COLORS[editStatus],
            )}>
              {editStatus === "confirmed"  && "✅ Patient will be notified their appointment is confirmed."}
              {editStatus === "completed"  && "🏁 Mark this after the patient has seen the doctor."}
              {editStatus === "cancelled"  && "❌ This will cancel the appointment. Slot becomes available again."}
              {editStatus === "pending"    && "⏳ Appointment is waiting for confirmation."}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleStatusUpdate}>
                <Check className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Appointment">
        {deleteModal && (
          <>
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
              <p className="text-sm text-red-700">
                Permanently delete the appointment for{" "}
                <span className="font-bold">{deleteModal.patientName}</span> with{" "}
                <span className="font-bold">{deleteModal.doctorName}</span> on{" "}
                <span className="font-bold">{formatDate(deleteModal.date)}</span>?
              </p>
              <p className="text-xs text-red-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
                Keep It
              </Button>
              <Button variant="danger" className="flex-1" loading={saving} onClick={handleDelete}>
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
