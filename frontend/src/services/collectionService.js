import api from "./api";

export const collectionService = {
  async getQueue() {
    const response = await api.get("/collections/queue");
    return response.data;
  },
  async getHistory() {
    const response = await api.get("/collections");
    return response.data;
  },
  async record(payload) {
    const response = await api.post("/collections", payload);
    return response.data;
  }
};
