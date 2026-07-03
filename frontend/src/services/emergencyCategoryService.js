import apiClient from "./apiClient";

export const emergencyCategoryService = {
  async getAllCategories() {
    const { data } = await apiClient.get("/emergency-categories");
    return data;
  },
};