// src/hooks/useMissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mission,
  CreateMissionDto,
  UpdateMissionDto,
  AssignMissionDto,
  ChangeStatusDto,
  FilterMissionDto,
} from '@/types/mission.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch functions
const fetchMissions = async (params?: FilterMissionDto & { companyId?: string }) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
  }
  const url = `${API_URL}/mission?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch missions');
  return res.json();
};

const fetchMission = async (id: string) => {
  const res = await fetch(`${API_URL}/mission/${id}`);
  if (!res.ok) throw new Error('Failed to fetch mission');
  return res.json();
};

const fetchMissionByCode = async (code: string) => {
  const res = await fetch(`${API_URL}/mission/code/${code}`);
  if (!res.ok) throw new Error('Failed to fetch mission by code');
  return res.json();
};

const fetchMissionStaff = async (missionId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/staff`);
  if (!res.ok) throw new Error('Failed to fetch mission staff');
  return res.json();
};

const fetchMissionEquipment = async (missionId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/equipment`);
  if (!res.ok) throw new Error('Failed to fetch mission equipment');
  return res.json();
};

const fetchMissionEvents = async (missionId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/events`);
  if (!res.ok) throw new Error('Failed to fetch mission events');
  return res.json();
};

// Create mutation
const createMission = async (data: CreateMissionDto) => {
  const res = await fetch(`${API_URL}/mission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create mission');
  }
  return res.json();
};

// Update mutation
const updateMission = async ({ id, data }: { id: string; data: UpdateMissionDto }) => {
  const res = await fetch(`${API_URL}/mission/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update mission');
  }
  return res.json();
};

// Assign mission (vehicle + staff + equipment)
const assignMission = async ({ id, data }: { id: string; data: AssignMissionDto }) => {
  const res = await fetch(`${API_URL}/mission/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to assign mission');
  }
  return res.json();
};

// Change status
const changeMissionStatus = async ({ id, data }: { id: string; data: ChangeStatusDto }) => {
  const res = await fetch(`${API_URL}/mission/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to change mission status');
  }
  return res.json();
};

// Soft delete
const softDeleteMission = async (id: string) => {
  const res = await fetch(`${API_URL}/mission/${id}/soft-delete`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to soft delete mission');
  }
  return res.json();
};

// Restore
const restoreMission = async (id: string) => {
  const res = await fetch(`${API_URL}/mission/${id}/restore`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to restore mission');
  }
  return res.json();
};

// Delete permanently
const deleteMission = async (id: string) => {
  const res = await fetch(`${API_URL}/mission/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete mission');
  }
  return res.json();
};

// Unassign vehicle
const unassignVehicle = async (missionId: string, vehicleId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/vehicle/${vehicleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to unassign vehicle');
  }
  return res.json();
};

// Complete assignment
const completeAssignment = async (missionId: string, vehicleId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/vehicle/${vehicleId}/complete`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to complete assignment');
  }
  return res.json();
};

// Check-in staff
const checkInStaff = async (missionId: string, staffId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/staff/${staffId}/check-in`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to check in staff');
  }
  return res.json();
};

// Check-out staff
const checkOutStaff = async (missionId: string, staffId: string) => {
  const res = await fetch(`${API_URL}/mission/${missionId}/staff/${staffId}/check-out`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to check out staff');
  }
  return res.json();
};

// React Query Hooks
export const useMissions = (params?: FilterMissionDto & { companyId?: string }) => {
  return useQuery({
    queryKey: ['missions', params],
    queryFn: () => fetchMissions(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useMission = (id: string) => {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => fetchMission(id),
    enabled: !!id,
  });
};

export const useMissionByCode = (code: string) => {
  return useQuery({
    queryKey: ['mission', 'code', code],
    queryFn: () => fetchMissionByCode(code),
    enabled: !!code,
  });
};

export const useMissionStaff = (missionId: string) => {
  return useQuery({
    queryKey: ['mission', missionId, 'staff'],
    queryFn: () => fetchMissionStaff(missionId),
    enabled: !!missionId,
  });
};

export const useMissionEquipment = (missionId: string) => {
  return useQuery({
    queryKey: ['mission', missionId, 'equipment'],
    queryFn: () => fetchMissionEquipment(missionId),
    enabled: !!missionId,
  });
};

export const useMissionEvents = (missionId: string) => {
  return useQuery({
    queryKey: ['mission', missionId, 'events'],
    queryFn: () => fetchMissionEvents(missionId),
    enabled: !!missionId,
  });
};

// Mutations
export const useCreateMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMission,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id] });
    },
  });
};

export const useAssignMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignMission,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id, 'staff'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id, 'equipment'] });
    },
  });
};

export const useChangeMissionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeMissionStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id, 'events'] });
    },
  });
};

export const useSoftDeleteMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: softDeleteMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};

export const useRestoreMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};

export const useUnassignVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ missionId, vehicleId }: { missionId: string; vehicleId: string }) =>
      unassignVehicle(missionId, vehicleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mission', variables.missionId] });
    },
  });
};

export const useCompleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ missionId, vehicleId }: { missionId: string; vehicleId: string }) =>
      completeAssignment(missionId, vehicleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mission', variables.missionId] });
    },
  });
};

export const useCheckInStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ missionId, staffId }: { missionId: string; staffId: string }) =>
      checkInStaff(missionId, staffId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mission', variables.missionId, 'staff'] });
    },
  });
};

export const useCheckOutStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ missionId, staffId }: { missionId: string; staffId: string }) =>
      checkOutStaff(missionId, staffId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mission', variables.missionId, 'staff'] });
    },
  });
};