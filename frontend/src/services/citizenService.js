import apiClient from "./apiClient";

export const citizenService = {
  async getMyProfile() {
    const { data } = await apiClient.get("/citizens/me");
    return data;
  },

  async updateMyProfile(payload) {
    const { data } = await apiClient.put("/citizens/me", payload);
    return data;
  },

  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/citizens", { params: { page, size } });
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/citizens/${id}`);
    return data;
  },
};