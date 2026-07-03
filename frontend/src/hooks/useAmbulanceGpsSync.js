import { useEffect, useRef } from "react";
import { ambulanceService } from "../services/ambulanceService";

const SYNC_INTERVAL_MS = 12000;

/**
 * Envoie la position GPS de l'ambulance au backend à intervalle régulier.
 */
export function useAmbulanceGpsSync(ambulanceId, position, enabled = true) {
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    if (!enabled || !ambulanceId) return undefined;

    const sync = () => {
      const pos = positionRef.current;
      if (!pos) return;
      ambulanceService.updatePosition(ambulanceId, pos).catch(() => {});
    };

    sync();
    const timer = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, ambulanceId]);
}
