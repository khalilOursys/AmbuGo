// src/modules/mission/dto/mission-location.dto.ts
export class MissionLocationDto {
  missionId: string;
}

export class CoordinatesDto {
  latitude: number;
  longitude: number;
}

export class MissionGpsResponseDto {
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
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  } | null;
  distance: {
    patientToPickupKm: number | null;
    pickupToDestinationKm: number | null;
    totalKm: number | null;
  };
  vehicle: {
    id: string;
    registration: string;
    latitude: number | null;
    longitude: number | null;
    lastUpdate: Date | null;
  } | null;
}
