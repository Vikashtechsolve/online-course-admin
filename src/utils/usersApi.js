import api from "./api";

export async function getUsers(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/users?${searchParams}` : "/users";
  const { data } = await api.get(url);
  return data;
}

export async function createUser(userData) {
  const { data } = await api.post("/users", userData);
  return data.user;
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.user;
}

export async function updateUser(id, updates) {
  const { data } = await api.put(`/users/${id}`, updates);
  return data.user;
}

export async function deactivateUser(id) {
  await api.delete(`/users/${id}`);
}

export const ROLE_OPTIONS = {
  superadmin: [
    { value: "admin", label: "Admin" },
    { value: "coordinator", label: "Course Coordinator" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
  ],
  admin: [
    { value: "coordinator", label: "Course Coordinator" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
  ],
};
