import { useEffect, useState } from "react";
import API from "../../api/axios";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  description: "",
  problemItSolves: "",
  category: "",
  url: "",
  entity: "",
  appId: "",
  appPassword: "",
  visibleToEmail: "",
  isMicrosoftLoginAvailable: false,
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get("/applications", { params: search ? { search } : {} });
      setApplications(res.data.data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await API.get("/entities");
      setEntities(res.data.data.filter((e) => e.isActive));
    } catch {
      // silently fail
    }
  };

  useEffect(() => { fetchData(); }, [search]);
  useEffect(() => { fetchEntities(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };

  const openEdit = (app) => {
    setForm({
      name: app.name || "",
      description: app.description || "",
      problemItSolves: app.problemItSolves || "",
      category: app.category || "",
      url: app.url || "",
      entity: app.entity?._id || app.entity || "",
      appId: app.appId || "",
      appPassword: app.appPassword || "",
      visibleToEmail: app.visibleToEmail || "",
      isMicrosoftLoginAvailable: !!app.isMicrosoftLoginAvailable,
    });
    setEditing(app);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/applications/${editing._id}`, form);
        toast.success("Application updated");
      } else {
        await API.post("/applications", form);
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

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold outline-none transition-all focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10";

  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--darwin-text)" }}>Applications</h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--darwin-text-muted)" }}>
            Manage enterprise platforms
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
      ) : applications.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-th-large text-4xl text-slate-200 mb-4"></i>
          <p className="text-slate-400 font-bold text-sm">No applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Name</th>
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Category</th>
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Access Info</th>
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Problem It Solves</th>
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="system-admin-row border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-black text-xs" style={{ color: "var(--darwin-text)" }}>{app.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--darwin-text-muted)" }}>
                      {app.category || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {app.isMicrosoftLoginAvailable ? (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black flex items-center gap-1.5 w-fit">
                        <i className="fab fa-microsoft"></i> SSO
                      </span>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold" style={{ color: "var(--darwin-text)" }}>ID: {app.appId || "—"}</p>
                        <p className="text-[10px] text-slate-400">Pass: {app.appPassword ? "••••••" : "—"}</p>
                      </>
                    )}
                    {app.visibleToEmail && <p className="text-[9px] text-blue-500 mt-0.5">👤 {app.visibleToEmail}</p>}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-xs line-clamp-2" style={{ color: "var(--darwin-text-muted)" }}>{app.problemItSolves || "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(app._id)} title="Toggle status">
                      <span className={`badge ${app.isActive ? "badge-active" : "badge-inactive"}`}>
                        {app.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(app)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-900 transition-all"
                        title="Edit">
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(app._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Delete">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Application" : "Create Application"} size="lg">
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
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--darwin-text)" }}>
                <i className="fas fa-lock"></i> Application Credentials (Internal)
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Login ID</label>
                  <input value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value })} className={inputClass} placeholder="Username/ID" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Password</label>
                  <input type="text" value={form.appPassword} onChange={(e) => setForm({ ...form, appPassword: e.target.value })} className={inputClass} placeholder="Password" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Visible Only To (User Email - Optional)</label>
                <input type="email" value={form.visibleToEmail} onChange={(e) => setForm({ ...form, visibleToEmail: e.target.value })} className={inputClass} placeholder="user@example.com" />
                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">If left empty, all users will see these credentials.</p>
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
