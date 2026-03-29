import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Loader2, UserPlus, Mail, Calendar, GraduationCap, UserCheck, UserCircle } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import EnrollUserModal from "../components/EnrollUserModal";
import { getUsers } from "../utils/usersApi";
import { useUser } from "../context/UserContext";

const ROLE_CONFIG = {
  teachers: {
    role: "teacher",
    title: "Teachers",
    label: "Teacher",
    icon: GraduationCap,
    color: "indigo",
    badgeClass: "bg-red-50 text-[#B11C20]",
    description: "Manage teachers who deliver lectures and courses.",
  },
  coordinators: {
    role: "coordinator",
    title: "Course Coordinators",
    label: "Coordinator",
    icon: UserCheck,
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-600",
    description: "Manage coordinators responsible for batches.",
  },
  students: {
    role: "student",
    title: "Students",
    label: "Student",
    icon: UserCircle,
    color: "violet",
    badgeClass: "bg-violet-50 text-violet-600",
    description: "Manage enrolled students.",
  },
};

const COLOR_CLASSES = {
  indigo: "bg-red-50 border-red-100 text-[#B11C20]",
  slate: "bg-slate-50 border-slate-200 text-slate-600",
  violet: "bg-violet-50 border-violet-100 text-violet-600",
};

export default function ManageUsersByRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleType: paramRole } = useParams();
  const { user } = useUser();
  // Derive role from path: /admin/teachers has no param, /users/teachers has roleType
  const roleType = paramRole || location.pathname.split("/").filter(Boolean).pop();
  const config = ROLE_CONFIG[roleType];
  const isSuperAdminPath = location.pathname.startsWith("/admin");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const roleForApi = config?.role;

  const loadUsers = useCallback(async () => {
    if (!roleForApi) return;
    setLoading(true);
    try {
      const data = await getUsers({ role: roleForApi });
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleForApi]);

  useEffect(() => {
    if (!config) {
      navigate(isSuperAdminPath ? "/admin" : "/users", { replace: true });
    }
  }, [config, navigate, isSuperAdminPath]);

  useEffect(() => {
    if (!roleForApi) {
      setLoading(false);
      return;
    }
    loadUsers();
  }, [roleForApi, roleType, loadUsers]);

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: isSuperAdminPath ? "Super Admin Panel" : "User Management", to: isSuperAdminPath ? "/admin" : "/users" },
          { label: config.title },
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
            <Icon className={`w-6 h-6 ${config.color === "indigo" ? "text-[#B11C20]" : config.color === "violet" ? "text-violet-600" : "text-slate-600"}`} />
            {config.title}
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          Enroll {config.role === "teacher" ? "Teacher" : config.role === "coordinator" ? "Coordinator" : "Student"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        {config.description}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#B11C20]" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Icon className={`w-12 h-12 text-slate-300 mx-auto mb-3`} />
          <p className="text-slate-600 font-medium">No {config.role}s yet</p>
          <p className="text-slate-500 text-sm mt-1">Enroll your first {config.role} to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B11C20] text-white text-sm font-medium hover:opacity-90"
          >
            <UserPlus size={16} />
            Enroll {config.role === "teacher" ? "Teacher" : config.role === "coordinator" ? "Coordinator" : "Student"}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${COLOR_CLASSES[config.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{u.name}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badgeClass}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Mail size={14} />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <p className="text-sm text-slate-500 mt-1">{u.phone}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Calendar size={12} />
                    Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
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
        onSuccess={loadUsers}
        currentUserRole={user?.role || "admin"}
        title={`Enroll ${config.role === "teacher" ? "Teacher" : config.role === "coordinator" ? "Coordinator" : "Student"}`}
        fixedRole={config.role}
      />
    </div>
  );
}
