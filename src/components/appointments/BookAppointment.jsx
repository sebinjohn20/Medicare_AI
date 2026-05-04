"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Card, Button, Select, Input, Spinner } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { formatTime, cn } from "@/lib/utils";

const STEPS = ["Choose Doctor", "Pick Date & Time", "Confirm"];
const TYPES = [{ value: "in-person", label: "In Person" }, { value: "video", label: "Video Call" }, { value: "phone", label: "Phone Call" }];

export default function BookAppointment() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    doctorId: "", date: "", timeSlot: "", type: "in-person", reason: "", patientPhone: "",
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDoctors(d.doctors); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      setLoading(true);
      fetch(`/api/doctors/${form.doctorId}/slots?date=${form.date}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setSlots(d.slots); })
        .finally(() => setLoading(false));
    }
  }, [form.doctorId, form.date]);

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    setForm({ ...form, doctorId: doc._id, timeSlot: "" });
    setStep(1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { toast(data.message, "error"); return; }
      toast("Appointment booked successfully!", "success");
      router.push("/dashboard/appointments");
    } catch { toast("Failed to book. Please try again.", "error"); }
    finally { setSubmitting(false); }
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">Schedule a consultation with our specialists</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0",
              i < step ? "bg-blue-600 border-blue-600 text-white" :
              i === step ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-400"
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className="flex-1 mx-2">
              <p className={cn("text-xs font-medium hidden sm:block", i === step ? "text-blue-600" : "text-gray-400")}>{s}</p>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 mt-1 sm:mt-0 hidden sm:block rounded", i < step ? "bg-blue-600" : "bg-gray-200")} />}
            </div>
          </div>
        ))}
      </div>

      {/* Step 0: Doctor */}
      {step === 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select a Doctor</h2>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No doctors available. Ask admin to add doctors or run the seed endpoint.</p>
              <button onClick={async () => { await fetch("/api/seed", { method: "POST" }); location.reload(); }} className="mt-3 text-blue-600 text-sm hover:underline">Seed Demo Data</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleDoctorSelect(doc)}
                  className="text-left p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {doc.name.split(" ").slice(1).map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-blue-600 font-medium">{doc.specialty}</p>
                      <p className="text-xs text-gray-400 mt-1">{doc.experience} yrs experience</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">⭐ {doc.rating}</span>
                        <span className="text-xs font-semibold text-green-700">₹{doc.consultationFee}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <div className="space-y-4">
          {selectedDoctor && (
            <Card className="p-4 flex items-center gap-3 bg-blue-50 border-blue-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                {selectedDoctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedDoctor.name}</p>
                <p className="text-xs text-blue-600">{selectedDoctor.specialty}</p>
              </div>
              <button onClick={() => setStep(0)} className="ml-auto text-xs text-blue-600 hover:underline">Change</button>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <Input
              label="Select Date"
              type="date"
              min={minDate}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: "" })}
            />

            {form.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                {loading ? (
                  <div className="flex justify-center py-6"><Spinner /></div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setForm({ ...form, timeSlot: slot.time })}
                        className={cn(
                          "py-2 px-1 text-xs rounded-xl border-2 font-medium transition-all",
                          !slot.available ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed" :
                          form.timeSlot === slot.time ? "bg-blue-600 border-blue-600 text-white shadow-md" :
                          "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                        )}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Select label="Appointment Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>

            <Input label="Reason for Visit" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe your symptoms or reason..." />
            <Input label="Contact Number" type="tel" value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} placeholder="+91 98765 43210" />
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}><ChevronLeft className="w-4 h-4" />Back</Button>
            <Button
              className="flex-1"
              disabled={!form.date || !form.timeSlot}
              onClick={() => setStep(2)}
            >Continue<ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Confirm Appointment</h2>
            <div className="space-y-3">
              {[
                ["Doctor", selectedDoctor.name],
                ["Specialty", selectedDoctor.specialty],
                ["Date", new Date(form.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
                ["Time", formatTime(form.timeSlot)],
                ["Type", TYPES.find((t) => t.value === form.type)?.label],
                ["Fee", `₹${selectedDoctor.consultationFee}`],
                ...(form.reason ? [["Reason", form.reason]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" />Back</Button>
            <Button className="flex-1" loading={submitting} onClick={handleSubmit}>
              <Check className="w-4 h-4" />Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
