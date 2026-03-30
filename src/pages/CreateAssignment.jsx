import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import RichTextArea from "../components/RichTextArea";
import { createAssignment, updateAssignment, getAssignmentById } from "../utils/assignmentsApi";
import { getCourses } from "../utils/coursesApi";
import { useUser } from "../context/UserContext";
import { formatDateForInput } from "../utils/date";

export default function CreateAssignment() {
  const navigate = useNavigate();
  const params = useParams();
  const assignmentId = params.id;
  const { user } = useUser();
  const isEditMode = Boolean(assignmentId);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    course: "",
    description: "",
    dueDate: "",
    estimatedTime: "",
    file: null,
  });
  const [hasExistingAttachment, setHasExistingAttachment] = useState(false);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    loadCourses();
  }, [user?._id]);

  useEffect(() => {
    if (isEditMode && assignmentId) {
      loadAssignment();
    }
  }, [assignmentId, isEditMode]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const params = isTeacher && user?._id ? { teacher: user._id } : {};
      const data = await getCourses(params);
      setCourses(data.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAssignment = async () => {
    setLoadingAssignment(true);
    try {
      const assignment = await getAssignmentById(assignmentId);
      const courseId = assignment.course?._id || assignment.course;
      setForm({
        title: assignment.title || "",
        course: courseId || "",
        description: assignment.description || "",
        dueDate: formatDateForInput(assignment.dueDate),
        estimatedTime: assignment.estimatedTime || "",
        file: null,
      });
      setHasExistingAttachment(Boolean(assignment.attachmentUrl));
    } catch {
      setError("Failed to load assignment.");
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, file: e.target.files?.[0] || null });
  };

  const handleSubmit = async () => {
    if (!form.title?.trim()) {
      setError("Assignment title is required");
      return;
    }
    if (!form.course) {
      setError("Please select a course");
      return;
    }
    if (!form.dueDate) {
      setError("Due date is required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isEditMode) {
        await updateAssignment(assignmentId, {
          title: form.title.trim(),
          description: form.description?.trim() || "",
          dueDate: form.dueDate,
          estimatedTime: form.estimatedTime?.trim() || "",
          file: form.file,
        });
      } else {
        await createAssignment({
          course: form.course,
          title: form.title.trim(),
          description: form.description?.trim() || "",
          dueDate: form.dueDate,
          estimatedTime: form.estimatedTime?.trim() || "",
          file: form.file,
        });
      }
      navigate("/assignments");
    } catch (err) {
      setError(err.response?.data?.message || (isEditMode ? "Failed to update assignment." : "Failed to create assignment."));
    } finally {
      setSubmitting(false);
    }
  };

  const loading = loadingCourses || (isEditMode && loadingAssignment);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Assignments", to: "/assignments" },
          { label: isEditMode ? "Edit Assignment" : "Create New Assignment" },
        ]}
      />

      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate("/assignments")}
          className="text-xl rounded-md px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#B11C20]">
            {isEditMode ? "Edit Assignment" : "Create New Assignment"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Update assignment details and timeline."
              : "Add details and timeline. The assignment will be allocated to all students enrolled in the selected course."}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 max-w-4xl">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {isEditMode && loadingAssignment ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-[#B11C20]" />
          </div>
        ) : (
        <>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="form-label">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Enter the Assignment Title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="form-control"
              disabled={loadingCourses || isEditMode}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            {(loadingCourses || (isEditMode && loadingAssignment)) && (
              <p className="text-xs text-slate-500 mt-1">
                {isEditMode ? "Loading assignment..." : "Loading courses..."}
              </p>
            )}
          </div>

          <div>
            <label className="form-label">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Estimated Time (e.g. 2 hours)</label>
            <input
              name="estimatedTime"
              placeholder="e.g. 2 hours, 30 minutes"
              value={form.estimatedTime}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Description (supports rich formatting)</label>
            <RichTextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Assignment instructions. Use toolbar for bold, lists, links, etc."
              rows={8}
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Attachment (optional)</label>
            <label className="form-upload-zone cursor-pointer text-gray-500 flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-[#B11C20] hover:bg-red-50/30 transition">
              <Upload size={28} />
              <span className="mt-2 text-sm">
                {form.file ? form.file.name : isEditMode ? "Choose new file to replace (optional)" : "Upload PDF or Image"}
              </span>
              <input type="file" onChange={handleFile} className="hidden" accept=".pdf,image/*" />
            </label>
            {isEditMode && hasExistingAttachment && !form.file && (
              <p className="text-xs text-slate-500 mt-1">Current attachment will be kept if not replaced.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/assignments")}
            className="form-btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="form-btn-primary disabled:opacity-50 flex items-center gap-2"
            disabled={submitting || loading}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? "Save Changes" : "Create Assignment"}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
