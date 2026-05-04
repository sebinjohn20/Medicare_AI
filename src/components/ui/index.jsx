"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Card
export function Card({ children, className, ...props }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

// Badge
export function Badge({ children, className }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", className)}>
      {children}
    </span>
  );
}

// Button
export function Button({ children, className, variant = "primary", size = "md", loading, disabled, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "hover:bg-gray-100 text-gray-600 focus:ring-gray-300",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// Input
export function Input({ className, label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn(
          "w-full border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none",
          "placeholder:text-gray-400",
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100 bg-red-50"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Select
export function Select({ className, label, error, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={cn(
          "w-full border rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none bg-white",
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto", maxWidth)}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Spinner
export function Spinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return <Loader2 className={cn("animate-spin text-blue-600", sizes[size])} />;
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}
