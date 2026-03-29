import api from "./api";

export async function getAssignments(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/assignments?${searchParams}` : "/assignments";
  const { data } = await api.get(url);
  return data;
}

export async function createAssignment(payload) {
  const formData = new FormData();
  formData.append("course", payload.course);
  formData.append("title", payload.title);
  formData.append("description", payload.description || "");
  formData.append("dueDate", payload.dueDate);
  if (payload.estimatedTime) formData.append("estimatedTime", payload.estimatedTime);
  if (payload.file) formData.append("file", payload.file);
  const { data } = await api.post("/assignments", formData);
  return data.assignment;
}

export async function getAssignmentById(id) {
  const { data } = await api.get(`/assignments/${id}`);
  return data.assignment;
}

export async function updateAssignment(id, payload) {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.dueDate !== undefined) formData.append("dueDate", payload.dueDate);
  if (payload.estimatedTime !== undefined) formData.append("estimatedTime", payload.estimatedTime);
  if (payload.file) formData.append("file", payload.file);
  const { data } = await api.put(`/assignments/${id}`, formData);
  return data.assignment;
}

export async function getSubmissions(assignmentId) {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
  return data.submissions;
}

export async function gradeSubmission(submissionId, grade, feedback) {
  const { data } = await api.put(`/submissions/${submissionId}`, {
    grade,
    feedback,
  });
  return data.submission;
}
