// src/api/vehicles.ts
import { Vehicle, VehicleFilterParams, PaginatedResponse, VehicleStaffSchedule, CreateVehicleDto, UpdateVehicleDto } from '@/types/vehicle.types';
import { apiClient } from '@/lib/api/client';

const BASE_URL = '/vehicles';

// ===== VEHICLE CRUD =====

/**
 * Get all vehicles with pagination and filters
 */
export const getVehicles = async (params?: VehicleFilterParams): Promise<PaginatedResponse<Vehicle>> => {
  return apiClient.get<PaginatedResponse<Vehicle>>(BASE_URL, params);
};

/**
 * Get all vehicles (without pagination)
 */
export const getAllVehicles = async (params?: VehicleFilterParams): Promise<Vehicle[]> => {
  return apiClient.get<Vehicle[]>(`${BASE_URL}/all`, params);
};

/**
 * Get vehicle by ID
 */
export const getVehicle = async (id: string): Promise<Vehicle> => {
  return apiClient.get<Vehicle>(`${BASE_URL}/${id}`);
};

/**
 * Get vehicles by company
 */
export const getVehiclesByCompany = async (companyId: string): Promise<Vehicle[]> => {
  return apiClient.get<Vehicle[]>(`${BASE_URL}/company/${companyId}`);
};

/**
 * Get available vehicles
 */
export const getAvailableVehicles = async (companyId: string): Promise<Vehicle[]> => {
  return apiClient.get<Vehicle[]>(`${BASE_URL}/available`, { companyId });
};

/**
 * Create vehicle (with FormData for file uploads)
 */
export const createVehicle = async (data: CreateVehicleDto): Promise<Vehicle> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Échec de la création du véhicule');
  }

  return response.json();
};

/**
 * Update vehicle (with FormData for file uploads)
 */
export const updateVehicle = async (id: string, data: UpdateVehicleDto): Promise<Vehicle> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Échec de la mise à jour du véhicule');
  }
  
  return response.json();
};

/**
 * Delete vehicle (permanent)
 */
export const deleteVehicle = async (id: string): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${id}`);
};

/**
 * Soft delete vehicle
 */
export const softDeleteVehicle = async (id: string): Promise<Vehicle> => {
  return apiClient.patch<Vehicle>(`${BASE_URL}/${id}/soft-delete`);
};

/**
 * Restore vehicle
 */
export const restoreVehicle = async (id: string): Promise<Vehicle> => {
  return apiClient.patch<Vehicle>(`${BASE_URL}/${id}/restore`);
};

/**
 * Update vehicle status
 */
export const updateVehicleStatus = async (id: string, status: string): Promise<Vehicle> => {
  return apiClient.patch<Vehicle>(`${BASE_URL}/${id}/status`, { status });
};

// ===== SCHEDULE MANAGEMENT =====

/**
 * Add schedule to vehicle
 */
export const addSchedule = async (data: {
  vehicleId: string;
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
}): Promise<VehicleStaffSchedule> => {
  return apiClient.post<VehicleStaffSchedule>(`${BASE_URL}/schedules`, data);
};

/**
 * Get schedules for vehicle
 */
export const getSchedulesForVehicle = async (vehicleId: string, date?: string): Promise<VehicleStaffSchedule[]> => {
  return apiClient.get<VehicleStaffSchedule[]>(`${BASE_URL}/${vehicleId}/schedules`, { date });
};

/**
 * Update schedule
 */
export const updateSchedule = async (id: string, data: any): Promise<VehicleStaffSchedule> => {
  return apiClient.put<VehicleStaffSchedule>(`${BASE_URL}/schedules/${id}`, data);
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (id: string): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/schedules/${id}`);
};

// ===== STAFF AND EQUIPMENT ASSIGNMENT =====

/**
 * Assign staff to vehicle
 */
export const assignStaffToVehicle = async (
  vehicleId: string,
  staffSchedules: any[]
): Promise<Vehicle> => {
  return apiClient.post<Vehicle>(`${BASE_URL}/${vehicleId}/assign-staff`, { staffSchedules });
};

/**
 * Assign equipment to vehicle
 */
export const assignEquipmentToVehicle = async (
  vehicleId: string,
  equipment: { equipmentId: string; quantity: number }[]
): Promise<Vehicle> => {
  return apiClient.post<Vehicle>(`${BASE_URL}/${vehicleId}/assign-equipment`, { equipment });
};

/**
 * Remove staff from vehicle
 */
export const removeStaffFromVehicle = async (vehicleId: string, staffId: string): Promise<Vehicle> => {
  return apiClient.delete<Vehicle>(`${BASE_URL}/${vehicleId}/staff/${staffId}`);
};

/**
 * Remove equipment from vehicle
 */
export const removeEquipmentFromVehicle = async (vehicleId: string, equipmentId: string): Promise<Vehicle> => {
  return apiClient.delete<Vehicle>(`${BASE_URL}/${vehicleId}/equipment/${equipmentId}`);
};