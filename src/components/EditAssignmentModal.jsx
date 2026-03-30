import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import RichTextArea from "./RichTextArea";
import { updateAssignment } from "../utils/assignmentsApi";
import { formatDateForInput } from "../utils/date";

export default function EditAssignmentModal({ assignment, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    estimatedTime: "",
    file: null,
  });

  useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title || "",
        description: assignment.description || "",
        dueDate: formatDateForInput(assignment.dueDate),
        estimatedTime: assignment.estimatedTime || "",
        file: null,
      });
    }
  }, [assignment]);

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
    if (!form.dueDate) {
      setError("Due date is required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateAssignment(assignment._id, {
        title: form.title.trim(),
        description: form.description?.trim() || "",
        dueDate: form.dueDate,
        estimatedTime: form.estimatedTime?.trim() || "",
        file: form.file,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return null;

  return (
    <div className="form-overlay">
      <div className="form-modal max-w-xl">
        <button onClick={onClose} className="form-close-btn">
          <X size={22} />
        </button>

        <h2 className="form-title">Edit Assignment</h2>
        <p className="form-subtitle">Update assignment details.</p>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Description (rich formatting)</label>
            <RichTextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Assignment instructions..."
              rows={4}
            />
          </div>

          <div className="form-field">
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

          <div className="form-field">
            <label className="form-label">Estimated Time</label>
            <input
              name="estimatedTime"
              placeholder="e.g. 2 hours"
              value={form.estimatedTime}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Replace attachment (optional)</label>
            <label className="form-upload-zone cursor-pointer text-gray-500 flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-[#B11C20] hover:bg-red-50/30 transition">
              <Upload size={22} />
              <span className="mt-2 text-sm">
                {form.file ? form.file.name : "Choose new file to replace"}
              </span>
              <input
                type="file"
                onChange={handleFile}
                className="hidden"
                accept=".pdf,image/*"
              />
            </label>
            {assignment.attachmentUrl && !form.file && (
              <p className="text-xs text-slate-500 mt-1">
                Current attachment will be kept if not replaced.
              </p>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onClose} className="form-btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="form-btn-primary flex items-center gap-2 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
