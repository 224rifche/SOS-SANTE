import apiClient from "./apiClient";

export const interventionService = {
  async updateStatus(interventionId, payload) {
    const { data } = await apiClient.patch(`/interventions/${interventionId}/status`, payload);
    return data;
  },
};
