// src/hooks/useVehicles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVehicles,
  getVehicle,
  getVehiclesByCompany,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  softDeleteVehicle,
  restoreVehicle,
  updateVehicleStatus,
  getSchedulesForVehicle,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  assignStaffToVehicle,
  assignEquipmentToVehicle,
  removeStaffFromVehicle,
  removeEquipmentFromVehicle,
} from '@/lib/api/vehicles';
import { CreateVehicleDto, VehicleFilterParams } from '@/types/vehicle.types';

// ===== VEHICLE QUERIES =====

export const useVehicles = (params?: VehicleFilterParams) => {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => getVehicles(params),
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id),
    enabled: !!id,
  });
};

export const useVehiclesByCompany = (companyId: string) => {
  return useQuery({
    queryKey: ['vehicles', 'company', companyId],
    queryFn: () => getVehiclesByCompany(companyId),
    enabled: !!companyId,
  });
};

export const useAvailableVehicles = (companyId: string) => {
  return useQuery({
    queryKey: ['vehicles', 'available', companyId],
    queryFn: () => getAvailableVehicles(companyId),
    enabled: !!companyId,
  });
};

export const useSchedulesForVehicle = (vehicleId: string, date?: string) => {
  return useQuery({
    queryKey: ['vehicle-schedules', vehicleId, date],
    queryFn: () => getSchedulesForVehicle(vehicleId, date),
    enabled: !!vehicleId,
  });
};

// ===== VEHICLE MUTATIONS =====

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleDto) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateVehicle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useSoftDeleteVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: softDeleteVehicle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables] });
    },
  });
};

export const useRestoreVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restoreVehicle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables] });
    },
  });
};

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateVehicleStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
    },
  });
};

// ===== SCHEDULE MUTATIONS =====

export const useAddSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-schedules', data.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSchedule(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-schedules', data.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// ===== STAFF & EQUIPMENT MUTATIONS =====

export const useAssignStaffToVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vehicleId, staffSchedules }: { vehicleId: string; staffSchedules: any[] }) =>
      assignStaffToVehicle(vehicleId, staffSchedules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useAssignEquipmentToVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vehicleId, equipment }: { vehicleId: string; equipment: { equipmentId: string; quantity: number }[] }) =>
      assignEquipmentToVehicle(vehicleId, equipment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useRemoveStaffFromVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vehicleId, staffId }: { vehicleId: string; staffId: string }) =>
      removeStaffFromVehicle(vehicleId, staffId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useRemoveEquipmentFromVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vehicleId, equipmentId }: { vehicleId: string; equipmentId: string }) =>
      removeEquipmentFromVehicle(vehicleId, equipmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};