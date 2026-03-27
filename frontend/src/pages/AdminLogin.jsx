import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CircuitCanvas from "../components/CircuitCanvas";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="fixed inset-0 z-[9000] bg-white flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(27,58,139,0.06), transparent 45%), radial-gradient(circle at bottom left, rgba(255,125,32,0.04), transparent 45%)",
      }}
    >
      <CircuitCanvas powerUp={false} />

      <div className="relative z-[100] w-full max-w-md px-6">
        {/* Badge */}
        <div className="text-center mb-8">
          <div className="inline-block px-5 py-2 bg-blue-50/80 rounded-full text-blue-700 text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-blue-100/50">
            Administration Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1b3a8b] tracking-tight">
            Management Console
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            Sign in with your admin credentials
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--darwin-text-muted)" }}>
                Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--darwin-text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="launch-btn w-full text-white text-xs font-extrabold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-shield-alt"></i> Sign In
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 text-center z-10">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.3em]">
          Restricted access — Authorized administrators only
        </p>
      </div>
    </section>
  );
}
