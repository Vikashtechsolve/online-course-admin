import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, UserPlus, ChevronRight, Loader2, Mail, Calendar } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import EnrollUserModal from "../components/EnrollUserModal";
import { getUsers } from "../utils/usersApi";
export default function ManageAdmins() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getUsers({ role: "admin" });
      setAdmins(data.users || []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Super Admin Panel", to: "/admin" },
          { label: "Manage Admins" },
        ]}
      />

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#B11C20]" />
            Manage Admins
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-red)] text-white font-medium hover:opacity-90 shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          Enroll Admin
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        Admins can enroll teachers, coordinators, and students. They cannot access the Super Admin panel.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#B11C20]" />
        </div>
      ) : admins.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No admins yet</p>
          <p className="text-slate-500 text-sm mt-1">Enroll your first admin to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-red)] text-white text-sm font-medium hover:opacity-90"
          >
            <UserPlus size={16} />
            Enroll Admin
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-red-muted)] border border-[var(--accent-red)]/30 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-[var(--accent-red)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{admin.name}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-red-muted)] text-[var(--accent-red)]">Admin</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Mail size={14} />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Calendar size={12} />
                    Joined {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EnrollUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadAdmins}
        currentUserRole="superadmin"
        title="Enroll Admin"
        fixedRole="admin"
      />
    </div>
  );
}
