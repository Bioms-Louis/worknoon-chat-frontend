import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "customer", label: "Customer",  desc: "Shop and chat with merchants & agents" },
  { value: "designer", label: "Designer",  desc: "Provide design services to customers" },
  { value: "merchant", label: "Merchant",  desc: "Sell products and support customers" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate("/inbox");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join the eCommerce chat platform</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Alex Johnson" required className="input-base" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required className="input-base" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="Min 6 characters"
                  required
                  className="input-base !pr-10"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Role picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a…</label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === r.value
                        ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handle} className="accent-brand-500" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}