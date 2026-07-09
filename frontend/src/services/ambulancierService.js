import apiClient from "./apiClient";

export const ambulancierService = {
  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/ambulanciers", { params: { page, size } });
    return data;
  },

  async getMyProfile() {
    const { data } = await apiClient.get("/ambulanciers/me");
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/ambulanciers/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post("/ambulanciers", payload);
    return data;
  },

  async updateStatus(id, currentStatus) {
    const { data } = await apiClient.patch(`/ambulanciers/${id}/status`, { currentStatus });
    return data;
  },

  async updateAvailability(id, available) {
    const { data } = await apiClient.patch(`/ambulanciers/${id}/availability`, { available });
    return data;
  },

  async assignVehicle(id, ambulanceId) {
    const { data } = await apiClient.patch(`/ambulanciers/${id}/vehicle`, { ambulanceId });
    return data;
  },
};