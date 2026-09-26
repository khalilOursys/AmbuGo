'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import {
    usePermissionCatalog,
    useUserPermissions,
    useGrantPermission,
    useRevokePermission,
    useReplacePermissions,
    useGrantFromRole,
} from '@/hooks/usePermissions';
import PermissionPicker, {
    PermissionSearchInput,
    PermissionLegend,
    type PermState,
} from './PermissionPicker';
import type { Permission } from '@/types/permission';

interface Props {
    userId: string;
    userName?: string;
    userRole?: string;
}

export default function UserPermissionsManager({
    userId,
    userName,
    userRole,
}: Props) {
    const { data: catalog, isLoading: catLoading, error: catError } =
        usePermissionCatalog();
    const { data: userData, isLoading: userLoading, error: userError } =
        useUserPermissions(userId);

    const grant = useGrantPermission(userId);
    const revoke = useRevokePermission(userId);
    const replace = useReplacePermissions(userId);
    const grantFromRole = useGrantFromRole(userId);

    const [search, setSearch] = useState('');

    const roleSet = useMemo(
        () => new Set(userData?.rolePermissions.map((p) => p.name) ?? []),
        [userData],
    );
    const userGrantedSet = useMemo(
        () =>
            new Set(
                (userData?.userPermissions ?? [])
                    .filter((p) => !p.revokedAt)
                    .map((p) => p.name),
            ),
        [userData],
    );
    const effectiveSet = useMemo(
        () => new Set(userData?.effectivePermissions ?? []),
        [userData],
    );

    const stateOf = (perm: Permission): PermState => {
        const fromRole = roleSet.has(perm.name);
        const fromUser = userGrantedSet.has(perm.name);
        const revoked = (userData?.userPermissions ?? []).some(
            (p) => p.name === perm.name && p.revokedAt,
        );
        if (revoked) return 'revoked';
        if (fromRole && fromUser) return 'both';
        if (fromRole) return 'role';
        if (fromUser) return 'user';
        return 'none';
    };

    const toggle = (perm: Permission) => {
        const state = stateOf(perm);
        if (state === 'user' || state === 'both') revoke.mutate(perm.id);
        else grant.mutate(perm.id);
    };

    const clearUserOverrides = () => {
        if (!userData) return;
        replace.mutate(userData.rolePermissions.map((p) => p.id));
    };

    const copyRoleToUser = () => grantFromRole.mutate();

    const isBusy =
        grant.isPending ||
        revoke.isPending ||
        replace.isPending ||
        grantFromRole.isPending;

    if (catError || userError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load permissions: {(catError || userError)?.message}
            </div>
        );
    }

    if (catLoading || userLoading || !catalog || !userData) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading permissions…
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Permissions {userName ? `— ${userName}` : ''}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userRole ? `${userRole} • ` : ''}Effective: {effectiveSet.size} /{' '}
                            {catalog.permissions.length}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PermissionSearchInput value={search} onChange={setSearch} />

                    <button
                        type="button"
                        onClick={copyRoleToUser}
                        disabled={isBusy}
                        title="Copy role permissions as user-level overrides"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Sparkles className="h-4 w-4" />
                        From role
                    </button>

                    <button
                        type="button"
                        onClick={clearUserOverrides}
                        disabled={isBusy}
                        title="Reset all user-level overrides to match the role"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

            <PermissionLegend />

            <PermissionPicker
                permissions={catalog.permissions}
                getState={stateOf}
                onToggle={toggle}
                search={search}
                onSearchChange={setSearch}
                disabled={isBusy}
            />
        </div>
    );
}