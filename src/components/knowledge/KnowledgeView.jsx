"use client";

import { useState } from "react";
import { Search, Plus, ChevronDown, ChevronRight, Edit, Trash2, BookOpen } from "lucide-react";
import { Card, Button, Input, Textarea, Label, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { initialFaqs, faqCategories } from "@/data";

export default function KnowledgeView() {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "General" });

  const filtered = faqs.filter((f) => {
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || f.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (newFaq.question && newFaq.answer) {
      setFaqs([...faqs, { ...newFaq, id: Date.now(), usage: 0 }]);
      setNewFaq({ question: "", answer: "", category: "General" });
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage FAQs and company information for AI training</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total FAQs", value: faqs.length, color: "bg-blue-50 text-blue-600" },
          { label: "Categories", value: faqCategories.length, color: "bg-purple-50 text-purple-600" },
          { label: "Total Usage", value: faqs.reduce((s, f) => s + f.usage, 0), color: "bg-green-50 text-green-600" },
          { label: "Avg Usage", value: Math.round(faqs.reduce((s, f) => s + f.usage, 0) / faqs.length), color: "bg-orange-50 text-orange-600" },
        ].map((s, i) => (
          <Card key={i} className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center", s.color)}>
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!category ? "default" : "outline"} size="sm" onClick={() => setCategory(null)}>All</Button>
          {faqCategories.map((cat) => (
            <Button key={cat} size="sm" variant={category === cat ? "default" : "outline"} onClick={() => setCategory(cat)}>
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Add FAQ Form */}
      {isAdding && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add New FAQ</h3>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <select
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                className="w-full mt-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {faqCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Question</Label>
              <Input
                className="mt-1.5"
                placeholder="Enter the question..."
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                className="mt-1.5"
                placeholder="Enter the answer..."
                rows={4}
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">Save FAQ</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* FAQ List */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">FAQs ({filtered.length})</h3>
        <div className="space-y-3">
          {filtered.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {expanded === faq.id
                    ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{faq.question}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <Badge className="bg-blue-100 text-blue-700">{faq.category}</Badge>
                      <span className="text-xs text-gray-400">Used {faq.usage} times</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setFaqs(faqs.filter((f) => f.id !== faq.id)); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {expanded === faq.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
