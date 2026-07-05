import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

function decodeUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return {
      userId: payload.userId || null,
      email: payload.sub,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roles: (payload.roles || payload.authorities || []).map((r) =>
        typeof r === "string" ? r.replace("ROLE_", "") : r
      ),
      permissions: payload.permissions || [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("wonmally_access_token"));
  const [user, setUser] = useState(() => decodeUserFromToken(localStorage.getItem("wonmally_access_token")));
  const [authChecked, setAuthChecked] = useState(false);

  const persistSession = useCallback((authResponse) => {
    localStorage.setItem("wonmally_access_token", authResponse.accessToken);
    localStorage.setItem("wonmally_refresh_token", authResponse.refreshToken);
    setAccessToken(authResponse.accessToken);
    setUser(decodeUserFromToken(authResponse.accessToken));
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    persistSession(response);
    return response;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);
    persistSession(response);
    return response;
  }, [persistSession]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("wonmally_refresh_token");
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      localStorage.removeItem("wonmally_access_token");
      localStorage.removeItem("wonmally_refresh_token");
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    authService.getMe()
      .then((profile) => {
        if (cancelled) return;
        setUser({
          userId: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: Array.from(profile.roles || []),
          permissions: Array.from(profile.permissions || []),
        });
      })
      .catch(() => {
        // Pas de session cookie valide ; on garde le fallback localStorage existant.
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => { cancelled = true; };
  }, []);

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission) ?? false,
    [user]
  );

  const value = useMemo(() => ({
    user,
    accessToken,
    authChecked,
    isAuthenticated: !!accessToken,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
  }), [user, accessToken, authChecked, login, register, logout, hasRole, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans un AuthProvider");
  return ctx;
}
