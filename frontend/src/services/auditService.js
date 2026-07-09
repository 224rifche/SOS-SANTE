import apiClient from "./apiClient";

export const auditService = {
  async listLogs({ userId, action, dateFrom, dateTo, page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/audit-logs", {
      params: { userId, action, dateFrom, dateTo, page, size },
    });
    return data;
  },
};