import api from "./api";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

const ADMIN_ROLES = ["superadmin", "admin", "coordinator", "teacher"];

export function isAdminAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setAdminAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function adminLogin(email, password) {
  const { data } = await api.post("/auth/login", { email, password });

  if (!ADMIN_ROLES.includes(data.user.role)) {
    throw new Error(
      "This portal is for admin users only. Students should use the student panel."
    );
  }

  setAdminAuth(data.token, data.user);
  return data;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, newPassword) {
  const { data } = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  setAdminAuth(data.token, data.user);
  return data;
}

export async function fetchAdminProfile() {
  const { data } = await api.get("/auth/me");
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function updateAdminProfile(updates) {
  const { data } = await api.put("/auth/profile", updates);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post("/users/upload-avatar", formData);
  const user = getAdminUser();
  if (user) {
    user.avatar = data.avatar;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return data.avatar;
}

export function getRoleLabel(role) {
  const labels = {
    superadmin: "Super Admin",
    admin: "Admin",
    coordinator: "Course Coordinator",
    teacher: "Teacher",
    student: "Student",
  };
  return labels[role] || role;
}
