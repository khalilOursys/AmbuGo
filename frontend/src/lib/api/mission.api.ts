const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ==================== TYPES ====================

export interface MissionListItem {
  id: string;
  code: string;
  priority: string;
  status: string;
  reason: string | null;
  pickupAddress: string | null;
  destination: string | null;
  callDate: string;
  completedAt: string | null;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
  location: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface PaginatedMissions {
  data: MissionListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MissionDetail {
  id: string;
  code: string;
  priority: string;
  status: string;
  reason: string | null;
  pickupAddress: string | null;
  destination: string | null;
  latitude: number | null;
  longitude: number | null;
  callDate: string;
  dispatchedAt: string | null;
  arrivedSceneAt: string | null;
  transportedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  customer: { id: string; name: string } | null;
  contract: { id: string; reference: string; title: string } | null;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
    phone: string | null;
    gender: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  location: {
    id: string;
    name: string;
    type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  company: { id: string; name: string } | null;

  assignments: Array<{
    id: string;
    assignedAt: string;
    isComplete: boolean;
    vehicle: {
      id: string;
      registration: string;
      brand: string | null;
      model: string | null;
      level: string;
      status: string;
      gpsPositions?: Array<{
        id: string;
        latitude: number;
        longitude: number;
        createdAt: string;
      }>;
    } | null;
    staffMembers: Array<{
      id: string;
      staff: {
        id: string;
        firstname: string;
        lastname: string;
        type: string;
      } | null;
    }>;
  }>;
}

// ✅ Shape returned by GET /mission/:id/gps
export interface MissionGpsResponse {
  mission: {
    id: string;
    code: string;
    status: string;
    priority: string;
    pickupAddress: string | null;
  };
  patient: {
    id: string;
    fullname: string;
    phone: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  pickup: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  };
  destination: {
    id: string;
    name: string;
    type: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  } | null;
  distance: {
    patientToDestinationKm: number | null;
  };
  estimatedTime: {
    minutes: number;
    human: string;
    etaIso: string;
    etaLocal: string;
    speedKmh?: number;
    source: 'OSRM' | 'HAVERSINE';
  } | null;
  vehicle: {
    id: string;
    registration: string;
    latitude: number | null;
    longitude: number | null;
    lastUpdate: string | null;
  } | null;
}

// ==================== ERROR ====================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==================== FETCH ====================

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(
      res.status,
      (body as { message?: string })?.message ??
        `Request failed with status ${res.status}`,
      body,
    );
  }

  return (await res.json()) as T;
}

// ==================== ENDPOINTS ====================

export function fetchMissions(
  companyId: string,
  params: { page?: number; limit?: number; search?: string } = {},
  signal?: AbortSignal,
): Promise<PaginatedMissions> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  qs.set('companyId', companyId);

  return apiFetch<PaginatedMissions>(`/mission?${qs.toString()}`, { signal });
}

export function fetchMission(
  missionId: string,
  signal?: AbortSignal,
): Promise<MissionDetail> {
  return apiFetch<MissionDetail>(`/mission/${missionId}`, { signal });
}

// ✅ Dedicated GPS endpoint
export function fetchMissionGps(
  missionId: string,
  signal?: AbortSignal,
): Promise<MissionGpsResponse> {
  return apiFetch<MissionGpsResponse>(`/mission/${missionId}/gps`, { signal });
}