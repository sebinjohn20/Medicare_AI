"use client";
import { useState } from "react";
import { User, Lock, Bell, Save } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast("Profile updated successfully", "success");
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" value={user?.email || ""} disabled className="bg-gray-50 cursor-not-allowed" />
          <Input label="Phone Number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
          <Input label="Role" value={user?.role || "user"} disabled className="bg-gray-50 cursor-not-allowed capitalize" />
        </div>
        <Button loading={saving} onClick={handleSave}><Save className="w-4 h-4" />Save Changes</Button>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        {[
          ["Email Notifications", "Receive appointment confirmations via email"],
          ["WhatsApp Reminders", "Get appointment reminders on WhatsApp"],
          ["SMS Alerts", "Receive SMS for urgent updates"],
        ].map(([label, desc]) => (
          <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        ))}
      </Card>
    </div>
  );
}
