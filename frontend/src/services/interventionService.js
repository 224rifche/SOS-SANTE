import apiClient from "./apiClient";

export const interventionService = {
  async getActiveIntervention() {
    const { data } = await apiClient.get("/interventions/active");
    return data;
  },

  async updateStatus(interventionId, payload) {
    const { data } = await apiClient.patch(`/interventions/${interventionId}/status`, payload);
    return data;
  },
};
