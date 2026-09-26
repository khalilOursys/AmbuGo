export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  group?: string | null;
}

export interface UserPermissionEntry extends Permission {
  grantedAt?: string;
  grantedById?: string | null;
  revokedAt?: string | null;
}

export interface UserPermissionsResponse {
  userId: string;
  role: string;
  rolePermissions: Permission[];
  userPermissions: UserPermissionEntry[];
  effectivePermissions: string[];
}

export interface PermissionCatalogResponse {
  permissions: Permission[];
  groups: string[];
}

export interface RolePermissionsResponse {
  role: string;
  rolePermissions: Permission[];
}

export type RolePermissionMap = Record<string, string[]>;