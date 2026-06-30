import { useState, useCallback } from "react";

/**
 * Recupere la position GPS de l'utilisateur.
 * Reference : Module Geolocalisation (Phase 6 - Exigences Fonctionnelles, Module 2).
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("La geolocalisation n'est pas supportee par ce navigateur.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Impossible de recuperer votre position. Vous pouvez la selectionner manuellement sur la carte.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { position, error, loading, requestLocation, setPosition };
}
