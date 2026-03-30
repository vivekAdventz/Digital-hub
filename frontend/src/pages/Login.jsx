import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../config/msalConfig";
import CircuitCanvas from "../components/CircuitCanvas";

export default function Login() {
  const { manualLogin, microsoftLogin } = useAuth();
  const { instance, accounts, inProgress } = useMsal();
  const [powerUp, setPowerUp] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendAuthStarted, setBackendAuthStarted] = useState(false);

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0 && !backendAuthStarted) {
      setBackendAuthStarted(true);
      setLoading(true);
      microsoftLogin({ account: accounts[0] }).catch((err) => {
        setError(err.message || "Backend authentication failed");
        setLoading(false);
      });
    }
  }, [inProgress, accounts, backendAuthStarted, microsoftLogin]);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await manualLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      setError(err.message || "Microsoft login failed");
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 z-[9000] bg-white flex flex-col items-center justify-center overflow-auto"
             style={{ background: "radial-gradient(circle at top right, rgba(27,58,139,0.06), transparent 45%), radial-gradient(circle at bottom left, rgba(255,125,32,0.04), transparent 45%)" }}>
      <CircuitCanvas powerUp={powerUp} />

      {/* Hero Content */}
      <div className="text-center relative z-[100] px-6 max-w-4xl flex flex-col items-center justify-center">
        <div className="inline-block px-5 py-2 bg-blue-50/80 rounded-full text-blue-700 text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-blue-100/50">
          Corporate Internal Portal
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-[#1b3a8b] leading-[1.05] mb-6 tracking-tight">
          Unlocking Synergies Across the Ecosystem.
        </h1>
        <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-10 leading-relaxed">
          A unified gateway designed to streamline your workflow. Access your HR tools, operational analytics, and strategic platforms in one seamless experience.
        </p>

        {/* Microsoft SSO Button */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="launch-btn px-12 py-6 rounded-full text-white flex items-center justify-center gap-8 mx-auto hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span className="text-xl font-extrabold tracking-wide">Sign in with Microsoft</span>
          <i className="fas fa-arrow-right text-2xl group-hover:translate-x-2 transition-transform"></i>
        </button>

        {/* Divider
        <div className="flex items-center gap-4 w-full max-w-md mx-auto mt-8 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        */}

        {/* Manual Login Toggle / Form
        {!showManual ? (
          <div className="flex flex-col items-center">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <button
              onClick={() => { setShowManual(true); setError(""); }}
              className="text-sm font-bold text-[#1b3a8b] hover:text-[#ff7d20] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-envelope text-xs"></i>
              Sign in with Email &amp; Password
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <form onSubmit={handleManualLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--darwin-text-muted)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--darwin-text-muted)" }}>
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
                  <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> Sign In</>
                )}
              </button>
            </form>
            <button
              onClick={() => { setShowManual(false); setError(""); }}
              className="mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors w-full text-center"
            >
              Back to Microsoft Sign In
            </button>
          </div>
        )}
        */}
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 text-center z-10">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.3em]">
          Authorized accounts only
        </p>
      </div>
    </section>
  );
}
