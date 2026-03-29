import api from "./api";

export async function getBatchStudents(batchId, params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams
    ? `/batches/${batchId}/students?${searchParams}`
    : `/batches/${batchId}/students`;
  const { data } = await api.get(url);
  return data;
}

export async function enrollBatchStudent(batchId, studentData) {
  const { data } = await api.post(`/batches/${batchId}/students`, studentData);
  return data.enrollment;
}

export async function enrollBatchStudentsFromCsv(batchId, file) {
  const formData = new FormData();
  formData.append("csv", file);
  const { data } = await api.post(`/batches/${batchId}/students/upload`, formData);
  return data;
}

export async function removeBatchStudent(batchId, studentId) {
  await api.delete(`/batches/${batchId}/students/${studentId}`);
}

export async function updateBatchStudentAccess(batchId, studentId, updates) {
  const { data } = await api.put(
    `/batches/${batchId}/students/${studentId}`,
    updates
  );
  return data.enrollment;
}
