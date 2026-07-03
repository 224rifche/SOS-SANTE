import apiClient from "./apiClient";

export const auditService = {
  async listLogs({ userId, page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/audit-logs", {
      params: { userId, page, size },
    });
    return data;
  },
};
