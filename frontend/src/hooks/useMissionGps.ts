'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchMission,
  fetchMissionGps,
  fetchMissions,
  type MissionDetail,
  type MissionGpsResponse,
  type PaginatedMissions,
} from '@/lib/api/mission.api';

export const missionsKey = (
  companyId: string,
  params: { page?: number; limit?: number; search?: string } = {},
) => ['missions', companyId, params] as const;

export const missionKey = (missionId: string) =>
  ['mission', missionId] as const;

export const missionGpsKey = (missionId: string) =>
  ['mission-gps', missionId] as const;

// ============ LIST ============
export function useMissions(
  companyId: string,
  opts: {
    page?: number;
    limit?: number;
    search?: string;
    refetchIntervalMs?: number | false;
  } = {},
) {
  const { refetchIntervalMs = false, ...params } = opts;

  return useQuery<PaginatedMissions, Error>({
    queryKey: missionsKey(companyId, params),
    queryFn: ({ signal }) => fetchMissions(companyId, params, signal),
    enabled: !!companyId,
    refetchInterval: refetchIntervalMs,
  });
}

// ============ DETAIL ============
export function useMission(
  missionId: string,
  refetchIntervalMs: number | false = false,
) {
  return useQuery<MissionDetail, Error>({
    queryKey: missionKey(missionId),
    queryFn: ({ signal }) => fetchMission(missionId, signal),
    enabled: !!missionId,
    refetchInterval: refetchIntervalMs,
  });
}

// ============ GPS (uses /missions/:id/gps) ============
export function useMissionGps(
  missionId: string,
  refetchIntervalMs: number | false = false,
) {
  return useQuery<MissionGpsResponse, Error>({
    queryKey: missionGpsKey(missionId),
    queryFn: ({ signal }) => fetchMissionGps(missionId, signal),
    enabled: !!missionId,
    refetchInterval: refetchIntervalMs,
  });
}