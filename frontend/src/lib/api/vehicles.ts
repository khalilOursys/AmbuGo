import { apiClient } from "./client";

export type VehicleType =
  | "AMBULANCE"
  | "VSL"
  | "TPMR"
  | "MEDICAL_MOTORBIKE";

export type VehicleStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "ON_MISSION"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;

  brand?: string;
  model?: string;

  sanitaryApprovalNo?: string;
  sanitaryExpiryDate?: string;

  technicalControlDate?: string;
  nextTechnicalControl?: string;

  insurancePolicyNo?: string;
  insuranceCompany?: string;
  insuranceExpiryDate?: string;

  medicalEquipment?: string;
  mileage?: number;
  maintenancePlan?: string;
  status: VehicleStatus;

  createdAt: string;
  updatedAt: string;
}

export const vehicleApi = {
  getAll: () => apiClient.get<Vehicle[]>("/vehicles"),

  getById: (id: string) =>
    apiClient.get<Vehicle>(`/vehicles/${id}`),

  create: (data: Partial<Vehicle>) =>
    apiClient.post<Vehicle>("/vehicles", data),

  update: (id: string, data: Partial<Vehicle>) =>
    apiClient.put<Vehicle>(`/vehicles/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<void>(`/vehicles/${id}`),
};