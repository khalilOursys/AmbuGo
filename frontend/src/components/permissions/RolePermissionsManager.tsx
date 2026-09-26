'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, RotateCcw, Users } from 'lucide-react';
import {
    usePermissionCatalog,
    useRolePermissions,
    useReplaceRolePermissions,
} from '@/hooks/usePermissions';
import PermissionPicker, {
    PermissionSearchInput,
    type PermState,
} from './PermissionPicker';
import type { Permission } from '@/types/permission';

interface Props {
    role: string;
}

export default function RolePermissionsManager({ role }: Props) {
    const { data: catalog, isLoading: catLoading, error: catError } =
        usePermissionCatalog();
    const { data: roleData, isLoading: roleLoading, error: roleError } =
        useRolePermissions(role);

    const replace = useReplaceRolePermissions(role);
    const [search, setSearch] = useState('');

    const roleSet = useMemo(
        () => new Set(roleData?.rolePermissions.map((p) => p.name) ?? []),
        [roleData],
    );

    const stateOf = (perm: Permission): PermState =>
        roleSet.has(perm.name) ? 'role' : 'none';

    const toggle = (perm: Permission) => {
        if (!roleData || !catalog) return;
        const currentIds = new Set(roleData.rolePermissions.map((p) => p.id));
        if (currentIds.has(perm.id)) currentIds.delete(perm.id);
        else currentIds.add(perm.id);
        replace.mutate([...currentIds]);
    };

    const resetToDefaults = () => {
        // optional: implement if you have a "default role perms" endpoint
        // replace.mutate(defaultIds);
    };

    const isBusy = replace.isPending;

    if (catError || roleError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load permissions: {(catError || roleError)?.message}
            </div>
        );
    }

    if (catLoading || roleLoading || !catalog || !roleData) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading role permissions…
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Role — {role}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {roleData.rolePermissions.length} / {catalog.permissions.length}{' '}
                            permissions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PermissionSearchInput value={search} onChange={setSearch} />
                    <button
                        type="button"
                        onClick={resetToDefaults}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

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