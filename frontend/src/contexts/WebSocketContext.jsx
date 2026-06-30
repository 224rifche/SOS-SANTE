import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createStompClient } from "../websocket/stompClient";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

/**
 * Fournit une connexion STOMP unique partagee par toute l'application.
 * Canaux : /topic/alerts, /topic/interventions, /topic/interventions/{id}, /topic/notifications.
 */
export function WebSocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const client = createStompClient();

    client.onConnect = () => setConnected(true);
    client.onDisconnect = () => setConnected(false);
    client.onStompError = () => setConnected(false);

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current || !connected) return () => {};
    const subscription = clientRef.current.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });
    return () => subscription.unsubscribe();
  }, [connected]);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket doit etre utilise dans un WebSocketProvider");
  return ctx;
}
