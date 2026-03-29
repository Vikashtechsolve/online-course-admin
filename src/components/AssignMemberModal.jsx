import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getUsers } from "../utils/usersApi";
import {
  assignTeacher,
  unassignTeacher,
  assignCoordinator,
  unassignCoordinator,
  enrollStudent,
  unenrollStudent,
  getCourseById,
} from "../utils/coursesApi";

export default function AssignMemberModal({ isOpen, onClose, onSuccess, course, type }) {
  const [users, setUsers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState("");

  const roleMap = { teacher: "teacher", coordinator: "coordinator", student: "student" };
  const role = roleMap[type];

  useEffect(() => {
    if (isOpen && course) {
      loadData();
    }
  }, [isOpen, course?._id, type]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, courseRes] = await Promise.all([
        getUsers({ role }),
        getCourseById(course._id),
      ]);
      setUsers(usersRes.users || []);
      const key = type === "teacher" ? "teachers" : type === "coordinator" ? "coordinators" : "students";
      const list = courseRes[key] || [];
      const ids = list.map((m) => {
        const ref = m.teacher || m.coordinator || m.student;
        return ref?._id || ref;
      }).filter(Boolean);
      setAssigned(ids);
    } catch (err) {
      setUsers([]);
      setAssigned([]);
      setError(
        err.response?.data?.message ||
          "Failed to load users. You may not have permission to list this role."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = async (user) => {
    const id = user._id;
    const isAssigned = assigned.includes(id);
    setSubmitting(id);
    setError("");
    try {
      if (type === "teacher") {
        if (isAssigned) await unassignTeacher(course._id, id);
        else await assignTeacher(course._id, id);
      } else if (type === "coordinator") {
        if (isAssigned) await unassignCoordinator(course._id, id);
        else await assignCoordinator(course._id, id);
      } else {
        if (isAssigned) await unenrollStudent(course._id, id);
        else await enrollStudent(course._id, id);
      }
      setAssigned((prev) =>
        isAssigned ? prev.filter((x) => x !== id) : [...prev, id]
      );
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally {
      setSubmitting(null);
    }
  };

  if (!isOpen) return null;

  const title = `Assign ${type === "teacher" ? "Teachers" : type === "coordinator" ? "Coordinators" : "Students"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">{course?.title}</p>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#B11C20]" />
            </div>
          ) : users.length === 0 ? (
            !error ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No {role}s found. Enroll them from User Management first.
              </p>
            ) : null
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const isAssigned = assigned.includes(user._id);
                const busy = submitting === user._id;
                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => toggleAssignment(user)}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        isAssigned
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-[#B11C20] text-white hover:opacity-90"
                      } disabled:opacity-50`}
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isAssigned ? (
                        "Remove"
                      ) : (
                        "Assign"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
