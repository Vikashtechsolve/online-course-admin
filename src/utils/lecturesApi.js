import api from "./api";

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

export async function deleteLecture(id) {
  await api.delete(`/lectures/${id}`);
}
