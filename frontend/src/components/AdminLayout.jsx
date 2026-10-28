import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const navItems = [
  { to: "/admin", icon: "fas fa-chart-bar", label: "Dashboard", end: true },
  { to: "/admin/applications", icon: "fas fa-th-large", label: "Applications" },
  { to: "/admin/entities", icon: "fas fa-sitemap", label: "Entities" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--darwin-bg)" }}>
      {/* Enterprise Header */}
      <header className="header-top text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5 sm:gap-5 flex-shrink-0">
            <button className="lg:hidden text-white/80 hover:text-white p-1" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle menu">
              <i className="fas fa-bars text-lg"></i>
            </button>
            <div className="bg-white rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center shadow-sm">
              <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari Industries" className="h-6 sm:h-7 md:h-9 w-auto" />
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/20 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase">Management Console</h1>
              <p className="text-[9px] sm:text-[10px] opacity-60 font-bold uppercase tracking-tighter">Enterprise Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 flex-shrink-0">
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all shadow-sm"
              title="Settings">
              <i className="fas fa-cog text-xs sm:text-sm"></i>
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all shadow-sm"
              title="Logout">
              <i className="fas fa-sign-out-alt text-xs sm:text-sm"></i>
            </button>
            <div className="bg-white rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 flex items-center shadow-sm">
              <img src="https://www.zuariindustries.in/assets/web/img/logo/adventz.png" alt="Adventz" className="h-5 sm:h-7 md:h-9 w-auto" />
            </div>
          </div>
        </div>

        {/* Console Tabs */}
        <div className="max-w-full mx-auto px-3 sm:px-6 bg-white/5 border-t border-white/10">
          <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
            {navItems.map(({ to, icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `console-tab whitespace-nowrap flex items-center gap-2 text-xs py-2.5 ${
                    isActive ? "active !text-white !border-white font-black" : "!text-white/60 hover:!text-white font-bold"
                  }`
                }
              >
                <i className={`${icon} text-xs`}></i>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl lg:hidden p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-black text-sm uppercase tracking-wider text-[#1b3a8b]">Navigation</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Management Console</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {navItems.map(({ to, icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                  style={({ isActive }) => (isActive ? { background: "var(--darwin-blue)", color: "#fff" } : {})}
                >
                  <i className={`${icon} text-sm`}></i>
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all"
              >
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
