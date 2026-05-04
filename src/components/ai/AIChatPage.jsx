"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, RefreshCw, Phone, MessageCircle,
  Mic, X, Calendar, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ── Hospital phone number (edit to match your real number) ───────────────────
const HOSPITAL_PHONE = "+911800MEDICARE"; // used in tel: link
const HOSPITAL_PHONE_DISPLAY = "+91 1800-MEDICARE";
const WHATSAPP_NUMBER = "911234567890"; // digits only, no + (edit this)

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hello! I'm MediCare AI, your virtual hospital receptionist. I can help you:\n\n" +
      "• 🔍 Find the right specialist for your condition\n" +
      "• 📋 Learn about our doctors and their fees\n" +
      "• 📅 Guide you to book an appointment\n" +
      "• 💊 Answer general health questions\n\n" +
      "How can I assist you today?",
  },
];

const QUICK_PROMPTS = [
  "I need a cardiologist",
  "Who treats back pain?",
  "What are today's available doctors?",
  "I have a fever and headache",
  "Book appointment for child",
  "What is the consultation fee?",
];

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages]       = useState(INITIAL_MESSAGES);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [callModal, setCallModal]     = useState(false);
  const [error, setError]             = useState(null);
  const bottomRef                     = useRef(null);
  const inputRef                      = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      // Call our server-side route — avoids CORS and keeps API key secret
      const res = await fetch("/api/ai-chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: history.filter((m) => m.role !== "system"),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "AI service unavailable. Please try again.");
        setMessages(history); // keep user message visible
        return;
      }

      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
    setInput("");
  };

  // ── Call modal ──────────────────────────────────────────────────────────────
  const CallModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCallModal(false)} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
        <button
          onClick={() => setCallModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated phone icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
          <Phone className="w-9 h-9 text-white animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Call AI Receptionist</h2>
        <p className="text-sm text-gray-500 mb-6">
          Available 24/7. Our AI will help you book, modify or cancel appointments by voice.
        </p>

        {/* Primary call button */}
        <a
          href={`tel:${HOSPITAL_PHONE}`}
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600
            hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-2xl
            transition-all shadow-md hover:shadow-lg text-lg mb-3"
        >
          <Phone className="w-5 h-5" />
          {HOSPITAL_PHONE_DISPLAY}
        </a>

        {/* WhatsApp button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20want%20to%20book%20an%20appointment`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe59]
            text-white font-semibold py-3 rounded-2xl transition-all shadow-sm mb-3"
        >
          {/* WhatsApp icon inline SVG */}
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp Us
        </a>

        {/* Or chat here */}
        <button
          onClick={() => setCallModal(false)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Continue chatting here instead →
        </button>
      </div>
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-4"
         style={{ height: "calc(100vh - 4rem)" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Receptionist</h1>
          <p className="text-sm text-gray-500">Powered by Groq AI (Free) · Llama 3.3 · Knows your real doctors</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">Online</span>
          </div>

          {/* Call button */}
          <button
            onClick={() => setCallModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600
              text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Us</span>
          </button>

          <button
            onClick={resetChat}
            title="Reset chat"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
        {/* Call card */}
        <button
          onClick={() => setCallModal(true)}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-600
            text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Call to Book</p>
            <p className="text-xs text-emerald-100 mt-0.5">24/7 voice appointment booking</p>
            <p className="text-xs font-semibold text-white mt-1 truncate">{HOSPITAL_PHONE_DISPLAY}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
        </button>

        {/* Book online card */}
        <Link
          href="/dashboard/book"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-violet-600
            text-white rounded-2xl shadow-md hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Book Online</p>
            <p className="text-xs text-blue-100 mt-0.5">Pick doctor, date & time slot</p>
            <p className="text-xs font-semibold text-white mt-1">Open booking wizard →</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
        </Link>
      </div>

      {/* Chat window */}
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                m.role === "user"
                  ? "bg-blue-600"
                  : "bg-gradient-to-br from-violet-500 to-blue-600",
              )}>
                {m.role === "user"
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot  className="w-4 h-4 text-white" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm",
              )}>
                {m.content}

                {/* If assistant mentions booking, show inline CTA */}
                {m.role === "assistant" &&
                  (m.content.toLowerCase().includes("book appointment") ||
                   m.content.toLowerCase().includes("booking page")) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Link
                      href="/dashboard/book"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white
                        text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Appointment →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Could not reach AI</p>
                <p className="text-xs mt-0.5 text-red-500">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-100 p-3 sm:p-4 flex gap-2.5 items-end flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask about doctors…"
            rows={1}
            style={{ resize: "none" }}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none
              focus:ring-2 focus:ring-blue-100 focus:border-blue-300 leading-relaxed
              max-h-32 overflow-y-auto scrollbar-hide"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200
              text-white rounded-xl flex items-center justify-center transition-all
              disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap flex-shrink-0">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full
              text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Call modal */}
      {callModal && <CallModal />}
    </div>
  );
}
