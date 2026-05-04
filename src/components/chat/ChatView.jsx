"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Paperclip, Smile, MoreVertical, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Button } from "@/components/ui";
import { activeChats, initialMessages } from "@/data";

export default function ChatView() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: input, time: now }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I understand your request. Let me assist you with that right away. Could you provide me with more details?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
    setShowChat(true);
  };

  const activeChat = activeChats.find((c) => c.id === activeChatId) || activeChats[0];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
      {/* Chat List - hidden on mobile when chat is open */}
      <div className={cn(
        "w-full sm:w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0",
        "lg:flex",
        showChat ? "hidden sm:flex" : "flex"
      )}>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Active Chats</h2>
          <Input placeholder="Search conversations..." />
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={cn(
                "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                activeChatId === chat.id ? "bg-blue-50" : ""
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                  {chat.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 truncate text-sm">{chat.name}</p>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-medium">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-50 min-w-0",
        "lg:flex",
        showChat ? "flex" : "hidden sm:flex"
      )}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back button - mobile only */}
            <button
              onClick={() => setShowChat(false)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
              {activeChat?.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{activeChat?.name || "Sarah Johnson"}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Active now
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2 sm:gap-3", msg.sender === "user" ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                msg.sender === "ai"
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-purple-400 to-pink-400"
              )}>
                {msg.sender === "ai" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>
              <div className={cn("max-w-[75%] sm:max-w-md", msg.sender === "user" ? "items-end flex flex-col" : "")}>
                <div className={cn(
                  "rounded-2xl px-3 py-2 sm:px-4",
                  msg.sender === "ai"
                    ? "bg-white shadow-sm"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                )}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-1">{msg.time}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Paperclip className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Smile className="w-5 h-5" /></Button>
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex-shrink-0"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
