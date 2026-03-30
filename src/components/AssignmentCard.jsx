import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, ExternalLink, Pencil } from "lucide-react";
import SubmissionsModal from "./SubmissionsModal";
import { htmlToPlainText } from "../utils/htmlToPlainText";
import { formatDate } from "../utils/date";

export default function AssignmentCard({ assignment, onUpdate }) {
  const navigate = useNavigate();
  const [showSubmissions, setShowSubmissions] = useState(false);

  const courseTitle = assignment.course?.title || "Course";
  const descriptionPreview = htmlToPlainText(assignment.description);

  return (
    <div className="bg-linear-to-br from-[#2360BB10] to-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-[#B11C20] font-semibold text-lg leading-tight">
          {assignment.title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/assignments/${assignment._id}/edit`);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Edit assignment"
          >
            <Pencil size={16} />
          </button>
          <span className="text-[11px] font-medium bg-white border border-blue-200 text-[#2360BB] px-2.5 py-1 rounded-full whitespace-nowrap">
            {courseTitle}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Course:</span> {courseTitle}
        </p>
        <p className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span className="font-medium text-gray-800">Due Date:</span>{" "}
          {formatDate(assignment.dueDate)}
        </p>
        {assignment.estimatedTime && (
          <p>
            <span className="font-medium text-gray-800">Estimated Time:</span>{" "}
            {assignment.estimatedTime}
          </p>
        )}
        {descriptionPreview ? (
          <p
            className="text-gray-600 line-clamp-2 wrap-break-word mt-0.5"
            title={descriptionPreview.length > 120 ? descriptionPreview : undefined}
          >
            {descriptionPreview}
          </p>
        ) : null}
      </div>

      {assignment.attachmentUrl && (
        <a
          href={assignment.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#2360BB] hover:underline mt-2"
        >
          <ExternalLink size={14} />
          View attachment
        </a>
      )}

      <button
        onClick={() => setShowSubmissions(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#2360BB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4d94] transition"
      >
        <Users size={16} />
        View Submissions
      </button>

      {showSubmissions && (
        <SubmissionsModal
          assignment={assignment}
          onClose={() => setShowSubmissions(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
