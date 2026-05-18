import api from "./api";
import axios from "axios";

export async function getLectures(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/lectures?${searchParams}` : "/lectures";
  const { data } = await api.get(url);
  return data;
}

export async function createLecture(lectureData) {
  const { data } = await api.post("/lectures", lectureData);
  return data.lecture;
}

export async function getLectureById(id) {
  const { data } = await api.get(`/lectures/${id}`);
  return data.lecture;
}

export async function updateLecture(id, updates) {
  const { data } = await api.put(`/lectures/${id}`, updates);
  return data.lecture;
}

export async function uploadLectureMaterials(lectureId, formData) {
  const { data } = await api.post(`/lectures/${lectureId}/upload`, formData);
  return data.lecture;
}

/** Step 1: get presigned URL to upload video directly to R2 */
export async function createVideoUploadSession(lectureId, { fileName, contentType, fileSize }) {
  const { data } = await api.post(`/lectures/${lectureId}/video/upload-session`, {
    fileName,
    contentType,
    fileSize,
  });
  return data;
}

/** Step 2: PUT file bytes to R2 (use axios, not api base — different host) */
export async function putVideoToStorage(uploadUrl, file, onProgress, signal) {
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type || "video/mp4" },
    timeout: 0,
    signal,
    onUploadProgress: onProgress,
  });
}

/** Step 3: tell API to start HLS processing */
export async function completeVideoUpload(lectureId, { key, fileName, contentType }) {
  const { data } = await api.post(`/lectures/${lectureId}/video/complete`, {
    key,
    fileName,
    contentType,
  });
  return data;
}

export async function deleteLecture(id) {
  await api.delete(`/lectures/${id}`);
}
