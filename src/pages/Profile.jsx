import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Camera,
  Loader2,
  ShieldCheck,
  Lock,
  Pencil,
  CalendarDays,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useUser } from "../context/UserContext";
import {
  updateAdminProfile,
  uploadAvatar,
  changePassword,
  getRoleLabel,
} from "../utils/auth";

export default function Profile() {
  const navigate = useNavigate();
  const { user: profile, refreshUser } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef(null);

  const handleEdit = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setIsEditing(true);
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateAdminProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      refreshUser(updated);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      refreshUser({ ...profile, avatar: avatarUrl });
      setMessage({ type: "success", text: "Profile photo updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload photo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Password changed successfully." });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="max-w-2xl px-4 sm:px-0 space-y-6">
      <Breadcrumbs items={[{ label: "Profile" }]} />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-gray-100 transition text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-[#B11C20]">Profile</h1>
      </div>

      {message.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-linear-to-r from-[#B11C2008] to-[#B11C2004] border-b border-gray-100 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-md border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 ring-4 ring-white shadow-md border border-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#B11C20] text-white flex items-center justify-center shadow-lg hover:opacity-90 cursor-pointer disabled:opacity-60 transition-colors"
              >
                {isUploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Camera size={15} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.name || "Admin"}
              </h2>
              <p className="text-sm text-gray-500">
                {profile ? getRoleLabel(profile.role) : "Admin"}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <CalendarDays size={12} />
                Member since {memberSince}
              </div>
            </div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="divide-y divide-gray-100">
          {/* Name — editable */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#B11C20]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Full Name
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full text-gray-900 font-medium bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/10 text-sm"
                  placeholder="Enter your name"
                  autoFocus
                />
              ) : (
                <p className="text-gray-900 font-medium mt-0.5">
                  {profile?.name || "—"}
                </p>
              )}
            </div>
            {!isEditing && (
              <Pencil size={14} className="text-gray-300 shrink-0" />
            )}
          </div>

          {/* Email — read-only */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-50/50">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#B11C20]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1.5">
                Email
                <Lock size={10} className="text-gray-400" />
              </p>
              <p className="text-gray-900 font-medium wrap-break-word mt-0.5">
                {profile?.email || "—"}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shrink-0">
              Read-only
            </span>
          </div>

          {/* Phone — editable */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Phone Number
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1 w-full text-gray-900 font-medium bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/10 text-sm"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900 font-medium mt-0.5">
                  {profile?.phone || "Not provided"}
                </p>
              )}
            </div>
            {!isEditing && (
              <Pencil size={14} className="text-gray-300 shrink-0" />
            )}
          </div>

          {/* Role — read-only */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-50/50">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1.5">
                Role
                <Lock size={10} className="text-gray-400" />
              </p>
              <p className="text-gray-900 font-medium mt-0.5">
                {profile ? getRoleLabel(profile.role) : "—"}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shrink-0">
              Read-only
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="form-btn-primary inline-flex items-center gap-2"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ type: "", text: "" });
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="form-btn-primary inline-flex items-center gap-2"
              >
                <Pencil size={14} />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setMessage({ type: "", text: "" });
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Lock size={14} />
                Change Password
              </button>
            </>
          )}
        </div>
      </div>

      {/* Change password form */}
      {showPasswordForm && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Your new password must be at least 6 characters.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/10"
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/10"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/10"
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="form-btn-primary inline-flex items-center gap-2"
            >
              {isChangingPassword && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false);
                setMessage({ type: "", text: "" });
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
