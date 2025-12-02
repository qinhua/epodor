export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl: string;
  createdAt: number;
}

const LS_USER_KEY = "epodor:user";

export const getCurrentUser = (): UserProfile | null => {
  const raw = localStorage.getItem(LS_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const login = (username: string, _password: string): UserProfile => {
  const existing = getCurrentUser();
  if (existing && existing.username === username) return existing;
  const user: UserProfile = {
    id: "u-" + Date.now(),
    username,
    email: undefined,
    avatarUrl: "/default-avatar.svg",
    createdAt: Date.now(),
  };
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  return user;
};

export const register = (username: string, email?: string): UserProfile => {
  const user: UserProfile = {
    id: "u-" + Date.now(),
    username,
    email,
    avatarUrl: "/default-avatar.svg",
    createdAt: Date.now(),
  };
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(LS_USER_KEY);
};
