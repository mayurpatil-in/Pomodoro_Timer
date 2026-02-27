import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

export default function AdminUsersPage({ darkMode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { api, user } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [plan, setPlan] = useState("free");
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setEmail("");
    setPassword("");
    setRole("user");
    setPlan("free");
    setIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setEmail(user.email);
    setPassword(""); // don't show existing password
    setRole(user.role);
    setPlan(user.subscription_plan);
    setIsActive(user.is_active);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (modalMode === "create") {
        await api.post("/admin/users", {
          email,
          password,
          role,
          subscription_plan: plan,
        });
      } else {
        await api.put(`/admin/users/${selectedUser.id}`, {
          role,
          subscription_plan: plan,
          is_active: isActive,
        });
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.error || `Failed to ${modalMode} user.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = (u) => {
    if (user.id === u.id) {
      setError("You cannot delete your own account.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
      setTimeout(() => setError(""), 3000);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-inter font-bold ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            User Management
          </h1>
          <p
            className={`text-sm font-outfit mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Provision new accounts and manage subscriptions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} />
          Create User
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead
                className={`text-xs uppercase font-semibold ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}
              >
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-white/5" : "divide-slate-200"}`}
              >
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={
                      darkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
                        >
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "superadmin" ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700") : u.role === "admin" ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700") : darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                      >
                        {u.role === "user" ? (
                          <UsersIcon size={12} />
                        ) : (
                          <Shield size={12} />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.subscription_plan === "pro" ? (darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700") : darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {u.subscription_plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 ${u.is_active ? (darkMode ? "text-emerald-400" : "text-emerald-600") : darkMode ? "text-red-400" : "text-red-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`}
                        />
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.id === user.id
                              ? "opacity-30 cursor-not-allowed"
                              : darkMode
                                ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                          }`}
                          title={
                            u.id === user.id
                              ? "Cannot delete yourself"
                              : "Delete User"
                          }
                          disabled={u.id === user.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className={`text-center py-8 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#161b22] border border-white/10" : "bg-white"}`}
          >
            <div
              className={`px-6 py-4 border-b ${darkMode ? "border-white/10" : "border-slate-200"}`}
            >
              <h3
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                {modalMode === "create"
                  ? "Create New User"
                  : "Edit User Settings"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={modalMode === "edit"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white focus:border-indigo-500 disabled:opacity-50"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 disabled:opacity-50"
                  }`}
                />
              </div>

              {modalMode === "create" && (
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors appearance-none ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors appearance-none ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500"
                    }`}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>

              {modalMode === "edit" && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-white/10 border-white/20 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <label
                    htmlFor="isActive"
                    className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Account is active
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                    formLoading
                      ? "bg-indigo-500/50 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {formLoading ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleteLoading && setIsDeleteModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#161b22] border border-white/10" : "bg-white"}`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${darkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}
              >
                <Trash2 size={24} />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Delete User
              </h3>
              <p
                className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Are you sure you want to permanently delete{" "}
                <span
                  className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  {userToDelete.email}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleteLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                    deleteLoading
                      ? "bg-red-500/50 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
