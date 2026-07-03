import apiClient from "./apiClient";

export const medicalNoteService = {
  async createNote(payload) {
    const { data } = await apiClient.post("/medical-notes", payload);
    return data;
  },

  async getByIntervention(interventionId) {
    const { data } = await apiClient.get(`/medical-notes/by-intervention/${interventionId}`);
    return data;
  },
};
