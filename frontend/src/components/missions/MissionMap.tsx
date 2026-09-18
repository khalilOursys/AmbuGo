'use client';

import { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import type { MissionGpsResponse } from '@/lib/api/mission.api';

// ==================== CUSTOM DIV ICONS ====================

/** 👤 Patient — face on a red circle */
function makePatientIcon() {
    const html = `
    <div style="
      width: 40px; height: 40px;
      background: #dc2626;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  `;

    return L.divIcon({
        html,
        className: '', // disable leaflet's default white box
        iconSize: [40, 40],
        iconAnchor: [20, 20], // center on the coord
        popupAnchor: [0, -20],
    });
}

/** 🏥 Destination — hospital cross on a green circle */
function makeDestinationIcon() {
    const html = `
    <div style="
      width: 40px; height: 40px;
      background: #16a34a;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 6v12M6 12h12"/>
      </svg>
    </div>
  `;

    return L.divIcon({
        html,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
}

/** 🚑 Vehicle — pin shape on blue */
function makeVehicleIcon() {
    const html = `
    <div style="
      width: 32px; height: 42px;
      position: relative;
    ">
      <div style="
        width: 32px; height: 32px;
        background: #2563eb;
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        color: #fff;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             style="transform: rotate(45deg);">
          <path d="M10 10H6"/>
          <path d="M8 8v4"/>
          <rect x="3" y="6" width="18" height="12" rx="2"/>
          <circle cx="7" cy="18" r="1.5"/>
          <circle cx="17" cy="18" r="1.5"/>
        </svg>
      </div>
    </div>
  `;

    return L.divIcon({
        html,
        className: '',
        iconSize: [32, 42],
        iconAnchor: [16, 42], // tip of the pin
        popupAnchor: [0, -42],
    });
}

// Instantiate once (they're immutable)
const patientIcon = makePatientIcon();
const destinationIcon = makeDestinationIcon();
const vehicleIcon = makeVehicleIcon();

// ==================== HELPERS ====================

function InvalidateOnMount() {
    const map = useMap();
    useEffect(() => {
        const fix = () => map.invalidateSize();
        fix();
        const t1 = setTimeout(fix, 100);
        const t2 = setTimeout(fix, 300);
        window.addEventListener('resize', fix);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', fix);
        };
    }, [map]);
    return null;
}

// ==================== COMPONENT ====================

interface Props {
    data: MissionGpsResponse;
    height?: number | string;
}

export default function MissionMap({ data, height = 480 }: Props) {
    const patientPos =
        data.patient?.latitude != null && data.patient?.longitude != null
            ? ([data.patient.latitude, data.patient.longitude] as [number, number])
            : null;

    const destPos =
        data.destination?.latitude != null && data.destination?.longitude != null
            ? ([data.destination.latitude, data.destination.longitude] as [
                number,
                number,
            ])
            : null;

    const vehiclePos =
        data.vehicle?.latitude != null && data.vehicle?.longitude != null
            ? ([data.vehicle.latitude, data.vehicle.longitude] as [number, number])
            : null;

    if (!patientPos && !destPos && !vehiclePos) {
        return (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                ⚠️ No GPS coordinates available for this mission.
            </div>
        );
    }

    const center: [number, number] = patientPos ?? destPos ?? vehiclePos!;
    const h = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className="relative w-full overflow-hidden rounded-md border border-stroke dark:border-strokedark"
            style={{ height: h }}
        >
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <InvalidateOnMount />

                {/* 👤 Patient */}
                {patientPos && (
                    <Marker position={patientPos} icon={patientIcon}>
                        <Popup>
                            <strong>👤 Patient</strong>
                            <br />
                            {data.patient?.fullname}
                            <br />
                            {data.patient?.address ?? '—'}
                        </Popup>
                    </Marker>
                )}

                {/* 🏥 Destination */}
                {destPos && (
                    <Marker position={destPos} icon={destinationIcon}>
                        <Popup>
                            <strong>🏥 Destination</strong>
                            <br />
                            {data.destination?.name}
                            <br />
                            {data.destination?.address ?? '—'}
                        </Popup>
                    </Marker>
                )}

                {/* 🚑 Vehicle */}
                {vehiclePos && (
                    <Marker position={vehiclePos} icon={vehicleIcon}>
                        <Popup>
                            <strong>🚑 Vehicle</strong>
                            <br />
                            {data.vehicle?.registration}
                        </Popup>
                    </Marker>
                )}

                {/* Route line patient → destination */}
                {patientPos && destPos && (
                    <Polyline
                        positions={[patientPos, destPos]}
                        pathOptions={{ color: '#dc2626', weight: 3, dashArray: '6,6' }}
                    />
                )}
            </MapContainer>
        </div>
    );
}