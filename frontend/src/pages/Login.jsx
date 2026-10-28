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
    <section
      className="fixed inset-0 z-[9000] bg-white flex flex-col items-center justify-center overflow-auto px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(27,58,139,0.06), transparent 45%), radial-gradient(circle at bottom left, rgba(255,125,32,0.04), transparent 45%)",
      }}
    >
      <CircuitCanvas powerUp={powerUp} />

      {/* Hero Content */}
      <div className="text-center relative z-[100] px-2 sm:px-6 py-6 max-w-4xl flex flex-col items-center justify-center w-full">
        <div className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-50/80 rounded-full text-blue-700 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-5 sm:mb-8 border border-blue-100/50">
          Corporate Internal Portal
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-[#1b3a8b] leading-[1.15] sm:leading-[1.05] mb-4 sm:mb-6 tracking-tight">
          Unlocking Synergies Across the Ecosystem.
        </h1>
        <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-lg md:text-xl font-medium mb-8 sm:mb-10 leading-relaxed px-2">
          A unified gateway designed to streamline your workflow. Access your HR tools, operational analytics, and strategic platforms in one seamless experience.
        </p>

        {/* Microsoft SSO Button */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="launch-btn px-6 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-full text-white flex items-center justify-center gap-4 sm:gap-8 w-full max-w-sm sm:max-w-none sm:w-auto hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span className="text-base sm:text-xl font-extrabold tracking-wide">Sign in with Microsoft</span>
          <i className="fas fa-arrow-right text-base sm:text-2xl group-hover:translate-x-2 transition-transform"></i>
        </button>
      </div>

      {/* Bottom tagline */}
      <div className="relative sm:absolute sm:bottom-12 mt-6 sm:mt-0 text-center z-10">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.25em] sm:tracking-[0.3em]">
          Authorized accounts only
        </p>
      </div>
    </section>
  );
}
