import api from "./api";

export const authService = {
  async list(params = {}) {
    const response = await api.get("/auth", { params });
    return response.data;
  },
  async get(id) {
    const response = await api.get(`/auth/${id}`);
    return response.data;
  },
  async create(payload) {
    const response = await api.post("/auth", payload);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/auth/${id}`, payload);
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/auth/${id}`);
    return response.data;
  }
};
