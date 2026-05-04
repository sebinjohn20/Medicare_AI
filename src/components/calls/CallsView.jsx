"use client";

import { useState, useRef } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  PhoneForwarded, Clock, User,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { callHistory } from "@/data";

export default function CallsView() {
  const [isOnCall, setIsOnCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const intervalRef = useRef(null);

  const handleStartCall = () => {
    setIsOnCall(true);
    intervalRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setIsOnCall(false);
      setCallDuration(0);
    }, 30000);
  };

  const handleEndCall = () => {
    clearInterval(intervalRef.current);
    setIsOnCall(false);
    setCallDuration(0);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const statusColor = {
    completed: "bg-green-100 text-green-600",
    missed: "bg-red-100 text-red-600",
    transferred: "bg-orange-100 text-orange-600",
  };
  const statusBadge = {
    completed: "bg-green-100 text-green-700",
    missed: "bg-red-100 text-red-700",
    transferred: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Voice Calls</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage incoming calls and voice interactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Call Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              {!isOnCall ? (
                <>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Receptionist Ready</h2>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">Waiting for incoming calls...</p>
                  </div>
                  <Button onClick={handleStartCall} size="lg" className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8">
                    <Phone className="w-5 h-5 mr-2" /> Simulate Incoming Call
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                    <div className="flex items-end justify-center gap-1 mt-4 sm:mt-6 h-8 sm:h-12">
                      {Array.from({ length: 16 }, (_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full animate-bounce"
                          style={{ height: `${(i % 5) * 6 + 8}px`, animationDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Call in Progress</h2>
                    <p className="text-gray-500 mt-2 text-sm">Caller: +1 (555) 123-4567</p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono text-base sm:text-lg">{fmt(callDuration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    <Button
                      variant={isMuted ? "default" : "outline"}
                      size="lg"
                      onClick={() => setIsMuted(!isMuted)}
                      className={isMuted ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button size="lg" onClick={handleEndCall} className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-8">
                      <PhoneOff className="w-5 h-5 sm:mr-2" /><span className="hidden sm:inline">End Call</span>
                    </Button>
                    <Button
                      variant={isSpeakerOn ? "default" : "outline"}
                      size="lg"
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={isSpeakerOn ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                    >
                      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button variant="outline" size="lg"><PhoneForwarded className="w-5 h-5" /></Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-left">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2 sm:mb-3">Live Transcript</p>
                    <div className="space-y-2 text-sm">
                      <p><strong>AI:</strong> Hello! Thank you for calling. How may I assist you today?</p>
                      <p className="text-blue-600"><strong>Caller:</strong> Hi, I&apos;d like to know your business hours.</p>
                      <p><strong>AI:</strong> We&apos;re open Monday through Friday, 9 AM to 6 PM, and Saturday from 10 AM to 4 PM.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Today&apos;s Stats</h3>
            {[
              { label: "Total Calls", value: 47, pct: "78%", color: "bg-blue-600" },
              { label: "Answered", value: 43, pct: "91%", color: "bg-green-600", textColor: "text-green-600" },
              { label: "Transferred", value: 8, pct: "17%", color: "bg-orange-600", textColor: "text-orange-600" },
              { label: "Missed", value: 4, pct: "9%", color: "bg-red-600", textColor: "text-red-600" },
            ].map((s, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">{s.label}</span>
                  <span className={cn("font-semibold text-sm", s.textColor || "text-gray-900")}>{s.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={cn("h-2 rounded-full", s.color)} style={{ width: s.pct }} />
                </div>
              </div>
            ))}
          </Card>
          <Card className="p-4 sm:p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Avg Call Duration</h3>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600">4:32</p>
            <p className="text-sm text-gray-400 mt-1">minutes</p>
          </Card>
        </div>
      </div>

      {/* Recent Calls */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Calls</h3>
        <div className="space-y-2 sm:space-y-3">
          {callHistory.map((call) => (
            <div key={call.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0", statusColor[call.status])}>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{call.caller}</p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{call.phone}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{call.duration}</p>
                <p className="text-xs text-gray-400">{call.time}</p>
              </div>
              <Badge className={statusBadge[call.status]}>{call.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
