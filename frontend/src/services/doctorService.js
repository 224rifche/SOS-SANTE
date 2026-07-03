import apiClient from "./apiClient";

export const doctorService = {
  async getMyProfile() {
    const { data } = await apiClient.get("/doctors/me");
    return data;
  },

  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/doctors", { params: { page, size } });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/doctors/${id}/status`, { status });
    return data;
  },

  async updateAvailability(id, available) {
    const { data } = await apiClient.patch(`/doctors/${id}/availability`, { available });
    return data;
  },
};
