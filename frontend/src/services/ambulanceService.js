import apiClient from "./apiClient";

export const ambulanceService = {
  async list({ status, medicalCenterId, page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/ambulances", {
      params: { status, medicalCenterId, page, size },
    });
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/ambulances/${id}`);
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/ambulances/${id}/status`, { status });
    return data;
  },

  async updatePosition(id, { latitude, longitude }) {
    const { data } = await apiClient.patch(`/ambulances/${id}/position`, {
      gpsLatitude: latitude,
      gpsLongitude: longitude,
    });
    return data;
  },
};
