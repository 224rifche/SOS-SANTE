import apiClient from "./apiClient";

export const authService = {
  async register(payload) {
    await apiClient.post("/auth/register", payload);
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
  async verifyEmail(token) {
    await apiClient.get("/auth/verify-email", { params: { token } });
  },
};
