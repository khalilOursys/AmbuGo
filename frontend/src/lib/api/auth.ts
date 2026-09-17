// lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ---------------- Types ----------------
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string;
  companyName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

// ---------------- Token Helpers ----------------
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

// ---------------- Authenticated Fetch ----------------
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/signin")
    ) {
      window.location.href = "/signin";
    }
  }

  return response;
};

// ---------------- Login ----------------
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Invalid credentials");
  }

  const data: AuthResponse = await response.json();
  setToken(data.access_token); // ONLY token in localStorage
  return data;
};

// ---------------- Fetch current user ----------------
export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await authFetch(`/auth/me`);
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
};

// ---------------- Logout ----------------
export const logout = () => {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};