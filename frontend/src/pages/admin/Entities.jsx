import { useEffect, useState } from "react";
import API from "../../api/axios";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const emptyForm = { name: "" };

export default function Entities() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get("/entities", { params: search ? { search } : {} });
      setEntities(res.data.data);
    } catch {
      toast.error("Failed to load entities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };

  const openEdit = (entity) => {
    setForm({ name: entity.name || "" });
    setEditing(entity);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/entities/${editing._id}`, form);
        toast.success("Entity updated");
      } else {
        await API.post("/entities", form);
        toast.success("Entity created");
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
    if (!confirm("Delete this entity?")) return;
    try {
      await API.delete(`/entities/${id}`);
      toast.success("Entity deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/entities/${id}/toggle-status`);
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
          <h1 className="text-2xl font-black" style={{ color: "var(--darwin-text)" }}>Entities</h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--darwin-text-muted)" }}>
            Manage organizational entities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input
              type="text"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input pl-9 w-56"
            />
          </div>
          <button onClick={openCreate}
            className="launch-btn text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2">
            <i className="fas fa-plus text-[10px]"></i> Add Entity
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-sitemap text-4xl text-slate-200 mb-4"></i>
          <p className="text-slate-400 font-bold text-sm">No entities found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Name</th>
                <th className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity._id} className="system-admin-row border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-black text-xs" style={{ color: "var(--darwin-text)" }}>{entity.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(entity._id)} title="Toggle status">
                      <span className={`badge ${entity.isActive ? "badge-active" : "badge-inactive"}`}>
                        {entity.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(entity)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-900 transition-all"
                        title="Edit">
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(entity._id)}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Entity" : "Create Entity"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--darwin-text-muted)" }}>Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
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
