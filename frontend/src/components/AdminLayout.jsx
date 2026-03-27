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
        <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button className="lg:hidden text-white/80 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars text-lg"></i>
            </button>
            <div className="bg-white rounded-xl px-3 py-1.5 flex items-center">
              <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari Industries" className="h-7 md:h-9 w-auto" />
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-widest uppercase">Management Console</h1>
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-tighter">Enterprise Administration</p>
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

        {/* Console Tabs */}
        <div className="max-w-full mx-auto px-6 bg-white/5">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {navItems.map(({ to, icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `console-tab whitespace-nowrap flex items-center gap-2 ${isActive ? "active !text-white !border-white" : "!text-white/50 hover:!text-white/80"}`
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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl lg:hidden p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-sm uppercase tracking-wider" style={{ color: "var(--darwin-text)" }}>Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <nav className="space-y-2">
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
                        : "hover:bg-slate-50"
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: "var(--darwin-blue)", color: "#fff" } : { color: "var(--darwin-text-muted)" }}
                >
                  <i className={icon}></i>
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
