import apiClient from "./apiClient";

export const authService = {
  async register(payload) {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  async login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },

  async logout(refreshToken) {
    await apiClient.post("/auth/logout", { refreshToken });
  },
  async getMe() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
  async forgotPassword(email) {
    await apiClient.post("/auth/forgot-password", { email });
  },
  async resetPassword(token, newPassword) {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  },
};
