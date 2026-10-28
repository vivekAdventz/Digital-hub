import { useEffect, useRef, useState, useCallback } from "react";
import API from "../../api/axios";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const emptyCredentialRow = { email: "", appId: "", appPassword: "" };

const emptyForm = {
  name: "",
  description: "",
  problemItSolves: "",
  category: "",
  url: "",
  entity: "",
  userCredentials: [{ ...emptyCredentialRow }],
  isMicrosoftLoginAvailable: false,
  videoUrl: "",
};

/* ─── helpers ──────────────────────────────────────────────── */
function groupByEntity(apps) {
  const map = {};

  apps.forEach((app) => {
    const key = app.entity?.name?.trim() || "No Entity";
    const entityId = app.entity?._id || (typeof app.entity === "string" ? app.entity : null);
    const sortOrder = app.entity?.sortOrder ?? (entityId ? 0 : 999999);

    if (!map[key]) {
      map[key] = {
        name: key,
        entityId: entityId,
        sortOrder: sortOrder,
        apps: [],
      };
    } else if (!map[key].entityId && entityId) {
      map[key].entityId = entityId;
      map[key].sortOrder = sortOrder;
    }
    map[key].apps.push(app);
  });

  const entries = Object.values(map);

  // Sort entities primarily by sortOrder
  entries.sort((a, b) => {
    if (a.name === "No Entity") return 1;
    if (b.name === "No Entity") return -1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });

  return entries.map((item) => [item.name, item.entityId, item.apps]);
}

