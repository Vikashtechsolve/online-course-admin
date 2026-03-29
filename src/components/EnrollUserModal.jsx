import { useState, useEffect } from "react";
import { X, Mail, User, Phone, Lock, Loader2 } from "lucide-react";
import { createUser } from "../utils/usersApi";
import { ROLE_OPTIONS } from "../utils/usersApi";

export default function EnrollUserModal({ isOpen, onClose, onSuccess, currentUserRole, title = "Enroll User", fixedRole = null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(fixedRole || "");

  useEffect(() => {
    if (isOpen) setRole(fixedRole || "");
  }, [isOpen, fixedRole]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = ROLE_OPTIONS[currentUserRole] || ROLE_OPTIONS.admin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const finalRole = fixedRole || role;
    if (!name.trim() || !email.trim() || !password.trim() || !finalRole) {
      setError("Name, email, password, and role are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim(), role: finalRole });
      onSuccess?.();
      resetAndClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole(fixedRole || "");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={resetAndClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#B11C20] focus-within:ring-2 focus-within:ring-[#B11C20]/20">
              <User size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#B11C20] focus-within:ring-2 focus-within:ring-[#B11C20]/20">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#B11C20] focus-within:ring-2 focus-within:ring-[#B11C20]/20">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#B11C20] focus-within:ring-2 focus-within:ring-[#B11C20]/20">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>

          {!fixedRole && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/20"
              >
                <option value="">Select role</option>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
