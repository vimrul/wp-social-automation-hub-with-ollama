import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login, type AuthUser, type LoginPayload } from "../api/auth";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  logoutUser: () => void;
  refreshMe: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = "wp_social_access_token";
const USER_KEY = "wp_social_user";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMe();
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error("Failed to refresh current user:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  const loginUser = useCallback(
    async (payload: LoginPayload) => {
      const response = await login(payload);
      persistAuth(response.access_token, response.user);
    },
    [persistAuth]
  );

  const logoutUser = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      loginUser,
      logoutUser,
      refreshMe,
    }),
    [user, token, isLoading, loginUser, logoutUser, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
