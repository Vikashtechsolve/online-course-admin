import api from "./api";

/**
 * @returns {Promise<{ stats: Array<{key: string, title: string, value: string, icon: string}>, activities: Array<{at: string, title: string, color: string, type: string}>, headline: {title: string, subtitle: string} }>}
 */
export async function getAdminDashboard() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}
