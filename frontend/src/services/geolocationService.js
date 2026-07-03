import apiClient from "./apiClient";

export const geolocationService = {
  async calculateDistance(origin, destination) {
    const { data } = await apiClient.post("/geolocation/distance", {
      origin: { latitude: origin.latitude, longitude: origin.longitude },
      destination: { latitude: destination.latitude, longitude: destination.longitude },
    });
    return data;
  },
};