const PALETTE = [
  { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8", dot: "#3b82f6" },
  { bg: "#f0fdf4", border: "#22c55e", text: "#15803d", dot: "#22c55e" },
  { bg: "#fdf4ff", border: "#a855f7", text: "#7e22ce", dot: "#a855f7" },
  { bg: "#fff7ed", border: "#f97316", text: "#c2410c", dot: "#f97316" },
  { bg: "#fefce8", border: "#eab308", text: "#854d0e", dot: "#eab308" },
  { bg: "#f0f9ff", border: "#0ea5e9", text: "#0369a1", dot: "#0ea5e9" },
  { bg: "#fff1f2", border: "#f43f5e", text: "#be123c", dot: "#f43f5e" },
  { bg: "#f8fafc", border: "#94a3b8", text: "#475569", dot: "#94a3b8" },
];
const getPalette = (i) => PALETTE[i % PALETTE.length];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [grouped, setGrouped] = useState([]);

  // App row dragging refs
  const dragItem = useRef(null);   // { catKey, idx }
  const dragOver = useRef(null);   // { catKey, idx }

  // Entity section dragging refs & states
  const dragEntity = useRef(null); // entity section index
  const dragOverEntity = useRef(null); // entity section index
  const [draggingEntityIdx, setDraggingEntityIdx] = useState(null);
  const [dragOverEntityIdx, setDragOverEntityIdx] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await API.get("/applications", { params: search ? { search } : {} });
      const apps = res.data.data;
      setApplications(apps);
      setGrouped(groupByEntity(apps));
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchEntities = async () => {
    try {
      const res = await API.get("/entities");
      setEntities(res.data.data.filter((e) => e.isActive));
    } catch {
      // silently fail
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchEntities(); }, []);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      userCredentials: [{ ...emptyCredentialRow }],
    });
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (app) => {
    let credentials = [];
    if (Array.isArray(app.userCredentials) && app.userCredentials.length > 0) {
      credentials = app.userCredentials.map((c) => ({
        email: c.email || "",
        appId: c.appId || "",
        appPassword: c.appPassword || "",
      }));
    } else if (app.appId || app.appPassword) {
      const emails = Array.isArray(app.visibleToEmails) && app.visibleToEmails.length > 0
        ? app.visibleToEmails
        : app.visibleToEmail
        ? [app.visibleToEmail]
        : [""];

      credentials = emails.map((em) => ({
        email: em || "",
        appId: app.appId || "",
        appPassword: app.appPassword || "",
      }));
    } else {
      credentials = [{ ...emptyCredentialRow }];
    }

    setForm({
      name: app.name || "",
      description: app.description || "",
      problemItSolves: app.problemItSolves || "",
      category: app.category || "",
      url: app.url || "",
      entity: app.entity?._id || app.entity || "",
      userCredentials: credentials,
      isMicrosoftLoginAvailable: !!app.isMicrosoftLoginAvailable,
      videoUrl: app.videoUrl || "",
    });
    setEditing(app);
    setModalOpen(true);
  };

  const handleCredentialChange = (index, field, value) => {
    setForm((prev) => {
      const nextCreds = [...(prev.userCredentials || [])];
      nextCreds[index] = { ...nextCreds[index], [field]: value };
      return { ...prev, userCredentials: nextCreds };
    });
  };

  const handleAddCredential = () => {
    setForm((prev) => ({
      ...prev,
      userCredentials: [
        ...(prev.userCredentials || []),
        { ...emptyCredentialRow },
      ],
    }));
  };

  const handleRemoveCredential = (index) => {
    setForm((prev) => {
      const filtered = (prev.userCredentials || []).filter((_, i) => i !== index);
      return {
        ...prev,
        userCredentials: filtered.length > 0 ? filtered : [{ ...emptyCredentialRow }],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedCredentials = (form.userCredentials || [])
        .map((c) => ({
          email: (c.email || "").trim(),
          appId: (c.appId || "").trim(),
          appPassword: (c.appPassword || "").trim(),
        }))
        .filter((c) => c.email || c.appId || c.appPassword);

      const payload = {
        ...form,
        userCredentials: cleanedCredentials,
        appId: cleanedCredentials[0]?.appId || "",
        appPassword: cleanedCredentials[0]?.appPassword || "",
      };

      if (editing) {
        await API.put(`/applications/${editing._id}`, payload);
        toast.success("Application updated");
      } else {
        await API.post("/applications", payload);
        toast.success("Application created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this application?")) return;
    try {
      await API.delete(`/applications/${id}`);
      toast.success("Application deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/applications/${id}/toggle-status`);
      fetchData();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const toggleCollapse = (cat) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  /* ── Application Drag & Drop ── */
  const handleDragStart = (e, catKey, idx) => {
    e.stopPropagation();
    dragItem.current = { catKey, idx };
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", `${catKey}:${idx}`);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnter = (catKey, idx) => {
    if (dragItem.current === null) return;
    dragOver.current = { catKey, idx };
  };

  const handleDragEnd = async () => {
    const from = dragItem.current;
    const to = dragOver.current;
    dragItem.current = null;
    dragOver.current = null;
    if (!from || !to || from.idx === to.idx) return;
    if (from.catKey !== to.catKey) {
      toast("Apps can only be reordered within the same entity.", { icon: "ℹ️" });
      return;
    }

    const next = grouped.map(([cat, entityId, apps]) => {
      if (cat !== from.catKey) return [cat, entityId, apps];
      const reordered = [...apps];
      const [moved] = reordered.splice(from.idx, 1);
      reordered.splice(to.idx, 0, moved);
      return [cat, entityId, reordered];
    });

    setGrouped(next);
    await persistOrder(next);
  };

  const persistOrder = async (newGrouped) => {
    const orders = [];
    newGrouped.forEach(([, , apps]) => {
      apps.forEach((app, idx) => orders.push({ id: app._id, sortOrder: idx }));
    });
    try {
      await API.post("/applications/reorder", { orders });
      toast.success("Application order saved");
    } catch {
      toast.error("Could not save order");
    }
  };

  /* ── Entity Section Drag & Drop ── */
  const handleEntityDragStart = (e, idx) => {
    e.stopPropagation();
    dragEntity.current = idx;
    setDraggingEntityIdx(idx);
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", String(idx));
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleEntityDragEnter = (idx) => {
    if (dragEntity.current === null) return;
    dragOverEntity.current = idx;
    setDragOverEntityIdx(idx);
  };

  const handleEntityDragEnd = async () => {
    const from = dragEntity.current;
    const to = dragOverEntity.current;
    dragEntity.current = null;
    dragOverEntity.current = null;
    setDraggingEntityIdx(null);
    setDragOverEntityIdx(null);

    if (from === null || to === null || from === to) return;

    const next = [...grouped];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    setGrouped(next);
    await persistEntityOrder(next);
  };

  const persistEntityOrder = async (newGrouped) => {
    // Only persist entities that have a valid id (not "No Entity")
    const orders = newGrouped
      .filter(([, entityId]) => entityId)
      .map(([, entityId], idx) => ({ id: entityId, sortOrder: idx }));

    if (!orders.length) return;
    try {
      await API.post("/entities/reorder", { orders });
      toast.success("Entity order saved");
    } catch {
      toast.error("Could not save entity order");
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none transition-all focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10";

  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--darwin-text)" }}>Applications</h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--darwin-text-muted)" }}>
            Manage enterprise platforms — grouped by entity
          </p>
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
          <button onClick={openCreate}
            className="launch-btn text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2">
            <i className="fas fa-plus text-[10px]"></i> Add Application
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-th-large text-4xl text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold text-sm">No applications found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([cat, entityId, apps], catIdx) => {
            const p = getPalette(catIdx);
            const isCollapsed = !!collapsed[cat];
            const isDraggingThis = draggingEntityIdx === catIdx;
            const isDragOverThis = dragOverEntityIdx === catIdx && draggingEntityIdx !== null && draggingEntityIdx !== catIdx;

            return (
              <div
                key={entityId || cat}
                className={`rounded-3xl overflow-hidden shadow-sm transition-all duration-200 ${
                  isDraggingThis ? "opacity-40 scale-[0.99] border-dashed" : ""
                } ${isDragOverThis ? "ring-2 ring-blue-500 shadow-md" : ""}`}
                style={{ border: `1.5px solid ${p.border}33` }}
                onDragEnter={() => handleEntityDragEnter(catIdx)}
                onDragOver={(e) => {
                  if (dragEntity.current !== null) {
                    e.preventDefault();
                  }
                }}
              >
                {/* Entity Header — drag entire section along with its applications */}
                <div
                  className="w-full flex items-center justify-between px-6 py-4 transition-all hover:brightness-95 cursor-grab active:cursor-grabbing select-none"
                  style={{ background: p.bg }}
                  draggable
                  onDragStart={(e) => handleEntityDragStart(e, catIdx)}
                  onDragEnd={handleEntityDragEnd}
                >
                  {/* Left: grip + entity name + count */}
                  <div className="flex items-center gap-3">
                    <i
                      className="fas fa-grip-vertical text-sm mr-1"
                      style={{ color: `${p.dot}99` }}
                      title="Drag to reorder this entire entity"
                    />
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.dot }} />
                    <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: p.text }}>
                      {cat}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${p.dot}22`, color: p.text }}
                    >
                      {apps.length} app{apps.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Right: collapse toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(cat);
                    }}
                    className="flex items-center gap-2 ml-4 cursor-pointer focus:outline-none"
                    title={isCollapsed ? "Expand" : "Collapse"}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: p.text }}>
                      {isCollapsed ? "expand" : "collapse"}
                    </span>
                    <i
                      className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
                      style={{ color: p.text }}
                    />
                  </button>
                </div>

                {/* Drag guidance hint */}
                {!isCollapsed && (
                  <div
                    className="px-6 py-1.5 flex items-center gap-2"
                    style={{ background: `${p.bg}88`, borderBottom: `1px solid ${p.border}22` }}
                  >
                    <i className="fas fa-grip-lines text-[9px]" style={{ color: p.dot }} />
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: p.text, opacity: 0.65 }}>
                      Drag entity header to reorder entity &bull; Drag table rows below to reorder apps within this entity
                    </span>
                  </div>
                )}

                {/* Table */}
                {!isCollapsed && (
                  <div className="bg-white">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="w-8 px-3 py-3" />
                          <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Name</th>
                          <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Access Info</th>
                          <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Problem It Solves</th>
                          <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Status</th>
                          <th className="text-right px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.map((app, appIdx) => (
                          <tr
                            key={app._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, cat, appIdx)}
                            onDragEnter={() => handleDragEnter(cat, appIdx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              if (dragItem.current !== null) {
                                e.preventDefault();
                              }
                            }}
                            className="system-admin-row border-b border-slate-50 last:border-0 cursor-grab active:cursor-grabbing select-none"
                            style={{ borderLeft: `4px solid ${p.dot}55` }}
                          >
                            <td className="px-3 py-4 text-center">
                              <i className="fas fa-grip-vertical text-xs" style={{ color: `${p.dot}aa` }} title="Drag to reorder app" />
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-black text-xs" style={{ color: "var(--darwin-text)" }}>{app.name}</p>
                              {app.url && <p className="text-[10px] text-blue-400 mt-0.5 truncate max-w-[160px]">{app.url}</p>}
                            </td>
                            <td className="px-4 py-4">
                              {app.isMicrosoftLoginAvailable ? (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black flex items-center gap-1.5 w-fit">
                                  <i className="fab fa-microsoft" /> SSO
                                </span>
                              ) : (() => {
                                const creds = Array.isArray(app.userCredentials) && app.userCredentials.length > 0
                                  ? app.userCredentials
                                  : app.appId
                                  ? [{ email: app.visibleToEmail || "", appId: app.appId, appPassword: app.appPassword }]
                                  : [];

                                if (creds.length === 0) {
                                  return <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Public / None</span>;
                                }

                                if (creds.length === 1) {
                                  const c = creds[0];
                                  return (
                                    <div>
                                      <p className="text-[10px] font-bold" style={{ color: "var(--darwin-text)" }}>Login ID: {c.appId || "—"}</p>
                                      <p className="text-[10px] text-slate-400">Pass: {c.appPassword ? "••••••" : "—"}</p>
                                      {c.email ? (
                                        <p className="text-[9px] text-blue-500 mt-0.5 truncate max-w-[160px]" title={c.email}>👤 {c.email}</p>
                                      ) : (
                                        <p className="text-[9px] text-emerald-600 mt-0.5 font-bold">🌐 Shared (All Users)</p>
                                      )}
                                    </div>
                                  );
                                }

                                const tooltipText = creds
                                  .map((c) => `${c.email || "Default"}: ID=${c.appId || "—"}`)
                                  .join("\n");

                                return (
                                  <div>
                                    <span
                                      className="text-[10px] bg-blue-50 text-blue-800 px-2 py-1 rounded-md font-extrabold flex items-center gap-1.5 w-fit cursor-help shadow-sm border border-blue-100"
                                      title={tooltipText}
                                    >
                                      <i className="fas fa-users-cog text-[10px] text-blue-600" />
                                      {creds.length} User Accounts
                                    </span>
                                    <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[160px]" title={tooltipText}>
                                      {creds[0].email || "Default"}: {creds[0].appId} <span className="font-bold text-blue-600">+{creds.length - 1} more</span>
                                    </p>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-4 max-w-xs">
                              <span className="text-xs line-clamp-2" style={{ color: "var(--darwin-text-muted)" }}>{app.problemItSolves || "—"}</span>
                            </td>
                            <td className="px-4 py-4">
                              <button onClick={() => toggleStatus(app._id)} title="Toggle status">
                                <span className={`badge ${app.isActive ? "badge-active" : "badge-inactive"}`}>
                                  {app.isActive ? "Active" : "Inactive"}
                                </span>
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEdit(app)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-900 transition-all"
                                  title="Edit">
                                  <i className="fas fa-pen text-xs" />
                                </button>
                                <button onClick={() => handleDelete(app._id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                  title="Delete">
                                  <i className="fas fa-trash text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Application" : "Create Application"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>What Problem It Solves *</label>
            <textarea required rows={2} value={form.problemItSolves} onChange={(e) => setForm({ ...form, problemItSolves: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Entity</label>
              <select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })} className={inputClass}>
                <option value="">Select Entity</option>
                {entities.map((ent) => (
                  <option key={ent._id} value={ent._id}>{ent.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>YouTube Video URL <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className={inputClass}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Paste a YouTube link to add a Watch Video button on the app card.</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h3 className="text-xs font-black" style={{ color: "var(--darwin-text)" }}>Microsoft SSO Available</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Login with Microsoft 365</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isMicrosoftLoginAvailable: !form.isMicrosoftLoginAvailable })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.isMicrosoftLoginAvailable ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isMicrosoftLoginAvailable ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          
          {!form.isMicrosoftLoginAvailable && (
            <div className="border-t border-slate-100 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--darwin-text)" }}>
                    <i className="fas fa-key text-blue-600" /> User-Wise Credentials (Internal)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Assign specific Login ID and Password per user email. Leave email blank to set default/shared credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCredential}
                  className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                  title="Add credential for another user"
                >
                  <i className="fas fa-plus text-[9px]" /> Add User Account
                </button>
              </div>

              <div className="space-y-3">
                {(form.userCredentials || []).map((cred, credIdx) => (
                  <div
                    key={credIdx}
                    className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <i className="fas fa-user-shield text-blue-600 text-xs" />
                        Account #{credIdx + 1}
                        {cred.email ? (
                          <span className="text-blue-600 normal-case font-bold">({cred.email})</span>
                        ) : (
                          <span className="text-slate-400 normal-case font-normal">(Shared / Default)</span>
                        )}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAddCredential}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer"
                          title="Add another user credential"
                        >
                          <i className="fas fa-plus text-[10px]" />
                        </button>
                        {form.userCredentials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCredential(credIdx)}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all cursor-pointer"
                            title="Remove this credential"
                          >
                            <i className="fas fa-trash text-[10px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 flex flex-col justify-end">
                        <label className="mb-1.5 h-7 sm:h-8 flex items-end text-[9px] font-extrabold uppercase tracking-widest text-slate-500 leading-tight">
                          User Email
                        </label>
                        <input
                          type="email"
                          value={cred.email || ""}
                          onChange={(e) => handleCredentialChange(credIdx, "email", e.target.value)}
                          className={inputClass}
                          placeholder="user@example.com (blank = all)"
                        />
                      </div>
                      <div className="sm:col-span-4 flex flex-col justify-end">
                        <label className="mb-1.5 h-7 sm:h-8 flex items-end text-[9px] font-extrabold uppercase tracking-widest text-slate-500 leading-tight">
                          Login ID / Login email / username
                        </label>
                        <input
                          type="text"
                          value={cred.appId || ""}
                          onChange={(e) => handleCredentialChange(credIdx, "appId", e.target.value)}
                          className={inputClass}
                          placeholder="Login ID / email / username"
                        />
                      </div>
                      <div className="sm:col-span-3 flex flex-col justify-end">
                        <label className="mb-1.5 h-7 sm:h-8 flex items-end text-[9px] font-extrabold uppercase tracking-widest text-slate-500 leading-tight">
                          Password
                        </label>
                        <input
                          type="text"
                          value={cred.appPassword || ""}
                          onChange={(e) => handleCredentialChange(credIdx, "appPassword", e.target.value)}
                          className={inputClass}
                          placeholder="Password"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-5 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              style={{ color: "var(--darwin-text-muted)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="launch-btn text-white px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
