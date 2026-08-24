// src/types/mission.types.ts
export interface Mission {
  id: string;
  code: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'CREATED' | 'ASSIGNED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'ARRIVED_HOSPITAL' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  pickupAddress?: string;
  destination?: string;
  latitude?: number;
  longitude?: number;
  callDate: string;
  dispatchedAt?: string;
  arrivedSceneAt?: string;
  transportedAt?: string;
  completedAt?: string;
  customerId?: string;
  contractId?: string;
  patientId?: string;
  locationId?: string;
  notes?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    code?: string;
  };
  patient?: {
    id: string;
    firstname: string;
    lastname: string;
    phone?: string;
  };
  location?: {
    id: string;
    name: string;
    type: string;
    address?: string;
  };
  contract?: {
    id: string;
    reference: string;
    title: string;
  };
  assignments?: MissionAssignment[];
  equipment?: MissionEquipment[];
  events?: MissionEvent[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
  };
}

export interface MissionAssignment {
  id: string;
  missionId: string;
  vehicleId: string;
  assignedAt: string;
  isDefault: boolean;
  isComplete: boolean;
  vehicle?: {
    id: string;
    registration: string;
    brand?: string;
    model?: string;
    level: string;
  };
  staffMembers?: AssignmentStaff[];
}

export interface AssignmentStaff {
  id: string;
  assignmentId: string;
  staffId: string;
  sourceType: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  notes?: string;
  staff?: {
    id: string;
    firstname: string;
    lastname: string;
    type: string;
    matricule?: string;
  };
  schedule?: any;
}

export interface MissionEquipment {
  id: string;
  missionId: string;
  equipmentId: string;
  quantity: number;
  assignedAt: string;
  returnedAt?: string;
  equipment?: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
}

export interface MissionEvent {
  id: string;
  missionId: string;
  status?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface CreateMissionDto {
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  reason?: string;
  pickupAddress?: string;
  destination?: string;
  latitude?: number;
  longitude?: number;
  callDate?: string;
  customerId?: string;
  contractId?: string;
  patientId?: string;
  locationId?: string;
  notes?: string;
  equipment?: {
    equipmentId: string;
    quantity?: number;
  }[];
}

export interface UpdateMissionDto extends Partial<CreateMissionDto> {
  status?: Mission['status'];
  notes?: string;
  equipment?: {
    equipmentId: string;
    quantity?: number;
  }[];
}

export interface AssignMissionDto {
  vehicleId: string;
  staffIds: string[];
  sourceType?: string;
  notes?: string;
  equipment?: {
    equipmentId: string;
    quantity?: number;
  }[];
}

export interface ChangeStatusDto {
  status: Mission['status'];
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface FilterMissionDto {
  status?: Mission['status'];
  priority?: Mission['priority'];
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  patientId?: string;
  locationId?: string;
  vehicleId?: string;
  staffId?: string;
  equipmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}