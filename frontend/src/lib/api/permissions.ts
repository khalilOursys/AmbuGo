import type {
  PermissionCatalogResponse,
  RolePermissionsResponse,
  UserPermissionsResponse,
  RolePermissionMap,
} from '@/types/permission';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const permissionsApi = {
  // ---------- Catalog ----------
  catalog: () => http<PermissionCatalogResponse>('/permissions'),

  // ---------- Roles ----------
  allRolePermissions: () => http<RolePermissionMap>('/permissions/roles'),

  rolePermissions: (role: string) =>
    http<RolePermissionsResponse>(`/roles/${role}/permissions`),

  replaceRolePermissions: (role: string, permissionIds: string[]) =>
    http<RolePermissionsResponse>(`/roles/${role}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    }),

  // ---------- Users ----------
  forUser: (userId: string) =>
    http<UserPermissionsResponse>(`/users/${userId}/permissions`),

  grant: (userId: string, permissionId: string) =>
    http<UserPermissionsResponse>(`/users/${userId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionId }),
    }),

  revoke: (userId: string, permissionId: string) =>
    http<UserPermissionsResponse>(
      `/users/${userId}/permissions/${permissionId}`,
      { method: 'DELETE' },
    ),

  replace: (userId: string, permissionIds: string[]) =>
    http<UserPermissionsResponse>(`/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    }),

  grantFromRole: (userId: string) =>
    http<UserPermissionsResponse>(`/users/${userId}/permissions/from-role`, {
      method: 'POST',
    }),
};