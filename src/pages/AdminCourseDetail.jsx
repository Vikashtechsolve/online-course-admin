import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  UserPlus,
  GraduationCap,
  UserCheck,
  UserCircle,
  Pencil,
  Trash2,
  BookOpen,
  Award,
  CheckCircle,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  unassignTeacher,
  unassignCoordinator,
  markCourseComplete,
  bulkMarkCourseComplete,
} from "../utils/coursesApi";
import AssignMemberModal from "../components/AssignMemberModal";
import { useUser } from "../context/UserContext";

export default function AdminCourseDetail() {
  const { user } = useUser();
  const canAssignCoordinator = user && ["superadmin", "admin"].includes(user.role);
  const navigate = useNavigate();
  const { batchId, courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, type: null });
  const [editing, setEditing] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [bulkCompleting, setBulkCompleting] = useState(false);
  const [selectedForCert, setSelectedForCert] = useState([]);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const loadCourse = async () => {
    setLoading(true);
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
      setEditTitle(data.title || "");
      setEditDesc(data.description || "");
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleSaveEdit = async () => {
    try {
      await updateCourse(courseId, { title: editTitle, description: editDesc });
      setEditing(false);
      loadCourse();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deactivate course "${course?.title}"?`)) return;
    try {
      await deleteCourse(courseId);
      navigate(`/manage-batches/${batchId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">Course not found.</p>
        <button
          onClick={() => navigate(`/manage-batches/${batchId}`)}
          className="mt-4 text-[#B11C20] font-medium hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  const teachers = course.teachers || [];
  const coordinators = course.coordinators || [];
  const studentCount = course.students?.length ?? course.studentCount ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Manage Batches", to: "/manage-batches" },
          { label: course.batch?.name || "Batch", to: `/manage-batches/${batchId}` },
          { label: course.title },
        ]}
      />

      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <button
            onClick={() => navigate(`/manage-batches/${batchId}`)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium mb-2"
          >
            ← Back
          </button>
          {editing ? (
            <div className="space-y-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="block w-full max-w-md text-xl font-semibold border border-slate-200 rounded-lg px-3 py-2"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="block w-full max-w-md text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-[#B11C20] text-white text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
          {course.description && !editing && (
            <p className="text-slate-600 text-sm mt-1">{course.description}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#B11C20] text-[#B11C20] font-medium hover:bg-red-50"
        >
          <BookOpen size={18} />
          View Course (Lectures & Assignments)
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#B11C20]" />
              Teachers
            </h3>
            <button
              onClick={() => setAssignModal({ open: true, type: "teacher" })}
              className="text-sm text-[#B11C20] font-medium hover:underline flex items-center gap-1"
            >
              <UserPlus size={14} />
              Assign
            </button>
          </div>
          <div className="space-y-2">
            {teachers.length === 0 ? (
              <p className="text-slate-500 text-sm">No teachers assigned</p>
            ) : (
              teachers.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{t.teacher?.name}</p>
                    <p className="text-xs text-slate-500">{t.teacher?.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await unassignTeacher(courseId, t.teacher._id);
                        loadCourse();
                      } catch (e) {
                        alert(e.response?.data?.message || "Failed");
                      }
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#B11C20]" />
              Coordinators
            </h3>
            {canAssignCoordinator ? (
              <button
                type="button"
                onClick={() => setAssignModal({ open: true, type: "coordinator" })}
                className="flex items-center gap-1 text-sm font-medium text-[#B11C20] hover:underline"
              >
                <UserPlus size={14} />
                Assign
              </button>
            ) : null}
          </div>
          <div className="space-y-2">
            {coordinators.length === 0 ? (
              <p className="text-slate-500 text-sm">No coordinators assigned</p>
            ) : (
              coordinators.map((c) => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.coordinator?.name}</p>
                    <p className="text-xs text-slate-500">{c.coordinator?.email}</p>
                  </div>
                  {canAssignCoordinator ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await unassignCoordinator(courseId, c.coordinator._id);
                          loadCourse();
                        } catch (e) {
                          alert(e.response?.data?.message || "Failed");
                        }
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#B11C20]" />
              Students ({studentCount})
            </h3>
            <button
              onClick={() => navigate(`/manage-batches/${batchId}/students`)}
              className="text-sm text-[#B11C20] font-medium hover:underline"
            >
              Manage in Batch
            </button>
          </div>
          {(() => {
            const students = course.students || [];
            const completedCount = students.filter((s) => s.completedAt).length;
            const pendingCount = students.length - completedCount;
            const pendingStudents = students.filter((s) => !s.completedAt);
            const pendingIds = pendingStudents.map((e) => (e.student || e)._id);
            const selectedCount = selectedForCert.length;
            const allSelected = pendingCount > 0 && selectedCount === pendingCount;

            const toggleSelect = (id) => {
              setSelectedForCert((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              );
            };
            const selectAllPending = () => setSelectedForCert(pendingIds);
            const deselectAll = () => setSelectedForCert([]);

            return (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <p className="text-slate-500 text-sm">
                    {completedCount} with certificates, {pendingCount} pending
                  </p>
                  {pendingCount > 0 && (
                    <>
                      <button
                        onClick={async () => {
                          if (!confirm(`Generate certificates for all ${pendingCount} pending students? This may take a few minutes.`)) return;
                          setBulkCompleting(true);
                          setSelectedForCert([]);
                          try {
                            const res = await bulkMarkCourseComplete(courseId, { all: true });
                            alert(res.message || `Completed: ${res.completed}, Skipped: ${res.skipped}`);
                            loadCourse();
                          } catch (e) {
                            alert(e.response?.data?.message || "Bulk operation failed.");
                          } finally {
                            setBulkCompleting(false);
                          }
                        }}
                        disabled={bulkCompleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-60"
                      >
                        {bulkCompleting ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                        {bulkCompleting ? "Processing..." : `Mark All ${pendingCount} Complete`}
                      </button>
                      <span className="text-slate-400 text-xs">|</span>
                      <button
                        type="button"
                        onClick={allSelected ? deselectAll : selectAllPending}
                        className="text-xs text-[#B11C20] hover:underline"
                      >
                        {allSelected ? "Deselect all" : "Select all pending"}
                      </button>
                      {selectedCount > 0 && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Generate certificates for ${selectedCount} selected student(s)?`)) return;
                            setBulkCompleting(true);
                            try {
                              const res = await bulkMarkCourseComplete(courseId, { studentIds: selectedForCert });
                              alert(res.message || `Completed: ${res.completed}, Skipped: ${res.skipped}`);
                              setSelectedForCert([]);
                              loadCourse();
                            } catch (e) {
                              alert(e.response?.data?.message || "Operation failed.");
                            } finally {
                              setBulkCompleting(false);
                            }
                          }}
                          disabled={bulkCompleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-60"
                        >
                          <Award size={14} />
                          Mark {selectedCount} Selected Complete
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
            {(course.students || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No students enrolled</p>
            ) : (
              (course.students || []).map((enrollment) => {
                const student = enrollment.student || enrollment;
                const isCompleted = !!enrollment.completedAt;
                const isCompleting = completingId === student._id;
                return (
                  <div
                    key={enrollment._id || student._id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-2"
                  >
                    {!isCompleted ? (
                      <input
                        type="checkbox"
                        checked={selectedForCert.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="rounded border-slate-300 text-[#B11C20] focus:ring-[#B11C20] shrink-0"
                      />
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          setCompletingId(student._id);
                          try {
                            await markCourseComplete(courseId, student._id);
                            loadCourse();
                          } catch (e) {
                            alert(e.response?.data?.message || "Failed to mark complete.");
                          } finally {
                            setCompletingId(null);
                          }
                        }}
                        disabled={isCompleting}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B11C20] hover:bg-[#9a181b] text-white text-xs font-medium disabled:opacity-60"
                      >
                        {isCompleting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Award size={12} />
                        )}
                        {isCompleting ? "..." : "Mark Complete"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
              </>
            );
          })()}
        </div>
      </div>

      {assignModal.open && (
        <AssignMemberModal
          isOpen={assignModal.open}
          onClose={() => setAssignModal({ open: false, type: null })}
          onSuccess={loadCourse}
          course={course}
          type={assignModal.type}
        />
      )}
    </div>
  );
}
