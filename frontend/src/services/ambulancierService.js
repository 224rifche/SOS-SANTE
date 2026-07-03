import apiClient from "./apiClient";

export const ambulancierService = {
  async getMyProfile() {
    const { data } = await apiClient.get("/ambulanciers/me");
    return data;
  },

  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/ambulanciers", { params: { page, size } });
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/ambulanciers/${id}`);
    return data;
  },

  async updateAvailability(id, available) {
    const { data } = await apiClient.patch(`/ambulanciers/${id}/availability`, { available });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/ambulanciers/${id}/status`, { status });
    return data;
  },
};
