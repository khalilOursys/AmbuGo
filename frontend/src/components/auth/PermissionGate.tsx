// components/auth/PermissionGate.tsx
"use client";

import React, { useEffect } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
    permission: string | string[];
    mode?: "any" | "all";
    children: React.ReactNode;
}

export function PermissionGate({
    permission,
    mode = "any",
    children,
}: Props) {
    const { user, isLoading, hasPermission } = useAuth();
    const allowed = hasPermission(permission, mode);

    // Once the user is loaded and access is denied → real 404
    useEffect(() => {
        if (!isLoading && user && !allowed) {
            notFound();
        }
    }, [isLoading, user, allowed]);

    if (isLoading) {
        return <div className="p-6 text-sm text-gray-400">Loading…</div>;
    }

    // Not logged in — provider / middleware will redirect to /signin.
    if (!user) return null;

    // Denied — useEffect fires notFound(); render nothing for the flash.
    if (!allowed) return null;

    return <>{children}</>;
}