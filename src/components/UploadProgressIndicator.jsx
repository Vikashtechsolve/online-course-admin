import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useUpload, formatMb } from "../context/UploadContext";

const FIELD_LABELS = {
  video: "Video",
  notesPdf: "Notes PDF",
  pptFile: "PPT File",
};

const PHASE_LABELS = {
  preparing: "Preparing upload…",
  uploading: "Uploading to cloud…",
  finalizing: "Finishing upload…",
  processing: "Building stream (HLS)…",
  complete: "Complete",
  error: "Failed",
};

function LinearProgress({ progress }) {
  return (
    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-[#B11C20] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

function UploadCard({ item, onCancel, onDismiss }) {
  const {
    id,
    field,
    fileName,
    progress,
    status,
    phase,
    error,
    loadedBytes,
    totalBytes,
  } = item;
  const label = FIELD_LABELS[field] || field;

  const isActive = status === "uploading" || status === "processing";
  const isDone = status === "done";
  const isError = status === "error";
  const isVideo = field === "video";
  const phaseLabel = PHASE_LABELS[phase] || PHASE_LABELS.uploading;
  const sizeLabel =
    totalBytes > 0
      ? `${formatMb(loadedBytes || 0)} / ${formatMb(totalBytes)}`
      : null;

  return (
    <div className="flex flex-col gap-2 bg-white rounded-2xl shadow-2xl border border-slate-200 px-5 py-4 min-w-[300px] max-w-[380px] animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
          {isDone && <Check className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
          {isActive && (
            <Loader2 className="w-5 h-5 animate-spin text-[#B11C20]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {isDone
              ? `${label} ready`
              : isError
                ? `${label} failed`
                : `${label} — ${progress}%`}
          </p>
          <p className="text-xs text-[#2360BB] font-medium mt-0.5">{phaseLabel}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5" title={fileName}>
            {isError ? error : fileName}
          </p>
          {sizeLabel && !isError ? (
            <p className="text-[11px] text-slate-400 mt-0.5">{sizeLabel}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={isActive ? () => onCancel(id) : () => onDismiss(id)}
          className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={isActive ? "Cancel" : "Dismiss"}
        >
          <X size={16} />
        </button>
      </div>

      {isActive && phase === "uploading" ? (
        <LinearProgress progress={progress} />
      ) : null}

      {isActive && isVideo && phase === "processing" ? (
        <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-2">
          You can leave this page — processing continues on the server. We will
          notify you when the video is ready for students.
        </p>
      ) : null}

      {isActive && isVideo && phase === "uploading" ? (
        <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-2">
          Upload goes directly to cloud storage (not through the API server).
        </p>
      ) : null}
    </div>
  );
}

export default function UploadProgressIndicator() {
  const { uploads, cancelUpload, dismissUpload } = useUpload();

  if (!uploads.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-h-[min(70vh,calc(100vh-3rem))] overflow-y-auto overflow-x-hidden pr-1">
      {uploads.map((item) => (
        <UploadCard
          key={item.id}
          item={item}
          onCancel={cancelUpload}
          onDismiss={dismissUpload}
        />
      ))}
    </div>
  );
}
