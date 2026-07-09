import apiClient from "./apiClient";

export const interventionService = {
  async getActiveIntervention() {
    const { data } = await apiClient.get("/interventions/active");
    return data;
  },
  async getById(id) {
    const { data } = await apiClient.get(`/interventions/${id}`);
    return data;
  },
  async getByAlertId(alertId) {
    const { data } = await apiClient.get(`/interventions/by-alert/${alertId}`);
    return data;
  },
  async updateStatus(interventionId, payload) {
    const { data } = await apiClient.patch(`/interventions/${interventionId}/status`, payload);
    return data;
  },
  async updateVitalSigns(id, payload) {
    const { data } = await apiClient.patch(`/interventions/${id}/vitals`, payload);
    return data;
  },
  async listMine() {
    const { data } = await apiClient.get("/interventions/me");
    return data;
  },
  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/interventions", { params: { page, size } });
    return data;
  },
};