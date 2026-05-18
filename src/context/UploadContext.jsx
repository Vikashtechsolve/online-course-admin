import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import api from "../utils/api";
import {
  createVideoUploadSession,
  putVideoToStorage,
  completeVideoUpload,
} from "../utils/lecturesApi";

const UploadContext = createContext(null);

const POLL_MS = 4000;
const POLL_MAX_MS = 2 * 60 * 60 * 1000;
const STORAGE_KEY = "lms_active_uploads_v1";

function formatMb(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function finishUpload(id, lectureId, lecture, setUploads) {
  setUploads((prev) =>
    prev.map((u) =>
      u.id === id
        ? {
            ...u,
            status: "done",
            progress: 100,
            phase: "complete",
          }
        : u
    )
  );
  window.dispatchEvent(
    new CustomEvent("lecture-upload:done", {
      detail: { lectureId, lecture },
    })
  );
}

function loadStoredUploads() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((u) => u.status === "processing")
      : [];
  } catch {
    return [];
  }
}

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState(loadStoredUploads);
  const controllersRef = useRef(new Map());
  const pollTimersRef = useRef(new Map());

  useEffect(() => {
    const processing = uploads.filter((u) => u.status === "processing");
    if (processing.length) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(processing));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [uploads]);

  const stopPolling = useCallback((id) => {
    const t = pollTimersRef.current.get(id);
    if (t) {
      clearInterval(t);
      pollTimersRef.current.delete(id);
    }
  }, []);

  const pollVideoProcessing = useCallback(
    (lectureId, uploadId) => {
      stopPolling(uploadId);
      const started = Date.now();

      const tick = async () => {
        if (Date.now() - started > POLL_MAX_MS) {
          stopPolling(uploadId);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? {
                    ...u,
                    status: "error",
                    phase: "error",
                    error: "Video processing timed out. Check server logs.",
                  }
                : u
            )
          );
          return;
        }

        try {
          const { data } = await api.get(`/lectures/${lectureId}`);
          const lecture = data.lecture ?? data;

          if (lecture.videoProcessingStatus === "ready" && lecture.videoUrl) {
            stopPolling(uploadId);
            finishUpload(uploadId, lectureId, lecture, setUploads);
          } else if (lecture.videoProcessingStatus === "failed") {
            stopPolling(uploadId);
            setUploads((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? {
                      ...u,
                      status: "error",
                      phase: "error",
                      error:
                        lecture.videoProcessingError ||
                        "Video processing failed.",
                    }
                  : u
              )
            );
            window.dispatchEvent(
              new CustomEvent("lecture-upload:done", {
                detail: { lectureId, lecture },
              })
            );
          }
        } catch {
          /* keep polling */
        }
      };

      const interval = setInterval(tick, POLL_MS);
      pollTimersRef.current.set(uploadId, interval);
      tick();
    },
    [stopPolling]
  );

  const uploadVideoDirect = useCallback(
    async (lectureId, file, id) => {
      const update = (patch) =>
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
        );

      try {
        update({
          phase: "preparing",
          status: "uploading",
          progress: 0,
        });

        const session = await createVideoUploadSession(lectureId, {
          fileName: file.name,
          contentType: file.type || "video/mp4",
          fileSize: file.size,
        });

        const controller = controllersRef.current.get(id);
        update({
          phase: "uploading",
          status: "uploading",
          progress: 0,
        });

        await putVideoToStorage(
          session.uploadUrl,
          file,
          (e) => {
            if (!e.total) return;
            const pct = Math.round((e.loaded / e.total) * 100);
            update({
              progress: pct,
              loadedBytes: e.loaded,
              totalBytes: e.total,
              phase: "uploading",
            });
          },
          controller?.signal
        );

        update({
          phase: "finalizing",
          status: "processing",
          progress: 100,
          loadedBytes: file.size,
          totalBytes: file.size,
        });

        const { lecture } = await completeVideoUpload(lectureId, {
          key: session.key,
          fileName: file.name,
          contentType: file.type || "video/mp4",
        });

        controllersRef.current.delete(id);

        update({
          phase: "processing",
          status: "processing",
          progress: 100,
        });

        window.dispatchEvent(
          new CustomEvent("lecture-upload:done", {
            detail: { lectureId, lecture },
          })
        );

        pollVideoProcessing(lectureId, id);
      } catch (err) {
        controllersRef.current.delete(id);
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          setUploads((prev) => prev.filter((u) => u.id !== id));
          return;
        }
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message;
        let errorMsg = serverMsg || err.message || "Upload failed";
        if (status === 413) {
          errorMsg = serverMsg || "File is too large for the server limit.";
        }
        if (status === 507) {
          errorMsg =
            serverMsg ||
            "Server storage is full. Ask admin to free disk space or update backend.";
        }
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  status: "error",
                  phase: "error",
                  error: errorMsg,
                }
              : u
          )
        );
      }
    },
    [pollVideoProcessing]
  );

  const uploadViaApi = useCallback(
    (lectureId, field, file, id) => {
      const formData = new FormData();
      formData.append(field, file);

      api
        .post(`/lectures/${lectureId}/upload`, formData, {
          signal: controllersRef.current.get(id)?.signal,
          timeout: 0,
          onUploadProgress: (e) => {
            if (!e.total) return;
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) =>
                u.id === id
                  ? {
                      ...u,
                      progress: pct,
                      loadedBytes: e.loaded,
                      totalBytes: e.total,
                      phase: pct >= 100 ? "finalizing" : "uploading",
                      status: pct >= 100 ? "processing" : "uploading",
                    }
                  : u
              )
            );
          },
        })
        .then((res) => {
          controllersRef.current.delete(id);
          const lecture = res.data.lecture;

          if (
            field === "video" &&
            lecture?.videoProcessingStatus === "processing"
          ) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === id
                  ? {
                      ...u,
                      status: "processing",
                      phase: "processing",
                      progress: 100,
                    }
                  : u
              )
            );
            window.dispatchEvent(
              new CustomEvent("lecture-upload:done", {
                detail: { lectureId, lecture },
              })
            );
            pollVideoProcessing(lectureId, id);
            return;
          }

          finishUpload(id, lectureId, lecture, setUploads);
        })
        .catch((err) => {
          controllersRef.current.delete(id);
          stopPolling(id);
          if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
            setUploads((prev) => prev.filter((u) => u.id !== id));
            return;
          }
          const status = err.response?.status;
          const serverMsg = err.response?.data?.message;
          let errorMsg = serverMsg || "Upload failed";
          if (status === 413 && !serverMsg) {
            errorMsg =
              "File is too large. Ask admin to raise nginx client_max_body_size.";
          }
          if (status === 507) {
            errorMsg =
              serverMsg ||
              "Server storage is full. Deploy the latest backend for direct cloud upload.";
          }
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id
                ? {
                    ...u,
                    status: "error",
                    phase: "error",
                    error: errorMsg,
                  }
                : u
            )
          );
        });
    },
    [pollVideoProcessing, stopPolling]
  );

  const startUpload = useCallback(
    (lectureId, field, file) => {
      const id = crypto.randomUUID();
      const controller = new AbortController();
      controllersRef.current.set(id, controller);

      setUploads((prev) => [
        ...prev,
        {
          id,
          lectureId,
          field,
          fileName: file.name,
          fileSize: file.size,
          loadedBytes: 0,
          totalBytes: file.size,
          progress: 0,
          phase: "preparing",
          status: "uploading",
          error: null,
        },
      ]);

      if (field === "video") {
        uploadVideoDirect(lectureId, file, id);
      } else {
        uploadViaApi(lectureId, field, file, id);
      }
    },
    [uploadVideoDirect, uploadViaApi]
  );

  useEffect(() => {
    uploads.forEach((u) => {
      if (
        u.field === "video" &&
        u.status === "processing" &&
        !pollTimersRef.current.has(u.id)
      ) {
        pollVideoProcessing(u.lectureId, u.id);
      }
    });
  }, [uploads, pollVideoProcessing]);

  const cancelUpload = useCallback(
    (id) => {
      const c = controllersRef.current.get(id);
      if (c) c.abort();
      stopPolling(id);
    },
    [stopPolling]
  );

  const dismissUpload = useCallback(
    (id) => {
      stopPolling(id);
      setUploads((prev) => prev.filter((u) => u.id !== id));
    },
    [stopPolling]
  );

  return (
    <UploadContext.Provider
      value={{ uploads, startUpload, cancelUpload, dismissUpload }}
    >
      {children}
    </UploadContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}

export { formatMb };
