import api from "./api";

/** @param {Record<string, string>} params - e.g. { batch }, { coordinator: userId } for coordinator-assigned courses */
export async function getCourses(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/courses?${searchParams}` : "/courses";
  const { data } = await api.get(url);
  return data;
}

export async function createCourse(courseData) {
  const { data } = await api.post("/courses", courseData);
  return data.course;
}

export async function getCourseById(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data.course;
}

export async function updateCourse(id, updates) {
  const { data } = await api.put(`/courses/${id}`, updates);
  return data.course;
}

export async function deleteCourse(id) {
  await api.delete(`/courses/${id}`);
}

export async function assignTeacher(courseId, teacherId) {
  const { data } = await api.post(`/courses/${courseId}/teachers`, { teacher: teacherId });
  return data.assignment;
}

export async function unassignTeacher(courseId, teacherId) {
  await api.delete(`/courses/${courseId}/teachers/${teacherId}`);
}

export async function assignCoordinator(courseId, coordinatorId) {
  const { data } = await api.post(`/courses/${courseId}/coordinators`, { coordinator: coordinatorId });
  return data.assignment;
}

export async function unassignCoordinator(courseId, coordinatorId) {
  await api.delete(`/courses/${courseId}/coordinators/${coordinatorId}`);
}

export async function enrollStudent(courseId, studentId) {
  const { data } = await api.post(`/courses/${courseId}/students`, { student: studentId });
  return data.enrollment;
}

export async function unenrollStudent(courseId, studentId) {
  await api.delete(`/courses/${courseId}/students/${studentId}`);
}

export async function markCourseComplete(courseId, studentId) {
  const { data } = await api.post(`/courses/${courseId}/students/${studentId}/complete`);
  return data;
}

export async function bulkMarkCourseComplete(courseId, options = {}) {
  const { data } = await api.post(`/courses/${courseId}/students/bulk-complete`, options, {
    timeout: 600000, // 10 min for large batches
  });
  return data;
}
