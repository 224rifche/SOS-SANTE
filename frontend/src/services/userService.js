import apiClient from "./apiClient";

export const userService = {
  async getMyProfile() {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
  async updateMyProfile(payload) {
    const { data } = await apiClient.put("/users/me", payload);
    return data;
  },
  async changePassword(payload) {
    await apiClient.patch("/users/me/password", payload);
  },
  async listUsers({ role, enabled, search, page = 0, size = 20 } = {}) {
    const { data } = await apiClient.get("/users", {
      params: { role, enabled, search, page, size },
    });
    return data;
  },
  async getUserById(id) {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
  async createUser(payload) {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },
  async updateUser(id, payload) {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },
  async updateUserStatus(id, enabled) {
    const { data } = await apiClient.patch(`/users/${id}/status`, { enabled });
    return data;
  },
  async updateUserRoles(id, roleNames) {
    const { data } = await apiClient.patch(`/users/${id}/roles`, { roleNames });
    return data;
  },
  async deleteUser(id) {
    await apiClient.delete(`/users/${id}`);
  },
};