import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, Award, CheckCircle, UserCircle } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { getCourseById, markCourseComplete, bulkMarkCourseComplete } from "../utils/coursesApi";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [bulkCompleting, setBulkCompleting] = useState(false);
  const [selectedForCert, setSelectedForCert] = useState([]);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const data = await getCourseById(id);
      setCourse(data);
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">Course not found.</p>
        <button
          onClick={() => navigate("/courses")}
          className="mt-4 text-[#B11C20] font-medium hover:underline"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  const lectureCount = course.lectureCount ?? 0;
  const assignmentCount = course.assignmentCount ?? 0;
  const students = course.students || [];

  return (
    <div className="max-w-5xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Courses", to: "/courses" },
          { label: course.title },
        ]}
      />

      {/* Back Button */}
      <div
        onClick={() => navigate("/courses")}
        className="flex items-center gap-2 cursor-pointer mb-6 w-fit rounded-md px-2 py-1 hover:bg-gray-100"
      >
        <span className="text-lg">←</span>
        <h1 className="text-red-600 text-xl font-semibold">
          {course.title}
        </h1>
      </div>

      <div className="rounded-xl px-4 py-3 bg-linear-to-r from-[#B11C200A] to-[#2360BB0D] border border-red-100 text-sm text-gray-600">
        Track assignments and lectures for this course with quick access actions.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assignments */}
        <div className="bg-[#2360BB14] rounded-xl p-6 border border-blue-100 shadow-sm mycourses-card">
          <h2 className="text-red-600 font-serif font-semibold mb-3">Assignments</h2>
          <p className="mb-2">Create, review, and manage assignments for this course.</p>

          <div className="space-y-2 text-sm mt-4">
            <p className="flex items-center justify-between mycourses-stat rounded-md px-3 py-2">
              <span>Total Assignments</span>
              <span className="font-semibold text-[#B11C20]">{assignmentCount}</span>
            </p>
          </div>

          <button
            onClick={() => navigate(`/assignments?course=${id}`)}
            className="mt-4 bg-[#2360BB] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            View Assignments →
          </button>
        </div>

        {/* Lectures */}
        <div className="bg-[#2360BB14] rounded-xl p-6 border border-blue-100 shadow-sm mycourses-card">
          <h2 className="text-red-600 font-serif font-semibold mb-3">Lectures</h2>
          <p className="mb-2">Manage recorded lectures, live sessions, and course learning materials.</p>

          <div className="space-y-2 text-sm mt-4">
            <p className="flex items-center justify-between mycourses-stat rounded-md px-3 py-2">
              <span>Total Lectures</span>
              <span className="font-semibold text-[#B11C20]">{lectureCount}</span>
            </p>
          </div>

          <button
            onClick={() => navigate(`/courses/${id}/lectures`)}
            className="mt-4 bg-[#2360BB] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            View Lectures →
          </button>
        </div>

        {/* Students & Certificates */}
        <div className="md:col-span-2 bg-[#2360BB14] rounded-xl p-6 border border-blue-100 shadow-sm mycourses-card">
          <h2 className="text-red-600 font-serif font-semibold mb-3 flex items-center gap-2">
            <UserCircle size={20} />
            Students & Certificates
          </h2>
          {students.length === 0 ? (
            <p className="text-slate-500 text-sm">No students enrolled in this course.</p>
          ) : (
            <>
              {(() => {
                const completedCount = students.filter((s) => s.completedAt).length;
                const pendingCount = students.length - completedCount;
                const pendingStudents = students.filter((s) => !s.completedAt);
                const pendingIds = pendingStudents.map((e) => (e.student || e)._id);
                const selectedCount = selectedForCert.length;
                const allSelected = pendingCount > 0 && selectedCount === pendingCount;

                const selectAllPending = () => setSelectedForCert(pendingIds);
                const deselectAll = () => setSelectedForCert([]);

                return (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <p className="text-sm text-gray-600">
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
                              const res = await bulkMarkCourseComplete(id, { all: true });
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
                                const res = await bulkMarkCourseComplete(id, { studentIds: selectedForCert });
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
                );
              })()}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {students.map((enrollment) => {
                const student = enrollment.student || enrollment;
                const isCompleted = !!enrollment.completedAt;
                const isCompleting = completingId === student._id;
                return (
                  <div
                    key={enrollment._id || student._id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60 border border-blue-100"
                  >
                    {!isCompleted ? (
                      <input
                        type="checkbox"
                        checked={selectedForCert.includes(student._id)}
                        onChange={() => setSelectedForCert((prev) =>
                          prev.includes(student._id) ? prev.filter((x) => x !== student._id) : [...prev, student._id]
                        )}
                        className="rounded border-slate-300 text-[#B11C20] focus:ring-[#B11C20] shrink-0"
                      />
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          setCompletingId(student._id);
                          try {
                            await markCourseComplete(id, student._id);
                            loadCourse();
                          } catch (e) {
                            alert(e.response?.data?.message || "Failed to mark complete.");
                          } finally {
                            setCompletingId(null);
                          }
                        }}
                        disabled={isCompleting}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B11C20] hover:bg-[#9a181b] text-white text-xs font-medium disabled:opacity-60"
                      >
                        {isCompleting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Award size={12} />
                        )}
                        {isCompleting ? "Processing..." : "Mark Complete"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
