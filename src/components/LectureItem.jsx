import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Loader2, Trash2, Upload } from "lucide-react";
import { deleteLecture } from "../utils/lecturesApi";
import { formatDateTime } from "../utils/date";

const statusColor = {
  live: "bg-red-100 text-red-600 border-red-200",
  completed: "bg-green-100 text-green-600 border-green-200",
  recorded: "bg-blue-100 text-blue-600 border-blue-200",
  upcoming: "bg-yellow-100 text-yellow-700 border-yellow-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function LectureItem({ lecture, courseId, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const lectureId = lecture._id;
  const teacherName = lecture.teacher?.name || "Teacher";
  const dateStr = formatDateTime(lecture.scheduledAt);
  const durationStr = lecture.duration ? `${lecture.duration} min` : "";
  const status = lecture.status || "draft";
  const hasMeetingLink = !!lecture.meetingLink;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete lecture "${lecture.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteLecture(lectureId);
      onDelete?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 gap-4 rounded-xl px-3 transition border border-gray-200 bg-white hover:bg-[#f8fbff] hover:border-blue-200 hover:shadow-sm mb-3 last:mb-0">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-sm md:text-base">{lecture.title}</h3>
          <span
            className={`text-xs px-3 py-1 rounded-full border mycourses-pill ${statusColor[status] || statusColor.draft}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
          <span>{teacherName}</span>
          {dateStr && (
            <>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{dateStr}</span>
              </div>
            </>
          )}
          {durationStr && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>{durationStr}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        {hasMeetingLink && (
          <a
            href={lecture.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B11C20] text-white px-4 py-1 rounded-lg text-sm w-full sm:w-auto shadow-sm hover:shadow-md text-center"
          >
            Join
          </a>
        )}

        <button
          onClick={() => navigate(`/courses/${courseId}/lectures/${lectureId}`)}
          className="bg-[#2360BB] text-white px-4 py-1 rounded-lg text-sm w-full sm:w-auto shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          View & Upload Materials
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
          title="Delete lecture"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
