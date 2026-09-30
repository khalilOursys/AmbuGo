"use client";

import React, { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Crosshair, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Coordinates, LocationMapPickerProps } from "./types";
import { useGeolocation } from "./useGeolocation";

const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815]; // Tunisia

/* ------------------------------------------------------------------ */
/* Custom pin icon — pure SVG, no external files, never 404s           */
/* ------------------------------------------------------------------ */

const PIN_ICON = L.divIcon({
    className: "",
    html: `
    <div style="
      position: relative;
      width: 30px;
      height: 42px;
      transform: translate(-15px, -42px);
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
    ">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           width="30" height="42" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"
           stroke-linejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="#ffffff" stroke="none"/>
      </svg>
    </div>
  `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
});

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

function MapClickHandler({
    onChange,
    enabled,
}: {
    onChange: (lat: number, lng: number) => void;
    enabled: boolean;
}) {
    useMapEvents({
        click(e) {
            if (!enabled) return;
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({
    latitude,
    longitude,
    zoom,
}: {
    latitude?: number;
    longitude?: number;
    zoom: number;
}) {
    const map = useMapEvents({});
    useEffect(() => {
        if (latitude !== undefined && longitude !== undefined) {
            map.setView([latitude, longitude], zoom, { animate: true });
        }
    }, [latitude, longitude, zoom, map]);
    return null;
}

/** Forces Leaflet to remeasure the container after mount.
 *  Prevents mis-positioned markers/controls in flex/grid layouts. */
function InvalidateOnReady() {
    const map = useMapEvents({});
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(t);
    }, [map]);
    return null;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function LocationMapPicker({
    latitude,
    longitude,
    onChange,
    onReady,
    height = 400,
    zoom = 13,
    defaultZoom = 7,
    defaultCenter = DEFAULT_CENTER,
    showLocateButton = true,
    showClearButton = true,
    showReadout = true,
    showHint = true,
    className = "",
    readOnly = false,
}: LocationMapPickerProps) {
    const { locate } = useGeolocation();

    /** Local source of truth so the pin appears instantly on click,
     *  even before the parent state catches up. */
    const [picked, setPicked] = useState<Coordinates>({
        latitude,
        longitude,
    });

    // Sync from props (e.g. edit page loads data asynchronously)
    useEffect(() => {
        setPicked({ latitude, longitude });
    }, [latitude, longitude]);

    const hasCoords =
        picked.latitude !== undefined && picked.longitude !== undefined;

    const center: [number, number] = hasCoords
        ? [picked.latitude!, picked.longitude!]
        : defaultCenter;

    /** Update local state (instant pin) + notify parent */
    const commit = (coords: Coordinates) => {
        setPicked(coords);
        onChange(coords);
    };

    const handleMapClick = (lat: number, lng: number) => {
        commit({ latitude: lat, longitude: lng });
    };

    const handleLocate = async () => {
        try {
            const pos = await locate();
            commit({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = () => {
        commit({ latitude: undefined, longitude: undefined });
    };

    const numericHeight =
        typeof height === "number" ? `${height}px` : height;

    return (
        <div
            className={`relative overflow-hidden rounded-lg border border-stroke dark:border-form-strokedark ${className}`}
            style={{ height: numericHeight }}
        >
            <MapContainer
                center={center}
                zoom={hasCoords ? zoom : defaultZoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
                whenReady={onReady}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <InvalidateOnReady />

                <MapClickHandler enabled={!readOnly} onChange={handleMapClick} />

                <RecenterMap
                    latitude={picked.latitude}
                    longitude={picked.longitude}
                    zoom={zoom}
                />

                {hasCoords && (
                    <Marker
                        position={[picked.latitude!, picked.longitude!]}
                        icon={PIN_ICON}
                        draggable={!readOnly}
                        eventHandlers={{
                            dragend: (e) => {
                                const m = e.target as L.Marker;
                                const { lat, lng } = m.getLatLng();
                                commit({ latitude: lat, longitude: lng });
                            },
                        }}
                    />
                )}
            </MapContainer>

            {/* Hint */}
            {showHint && !readOnly && (
                <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow dark:bg-gray-800/90 dark:text-gray-200">
                    Click on the map to set coordinates
                </div>
            )}

            {/* Readout */}
            {showReadout && (
                <div className="pointer-events-none absolute bottom-2 right-2 z-[1000] rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow dark:bg-gray-800/90 dark:text-gray-200">
                    {hasCoords
                        ? `Lat: ${picked.latitude!.toFixed(6)}, Lng: ${picked.longitude!.toFixed(6)}`
                        : "No coordinates selected"}
                </div>
            )}

            {/* Locate button */}
            {showLocateButton && !readOnly && (
                <button
                    type="button"
                    onClick={handleLocate}
                    title="Use my location"
                    className="absolute top-2 right-2 z-[1000] rounded-md bg-white p-2 text-gray-600 shadow transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <Crosshair className="h-4 w-4" />
                </button>
            )}

            {/* Clear button */}
            {showClearButton && hasCoords && !readOnly && (
                <button
                    type="button"
                    onClick={handleClear}
                    title="Clear coordinates"
                    className={`absolute top-2 z-[1000] rounded-md bg-white p-2 text-gray-600 shadow transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${showLocateButton ? "right-12" : "right-2"
                        }`}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}