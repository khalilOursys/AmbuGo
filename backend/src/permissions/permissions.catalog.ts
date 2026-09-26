import { UserRole } from '@prisma/client';

export interface PermissionDef {
  name: string;
  description: string;
  group: string;
}

export const PERMISSIONS: PermissionDef[] = [
  // Missions
  { name: 'missions.read', description: 'View missions', group: 'missions' },
  {
    name: 'missions.create',
    description: 'Create missions',
    group: 'missions',
  },
  {
    name: 'missions.assign',
    description: 'Assign vehicles/staff to missions',
    group: 'missions',
  },
  {
    name: 'missions.update',
    description: 'Update mission status/details',
    group: 'missions',
  },
  {
    name: 'missions.cancel',
    description: 'Cancel missions',
    group: 'missions',
  },
  {
    name: 'missions.delete',
    description: 'Delete missions',
    group: 'missions',
  },

  // Vehicles
  { name: 'vehicles.read', description: 'View vehicles', group: 'vehicles' },
  {
    name: 'vehicles.manage',
    description: 'Create/edit/delete vehicles',
    group: 'vehicles',
  },
  {
    name: 'vehicles.gps',
    description: 'View GPS positions',
    group: 'vehicles',
  },

  // Staff
  { name: 'staff.read', description: 'View staff members', group: 'staff' },
  {
    name: 'staff.manage',
    description: 'Create/edit staff members',
    group: 'staff',
  },
  {
    name: 'staff.schedules.read',
    description: 'View staff schedules',
    group: 'staff',
  },
  {
    name: 'staff.schedules.manage',
    description: 'Manage staff schedules/shifts',
    group: 'staff',
  },
  {
    name: 'staff.attendance.edit',
    description: 'Edit staff attendance/check-in',
    group: 'staff',
  },

  // Customers / Contracts
  { name: 'customers.read', description: 'View customers', group: 'customers' },
  {
    name: 'customers.manage',
    description: 'Create/edit customers',
    group: 'customers',
  },
  { name: 'contracts.read', description: 'View contracts', group: 'contracts' },
  {
    name: 'contracts.manage',
    description: 'Create/edit contracts',
    group: 'contracts',
  },

  // Patients / Locations
  { name: 'patients.read', description: 'View patients', group: 'patients' },
  {
    name: 'patients.manage',
    description: 'Create/edit patients',
    group: 'patients',
  },
  { name: 'locations.read', description: 'View locations', group: 'locations' },
  {
    name: 'locations.manage',
    description: 'Create/edit locations',
    group: 'locations',
  },

  // Equipment
  { name: 'equipment.read', description: 'View equipment', group: 'equipment' },
  {
    name: 'equipment.manage',
    description: 'Manage equipment',
    group: 'equipment',
  },

  // Invoices / Billing
  { name: 'invoices.read', description: 'View invoices', group: 'billing' },
  {
    name: 'invoices.generate',
    description: 'Generate invoices',
    group: 'billing',
  },
  {
    name: 'invoices.manage',
    description: 'Edit/void invoices',
    group: 'billing',
  },
  {
    name: 'rates.manage',
    description: 'Manage distance rates & services',
    group: 'billing',
  },

  // Services
  { name: 'services.read', description: 'View services', group: 'services' },
  {
    name: 'services.manage',
    description: 'Create/edit services',
    group: 'services',
  },

  // Users / Admin
  { name: 'users.read', description: 'View users', group: 'admin' },
  {
    name: 'users.manage',
    description: 'Create/edit users & permissions',
    group: 'admin',
  },
  {
    name: 'company.read',
    description: 'View company settings',
    group: 'admin',
  },
  {
    name: 'company.manage',
    description: 'Edit company settings',
    group: 'admin',
  },
  { name: 'audit.read', description: 'View audit logs', group: 'admin' },
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.name),

  MANAGER: [
    'missions.read',
    'missions.create',
    'missions.assign',
    'missions.update',
    'missions.cancel',
    'vehicles.read',
    'vehicles.gps',
    'staff.read',
    'staff.schedules.read',
    'staff.schedules.manage',
    'customers.read',
    'contracts.read',
    'patients.read',
    'locations.read',
    'equipment.read',
    'invoices.read',
    'invoices.generate',
    'services.read',
    'company.read',
  ],

  SUPERVISOR: [
    'missions.read',
    'missions.create',
    'missions.assign',
    'missions.update',
    'vehicles.read',
    'vehicles.gps',
    'staff.read',
    'staff.schedules.read',
    'staff.attendance.edit',
    'customers.read',
    'contracts.read',
    'patients.read',
    'locations.read',
    'equipment.read',
    'services.read',
  ],

  DISPATCHER: [
    'missions.read',
    'missions.create',
    'missions.assign',
    'missions.update',
    'missions.cancel',
    'vehicles.read',
    'vehicles.gps',
    'staff.read',
    'staff.schedules.read',
    'customers.read',
    'patients.read',
    'locations.read',
    'services.read',
  ],

  STAFF: ['missions.read', 'vehicles.read', 'staff.schedules.read'],
};
