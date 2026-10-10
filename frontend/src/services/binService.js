import api from "./api";

export const binService = {
  async list(params = {}) {
    const response = await api.get("/bins", { params });
    return response.data;
  },
  async get(id) {
    const response = await api.get(`/bins/${id}`);
    return response.data;
  },
  async create(payload) {
    const response = await api.post("/bins", payload);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/bins/${id}`, payload);
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/bins/${id}`);
    return response.data;
  }
};
