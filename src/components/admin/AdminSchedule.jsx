"use client";
import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, Check, AlertTriangle } from "lucide-react";
import { Card, Button, Select, Input, Modal, Spinner, Badge, EmptyState } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { formatDate, cn } from "@/lib/utils";

export default function AdminSchedule() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    doctorId: "", date: "", startTime: "09:00", endTime: "17:00",
    slotDuration: 30, isHoliday: false, isEmergencyLeave: false, leaveReason: "",
  });

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/doctors").then((r) => r.json()),
      fetch("/api/schedule").then((r) => r.json()),
    ]).then(([doc, sched]) => {
      if (doc.success) { setDoctors(doc.doctors); if (doc.doctors.length > 0) setForm((f) => ({ ...f, doctorId: doc.doctors[0]._id })); }
      if (sched.success) setSchedules(sched.schedules);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.doctorId || !form.date) { toast("Doctor and date required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Schedule saved", "success"); setModal(false); fetchData(); }
      else toast(data.message, "error");
    } catch { toast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage availability, leaves and holidays</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="w-4 h-4" />Set Schedule</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : schedules.length === 0 ? (
        <Card className="p-10">
          <EmptyState icon={Clock} title="No schedules yet" description="Set doctor schedules to manage availability" action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" />Set Schedule</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedules.map((s) => (
            <Card key={s._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.doctorId?.name || "Doctor"}</p>
                  <p className="text-xs text-blue-600">{s.doctorId?.specialty}</p>
                </div>
                <Badge className={
                  s.isEmergencyLeave ? "bg-red-100 text-red-700 border-red-200" :
                  s.isHoliday ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-green-100 text-green-700 border-green-200"
                }>
                  {s.isEmergencyLeave ? "Emergency Leave" : s.isHoliday ? "Holiday" : "Active"}
                </Badge>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <p>📅 {formatDate(s.date)}</p>
                <p>🕐 {s.startTime} – {s.endTime}</p>
                <p>⏱ {s.slotDuration} min slots • Max {s.maxPatients} patients</p>
                {s.leaveReason && <p className="text-amber-600">⚠ {s.leaveReason}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Set Doctor Schedule">
        <div className="space-y-4">
          <Select label="Doctor" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialty}</option>)}
          </Select>
          <Input label="Date" type="date" min={minDate} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <Input label="Slot Duration (minutes)" type="number" value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: +e.target.value })} />

          {/* Leave options */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm font-medium text-amber-800">Leave / Unavailability</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isHoliday} onChange={(e) => setForm({ ...form, isHoliday: e.target.checked, isEmergencyLeave: false })} className="rounded" />
              <span className="text-sm text-gray-700">Mark as Holiday</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEmergencyLeave} onChange={(e) => setForm({ ...form, isEmergencyLeave: e.target.checked, isHoliday: false })} className="rounded" />
              <span className="text-sm text-gray-700">Emergency Leave</span>
            </label>
            {(form.isHoliday || form.isEmergencyLeave) && (
              <Input label="Reason" value={form.leaveReason} onChange={(e) => setForm({ ...form, leaveReason: e.target.value })} placeholder="Reason for unavailability..." />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}><Check className="w-4 h-4" />Save Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
