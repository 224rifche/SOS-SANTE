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
};