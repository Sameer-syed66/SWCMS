import api from "./api";

export const complaintService = {
  async submit(payload) {
    const response = await api.post("/complaints", payload);
    return response.data;
  },
  async track(trackingCode) {
    const response = await api.get(`/complaints/track/${encodeURIComponent(trackingCode)}`);
    return response.data;
  },
  async list(status) {
    const params = status ? { status } : {};
    const response = await api.get("/complaints", { params });
    return response.data;
  },
  async updateStatus(id, status, remarks = "") {
    const response = await api.put(`/complaints/${id}/status`, { status, remarks });
    return response.data;
  }
};
