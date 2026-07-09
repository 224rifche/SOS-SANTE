import apiClient from "./apiClient";

// Service en lecture seule : l'admin peut vérifier qu'une note existe,
// jamais la créer, modifier ou consulter son contenu clinique.
export const medicalNoteService = {
  async getByIntervention(interventionId) {
    const { data } = await apiClient.get(`/medical-notes/by-intervention/${interventionId}`);
    return data;
  },
};