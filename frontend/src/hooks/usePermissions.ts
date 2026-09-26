'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions';
import type {
  PermissionCatalogResponse,
  RolePermissionsResponse,
  UserPermissionsResponse,
  RolePermissionMap,
} from '@/types/permission';

export const permissionKeys = {
  all: ['permissions'] as const,
  catalog: () => [...permissionKeys.all, 'catalog'] as const,
  roles: () => [...permissionKeys.all, 'roles'] as const,
  role: (role: string) => [...permissionKeys.all, 'role', role] as const,
  forUser: (userId: string) => [...permissionKeys.all, 'user', userId] as const,
};

// ---------- Catalog ----------
export function usePermissionCatalog() {
  return useQuery<PermissionCatalogResponse>({
    queryKey: permissionKeys.catalog(),
    queryFn: permissionsApi.catalog,
    staleTime: 5 * 60_000,
  });
}

// ---------- Role permissions ----------
export function useAllRolePermissions() {
  return useQuery<RolePermissionMap>({
    queryKey: permissionKeys.roles(),
    queryFn: permissionsApi.allRolePermissions,
    staleTime: 60_000,
  });
}

export function useRolePermissions(role: string | undefined) {
  return useQuery<RolePermissionsResponse>({
    queryKey: role ? permissionKeys.role(role) : ['permissions', 'role', 'none'],
    queryFn: () => permissionsApi.rolePermissions(role!),
    enabled: !!role,
    staleTime: 60_000,
  });
}

export function useReplaceRolePermissions(role: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: string[]) =>
      permissionsApi.replaceRolePermissions(role, permissionIds),
    onSuccess: (data) => {
      qc.setQueryData<RolePermissionsResponse>(permissionKeys.role(role), data);
      qc.invalidateQueries({ queryKey: permissionKeys.roles() });
    },
  });
}

// ---------- User permissions ----------
export function useUserPermissions(userId: string | undefined) {
  return useQuery<UserPermissionsResponse>({
    queryKey: userId
      ? permissionKeys.forUser(userId)
      : ['permissions', 'user', 'none'],
    queryFn: () => permissionsApi.forUser(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useGrantPermission(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) =>
      permissionsApi.grant(userId, permissionId),
    onSuccess: (data) =>
      qc.setQueryData<UserPermissionsResponse>(
        permissionKeys.forUser(userId),
        data,
      ),
  });
}

export function useRevokePermission(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) =>
      permissionsApi.revoke(userId, permissionId),
    onSuccess: (data) =>
      qc.setQueryData<UserPermissionsResponse>(
        permissionKeys.forUser(userId),
        data,
      ),
  });
}

export function useReplacePermissions(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: string[]) =>
      permissionsApi.replace(userId, permissionIds),
    onSuccess: (data) =>
      qc.setQueryData<UserPermissionsResponse>(
        permissionKeys.forUser(userId),
        data,
      ),
  });
}

export function useGrantFromRole(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => permissionsApi.grantFromRole(userId),
    onSuccess: (data) =>
      qc.setQueryData<UserPermissionsResponse>(
        permissionKeys.forUser(userId),
        data,
      ),
  });
}