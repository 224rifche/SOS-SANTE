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

  async create(payload) {
    const { data } = await apiClient.post("/ambulances", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/ambulances/${id}`, payload);
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

  async remove(id) {
    await apiClient.delete(`/ambulances/${id}`);
  },
};