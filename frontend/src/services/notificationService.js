import api from "./api";

export const notificationService = {
  async list() {
    const response = await api.get("/notifications");
    return response.data;
  },
  async markRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllRead() {
    const response = await api.put("/notifications/read-all");
    return response.data;
  }
};
