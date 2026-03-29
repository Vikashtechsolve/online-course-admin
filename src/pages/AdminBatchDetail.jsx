import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  Plus,
  UserPlus,
  GraduationCap,
  UserCheck,
  UserCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { getBatches, getBatchById } from "../utils/batchesApi";
import { getCourses, deleteCourse } from "../utils/coursesApi";
import AddCourseModal from "../components/AddCourseModal";
import AssignMemberModal from "../components/AssignMemberModal";
import { useUser } from "../context/UserContext";

export default function AdminBatchDetail() {
  const { user } = useUser();
  const canAssignCoordinator = user && ["superadmin", "admin"].includes(user.role);
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, course: null, type: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(batchId);
      const batchData = isObjectId
        ? await getBatchById(batchId)
        : (await getBatches()).batches?.find((b) => b.slug === batchId);
      if (batchData) setBatch(batchData);

      const coursesRes = await getCourses({ batch: batchId });
      setCourses(coursesRes.courses || []);
    } catch {
      setBatch(null);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchId]);

  const handleDeleteCourse = async (course) => {
    if (!confirm(`Deactivate course "${course.title}"?`)) return;
    try {
      await deleteCourse(course._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course.");
    }
  };

  if (loading && !batch) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">Batch not found.</p>
        <button
          onClick={() => navigate("/manage-batches")}
          className="mt-4 text-[#B11C20] font-medium hover:underline"
        >
          Back to Manage Batches
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Manage Batches", to: "/manage-batches" },
          { label: batch.name },
        ]}
      />

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manage-batches")}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#B11C20]" />
            {batch.name} – Courses
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/manage-batches/${batchId}/students`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#B11C20] text-[#B11C20] font-medium hover:bg-red-50 shadow-sm transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            Manage Students
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No courses yet</p>
          <p className="text-slate-500 text-sm mt-1">Create a course and assign teachers or coordinators.</p>
          <button
            onClick={() => setShowCourseModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B11C20] text-white text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div
                  onClick={() => navigate(`/manage-batches/${batchId}/course/${course._id}`)}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <h3 className="text-[#B11C20] font-semibold text-lg mb-1">{course.title}</h3>
                  {course.description && (
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      {course.teachers || 0} teachers
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={14} />
                      {course.coordinators || 0} coordinators
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCircle size={14} />
                      {course.students || 0} students
                    </span>
                    <span>{course.lectures || 0} lectures</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAssignModal({ open: true, course, type: "teacher" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                  >
                    <UserPlus size={14} />
                    Teacher
                  </button>
                  {canAssignCoordinator ? (
                    <button
                      type="button"
                      onClick={() => setAssignModal({ open: true, course, type: "coordinator" })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                    >
                      <UserPlus size={14} />
                      Coordinator
                    </button>
                  ) : null}
                  <button
                    onClick={() => navigate(`/manage-batches/${batchId}/course/${course._id}`)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    title="Manage"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onSuccess={loadData}
        batchId={batch._id}
      />

      {assignModal.open && assignModal.course && (
        <AssignMemberModal
          isOpen={assignModal.open}
          onClose={() => setAssignModal({ open: false, course: null, type: null })}
          onSuccess={loadData}
          course={assignModal.course}
          type={assignModal.type}
        />
      )}
    </div>
  );
}
