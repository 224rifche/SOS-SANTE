import apiClient from "./apiClient";

export const medicalCenterService = {
  async list({ page = 0, size = 50 } = {}) {
    const { data } = await apiClient.get("/medical-centers", { params: { page, size } });
    return data;
  },
};
