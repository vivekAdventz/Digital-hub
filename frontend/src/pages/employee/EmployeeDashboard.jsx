import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

const ENTITY_COLORS = [
  "#1b3a8b", "#0d9488", "#7c3aed", "#dc2626", "#ea580c",
  "#0284c7", "#4f46e5", "#059669", "#b91c1c", "#9333ea",
];

function getEntityColor(name, idx) {
  return ENTITY_COLORS[idx % ENTITY_COLORS.length];
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/embed/")) {
      const eu = new URL(url);
      eu.searchParams.set("autoplay", "1");
      return eu.toString();
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
  } catch { return url; }
  return url;
}

const FAV_KEY = "digihub_favorites";
const RECENT_KEY = "digihub_recent";

function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
function saveFavorites(ids) { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); }
function loadRecent() {
  try { return JSON.parse(sessionStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function saveRecent(items) { sessionStorage.setItem(RECENT_KEY, JSON.stringify(items)); }

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("cards"); // "cards" | "table"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [favorites, setFavorites] = useState(loadFavorites);
  const [recentApps, setRecentApps] = useState(loadRecent);
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/applications");
        setApplications(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const launchApp = useCallback((app) => {
    if (!app.url) return;
    // Add to recent
    setRecentApps((prev) => {
      const filtered = prev.filter((r) => r._id !== app._id);
      const next = [{ _id: app._id, name: app.name, url: app.url }, ...filtered].slice(0, 8);
      saveRecent(next);
      return next;
    });
    window.open(app.url, "_blank", "noopener,noreferrer");
  }, []);

  // Filter & search
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter === "active" && !app.isActive) return false;
      if (statusFilter === "inactive" && app.isActive) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          app.name?.toLowerCase().includes(q) ||
          app.description?.toLowerCase().includes(q) ||
          app.problemItSolves?.toLowerCase().includes(q) ||
          app.category?.toLowerCase().includes(q) ||
          app.entity?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, search, statusFilter]);

  // Group by entity
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((app) => {
      const entityName = app.entity?.name || "General";
      if (!groups[entityName]) groups[entityName] = [];
      groups[entityName].push(app);
    });
    return Object.entries(groups);
  }, [filtered]);

  // Favorite apps
  const favoriteApps = useMemo(() => {
    return applications.filter((a) => favorites.includes(a._id));
  }, [applications, favorites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "var(--darwin-text)" }}>
                Welcome, {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--darwin-text-muted)" }}>
                DigiHub &bull; {applications.length} Systems Registered
              </p>
            </div>
          </div>

          {/* Tabs + Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6">
            <div className="flex items-center gap-8 border-b border-slate-100">
              <button
                className={`view-tab ${view === "cards" ? "active" : ""}`}
                onClick={() => setView("cards")}
              >
                <i className="fas fa-th-large mr-2"></i>Departmental Matrix
              </button>
              <button
                className={`view-tab ${view === "table" ? "active" : ""}`}
                onClick={() => setView("table")}
              >
                <i className="fas fa-list mr-2"></i>System Directory
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search platforms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="filter-input pl-9 w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Strip */}
      {favoriteApps.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--darwin-text-muted)" }}>
            <i className="fas fa-star mr-1" style={{ color: "var(--darwin-accent)" }}></i> Favorites
          </p>
          <div className="flex gap-3 flex-wrap">
            {favoriteApps.map((app) => (
              <button
                key={app._id}
                onClick={() => launchApp(app)}
                className="recent-pill bg-white rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--darwin-accent)" }}></div>
                <span className="text-xs font-bold" style={{ color: "var(--darwin-text)" }}>{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Apps */}
      {recentApps.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 pt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--darwin-text-muted)" }}>
            <i className="fas fa-clock mr-1"></i> Recently Accessed
          </p>
          <div className="flex gap-2 flex-wrap">
            {recentApps.map((r) => (
              <a
                key={r._id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="recent-pill bg-slate-50 rounded-lg px-3 py-1.5 text-[11px] font-bold"
                style={{ color: "var(--darwin-text)" }}
              >
                {r.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-search text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-bold text-sm">No applications match your criteria</p>
          </div>
        ) : view === "cards" ? (
          /* === CARD GRID VIEW === */
          <div className="space-y-10">
            {grouped.map(([entityName, apps], gIdx) => (
              <div key={entityName} className="fade-in">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: getEntityColor(entityName, gIdx) }}></div>
                  <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--darwin-text)" }}>{entityName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100" style={{ color: "var(--darwin-text-muted)" }}>
                    {apps.length} {apps.length === 1 ? "system" : "systems"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {apps.map((app) => (
                    <div key={app._id} className="app-card rounded-3xl p-6 relative overflow-hidden flex flex-col min-h-[350px]">
                      {/* Color accent bar */}
                      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-3xl" style={{ background: getEntityColor(entityName, gIdx) }}></div>

                      {/* Favorite star */}
                      <button
                        className={`star-btn ${favorites.includes(app._id) ? "active" : ""}`}
                        onClick={() => toggleFavorite(app._id)}
                      >
                        <i className={favorites.includes(app._id) ? "fas fa-star" : "far fa-star"}></i>
                      </button>

                      {/* Badge + Health */}
                      <div className="flex items-center justify-end gap-2 mb-4">
                        <span className={`badge ${app.isActive ? "badge-active" : "badge-inactive"}`}>
                          {app.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className={`health-dot ${app.isActive ? "bg-emerald-400" : "bg-red-400"}`}></div>
                      </div>

                      <div className="flex flex-col flex-1">
                        {/* App Info */}
                        <h4 className="font-black text-sm mb-1" style={{ color: "var(--darwin-text)" }}>{app.name}</h4>
                        {app.category && (
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--darwin-text-muted)" }}>{app.category}</p>
                        )}
                        <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: "var(--darwin-text-muted)" }}>
                          {app.problemItSolves || app.description}
                        </p>

                        {app.videoUrl && (
                          <button
                            onClick={() => setVideoModal(getYouTubeEmbedUrl(app.videoUrl))}
                            className="mb-4 flex items-center gap-2 group"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 group-hover:bg-indigo-700 transition shrink-0">
                              <i className="fas fa-play text-white" style={{ fontSize: "7px", marginLeft: "1px" }}></i>
                            </span>
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 group-hover:text-indigo-700 transition">Watch Demo</span>
                          </button>
                        )}

                        <div className="mt-auto">
                          {app.isMicrosoftLoginAvailable && (
                            <div className="mb-4 flex items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2">
                              <i className="fab fa-microsoft text-blue-600"></i>
                              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Microsoft Login Supported</span>
                            </div>
                          )}

                          {app.appId && !app.isMicrosoftLoginAvailable && (
                            <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--darwin-text-muted)" }}>
                                <i className="fas fa-key text-[10px]"></i> Access Credentials
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400">ID:</span>
                                  <span className="text-[10px] font-black text-slate-700 select-all">{app.appId}</span>
                                </div>
                                {app.appPassword && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400">Pass:</span>
                                    <span className="text-[10px] font-black text-slate-700 select-all">{app.appPassword}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Launch */}
                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        {app.url ? (
                          <button
                            onClick={() => launchApp(app)}
                            className="launch-btn w-full text-white text-xs font-extrabold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            Launch Application <i className="fas fa-arrow-right text-[10px]"></i>
                          </button>
                        ) : (
                          <div className="text-center text-[10px] font-bold uppercase tracking-wider py-3" style={{ color: "var(--darwin-text-muted)" }}>
                            No URL Configured
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* === TABLE VIEW === */
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Enterprise Platform</th>
                  <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Capabilities</th>
                  <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Access Info</th>
                  <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Entity</th>
                  <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app._id} className="system-admin-row border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          className={`star-btn relative !static !top-auto !left-auto ${favorites.includes(app._id) ? "active" : ""}`}
                          onClick={() => toggleFavorite(app._id)}
                        >
                          <i className={favorites.includes(app._id) ? "fas fa-star" : "far fa-star"}></i>
                        </button>
                        <div>
                          <p className="font-black text-xs" style={{ color: "var(--darwin-text)" }}>{app.name}</p>
                          {app.category && (
                            <p className="text-[10px] font-bold" style={{ color: "var(--darwin-text-muted)" }}>{app.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.isMicrosoftLoginAvailable ? (
                         <div className="flex items-center gap-1.5 text-blue-600">
                           <i className="fab fa-microsoft text-[10px]"></i>
                           <span className="text-[10px] font-black uppercase tracking-wider">SSO</span>
                         </div>
                      ) : app.appId ? (
                        <>
                          <p className="text-[10px] font-bold" style={{ color: "var(--darwin-text)" }}>ID: {app.appId}</p>
                          <p className="text-[10px] text-slate-400">Pass: {app.appPassword || "—"}</p>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Public</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--darwin-text-muted)" }}>
                        {app.entity?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${app.isActive ? "badge-active" : "badge-inactive"}`}>
                        {app.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.url ? (
                          <button
                            onClick={() => launchApp(app)}
                            className="launch-btn text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                          >
                            Launch <i className="fas fa-arrow-right text-[8px]"></i>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold" style={{ color: "var(--darwin-text-muted)" }}>—</span>
                        )}
                        {app.videoUrl && (
                          <button
                            onClick={() => setVideoModal(getYouTubeEmbedUrl(app.videoUrl))}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition"
                          >
                            <i className="fas fa-play text-[8px]"></i> Watch
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Modal — rendered via portal to escape any parent transforms */}
      {videoModal && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setVideoModal(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModal(null)}
              className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 transition text-white"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={videoModal}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                title="Application Video"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
