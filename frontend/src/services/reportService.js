import api from "./api";

export const reportService = {
  async getSummary() {
    const response = await api.get("/reports/summary");
    return response.data;
  },
  async getDashboard() {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
  async getAuthorities() {
    const response = await api.get("/admin/authorities");
    return response.data;
  },
  async createAuthority(payload) {
    const response = await api.post("/admin/authorities", payload);
    return response.data;
  },
  async toggleAuthorityStatus(id, status) {
    const response = await api.put(`/admin/authorities/${id}/status`, { status });
    return response.data;
  },
  async getSettings() {
    const response = await api.get("/admin/settings");
    return response.data;
  },
  async updateSettings(payload) {
    const response = await api.put("/admin/settings", payload);
    return response.data;
  },
  getExportUrl(type = "collections") {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${base}/reports/export?type=${type}`;
  }
};
