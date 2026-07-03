import apiClient from "./apiClient";

export const notificationService = {
  async getMyNotifications() {
    const { data } = await apiClient.get("/notifications/me");
    return data;
  },

  async getMyUnreadNotifications() {
    const { data } = await apiClient.get("/notifications/me/unread");
    return data;
  },

  async markAsRead(id) {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data;
  },
};
