import api from "./api";

export const alertService = {
  async list(status) {
    const params = status ? { status } : {};
    const response = await api.get("/alerts", { params });
    return response.data;
  },
  async resolve(id) {
    const response = await api.put(`/alerts/${id}/resolve`);
    return response.data;
  }
};
