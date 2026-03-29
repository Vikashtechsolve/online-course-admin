import { useNavigate } from "react-router-dom";
import { ChevronRight, FileText } from "lucide-react";

export default function TicketCard({ ticket }) {
  const navigate = useNavigate();
  const attachmentLabel = ticket.attachmentName;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/support/${ticket._id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/support/${ticket._id}`)}
      className="bg-linear-to-br from-[#EEF4FF] to-white rounded-xl p-6 flex justify-between items-start border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer"
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
          <span className="text-[11px] font-medium bg-white border border-blue-200 text-[#2360BB] px-2.5 py-1 rounded-full">
            {ticket.ticketNumber}
          </span>
          <span className="text-[11px] font-medium bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
            {ticket.course}
          </span>
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              ticket.status === "resolved"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {ticket.status === "resolved" ? "resolved" : "open"}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium text-gray-800">From:</span>{" "}
          {ticket.student?.name || "Student"}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium text-gray-800">Category:</span> {ticket.category}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{ticket.description}</p>
        {ticket.attachmentUrl ? (
          <p className="text-xs text-[#2360BB] flex items-center gap-1">
            <FileText size={12} />
            <a
              href={ticket.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="underline hover:text-[#B11C20]"
            >
              {attachmentLabel || "View attachment"}
            </a>
          </p>
        ) : attachmentLabel ? (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FileText size={12} />
            {attachmentLabel}
          </p>
        ) : null}
      </div>

      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
    </div>
  );
}
