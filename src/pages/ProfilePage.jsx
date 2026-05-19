import { useState, useRef } from "react";
import { useAuth }    from "../context/AuthContext";
import { userAPI, authAPI } from "../api";
import { Avatar, RoleBadge, Spinner } from "../components/ui";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [prefs, setPrefs] = useState({ notifyEmail: user?.notifyEmail ?? true, notifyPush: user?.notifyPush ?? true });

  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateMe({ ...profile, ...prefs });
      updateUser(data);
      showMsg("success", "Profile updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      showMsg("error", "New passwords don't match");
      return;
    }
    setSavingPw(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      showMsg("success", "Password changed successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const { data } = await userAPI.uploadAvatar(form);
      updateUser({ avatar: data.avatar });
      showMsg("success", "Avatar updated!");
    } catch (err) {
      showMsg("error", "Failed to upload avatar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
        <Link to="/inbox" className="btn-ghost text-sm">← Back to Inbox</Link>
        <h1 className="font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Toast */}
        {msg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            msg.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}>
            {msg.text}
          </div>
        )}

        {/* Avatar card */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar user={user} size={80} />
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Spinner size={24} />
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary text-sm">
                {uploading ? "Uploading…" : "Change Photo"}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">JPG, PNG or GIF · Max 10MB</p>
            </div>
            <div className="ml-auto">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Personal Info</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
              <input className="input-base" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input className="input-base opacity-60 cursor-not-allowed" value={user?.email || ""} disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
              <textarea
                className="input-base resize-none"
                rows={3}
                placeholder="Tell others a bit about yourself…"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{profile.bio.length}/200</p>
            </div>

            {/* Notification prefs */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notifications</p>
              <div className="space-y-3">
                {[
                  { key: "notifyEmail", label: "Email notifications", desc: "Receive emails for new messages" },
                  { key: "notifyPush",  label: "Push notifications",  desc: "Browser push notifications" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                    <div
                      onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${prefs[key] ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <><Spinner size={16} /> Saving…</> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            {["currentPassword", "newPassword", "confirm"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password" : "Confirm new password"}
                </label>
                <input
                  type="password"
                  className="input-base"
                  value={pwForm[field]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={savingPw} className="btn-secondary w-full">
              {savingPw ? <><Spinner size={16} /> Updating…</> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}