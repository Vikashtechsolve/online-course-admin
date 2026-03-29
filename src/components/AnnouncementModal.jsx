import { useState } from "react";

export default function AnnouncementModal({ closeModal, courses, onSubmit, mode = "create", initialData = null }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    body: initialData?.body || "",
    course: initialData?.course?._id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.course) {
      setError("Select a course.");
      return;
    }
    if (!form.title?.trim()) {
      setError("Enter a title.");
      return;
    }
    if (!form.body?.trim()) {
      setError("Enter the announcement message.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        course: form.course,
        title: form.title.trim(),
        body: form.body.trim(),
      });
    } catch (e) {
      setError(
        e.response?.data?.message ||
          (mode === "edit" ? "Could not update. Try again." : "Could not publish. Try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <button type="button" onClick={closeModal} className="form-close-btn text-xl">
          ✕
        </button>

        <h2 className="form-title">{mode === "edit" ? "Edit Announcement" : "Create Announcement"}</h2>
        <p className="form-subtitle">
          Students enrolled in the selected course will see this on their Announcements page.
        </p>

        {courses.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            You have no courses assigned as coordinator. Ask an admin to assign you to a course
            before posting announcements.
          </p>
        ) : null}

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Course</label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="form-control"
              required
              disabled={mode === "edit"}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                  {c.batch?.name ? ` (${c.batch.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Title</label>
            <input
              name="title"
              placeholder="Announcement title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Message</label>
            <textarea
              name="body"
              placeholder="Write the announcement details here..."
              value={form.body}
              onChange={handleChange}
              className="form-control h-28"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}

        <div className="form-actions">
          <button type="button" onClick={closeModal} className="form-btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="form-btn-primary"
            disabled={saving || courses.length === 0}
          >
            {saving ? (mode === "edit" ? "Saving…" : "Publishing…") : mode === "edit" ? "Save Changes" : "Publish Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}
