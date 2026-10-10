import api from "./api";

export const collectionService = {
  async list(params = {}) {
    const response = await api.get("/collections", { params });
    return response.data;
  },
  async get(id) {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },
  async create(payload) {
    const response = await api.post("/collections", payload);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/collections/${id}`, payload);
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  }
};
