import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Applications",
      total: stats?.applications?.total || 0,
      active: stats?.applications?.active || 0,
      icon: "fas fa-th-large",
      color: "#1b3a8b",
    },
    {
      title: "Entities",
      total: stats?.entities?.total || 0,
      active: stats?.entities?.active || 0,
      icon: "fas fa-sitemap",
      color: "#ff7d20",
    },
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--darwin-text)" }}>System Overview</h1>
        <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--darwin-text-muted)" }}>
          Enterprise Platform Statistics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="app-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-3xl" style={{ background: card.color }}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--darwin-text-muted)" }}>{card.title}</p>
                <p className="text-4xl font-black" style={{ color: "var(--darwin-text)" }}>{card.total}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: card.color }}>
                <i className={`${card.icon} text-xl`}></i>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="health-dot bg-emerald-400"></div>
                <span className="text-[11px] font-bold" style={{ color: "var(--darwin-text-muted)" }}>{card.active} Active</span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-2">
                <div className="health-dot bg-red-400"></div>
                <span className="text-[11px] font-bold" style={{ color: "var(--darwin-text-muted)" }}>{card.total - card.active} Inactive</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
