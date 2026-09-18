'use client';

import type { MissionGpsResponse } from '@/lib/api/mission.api';
import MissionMapWrapper from './MissionMapWrapper';

export default function MissionGpsCard({
    data,
}: {
    data: MissionGpsResponse;
}) {
    const { patient, destination, distance, estimatedTime, vehicle } = data;

    const km = distance.patientToDestinationKm;
    const minutes = estimatedTime?.minutes ?? 0;
    const isLong = minutes >= 120;
    const isVeryLong = minutes >= 360;

    return (
        <div className="space-y-4">
            {/* Distance + ETA */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-900 dark:bg-red-950">
                    <p className="text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-300">
                        Distance
                    </p>
                    <p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-200">
                        {km != null ? `${km} km` : '—'}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {patient?.fullname ?? 'Patient'} →{' '}
                        {destination?.name ?? 'Destination'}
                    </p>
                </div>

                <div
                    className={`rounded-xl border p-5 text-center ${isVeryLong
                            ? 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950'
                            : isLong
                                ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'
                                : 'border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                        }`}
                >
                    <p
                        className={`text-xs font-medium uppercase tracking-wider ${isVeryLong
                                ? 'text-purple-600 dark:text-purple-300'
                                : isLong
                                    ? 'text-orange-600 dark:text-orange-300'
                                    : 'text-blue-600 dark:text-blue-300'
                            }`}
                    >
                        Estimated Time
                    </p>
                    <p
                        className={`mt-1 text-3xl font-bold ${isVeryLong
                                ? 'text-purple-700 dark:text-purple-200'
                                : isLong
                                    ? 'text-orange-700 dark:text-orange-200'
                                    : 'text-blue-700 dark:text-blue-200'
                            }`}
                    >
                        {estimatedTime?.human ?? '—'}
                    </p>
                    {estimatedTime?.etaLocal && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            Arrives ~{estimatedTime.etaLocal}
                        </p>
                    )}
                    {estimatedTime?.source && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                            via {estimatedTime.source}
                        </p>
                    )}
                    {isLong && (
                        <p className="mt-1 text-xs font-medium">
                            {isVeryLong ? '🚨 Long-distance transfer' : '⚠️ Long trip'}
                        </p>
                    )}
                </div>
            </div>

            {/* Map */}
            <MissionMapWrapper data={data} height={480} />

            {/* Patient / Destination info */}
            <div className="grid gap-4 md:grid-cols-2">
                {patient && (
                    <div className="rounded-md border border-stroke p-4 dark:border-strokedark">
                        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            👤 Patient
                        </h3>
                        <p className="text-sm">
                            <span className="text-gray-500">Name: </span>
                            {patient.fullname}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Phone: </span>
                            {patient.phone ?? '—'}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Address: </span>
                            {patient.address ?? '—'}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">GPS: </span>
                            <span className="font-mono text-xs">
                                {patient.latitude != null && patient.longitude != null
                                    ? `${patient.latitude.toFixed(5)}, ${patient.longitude.toFixed(5)}`
                                    : '—'}
                            </span>
                        </p>
                    </div>
                )}

                {destination && (
                    <div className="rounded-md border border-stroke p-4 dark:border-strokedark">
                        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            🏥 Destination
                        </h3>
                        <p className="text-sm">
                            <span className="text-gray-500">Name: </span>
                            {destination.name}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Type: </span>
                            {destination.type}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">Address: </span>
                            {destination.address ?? '—'}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-500">GPS: </span>
                            <span className="font-mono text-xs">
                                {destination.latitude != null && destination.longitude != null
                                    ? `${destination.latitude.toFixed(5)}, ${destination.longitude.toFixed(5)}`
                                    : '—'}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Vehicle */}
            {vehicle && (
                <div className="rounded-md border border-stroke p-4 dark:border-strokedark">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        🚑 Assigned Vehicle
                    </h3>
                    <p className="text-sm">
                        <span className="text-gray-500">Registration: </span>
                        {vehicle.registration}
                    </p>
                    <p className="text-sm">
                        <span className="text-gray-500">Live GPS: </span>
                        <span className="font-mono text-xs">
                            {vehicle.latitude != null && vehicle.longitude != null
                                ? `${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`
                                : 'No signal'}
                        </span>
                    </p>
                    {vehicle.lastUpdate && (
                        <p className="mt-1 text-xs text-gray-400">
                            Last update: {new Date(vehicle.lastUpdate).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}