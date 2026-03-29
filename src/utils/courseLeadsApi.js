import api from "./api";

export const COURSE_TYPES = [
  { value: "fullstack_developer", label: "Full Stack MERN" },
  { value: "data_analytics", label: "Data Analytics" },
];

export const PROGRAM_OPTIONS = [
  { value: "mini", label: "Mini" },
  { value: "macro", label: "Macro" },
];

export const MARKETING_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "not_interested", label: "Not interested" },
  { value: "enrolled", label: "Enrolled" },
];

export async function fetchIntakeBatches(courseType) {
  const params = courseType ? { courseType } : {};
  const { data } = await api.get("/course-leads/admin/intake-batches", { params });
  return data.batches || [];
}

export async function createIntakeBatch(payload) {
  const { data } = await api.post("/course-leads/admin/intake-batches", payload);
  return data.batch;
}

export async function updateIntakeBatch(id, payload) {
  const { data } = await api.patch(`/course-leads/admin/intake-batches/${id}`, payload);
  return data.batch;
}

export async function fetchRegistrations(params) {
  const { data } = await api.get("/course-leads/admin/registrations", { params });
  return data;
}

export async function updateRegistration(id, payload) {
  const { data } = await api.patch(`/course-leads/admin/registrations/${id}`, payload);
  return data.item;
}

export async function downloadRegistrationsExport(queryParams) {
  const { data } = await api.get("/course-leads/admin/registrations/export", {
    params: queryParams,
    responseType: "blob",
  });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `course-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
