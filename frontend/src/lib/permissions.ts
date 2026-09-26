// lib/permissions.ts
import type { Permission } from "@/lib/api/auth";

export function hasPermission(
  userPermissions: Permission[] | undefined,
  required?: string | string[],
  mode: "any" | "all" = "any"
): boolean {
  if (!required) return true;
  if (!userPermissions?.length) return false;

  const names = userPermissions.map((p) => p.name);
  const list = Array.isArray(required) ? required : [required];

  return mode === "all"
    ? list.every((r) => names.includes(r))
    : list.some((r) => names.includes(r));
}