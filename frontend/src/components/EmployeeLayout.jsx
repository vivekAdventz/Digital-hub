import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Chatbot from "./Chatbot";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--darwin-bg)" }}>
      {/* Enterprise Header */}
      <header className="header-top text-white py-3 px-8 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="bg-white rounded-xl px-3 py-1.5 flex items-center">
              <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari Industries" className="h-7 md:h-9 w-auto" />
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-widest uppercase">DigiHub</h1>
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">Enterprise App Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all shadow-sm"
              title="Settings">
              <i className="fas fa-cog"></i>
            </button>
            <button onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all shadow-sm"
              title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
            <div className="bg-white rounded-xl px-3 py-1.5 flex items-center">
              <img src="https://www.zuariindustries.in/assets/web/img/logo/adventz.png" alt="Adventz" className="h-7 md:h-9 w-auto" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
