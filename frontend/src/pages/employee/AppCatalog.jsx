import { useEffect, useState } from "react";
import { FiSearch, FiExternalLink } from "react-icons/fi";
import API from "../../api/axios";

export default function AppCatalog() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { isActive: "true" };
        if (search) params.search = search;
        if (categoryFilter) params.category = categoryFilter;
        const res = await API.get("/applications", { params });
        setApplications(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, categoryFilter]);

  const categories = [...new Set(applications.map((a) => a.category).filter(Boolean))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Application Catalog</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No applications found</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div key={app._id} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{app.name}</h3>
                {app.category && (
                  <span className="ml-2 shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">{app.category}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{app.description}</p>
              <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-700 mb-0.5">Problem It Solves</p>
                <p className="text-sm text-amber-900 line-clamp-2">{app.problemItSolves}</p>
              </div>
              {app.entity?.name && (
                <p className="text-xs text-gray-400 mb-3">Entity: {app.entity.name}</p>
              )}
              {app.isMicrosoftLoginAvailable && (
                <div className="mb-4 flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  <i className="fab fa-microsoft text-indigo-600"></i>
                  <span className="text-xs font-bold text-indigo-700">Microsoft SSO Support</span>
                </div>
              )}
              {app.appId && !app.isMicrosoftLoginAvailable && (
                <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-gray-100 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Login Details</span>
                    <i className="fas fa-key text-[10px] text-gray-300"></i>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-gray-700 select-all font-bold">{app.appId}</span>
                    </div>
                    {app.appPassword && (
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Pass:</span>
                        <span className="text-gray-700 select-all font-bold">{app.appPassword}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-auto">
                {app.url ? (
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition">
                    <FiExternalLink size={14} /> Open
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No URL available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
