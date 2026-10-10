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
  async simulate(bin_id, waste_level) {
    const response = await api.post("/waste/simulate", { bin_id, waste_level });
    return response.data;
  },
  async getReadings(bin_id) {
    const response = await api.get(`/waste/readings/${bin_id}`);
    return response.data;
  },
  async triggerSimulationTick() {
    const response = await api.post("/waste/simulation/tick");
    return response.data;
  },
  async startAutoSimulation(interval_seconds = 4) {
    const response = await api.post("/waste/simulation/start", { interval_seconds });
    return response.data;
  },
  async stopAutoSimulation() {
    const response = await api.post("/waste/simulation/stop");
    return response.data;
  },
  async getSimulationStatus() {
    const response = await api.get("/waste/simulation/status");
    return response.data;
  },
  async resetSimulation() {
    const response = await api.post("/waste/simulation/reset");
    return response.data;
  }
};
