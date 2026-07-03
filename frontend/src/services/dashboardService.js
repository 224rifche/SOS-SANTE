import apiClient from "./apiClient";

export const dashboardService = {
  async getPublicStats() {
    const { data } = await apiClient.get("/dashboard/public-stats");
    return data;
  },

  async getStats() {
    const { data } = await apiClient.get("/dashboard/stats");
    return data;
  },
};