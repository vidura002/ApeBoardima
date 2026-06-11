import type { Listing, SearchFilters, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'rl_token';
const USER_KEY = 'rl_user';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Multipart (for file uploads — no Content-Type header so browser sets boundary)
async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── API types ─────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface Enquiry {
  id: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
  propertyId: string;
  tenantId: string;
  property?: Listing;
  tenant?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
}

export interface UploadResponse {
  urls: string[];
  publicIds: string[];
}

export interface AdminUser extends User {
  listingCount: number;
  enquiryCount: number;
  savedCount: number;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const auth = {
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  googleConfig: () =>
    request<{ configured: boolean; clientId: string }>('/api/auth/google/config'),

  google: (data: { credential: string; role?: string }) =>
    request<AuthResponse>('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<{ user: User }>('/api/auth/me'),

  updateMe: (data: { name?: string; phone?: string }) =>
    request<{ user: User }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const adminUsers = {
  list: () => request<{ data: AdminUser[] }>('/api/auth/admin/users'),

  update: (id: string, data: { role?: User['role']; verified?: boolean }) =>
    request<{ user: AdminUser }>(`/api/auth/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/api/auth/admin/users/${id}`, { method: 'DELETE' }),
};

// ── Properties API ────────────────────────────────────────────────────────────

export interface PropertyFilters {
  q?: string;
  area?: string;
  type?: string;
  minPrice?: number | '';
  maxPrice?: number | '';
  gender?: string;
  furnished?: boolean | '';
  sortBy?: SearchFilters['sortBy'];
  featured?: boolean;
  page?: number;
  limit?: number;
}

export type AdminListingStatus = 'all' | 'pending' | 'approved' | 'verified';

export const properties = {
  list: (params: PropertyFilters = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) qs.set(k, String(v));
    });
    return request<PaginatedResponse<Listing>>(`/api/properties?${qs}`);
  },

  get: (id: string) => request<Listing>(`/api/properties/${id}`),

  mine: () => request<{ data: Listing[] }>('/api/properties/mine'),

  areaCounts: () => request<{ data: Record<string, number> }>('/api/properties/stats/area-counts'),

  adminList: (status: AdminListingStatus = 'all') =>
    request<{ data: Listing[] }>(`/api/properties/admin/all?status=${status}`),

  create: (data: Partial<Listing> & { imageUrls?: string[] }) =>
    request<Listing>('/api/properties', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Listing> & { imageUrls?: string[] }) =>
    request<Listing>(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  moderate: (id: string, data: { approved?: boolean; verified?: boolean; featured?: boolean }) =>
    request<Listing>(`/api/properties/admin/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/api/properties/${id}`, { method: 'DELETE' }),
};

// ── Upload API ────────────────────────────────────────────────────────────────

export const upload = {
  images: (files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    return requestForm<UploadResponse>('/api/upload/images', form);
  },
};

// ── Enquiries API ─────────────────────────────────────────────────────────────

export const enquiries = {
  create: (data: { propertyId: string; message: string }) =>
    request<Enquiry>('/api/enquiries', { method: 'POST', body: JSON.stringify(data) }),

  forLandlord: () => request<{ data: Enquiry[] }>('/api/enquiries/landlord'),

  forTenant: () => request<{ data: Enquiry[] }>('/api/enquiries/tenant'),

  updateStatus: (id: string, status: 'NEW' | 'CONTACTED' | 'CLOSED') =>
    request<Enquiry>(`/api/enquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ── Saved API ─────────────────────────────────────────────────────────────────

export const saved = {
  list: () => request<{ data: Listing[] }>('/api/saved'),

  ids: () => request<{ data: string[] }>('/api/saved/ids'),

  save: (propertyId: string) =>
    request<{ message: string; propertyId: string }>('/api/saved', { method: 'POST', body: JSON.stringify({ propertyId }) }),

  unsave: (propertyId: string) =>
    request<{ message: string; propertyId: string }>(`/api/saved/${propertyId}`, { method: 'DELETE' }),
};
