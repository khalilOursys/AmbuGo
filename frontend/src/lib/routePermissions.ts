// lib/routePermissions.ts

/**
 * Maps a URL prefix → required permission(s).
 * The FIRST matching prefix wins, so order from most specific → least specific.
 *
 * - `permission: "..."`            → user needs this one
 * - `permission: ["a", "b"]`       → user needs ANY of them (default)
 * - `mode: "all"`                  → user needs ALL of them
 * - `permission: undefined`        → public (no check)
 */
export type RouteRule = {
  prefix: string;
  permission?: string | string[];
  mode?: "any" | "all";
};

export const ROUTE_PERMISSIONS: RouteRule[] = [
  // ---- Auth / public ----
  { prefix: "/signin", permission: undefined },
  { prefix: "/signup", permission: undefined },

  // ---- Companies ----
  { prefix: "/companies/add", permission: "companies.create" },
  { prefix: "/companies",     permission: "companies.read" },

  // ---- Equipment ----
  { prefix: "/equipment/add",        permission: "equipment.create" },
  { prefix: "/equipment/categories", permission: "equipment.categories" },
  { prefix: "/equipment",            permission: "equipment.read" },

  // ---- Locations ----
  { prefix: "/locations/add", permission: "locations.create" },
  { prefix: "/locations/map", permission: "locations.map" },
  { prefix: "/locations",     permission: "locations.read" },

  // ---- Missions ----
  { prefix: "/missions/add",      permission: "missions.create" },
  { prefix: "/missions/schedule", permission: "missions.schedule" },
  { prefix: "/missions/routes",   permission: "missions.routes" },
  { prefix: "/missions/stats",    permission: "missions.stats" },
  { prefix: "/missions",          permission: "missions.read" },

  // ---- Patients ----
  { prefix: "/patients/add",     permission: "patients.create" },
  { prefix: "/patients/records", permission: "patients.records" },
  { prefix: "/patients",         permission: "patients.read" },

  // ---- Services ----
  { prefix: "/services/add", permission: "services.create" },
  { prefix: "/services",     permission: "services.read" },

  // ---- Staff ----
  { prefix: "/staff/add",       permission: "staff.create" },
  { prefix: "/staff/schedules", permission: "staff.schedules" },
  { prefix: "/staff/roles",     permission: "staff.roles" },
  { prefix: "/staff",           permission: "staff.read" },

  // ---- Vehicles ----
  { prefix: "/vehicles/add",         permission: "vehicles.create" },
  { prefix: "/vehicles/maintenance", permission: "vehicles.maintenance" },
  { prefix: "/vehicles",             permission: "vehicles.read" },

  // ---- Users ----
  { prefix: "/users/add",         permission: "users.create" },
  { prefix: "/users/permissions", permission: "users.permissions" },
  { prefix: "/users",             permission: "users.read" },

  // ---- Profile — always allowed ----
  { prefix: "/profile", permission: undefined },
];

/**
 * Returns the rule that matches a given pathname, or null if none match
 * (meaning: no restriction → allow).
 */
export function findRouteRule(pathname: string): RouteRule | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (
      pathname === rule.prefix ||
      pathname.startsWith(rule.prefix + "/")
    ) {
      return rule;
    }
  }
  return null;
}