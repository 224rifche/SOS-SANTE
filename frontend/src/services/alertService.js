import apiClient from "./apiClient";

export const alertService = {
  async createAlert(payload) {
    const { data } = await apiClient.post("/alerts", payload);
    return data;
  },

  async getMyAlerts() {
    const { data } = await apiClient.get("/alerts/me");
    return data;
  },

  async getAlertById(id) {
    const { data } = await apiClient.get(`/alerts/${id}`);
    return data;
  },

  async listAll(status) {
    const { data } = await apiClient.get("/alerts", { params: { status } });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/alerts/${id}/status`, { status });
    return data;
  },
};
