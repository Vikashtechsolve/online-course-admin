import { useState } from "react";
import { X } from "lucide-react";
import { createCourse } from "../utils/coursesApi";

export default function AddCourseModal({ isOpen, onClose, onSuccess, batchId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }
    if (!batchId) {
      setError("Batch is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCourse({
        batch: batchId,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Add Course</h2>
            <button
              type="button"
              onClick={onClose}
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Basic React, DSA Fundamentals"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 text-sm outline-none focus:border-[#B11C20] focus:ring-2 focus:ring-[#B11C20]/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
