import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, FileText, User, BookOpen, Tag, SendHorizontal, Loader2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { fetchTicket, staffReply, formatTicketDate } from "../utils/ticketsApi";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadTicket = useCallback(async () => {
    setLoading(true);
    try {
      const t = await fetchTicket(ticketId);
      setTicket(t);
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleStaffReply = async () => {
    if (!replyText.trim()) {
      setError("Write a reply before sending.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const updated = await staffReply(ticketId, replyText.trim());
      setTicket(updated);
      setReplyText("");
      window.dispatchEvent(new Event("admin-tickets:updated"));
    } catch (e) {
      setError(e.response?.data?.message || "Could not send reply.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Ticket not found.</p>
        <button
          type="button"
          onClick={() => navigate("/support")}
          className="mt-4 text-[#B11C20] font-medium hover:underline"
        >
          ← Back to Support
        </button>
      </div>
    );
  }

  const messages = ticket.messages || [];

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Support / Help", to: "/support" },
          { label: ticket.ticketNumber || `Ticket` },
        ]}
      />

      <button
        type="button"
        onClick={() => navigate("/support")}
        className="flex items-center gap-2 text-gray-600 hover:text-[#B11C20] text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to tickets
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-[#B11C2008] to-[#2360BB08] border-b border-gray-200 px-5 py-4">
          <h1 className="text-xl font-semibold text-[#B11C20]">{ticket.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User size={14} />
              {ticket.student?.name || "Student"}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {ticket.course}
            </span>
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {ticket.category}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                ticket.status === "resolved"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {ticket.attachmentUrl || ticket.attachmentName ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Student attachment
              </h2>
              {ticket.attachmentName ? (
                <p className="text-sm text-gray-600 mb-2">{ticket.attachmentName}</p>
              ) : null}
              {ticket.attachmentUrl ? (
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#2360BB] hover:underline"
                >
                  Open or download file
                </a>
              ) : (
                <p className="text-xs text-amber-700">
                  No file URL (ticket may have been created before uploads were enabled).
                </p>
              )}
            </div>
          ) : null}

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Conversation</h2>
            <div className="space-y-3">
              {messages.map((m) => {
                const isStaff = m.authorRole === "staff";
                return (
                  <div
                    key={m._id}
                    className={`rounded-lg border p-3 text-sm ${
                      isStaff ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between gap-2 text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-gray-700">
                        {isStaff
                          ? `Staff${m.author?.name ? ` · ${m.author.name}` : ""}`
                          : `Student${m.author?.name ? ` · ${m.author.name}` : ""}`}
                      </span>
                      <span>{formatTicketDate(m.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{m.text}</p>
                    {m.attachmentUrl ? (
                      <p className="mt-2 text-xs">
                        <a
                          href={m.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#2360BB] hover:underline"
                        >
                          {m.attachmentName ? `Download: ${m.attachmentName}` : "Download attachment"}
                        </a>
                      </p>
                    ) : m.attachmentName ? (
                      <p className="mt-2 text-xs text-gray-500">File: {m.attachmentName}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-field pt-2 border-t border-gray-100">
            <label className="form-label">Reply to student</label>
            <p className="text-xs text-gray-500 mb-2">
              Your message is added to the thread and the ticket is marked <strong>resolved</strong>.
              The student can reopen if they still need help.
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="form-control min-h-[120px]"
              rows={4}
            />
            {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
            <button
              type="button"
              onClick={handleStaffReply}
              disabled={sending || !replyText.trim()}
              className="form-btn-primary mt-4 w-full sm:w-auto inline-flex items-center gap-2"
            >
              <SendHorizontal size={16} />
              {sending ? "Sending..." : "Send reply & mark resolved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
