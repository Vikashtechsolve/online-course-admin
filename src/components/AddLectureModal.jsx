import { useState } from "react";
import { X, Calendar, Clock, Loader2 } from "lucide-react";
import { createLecture } from "../utils/lecturesApi";

const LECTURE_STATUS = ["draft", "upcoming", "live", "completed", "recorded"];

export default function AddLectureModal({ courseId, closeModal, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    status: "draft",
    date: "",
    hour: "12",
    minute: "00",
    period: "AM",
    duration: "",
    meetingLink: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title?.trim()) {
      setError("Lecture title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let scheduledAt = null;
      if (form.date) {
        const h = parseInt(form.hour, 10);
        const m = parseInt(form.minute, 10);
        const hour24 = form.period === "PM" && h !== 12 ? h + 12 : form.period === "AM" && h === 12 ? 0 : h;
        scheduledAt = new Date(form.date);
        scheduledAt.setHours(hour24, m, 0, 0);
      }

      const duration = form.duration ? parseInt(form.duration, 10) : null;
      await createLecture({
        course: courseId,
        title: form.title.trim(),
        status: form.status,
        scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
        duration: duration || undefined,
        meetingLink: form.meetingLink?.trim() || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lecture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal max-w-lg">
        <button onClick={closeModal} className="form-close-btn">
          <X size={22} />
        </button>

        <h2 className="form-title">Add New Lecture</h2>
        <p className="form-subtitle">
          Add lecture details and learning resources for this course.
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              Lecture Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Enter the Lecture Title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Lecture Tag</label>
            <p className="text-xs text-gray-500 mb-1">For organization only (live, recorded, etc.) — you can upload materials for any tag.</p>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-control"
            >
              {LECTURE_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Schedule Lecture Date</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full outline-none"
              />
              <Calendar size={18} className="text-gray-400" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Schedule Lecture Time</label>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              <input
                type="number"
                name="hour"
                placeholder="HH"
                min="1"
                max="12"
                value={form.hour}
                onChange={handleChange}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1"
              />
              <span>:</span>
              <input
                type="number"
                name="minute"
                placeholder="MM"
                min="0"
                max="59"
                value={form.minute}
                onChange={handleChange}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1"
              />
              <select
                name="period"
                value={form.period}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-2 py-1"
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              placeholder="e.g. 60"
              min="1"
              value={form.duration}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Meeting Link</label>
            <p className="text-xs text-gray-500 mb-1">Optional. Students can join from lecture card when scheduled.</p>
            <input
              name="meetingLink"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={closeModal} className="form-btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="form-btn-primary disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create Lecture
          </button>
        </div>
      </div>
    </div>
  );
}
