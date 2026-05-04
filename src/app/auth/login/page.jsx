"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Eye, EyeOff, Bot, Stethoscope } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast }  = useToast();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        toast(data.message || "Login failed", "error");
        setLoading(false);
        return;
      }

      // Store user in context/localStorage
      login(data.user, data.token);
      toast("Welcome back!", "success");

      // Full-page navigation so the browser sends the fresh HTTP-only cookie
      // on the very next request (router.push is client-side and races the cookie)
      window.location.href = data.user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      console.error(err);
      toast("Something went wrong. Try again.", "error");
      setLoading(false);
    }
  };

  const field = (key, label, type, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
          errors[key]
            ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg mb-4">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MediCare AI</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {field("email", "Email address", "email", "you@example.com")}

            {/* Password with show/hide */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-all ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" /> Demo Credentials
            </p>
            <p className="text-xs text-blue-600">Admin: <strong>admin@hospital.com</strong> / <strong>Admin@123</strong></p>
            <p className="text-xs text-blue-500 mt-0.5">
              First run?{" "}
              <button
                className="underline font-medium"
                onClick={async () => {
                  const r = await fetch("/api/seed", { method: "POST" });
                  const d = await r.json();
                  toast(d.message, d.success ? "success" : "info");
                }}
              >
                Click here to seed demo data
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
