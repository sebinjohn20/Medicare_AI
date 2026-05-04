"use client";
import { useState, useEffect } from "react";
import {
  Calendar, Clock, User, ChevronRight, ChevronLeft,
  Check, Search, UserPlus, Stethoscope, Star,
} from "lucide-react";
import { Card, Button, Select, Input, Spinner } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { formatTime, cn } from "@/lib/utils";

const STEPS = ["Select Patient", "Choose Doctor", "Date & Time", "Confirm"];
const TYPES = [
  { value: "in-person", label: "🏥 In Person" },
  { value: "video",     label: "📹 Video Call" },
  { value: "phone",     label: "📞 Phone Call" },
];

export default function AdminBookAppointment() {
  const { toast } = useToast();

  // Step tracker
  const [step, setStep] = useState(0);

  // Data
  const [users,    setUsers]    = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [slots,    setSlots]    = useState([]);

  // Loading states
  const [loadingUsers,   setLoadingUsers]   = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [submitting,     setSubmitting]     = useState(false);

  // Search
  const [userSearch, setUserSearch] = useState("");

  // Selections
  const [patientMode,    setPatientMode]    = useState("existing"); // "existing" | "walkin"
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [walkin,         setWalkin]         = useState({ name: "", email: "", phone: "" });
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form
  const [form, setForm] = useState({
    doctorId: "", date: "", timeSlot: "", type: "in-person",
    reason: "", patientPhone: "",
  });

  // ── Fetch users on search ───────────────────────────────────────────────────
  useEffect(() => {
    setLoadingUsers(true);
    const q = userSearch ? `?search=${encodeURIComponent(userSearch)}` : "";
    fetch(`/api/admin/users${q}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.users); })
      .finally(() => setLoadingUsers(false));
  }, [userSearch]);

  // ── Fetch doctors ───────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingDoctors(true);
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDoctors(d.doctors); })
      .finally(() => setLoadingDoctors(false));
  }, []);

  // ── Fetch slots when doctor + date selected ─────────────────────────────────
  useEffect(() => {
    if (!form.doctorId || !form.date) return;
    setLoadingSlots(true);
    setSlots([]);
    fetch(`/api/doctors/${form.doctorId}/slots?date=${form.date}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSlots(d.slots); })
      .finally(() => setLoadingSlots(false));
  }, [form.doctorId, form.date]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const displayPatientName = patientMode === "existing"
    ? selectedUser?.name
    : walkin.name;

  const canProceedStep0 = patientMode === "existing"
    ? !!selectedUser
    : walkin.name.trim().length > 1;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ...(patientMode === "existing"
          ? { overridePatientId: selectedUser._id }
          : {
              overridePatientName:  walkin.name,
              overridePatientEmail: walkin.email,
              patientPhone:         walkin.phone,
            }),
      };

      const res  = await fetch("/api/appointments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) { toast(data.message, "error"); return; }
      toast(`Appointment confirmed for ${displayPatientName}!`, "success");
      window.location.href = "/admin/appointments";
    } catch {
      toast("Failed to book appointment. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step bar ────────────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <button
            onClick={() => i < step && setStep(i)}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0",
              i < step
                ? "bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700"
                : i === step
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-400 cursor-default",
            )}
          >
            {i < step ? <Check className="w-4 h-4" /> : i + 1}
          </button>
          <div className="flex-1 px-2 hidden sm:block">
            <p className={cn("text-xs font-medium truncate", i === step ? "text-blue-600" : "text-gray-400")}>
              {label}
            </p>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 mt-1 rounded", i < step ? "bg-blue-600" : "bg-gray-200")} />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 0 — SELECT PATIENT
  // ══════════════════════════════════════════════════════════════════════════
  const Step0 = () => (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Patient</h2>
        <p className="text-sm text-gray-500">Choose an existing registered patient or enter a walk-in patient.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[
          { key: "existing", icon: User,     label: "Registered Patient" },
          { key: "walkin",   icon: UserPlus, label: "Walk-in / New"      },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => { setPatientMode(key); setSelectedUser(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all",
              patientMode === key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Existing patient search */}
      {patientMode === "existing" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No patients found</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
              {users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    selectedUser?._id === u._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-blue-200 hover:bg-gray-50",
                  )}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                  </div>
                  {selectedUser?._id === u._id && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Walk-in form */}
      {patientMode === "walkin" && (
        <div className="space-y-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs text-amber-700 font-medium">
            Walk-in patients won&apos;t have a portal account. The appointment will be logged under admin.
          </p>
          <Input
            label="Patient Full Name *"
            value={walkin.name}
            onChange={(e) => setWalkin({ ...walkin, name: e.target.value })}
            placeholder="e.g. Rajan Pillai"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={walkin.email}
            onChange={(e) => setWalkin({ ...walkin, email: e.target.value })}
            placeholder="patient@email.com"
          />
          <Input
            label="Phone Number *"
            type="tel"
            value={walkin.phone}
            onChange={(e) => setWalkin({ ...walkin, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </div>
      )}

      {/* Selection summary */}
      {(selectedUser || (patientMode === "walkin" && walkin.name)) && (
        <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              {patientMode === "existing" ? selectedUser.name : walkin.name}
            </p>
            <p className="text-xs text-green-600">
              {patientMode === "existing" ? selectedUser.email : (walkin.phone || "Walk-in patient")}
            </p>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!canProceedStep0}
        onClick={() => setStep(1)}
      >
        Continue <ChevronRight className="w-4 h-4" />
      </Button>
    </Card>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — CHOOSE DOCTOR
  // ══════════════════════════════════════════════════════════════════════════
  const Step1 = () => (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Doctor</h2>
        <p className="text-sm text-gray-500">Select the specialist for this appointment.</p>
      </div>

      {loadingDoctors ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-10">
          <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No doctors found.</p>
          <button
            onClick={async () => { await fetch("/api/seed", { method: "POST" }); location.reload(); }}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            Seed demo doctors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-hide">
          {doctors.map((doc) => (
            <button
              key={doc._id}
              onClick={() => {
                setSelectedDoctor(doc);
                setForm({ ...form, doctorId: doc._id, timeSlot: "", date: "" });
                setStep(2);
              }}
              className="text-left p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {doc.name.split(" ").slice(1).map((n) => n[0]).join("").slice(0, 2) || doc.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{doc.name}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{doc.specialty}</p>
                  <p className="text-xs text-gray-400 mt-1">{doc.qualification || "MBBS"} · {doc.experience}y exp</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{doc.rating}
                    </span>
                    <span className="text-xs font-semibold text-green-700">₹{doc.consultationFee}</span>
                    <span className="text-xs text-gray-400">{doc.workingHours?.start}–{doc.workingHours?.end}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={() => setStep(0)}>
        <ChevronLeft className="w-4 h-4" /> Back
      </Button>
    </Card>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — DATE & TIME
  // ══════════════════════════════════════════════════════════════════════════
  const Step2 = () => (
    <div className="space-y-4">
      {/* Selected doctor chip */}
      {selectedDoctor && (
        <Card className="p-4 flex items-center gap-3 bg-blue-50 border-blue-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {selectedDoctor.name.split(" ").slice(1).map((n) => n[0]).join("").slice(0,2) || selectedDoctor.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{selectedDoctor.name}</p>
            <p className="text-xs text-blue-600">{selectedDoctor.specialty} · ₹{selectedDoctor.consultationFee}</p>
          </div>
          <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Change</button>
        </Card>
      )}

      <Card className="p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Date &amp; Time</h2>

        {/* Date picker */}
        <Input
          label="Appointment Date"
          type="date"
          min={minDate}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: "" })}
        />

        {/* Slot grid */}
        {form.date && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Slots
              {loadingSlots && <span className="ml-2 text-xs text-blue-500">Loading…</span>}
            </label>
            {loadingSlots ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                No slots available for this date
              </p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setForm({ ...form, timeSlot: slot.time })}
                    title={!slot.available ? "Already booked" : slot.time}
                    className={cn(
                      "py-2 text-xs rounded-xl border-2 font-medium transition-all",
                      !slot.available
                        ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                        : form.timeSlot === slot.time
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700",
                    )}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointment type */}
        <Select
          label="Appointment Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Symptoms</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            placeholder="Chief complaint or reason for visit…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
          />
        </div>

        {/* Phone */}
        <Input
          label="Contact Number"
          type="tel"
          value={form.patientPhone}
          onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
          placeholder="+91 98765 43210"
        />
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep(1)}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          className="flex-1"
          disabled={!form.date || !form.timeSlot}
          onClick={() => setStep(3)}
        >
          Review &amp; Confirm <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3 — CONFIRM
  // ══════════════════════════════════════════════════════════════════════════
  const Step3 = () => {
    const rows = [
      ["Patient",    displayPatientName],
      ["Doctor",     selectedDoctor?.name],
      ["Specialty",  selectedDoctor?.specialty],
      ["Date",       new Date(form.date).toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })],
      ["Time",       formatTime(form.timeSlot)],
      ["Type",       TYPES.find((t) => t.value === form.type)?.label],
      ["Fee",        `₹${selectedDoctor?.consultationFee}`],
      ["Status",     "Confirmed (Admin booking)"],
      ...(form.reason ? [["Reason", form.reason]] : []),
      ...(form.patientPhone ? [["Phone", form.patientPhone]] : []),
    ];

    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Review Appointment</h2>

          {/* Summary badge */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">Admin booking — auto-confirmed</p>
              <p className="text-xs text-green-600">Patient will be notified if they have an account.</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-3">
                <span className="text-sm text-gray-500 flex-shrink-0 w-28">{label}</span>
                <span className={cn(
                  "text-sm font-medium text-right flex-1",
                  label === "Status" ? "text-green-700" : "text-gray-900",
                )}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep(2)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            loading={submitting}
            onClick={handleSubmit}
          >
            <Check className="w-4 h-4" /> Book Appointment
          </Button>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manually schedule an appointment on behalf of a patient.
        </p>
      </div>

      <StepBar />

      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  );
}
