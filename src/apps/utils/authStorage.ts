import { USER_ROLES } from "../../config/sidebarConfig";
import type { UserRole } from "../../config/sidebarConfig";
import type { InstitutionDropDown } from "../types/api";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// Used when the role can't be resolved (non-admins can't call GET /user/{id}).
// TODO: drop once the backend adds the role to the access token
const DEFAULT_ROLE: UserRole = "operator";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  institution?: InstitutionDropDown | null;
}

interface TokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

// Backend roles are upper case (ADMIN, OPERATOR, ...)
export const normalizeRole = (role?: string | null): UserRole => {
  const normalized = role?.toLowerCase() as UserRole | undefined;
  return normalized && USER_ROLES.includes(normalized) ? normalized : DEFAULT_ROLE;
};

export const setTokens = (accessToken: string, refreshToken?: string | null) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

// Lets components re-render when the saved user changes (see useSessionUser)
const userListeners = new Set<() => void>();
let cachedUserJson: string | null = null;
let cachedUser: SessionUser | null = null;

export const subscribeUser = (listener: () => void) => {
  userListeners.add(listener);
  return () => {
    userListeners.delete(listener);
  };
};

const notifyUserChange = () => userListeners.forEach((listener) => listener());

export const setUser = (user: SessionUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyUserChange();
};

// Returns the same object until the stored value changes (required by useSyncExternalStore)
export const getUser = (): SessionUser | null => {
  const json = localStorage.getItem(USER_KEY);
  if (json === cachedUserJson) return cachedUser;

  cachedUserJson = json;
  try {
    cachedUser = json ? JSON.parse(json) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
};

export const getUserRole = (): UserRole => getUser()?.role ?? DEFAULT_ROLE;

export const getUserName = () => getUser()?.name ?? "User";

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyUserChange();
};
