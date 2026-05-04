"use client";

import { useState } from "react";
import { Search, Filter, MessageSquare, Phone, Download, Eye, ArrowLeft } from "lucide-react";
import { Card, Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { conversationsData } from "@/data";

export default function ConversationsView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = conversationsData.filter((c) => {
    const matchSearch =
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || c.type === filter;
    return matchSearch && matchType;
  });

  const sentimentColors = {
    positive: "bg-green-100 text-green-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-700",
  };

  const handleSelect = (conv) => {
    setSelected(conv);
    setShowDetail(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Conversation History</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">View and analyze all customer interactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total", value: conversationsData.length, color: "bg-blue-50", icon: "text-blue-600" },
          { label: "Resolved", value: conversationsData.filter((c) => c.resolved).length, color: "bg-green-50", icon: "text-green-600" },
          { label: "Avg Duration", value: "7 min", color: "bg-purple-50", icon: "text-purple-600" },
          { label: "Satisfaction", value: "92%", color: "bg-orange-50", icon: "text-orange-600" },
        ].map((s, i) => (
          <Card key={i} className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center", s.color)}>
                <MessageSquare className={cn("w-4 h-4 sm:w-6 sm:h-6", s.icon)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[["all", "All", Filter], ["chat", "Chat", MessageSquare], ["call", "Calls", Phone]].map(([v, label, Icon]) => (
            <Button key={v} size="sm" variant={filter === v ? "default" : "outline"} onClick={() => setFilter(v)}>
              <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{label}
            </Button>
          ))}
          <Button size="sm" variant="outline"><Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />Export</Button>
        </div>
      </div>

      {/* List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* List */}
        <Card className={cn("p-4 sm:p-6", showDetail && selected ? "hidden lg:block" : "block")}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">All Conversations ({filtered.length})</h3>
          <div className="space-y-3 max-h-[500px] lg:max-h-[600px] overflow-y-auto">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={cn(
                  "p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors",
                  selected?.id === conv.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      conv.type === "chat" ? "bg-purple-100" : "bg-blue-100"
                    )}>
                      {conv.type === "chat"
                        ? <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        : <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{conv.customer}</p>
                      <p className="text-xs text-gray-400">{conv.date} • {conv.time}</p>
                    </div>
                  </div>
                  <Badge className={sentimentColors[conv.sentiment]}>{conv.sentiment}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{conv.summary}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Duration: {conv.duration}</span>
                  <Badge className={conv.resolved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {conv.resolved ? "Resolved" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Detail */}
        <Card className={cn("p-4 sm:p-6", showDetail && selected ? "block" : "hidden lg:block")}>
          {selected ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Mobile back button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDetail(false)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Conversation Details</h3>
              </div>
              <div className="space-y-2">
                {[
                  ["Customer", selected.customer],
                  ["Type", selected.type],
                  ["Date & Time", `${selected.date} ${selected.time}`],
                  ["Duration", selected.duration],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm capitalize">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-500">Sentiment</span>
                  <Badge className={sentimentColors[selected.sentiment]}>{selected.sentiment}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs sm:text-sm text-gray-500">Status</span>
                  <Badge className={selected.resolved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {selected.resolved ? "Resolved" : "Pending"}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Summary</h4>
                <p className="text-xs sm:text-sm text-gray-600">{selected.summary}</p>
              </div>
              {selected.transcript && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Transcript</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 max-h-48 overflow-y-auto">
                    {selected.transcript.map((line, i) => (
                      <p key={i} className="text-xs sm:text-sm text-gray-700">{line}</p>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full text-sm">
                <Download className="w-4 h-4 mr-2" />Download Transcript
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-16">
              <Eye className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
              <p className="text-gray-400 text-sm">Select a conversation to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
