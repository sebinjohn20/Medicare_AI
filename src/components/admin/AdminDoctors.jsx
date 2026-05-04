"use client";
import { useState, useEffect, useCallback } from "react";
import { Stethoscope, Plus, Edit2, Trash2, Star, Check } from "lucide-react";
import { Card, Button, Badge, EmptyState, Modal, Input, Select, Spinner } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const SPECIALTIES = ["Cardiology","Orthopedics","Pediatrics","Neurology","Gynecology","Dermatology","General Medicine","ENT","Ophthalmology","Psychiatry","Oncology","Urology","Nephrology","Gastroenterology","Pulmonology"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EMPTY_FORM = { name:"", email:"", specialty:"Cardiology", department:"", qualification:"", experience:0, consultationFee:500, bio:"", workingHours:{start:"09:00",end:"17:00"}, workingDays:["Monday","Tuesday","Wednesday","Thursday","Friday"], slotDuration:30 };

export default function AdminDoctors() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "add" | "edit" | null
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/doctors")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDoctors(d.doctors); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal("form"); };
  const openEdit = (doc) => {
    setForm({ ...doc, workingHours: doc.workingHours || { start:"09:00", end:"17:00" }, workingDays: doc.workingDays || DAYS.slice(0,5) });
    setEditTarget(doc);
    setModal("form");
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.specialty) { toast("Name, email and specialty are required","error"); return; }
    setSaving(true);
    try {
      const url = editTarget ? `/api/admin/doctors/${editTarget._id}` : "/api/admin/doctors";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type":"application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast(editTarget ? "Doctor updated" : "Doctor added", "success"); setModal(null); fetchDoctors(); }
      else toast(data.message, "error");
    } catch { toast("Failed to save","error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/doctors/${deleteModal._id}`, { method:"DELETE" });
      const data = await res.json();
      if (data.success) { toast("Doctor deactivated","success"); setDeleteModal(null); fetchDoctors(); }
      else toast(data.message, "error");
    } catch { toast("Failed","error"); }
    finally { setSaving(false); }
  };

  const toggleDay = (day) => {
    const days = form.workingDays.includes(day) ? form.workingDays.filter((d) => d !== day) : [...form.workingDays, day];
    setForm({ ...form, workingDays: days });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{doctors.length} doctors registered</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" />Add Doctor</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> :
        doctors.length === 0 ? (
          <Card className="p-10 text-center">
            <EmptyState icon={Stethoscope} title="No doctors yet" description="Add your first doctor to get started" action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Doctor</Button>} />
            <button onClick={async () => { const r = await fetch("/api/seed",{method:"POST"}); const d = await r.json(); toast(d.message, d.success ? "success" : "error"); fetchDoctors(); }} className="mt-4 text-sm text-blue-600 hover:underline">Or load demo data</button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <Card key={doc._id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {doc.name.split(" ").slice(1).map((n) => n[0]).join("") || doc.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-blue-600 font-medium">{doc.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(doc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteModal(doc)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p>🎓 {doc.qualification || "MBBS"}</p>
                  <p>⏱ {doc.experience} years experience</p>
                  <p>🕐 {doc.workingHours?.start} - {doc.workingHours?.end}</p>
                  <p>💰 ₹{doc.consultationFee} per visit</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-gray-700">{doc.rating}</span>
                  </div>
                  <Badge className={doc.isAvailable ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                    {doc.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

      {/* Form Modal */}
      <Modal isOpen={modal === "form"} onClose={() => setModal(null)} title={editTarget ? "Edit Doctor" : "Add New Doctor"} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="Dr. John Smith" />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} placeholder="doctor@hospital.com" />
          <Select label="Specialty *" value={form.specialty} onChange={(e) => setForm({...form,specialty:e.target.value})}>
            {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Input label="Department" value={form.department} onChange={(e) => setForm({...form,department:e.target.value})} placeholder="Heart & Vascular" />
          <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({...form,qualification:e.target.value})} placeholder="MBBS, MD" />
          <Input label="Experience (years)" type="number" value={form.experience} onChange={(e) => setForm({...form,experience:+e.target.value})} />
          <Input label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={(e) => setForm({...form,consultationFee:+e.target.value})} />
          <Input label="Slot Duration (minutes)" type="number" value={form.slotDuration} onChange={(e) => setForm({...form,slotDuration:+e.target.value})} />
          <Input label="Start Time" type="time" value={form.workingHours?.start} onChange={(e) => setForm({...form,workingHours:{...form.workingHours,start:e.target.value}})} />
          <Input label="End Time" type="time" value={form.workingHours?.end} onChange={(e) => setForm({...form,workingHours:{...form.workingHours,end:e.target.value}})} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button key={day} onClick={() => toggleDay(day)}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-medium border transition-all", form.workingDays?.includes(day) ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                {day.slice(0,3)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({...form,bio:e.target.value})} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none" placeholder="Brief professional bio..." />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
          <Button className="flex-1" loading={saving} onClick={handleSave}><Check className="w-4 h-4" />{editTarget ? "Update" : "Add Doctor"}</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Deactivate Doctor">
        <p className="text-sm text-gray-600 mb-6">Deactivate <span className="font-semibold">{deleteModal?.name}</span>? They won&apos;t appear in new bookings.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={saving} onClick={handleDelete}>Deactivate</Button>
        </div>
      </Modal>
    </div>
  );
}
