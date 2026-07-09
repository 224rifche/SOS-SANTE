import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";

/**
 * Cree un client STOMP connecte via SockJS, authentifie par Bearer Token.
 * Reference : Phase 6 - Partie 4 (Architecture Temps Reel).
 */
export function createStompClient() {
  const token = localStorage.getItem("wonmally_access_token");

  return new Client({
    webSocketFactory: () => new SockJS(WS_BASE_URL),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (msg) => console.log("[STOMP]", msg),
  });
}
