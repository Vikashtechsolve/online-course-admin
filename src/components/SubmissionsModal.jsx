import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink, Check } from "lucide-react";
import { getSubmissions, gradeSubmission } from "../utils/assignmentsApi";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SubmissionsModal({ assignment, onClose, onUpdate }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [gradeInput, setGradeInput] = useState({});

  useEffect(() => {
    loadSubmissions();
  }, [assignment?._id]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const list = await getSubmissions(assignment._id);
      setSubmissions(list || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (sub) => {
    const gradeVal = gradeInput[sub._id]?.grade ?? sub.grade ?? "";
    const feedbackVal = gradeInput[sub._id]?.feedback ?? sub.feedback ?? "";
    if (!gradeVal && !feedbackVal) return;
    setGradingId(sub._id);
    try {
      await gradeSubmission(sub._id, gradeVal || undefined, feedbackVal || undefined);
      setGradeInput((prev) => ({ ...prev, [sub._id]: undefined }));
      loadSubmissions();
      onUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save grade.");
    } finally {
      setGradingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Submissions – {assignment.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            All students enrolled in this course can submit. Grade submitted work below.
          </p>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No submissions yet. Students will appear here when they submit.
            </p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const student = sub.student;
                const name = student?.name || "Student";
                const email = student?.email || "";
                const hasSubmitted = !!sub.submissionLink;
                let dueEndOfDay = null;
                if (assignment?.dueDate) {
                  dueEndOfDay = new Date(assignment.dueDate);
                  dueEndOfDay.setHours(23, 59, 59, 999);
                }
                const isOnTime =
                  hasSubmitted &&
                  sub.submittedAt &&
                  dueEndOfDay
                    ? new Date(sub.submittedAt) <= dueEndOfDay
                    : null;

                return (
                  <div
                    key={sub._id}
                    className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasSubmitted ? (
                          <>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                              Submitted
                            </span>
                            {isOnTime !== null && (
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full ${
                                  isOnTime
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isOnTime ? "On time" : "Late"}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {hasSubmitted && (
                      <>
                        <a
                          href={sub.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#2360BB] hover:underline mt-2"
                        >
                          <ExternalLink size={14} />
                          View submission
                        </a>
                        <p className="text-xs text-slate-500 mt-1">
                          Submitted: {formatDate(sub.submittedAt)}
                        </p>
                      </>
                    )}

                    {(hasSubmitted || sub.status === "graded") && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Grade"
                            value={gradeInput[sub._id]?.grade ?? sub.grade ?? ""}
                            onChange={(e) =>
                              setGradeInput((prev) => ({
                                ...prev,
                                [sub._id]: {
                                  ...prev[sub._id],
                                  grade: e.target.value,
                                },
                              }))
                            }
                            className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Feedback (optional)"
                            value={gradeInput[sub._id]?.feedback ?? sub.feedback ?? ""}
                            onChange={(e) =>
                              setGradeInput((prev) => ({
                                ...prev,
                                [sub._id]: {
                                  ...prev[sub._id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                          <button
                            onClick={() => handleGrade(sub)}
                            disabled={gradingId === sub._id}
                            className="px-3 py-1.5 rounded-lg bg-[#B11C20] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {gradingId === sub._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : sub.status === "graded" ? (
                              "Update"
                            ) : (
                              <Check size={14} />
                            )}
                            {sub.status === "graded" ? "Update" : "Grade"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
