import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { userAPI, conversationAPI } from "../api";
import { Avatar, RoleBadge, Spinner } from "../components/ui";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionMsg, setActionMsg] = useState("");

  const LIMIT = 10;
  const ROLES = ["all", "admin", "agent", "customer", "designer", "merchant"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter !== "all")   params.role   = roleFilter;

      const [usersRes, statsRes] = await Promise.all([
        userAPI.getAllUsers(params),
        conversationAPI.getStats(),
      ]);
      setUsers(usersRes.data.users);
      setTotal(usersRes.data.total);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleActive = async (userId, currentState) => {
    try {
      await userAPI.updateUser(userId, { isActive: !currentState });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !currentState } : u));
      setActionMsg(`User ${!currentState ? "activated" : "deactivated"}`);
      setTimeout(() => setActionMsg(""), 2500);
    } catch {}
  };

  const changeRole = async (userId, newRole) => {
    try {
      await userAPI.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
    } catch {}
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inbox" className="btn-ghost text-sm">← Inbox</Link>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Admin Dashboard</h1>
        </div>
        <Link to="/profile" className="btn-ghost text-sm">Profile →</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {actionMsg && (
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl text-sm font-medium">
            ✅ {actionMsg}
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total users", value: total, icon: "👥" },
              { label: "Total conversations", value: stats.total || 0, icon: "💬" },
              { label: "Active conversations", value: stats.active || 0, icon: "🟢" },
              { label: "Support convos", value: stats.byType?.find((t) => t._id === "support")?.count || 0, icon: "🎧" },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name…"
              className="input-base max-w-xs"
            />
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRoleFilter(r); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    roleFilter === r
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size={28} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-600">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} size={36} showOnline />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-700 dark:text-gray-300"
                        >
                          {["admin","agent","customer","designer","merchant"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          u.isActive
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive(u._id, u.isActive)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            u.isActive
                              ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {total} total · Page {page} of {pages}
              </p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary !py-1 !px-3 text-xs disabled:opacity-40">Prev</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === pages} className="btn-secondary !py-1 !px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}