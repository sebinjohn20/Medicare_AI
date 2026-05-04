"use client";
import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Search, Filter, X } from "lucide-react";
import { Card, Badge, Button, EmptyState, Modal, Select, Spinner } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatTime, STATUS_COLORS, cn } from "@/lib/utils";
import Link from "next/link";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/appointments${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setAppointments(d.appointments); })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${cancelModal._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Appointment cancelled", "info");
        setCancelModal(null);
        fetchAppointments();
      } else { toast(data.message, "error"); }
    } catch { toast("Failed to cancel", "error"); }
    finally { setCancelling(false); }
  };

  const filtered = appointments.filter((a) =>
    search === "" || a.doctorName?.toLowerCase().includes(search.toLowerCase()) || a.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your appointments</p>
        </div>
        <Link href="/dashboard/book">
          <Button><Plus className="w-4 h-4" />Book New</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor or specialty..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all",
                filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Table / Cards */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments found"
            description="Book your first appointment with a specialist"
            action={<Link href="/dashboard/book"><Button size="sm"><Plus className="w-4 h-4" />Book Now</Button></Link>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Doctor", "Specialty", "Date", "Time", "Type", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-4 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm">{a.doctorName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.specialty}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(a.timeSlot)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{a.type}</td>
                      <td className="px-6 py-4">
                        <Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {(a.status === "pending" || a.status === "confirmed") && (
                          <button
                            onClick={() => setCancelModal(a)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtered.map((a) => (
                <div key={a._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{a.doctorName}</p>
                      <p className="text-xs text-blue-600">{a.specialty}</p>
                    </div>
                    <Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(a.date)}</span>
                    <span>{formatTime(a.timeSlot)}</span>
                    <span className="capitalize">{a.type}</span>
                  </div>
                  {(a.status === "pending" || a.status === "confirmed") && (
                    <button onClick={() => setCancelModal(a)} className="text-xs text-red-500 font-medium">Cancel appointment</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to cancel your appointment with{" "}
          <span className="font-semibold">{cancelModal?.doctorName}</span> on{" "}
          <span className="font-semibold">{formatDate(cancelModal?.date)}</span> at{" "}
          <span className="font-semibold">{formatTime(cancelModal?.timeSlot)}</span>?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setCancelModal(null)}>Keep</Button>
          <Button variant="danger" className="flex-1" loading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
