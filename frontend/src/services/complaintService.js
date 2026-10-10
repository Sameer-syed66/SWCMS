import api from "./api";

export const complaintService = {
  async list(params = {}) {
    const response = await api.get("/complaints", { params });
    return response.data;
  },
  async get(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },
  async create(payload) {
    const response = await api.post("/complaints", payload);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/complaints/${id}`, payload);
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  }
};
