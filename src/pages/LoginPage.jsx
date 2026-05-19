import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/inbox");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                required
                className="input-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  required
                  className="input-base !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Quick fill for dev */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center mb-2">Quick dev login</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { label: "Customer", email: "customer@test.com" },
                { label: "Agent",    email: "agent@test.com" },
                { label: "Admin",    email: "admin@test.com" },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => setForm({ email: u.email, password: "password123" })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}