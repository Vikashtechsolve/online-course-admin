import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, FileText, Video, File, Pencil, Download, Trash2, Check, Link2, BookOpen } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import DOMPurify from "dompurify";
import EditLectureModal from "../components/EditLectureModal";
import RichTextArea from "../components/RichTextArea";
import {
  getLectureById,
  updateLecture,
  uploadLectureMaterials,
} from "../utils/lecturesApi";
import { useUser } from "../context/UserContext";

export default function LectureSession() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [lecture, setLecture] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [testLinkInput, setTestLinkInput] = useState("");
  const [savingTestLink, setSavingTestLink] = useState(false);
  const [practiceContentInput, setPracticeContentInput] = useState("");
  const [savingPractice, setSavingPractice] = useState(false);
  const fileInputRef = useRef({
    video: null,
    notesPdf: null,
    pptFile: null,
  });

  const canManage = ["admin", "superadmin", "coordinator", "teacher"].includes(user?.role);
  const canUpload = canManage; // Teachers can upload materials for any lecture type (status is just a tag)

  useEffect(() => {
    loadLecture();
  }, [lectureId]);

  useEffect(() => {
    if (lecture?.testLink !== undefined) setTestLinkInput(lecture.testLink || "");
  }, [lecture?.testLink]);

  useEffect(() => {
    if (lecture?.practiceContent !== undefined)
      setPracticeContentInput(lecture.practiceContent || "");
  }, [lecture?.practiceContent]);

  const loadLecture = async () => {
    setLoading(true);
    try {
      const data = await getLectureById(lectureId);
      setLecture(data);
      setCourse(data?.course);
    } catch {
      setLecture(null);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (field, files) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadProgress(`Uploading ${field}...`);
    try {
      const formData = new FormData();
      if (field === "video" && files[0]) {
        formData.append("video", files[0]);
      } else if (field === "notesPdf" && files[0]) {
        formData.append("notesPdf", files[0]);
      } else if (field === "pptFile" && files[0]) {
        formData.append("pptFile", files[0]);
      }
      const updated = await uploadLectureMaterials(lectureId, formData);
      setLecture(updated);
      setUploadProgress("");
    } catch (err) {
      setUploadProgress(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = (field) => {
    const input = fileInputRef.current[field];
    if (input) input.click();
  };

  const handleRemoveMaterial = async (field) => {
    const label = { video: "video", notesPdf: "notes PDF", pptFile: "PPT file", testLink: "test link", practiceContent: "practice content" }[field] || field;
    if (!confirm(`Remove ${label}?`)) return;
    try {
      const updates = {};
      if (field === "video") updates.videoUrl = "";
      if (field === "notesPdf")
        updates.notes = { image: lecture.notes?.image || "", pdf: "" };
      if (field === "pptFile")
        updates.ppt = { slides: [], fileUrl: "" };
      if (field === "testLink") updates.testLink = "";
      if (field === "practiceContent") updates.practiceContent = "";
      const updated = await updateLecture(lectureId, updates);
      setLecture(updated);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove.");
    }
  };

  const handleSavePracticeContent = async () => {
    setSavingPractice(true);
    try {
      const updated = await updateLecture(lectureId, {
        practiceContent: practiceContentInput.trim(),
      });
      setLecture(updated);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save practice content.");
    } finally {
      setSavingPractice(false);
    }
  };

  const handleSaveTestLink = async () => {
    setSavingTestLink(true);
    try {
      const updated = await updateLecture(lectureId, {
        testLink: testLinkInput.trim(),
      });
      setLecture(updated);
      setTestLinkInput("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save test link.");
    } finally {
      setSavingTestLink(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await updateLecture(lectureId, { status: newStatus });
      setLecture(updated);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !lecture) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Lecture not found.</p>
        <button
          onClick={() => navigate(`/courses/${courseId}/lectures`)}
          className="mt-4 text-[#B11C20] font-medium hover:underline"
        >
          Back to Lectures
        </button>
      </div>
    );
  }

  const notes = lecture.notes || {};

  return (
    <div className="px-4 md:px-6 pb-10">
      <Breadcrumbs
        items={[
          { label: "My Courses", to: "/courses" },
          { label: course?.title || "Course", to: `/courses/${courseId}` },
          { label: "Lectures", to: `/courses/${courseId}/lectures` },
          { label: lecture.title || "Session" },
        ]}
      />

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/courses/${courseId}/lectures`)}
            className="text-xl rounded-md px-2 py-1 hover:bg-gray-100"
          >
            ←
          </button>
          <h1 className="text-lg md:text-xl text-[#B11C20] font-semibold">
            {lecture.title}
          </h1>
        </div>
        {canManage && (
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium"
          >
            <Pencil size={16} />
            Edit Session
          </button>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm">
        <h2 className="font-semibold text-base md:text-lg">{lecture.title}</h2>
        <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500 mt-1">
          <span>{lecture.teacher?.name}</span>
          {lecture.scheduledAt && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>{new Date(lecture.scheduledAt).toLocaleString()}</span>
            </>
          )}
          {lecture.duration && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>{lecture.duration} min</span>
            </>
          )}
          <span className="hidden sm:inline">|</span>
          {canManage ? (
            <select
              value={lecture.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 capitalize"
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="recorded">Recorded</option>
            </select>
          ) : (
            <span className="capitalize">{lecture.status}</span>
          )}
        </div>
      </div>

      {/* Upload Materials Section - teachers can upload for any lecture type */}
      {canUpload && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Upload size={18} className="text-[#2360BB]" />
              Manage Materials
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Upload or remove materials. Students will see available content in their lecture view.
            </p>
          </div>

          <input
            ref={(el) => (fileInputRef.current.video = el)}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => handleFileSelect("video", e.target.files)}
          />
          <input
            ref={(el) => (fileInputRef.current.notesPdf = el)}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect("notesPdf", e.target.files)}
          />
          <input
            ref={(el) => (fileInputRef.current.pptFile = el)}
            type="file"
            accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect("pptFile", e.target.files)}
          />

          <div className="p-5 space-y-4">
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-2 px-3 rounded-lg bg-blue-50 border border-blue-100">
                <Loader2 size={16} className="animate-spin shrink-0" />
                {uploadProgress}
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Video */}
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <Video size={18} className="text-[#B11C20]" />
                  Video
                </div>
                {lecture.videoUrl ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-sm text-emerald-800 font-medium truncate">Uploaded</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => triggerFileInput("video")}
                        disabled={uploading}
                        className="flex-1 text-xs py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleRemoveMaterial("video")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => triggerFileInput("video")}
                    disabled={uploading}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#B11C20] hover:bg-red-50/30 text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <Video size={24} className="text-slate-400" />
                    <span className="text-sm">Upload Video</span>
                  </button>
                )}
              </div>

              {/* Notes PDF */}
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <FileText size={18} className="text-[#2360BB]" />
                  Notes (PDF)
                </div>
                {notes.pdf ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-sm text-emerald-800 font-medium truncate">Uploaded</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => triggerFileInput("notesPdf")}
                        disabled={uploading}
                        className="flex-1 text-xs py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleRemoveMaterial("notesPdf")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => triggerFileInput("notesPdf")}
                    disabled={uploading}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#2360BB] hover:bg-blue-50/30 text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <FileText size={24} className="text-slate-400" />
                    <span className="text-sm">Upload Notes PDF</span>
                  </button>
                )}
              </div>

              {/* PPT File */}
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <File size={18} className="text-slate-600" />
                  PPT File
                </div>
                {lecture.ppt?.fileUrl ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-sm text-emerald-800 font-medium truncate">Uploaded</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => triggerFileInput("pptFile")}
                        disabled={uploading}
                        className="flex-1 text-xs py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => handleRemoveMaterial("pptFile")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => triggerFileInput("pptFile")}
                    disabled={uploading}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <File size={24} className="text-slate-400" />
                    <span className="text-sm">Upload PPT</span>
                  </button>
                )}
              </div>

              {/* Test Link */}
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <Link2 size={18} className="text-amber-600" />
                  Test Link
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="url"
                    value={testLinkInput}
                    onChange={(e) => setTestLinkInput(e.target.value)}
                    placeholder="https://example.com/test"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2360BB]"
                  />
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={handleSaveTestLink}
                      disabled={savingTestLink || !testLinkInput.trim()}
                      className="flex-1 text-xs py-2 rounded-lg bg-[#2360BB] text-white hover:bg-[#1d4d94] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {savingTestLink ? <Loader2 size={14} className="animate-spin" /> : null}
                      {lecture.testLink ? "Update" : "Save"} Link
                    </button>
                    {lecture.testLink && (
                      <button
                        onClick={() => handleRemoveMaterial("testLink")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {lecture.testLink && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100 mt-1">
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-800 truncate" title={lecture.testLink}>
                        Link added — visible to students
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Practice Content */}
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <BookOpen size={18} className="text-violet-600" />
                  Practice Content
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Rich text (HTML) for exercises, instructions — like a document canvas.
                </p>
                <div className="flex-1 flex flex-col gap-2">
                  <RichTextArea
                    value={practiceContentInput}
                    onChange={(e) => setPracticeContentInput(e.target.value)}
                    placeholder="Add practice exercises, instructions, or notes..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePracticeContent}
                      disabled={savingPractice || !practiceContentInput.trim()}
                      className="text-sm py-2 px-4 rounded-lg bg-[#2360BB] text-white hover:bg-[#1d4d94] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {savingPractice ? <Loader2 size={14} className="animate-spin" /> : null}
                      {lecture.practiceContent ? "Update" : "Save"}
                    </button>
                    {lecture.practiceContent && (
                      <button
                        onClick={() => handleRemoveMaterial("practiceContent")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {lecture.practiceContent && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-800">Visible to students in Practice section</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {["notes", "ppt", "test", "practice"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition ${
              activeTab === tab
                ? "bg-[#B11C20] text-white shadow-sm"
                : "bg-gray-200 border border-transparent hover:bg-gray-300/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm mycourses-card">
        {activeTab === "notes" && (
          <div className="flex flex-col items-center text-center">
            {notes.pdf ? (
              <a
                href={notes.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B11C20] font-medium hover:underline"
              >
                Download PDF
              </a>
            ) : (
              <p className="text-slate-500">No notes available yet.</p>
            )}
          </div>
        )}

        {activeTab === "ppt" && (
          <div className="space-y-4">
            {lecture.ppt?.fileUrl ? (
              <a
                href={lecture.ppt.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#B11C20] font-medium hover:underline"
              >
                <Download size={16} />
                Download PPT file
              </a>
            ) : (
              <p className="text-slate-500">No PPT file uploaded yet.</p>
            )}
          </div>
        )}

        {activeTab === "test" && (
          <div className="border border-gray-200 p-6 md:p-10 rounded-lg text-slate-500 bg-slate-50/70">
            {lecture.testLink ? (
              <a
                href={lecture.testLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B11C20] font-medium hover:underline"
              >
                Open Test Link
              </a>
            ) : (
              "Test link will appear here..."
            )}
          </div>
        )}

        {activeTab === "practice" && (
          <div className="space-y-2">
            {lecture.practiceContent ? (
              <div
                className="practice-content p-6 rounded-xl border border-slate-200 bg-white text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(lecture.practiceContent, {
                    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h1", "h2", "h3", "h4", "a", "code", "pre", "blockquote", "hr", "span", "div"],
                    ALLOWED_ATTR: ["href", "target", "rel"],
                  }),
                }}
              />
            ) : (
              <p className="text-slate-500 p-6">Practice content will appear here...</p>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditLectureModal
          lecture={lecture}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadLecture();
          }}
        />
      )}
    </div>
  );
}
