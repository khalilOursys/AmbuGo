// src/types/vehicle.types.ts
export interface CreateVehicleDto {
  companyId: string;
  registration: string;
  brand?: string;
  model?: string;
  level: 'BLS' | 'ALS' | 'ICU';
  status?: 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  vehicleTypeId?: string;
  staffSchedules?: {
    staffId: string;
    shiftStart: string;
    shiftEnd: string;
    shiftType?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
    validFrom?: string;
    validUntil?: string;
    status?: string;
    notes?: string;
  }[];
  equipment?: {
    equipmentId: string;
    quantity: number;
  }[];
}

export interface Vehicle {
  id: string;
  companyId: string;
  registration: string;
  brand?: string;
  model?: string;
  level: 'BLS' | 'ALS' | 'ICU';
  status: 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  vehicleTypeId?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
  vehicleType?: {
    id: string;
    name: string;
  };
  staffSchedules?: VehicleStaffSchedule[];
  equipment?: VehicleEquipment[];
  gpsPositions?: GpsPosition[];
  assignments?: MissionAssignment[];
}

export interface VehicleType {
  id: string;
  name: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* export interface Vehicle {
  id: string;
  registration: string;
  brand?: string;
  model?: string;
  level: 'BLS' | 'ALS' | 'ICU';
  status: 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  companyId: string;
  vehicleTypeId?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
  vehicleType?: VehicleType;
  staffSchedules?: VehicleStaffSchedule[];
  equipment?: VehicleEquipment[];
  gpsPositions?: GpsPosition[];
  assignments?: MissionAssignment[];
} */

export interface VehicleStaffSchedule {
  id: string;
  vehicleId: string;
  staffId: string;
  shiftStart: string;
  shiftEnd: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
  isRecurring: boolean;
  recurrenceRule?: string;
  validFrom: string;
  validUntil?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REPLACED';
  isReserved: boolean;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  shiftTemplateId?: string;
  notes?: string;
  staff?: {
    id: string;
    matricule: string;
    firstname: string;
    lastname: string;
    type: 'DRIVER' | 'PARAMEDIC' | 'NURSE' | 'DOCTOR';
    email?: string;
    phone?: string;
  };
  shiftTemplate?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
}

export interface VehicleEquipment {
  id: string;
  vehicleId: string;
  equipmentId: string;
  quantity: number;
  assignedAt: string;
  returnedAt?: string;
  equipment?: {
    id: string;
    code: string;
    name: string;
    description?: string;
    quantity: number;
  };
}

export interface GpsPosition {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  address?: string;
  createdAt: string;
}

export interface MissionAssignment {
  id: string;
  missionId: string;
  vehicleId: string;
  assignedAt: string;
  isDefault: boolean;
  isComplete: boolean;
  mission?: {
    id: string;
    code: string;
    status: string;
    priority: string;
    callDate: string;
  };
}

export interface CreateVehicleDto {
  companyId: string;
  registration: string;
  brand?: string;
  model?: string;
  level: 'BLS' | 'ALS' | 'ICU';
  status?: 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  vehicleTypeId?: string;
  staffSchedules?: {
    staffId: string;
    shiftStart: string;
    shiftEnd: string;
    shiftType?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
    validFrom?: string;
    validUntil?: string;
    status?: string;
    notes?: string;
  }[];
  equipment?: {
    equipmentId: string;
    quantity: number;
  }[];
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  id: string;
}

export interface VehicleFilterParams {
  page?: number;
  limit?: number;
  companyId?: string;
  registration?: string;
  brand?: string;
  model?: string;
  status?: string;
  level?: string;
  vehicleTypeId?: string;
  isDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}