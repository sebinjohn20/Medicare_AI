"use client";

import { useState } from "react";
import { Save, Bot, Zap, Mic, Bell, Globe, Users, Shield } from "lucide-react";
import { Card, Button, Input, Label, Switch, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function SettingsView() {
  const [settings, setSettings] = useState({
    companyName: "Acme Inc.",
    companyPhone: "+1 (555) 123-4567",
    companyEmail: "hello@acme.com",
    aiModel: "gpt-4",
    voiceProvider: "elevenlabs",
    voiceGender: "female",
    responseSpeed: "balanced",
    autoTransfer: true,
    recordCalls: true,
    sendTranscripts: true,
    emailNotifications: true,
    smsNotifications: false,
    enableRAG: true,
    temperature: 0.7,
    maxTokens: 500,
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const up = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Bot },
    { id: "ai", label: "AI Config", icon: Zap },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Globe },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Configure your AI receptionist</p>
        </div>
        <Button
          onClick={handleSave}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 self-start sm:self-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />{label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />Company Information
            </h3>
            <div className="space-y-4">
              {[
                ["companyName", "Company Name", "text", "Acme Inc."],
                ["companyPhone", "Phone Number", "tel", "+1 (555)..."],
                ["companyEmail", "Email", "email", "hello@company.com"],
              ].map(([k, label, type, ph]) => (
                <div key={k}>
                  <Label htmlFor={k}>{label}</Label>
                  <Input id={k} type={type} className="mt-1.5" value={settings[k]} placeholder={ph}
                    onChange={(e) => up(k, e.target.value)} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />Automation
            </h3>
            {[
              ["autoTransfer", "Auto Transfer to Human", "Transfer complex queries automatically"],
              ["recordCalls", "Record Calls", "Save call recordings for quality assurance"],
              ["sendTranscripts", "Send Transcripts", "Email conversation summaries"],
            ].map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 last:border-0 gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <Switch checked={settings[k]} onCheckedChange={(v) => up(k, v)} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* AI Config */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">AI Model Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>AI Model</Label>
                <select value={settings.aiModel} onChange={(e) => up("aiModel", e.target.value)}
                  className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="gpt-4">GPT-4 (Most Capable)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                  <option value="claude-3">Claude 3 Sonnet</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
              <div>
                <Label>Temperature: {settings.temperature}</Label>
                <input type="range" min="0" max="1" step="0.1" value={settings.temperature}
                  onChange={(e) => up("temperature", parseFloat(e.target.value))}
                  className="w-full mt-2 accent-blue-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Precise</span><span>Creative</span>
                </div>
              </div>
              <div>
                <Label>Max Response Tokens</Label>
                <Input type="number" value={settings.maxTokens}
                  onChange={(e) => up("maxTokens", parseInt(e.target.value))} className="mt-1.5" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">RAG Settings</h3>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-4 gap-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">Enable Knowledge Base</p>
                <p className="text-xs text-gray-500">Use FAQs to improve responses</p>
              </div>
              <Switch checked={settings.enableRAG} onCheckedChange={(v) => up("enableRAG", v)} />
            </div>
            <p className="text-sm text-gray-500">
              When enabled, the AI will reference your knowledge base to provide accurate, company-specific answers.
            </p>
          </Card>
        </div>
      )}

      {/* Voice */}
      {activeTab === "voice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Text-to-Speech</h3>
            <div className="space-y-4">
              {[
                ["voiceProvider", "Voice Provider", [["elevenlabs","ElevenLabs (Recommended)"],["google","Google TTS"],["amazon","Amazon Polly"],["azure","Azure Neural"]]],
                ["voiceGender", "Voice Gender", [["female","Female"],["male","Male"]]],
                ["responseSpeed", "Response Speed", [["fast","Fast"],["balanced","Balanced"],["natural","Natural"]]],
              ].map(([k, label, opts]) => (
                <div key={k}>
                  <Label>{label}</Label>
                  <select value={settings[k]} onChange={(e) => up(k, e.target.value)}
                    className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Speech Recognition</h3>
            <div className="space-y-4">
              <div>
                <Label>Provider</Label>
                <select className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Deepgram (Recommended)</option>
                  <option>Google Speech-to-Text</option>
                  <option>AssemblyAI</option>
                  <option>OpenAI Whisper</option>
                </select>
              </div>
              <div>
                <Label>Language</Label>
                <select className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Notification Preferences</h3>
          <div className="space-y-1">
            {[
              ["emailNotifications", "Email Notifications", "Receive email alerts for important events"],
              ["smsNotifications", "SMS Notifications", "Get text messages for urgent matters"],
            ].map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <Switch checked={settings[k]} onCheckedChange={(v) => up(k, v)} />
              </div>
            ))}
            {[
              ["New Appointments", "Alert when appointments are booked", true],
              ["Missed Calls", "Notify when calls are missed", true],
              ["Daily Summary", "Receive daily activity reports", true],
              ["Error Alerts", "Immediate alerts for system errors", true],
            ].map(([l, d, def]) => (
              <div key={l} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 last:border-0 gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{l}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{d}</p>
                </div>
                <Switch defaultChecked={def} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Integrations */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            ["Twilio", "Phone calls & SMS", true],
            ["SendGrid", "Email notifications", true],
            ["Google Calendar", "Appointment sync", false],
            ["Slack", "Team notifications", false],
            ["WhatsApp Business", "WhatsApp messaging", false],
            ["CRM Integration", "Salesforce, HubSpot", false],
          ].map(([name, desc, connected]) => (
            <Card key={name} className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{desc}</p>
                </div>
                <Badge className={connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                  {connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full text-sm">{connected ? "Configure" : "Connect"}</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
