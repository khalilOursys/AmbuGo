'use client';

import React, { useMemo, useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Search,
    Shield,
    ShieldCheck,
    X,
} from 'lucide-react';
import type { Permission } from '@/types/permission';

export type PermState = 'role' | 'user' | 'both' | 'none' | 'revoked';

interface Props {
    permissions: Permission[];
    /** returns the visual state of a permission for the current subject */
    getState: (perm: Permission) => PermState;
    onToggle: (perm: Permission) => void;
    /** optional header extras */
    search: string;
    onSearchChange: (value: string) => void;
    disabled?: boolean;
}

export default function PermissionPicker({
    permissions,
    getState,
    onToggle,
    search,
    onSearchChange,
    disabled,
}: Props) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const grouped = useMemo(() => {
        const map = new Map<string, Permission[]>();
        for (const p of permissions) {
            const key = p.group ?? 'other';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        }
        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [permissions]);

    const filteredGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return grouped;
        return grouped
            .map(
                ([group, perms]) =>
                    [
                        group,
                        perms.filter(
                            (p) =>
                                p.name.toLowerCase().includes(q) ||
                                (p.description ?? '').toLowerCase().includes(q),
                        ),
                    ] as [string, Permission[]],
            )
            .filter(([, perms]) => perms.length > 0);
    }, [grouped, search]);

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredGroups.map(([group, perms]) => {
                const isCollapsed = collapsed[group];
                return (
                    <section key={group}>
                        <button
                            type="button"
                            onClick={() =>
                                setCollapsed((c) => ({ ...c, [group]: !c[group] }))
                            }
                            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                {group}
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    {perms.length}
                                </span>
                            </span>
                        </button>

                        {!isCollapsed && (
                            <ul className="grid grid-cols-1 gap-2 px-5 pb-4 md:grid-cols-2 xl:grid-cols-3">
                                {perms.map((perm) => {
                                    const state = getState(perm);
                                    return (
                                        <li key={perm.id}>
                                            <button
                                                type="button"
                                                onClick={() => onToggle(perm)}
                                                disabled={disabled}
                                                className={`group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${state === 'none'
                                                        ? 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                                                        : 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-900/10'
                                                    } disabled:opacity-60`}
                                            >
                                                <StateIcon state={state} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {perm.name}
                                                        </span>
                                                        <StateBadge state={state} />
                                                    </div>
                                                    {perm.description && (
                                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                                            {perm.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                );
            })}

            {filteredGroups.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No permissions match “{search}”.
                </div>
            )}
        </div>
    );
}

/* ---------- Exported helpers ---------- */

export function PermissionSearchInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search permissions…"
                className="w-56 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
        </div>
    );
}

export function PermissionLegend() {
    return (
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <LegendItem color="bg-blue-500" label="From role" />
            <LegendItem color="bg-emerald-500" label="User override (granted)" />
            <LegendItem color="bg-purple-500" label="Role + override" />
            <LegendItem color="bg-gray-300" label="Not granted" />
            <LegendItem color="bg-red-500" label="Revoked at user level" />
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
        </span>
    );
}

export function StateIcon({ state }: { state: PermState }) {
    const base =
        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border';
    switch (state) {
        case 'role':
            return (
                <span className={`${base} border-blue-500 bg-blue-500 text-white`}>
                    <Shield className="h-3 w-3" />
                </span>
            );
        case 'user':
            return (
                <span className={`${base} border-emerald-500 bg-emerald-500 text-white`}>
                    <Check className="h-3 w-3" />
                </span>
            );
        case 'both':
            return (
                <span className={`${base} border-purple-500 bg-purple-500 text-white`}>
                    <ShieldCheck className="h-3 w-3" />
                </span>
            );
        case 'revoked':
            return (
                <span className={`${base} border-red-500 bg-red-500 text-white`}>
                    <X className="h-3 w-3" />
                </span>
            );
        default:
            return (
                <span
                    className={`${base} border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800`}
                />
            );
    }
}

export function StateBadge({ state }: { state: PermState }) {
    const map: Record<string, { label: string; cls: string }> = {
        role: {
            label: 'role',
            cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        },
        user: {
            label: 'override',
            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        },
        both: {
            label: 'role + override',
            cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        },
        revoked: {
            label: 'revoked',
            cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        },
    };
    const cfg = map[state];
    if (!cfg) return null;
    return (
        <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cfg.cls}`}
        >
            {cfg.label}
        </span>
    );
}