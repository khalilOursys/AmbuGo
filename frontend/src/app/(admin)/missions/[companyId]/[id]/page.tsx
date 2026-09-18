'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  User,
  MapPin,
  Building2,
  Calendar,
  Activity,
  BadgeCheck,
  Ambulance,
  Navigation,
} from 'lucide-react';

import { useMission } from '@/hooks/useMissions';

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  EN_ROUTE: 'bg-yellow-100 text-yellow-800',
  ON_SCENE: 'bg-orange-100 text-orange-800',
  TRANSPORTING: 'bg-purple-100 text-purple-800',
  ARRIVED_HOSPITAL: 'bg-cyan-100 text-cyan-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ViewMissionPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;
  const missionId = params.id as string;

  const { data: mission, isLoading, isError, error } = useMission(
    missionId
  );

  const handleBack = () => router.push(`/missions/${companyId}`);
  const handleEdit = () =>
    router.push(`/missions/${companyId}/edit/${missionId}`);
  const handleViewMap = () =>
    router.push(`/missions/${companyId}/map/${missionId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isError || !mission) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          ❌ {(error as Error)?.message ?? 'Mission not found'}
          <button
            onClick={handleBack}
            className="mt-3 block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const primaryAssignment = mission.assignments?.[0];
  const vehicle = primaryAssignment?.vehicle;
  const staffMembers = primaryAssignment?.staffMembers ?? [];

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Missions
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleViewMap}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <Navigation className="h-5 w-5" />
            View Map
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            <Edit className="h-5 w-5" />
            Edit Mission
          </button>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
              <Activity className="h-6 w-6" />
              Mission {mission.code}
            </h3>
            <p className="mt-1 text-sm text-gray-500">ID: {mission.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[mission.priority] ?? priorityColors.NORMAL
                }`}
            >
              {mission.priority}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[mission.status] ?? 'bg-gray-100 text-gray-800'
                }`}
            >
              {mission.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${mission.isDeleted
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}
            >
              {mission.isDeleted ? 'Deleted' : 'Active'}
            </span>
          </div>
        </div>

        <div className="p-6.5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Patient */}
            <InfoCard title="Patient" icon={<User className="h-5 w-5" />}>
              {mission.patient ? (
                <>
                  <InfoRow
                    label="Name"
                    value={`${mission.patient.firstname} ${mission.patient.lastname}`}
                  />
                  <InfoRow
                    label="Phone"
                    value={mission.patient.phone}
                    href={
                      mission.patient.phone
                        ? `tel:${mission.patient.phone}`
                        : undefined
                    }
                  />
                  <InfoRow label="Gender" value={mission.patient.gender} />
                  <InfoRow label="Address" value={mission.patient.address} />
                  <InfoRow
                    label="GPS"
                    value={
                      mission.patient.latitude != null &&
                        mission.patient.longitude != null
                        ? `${mission.patient.latitude.toFixed(
                          5,
                        )}, ${mission.patient.longitude.toFixed(5)}`
                        : null
                    }
                  />
                </>
              ) : (
                <p className="text-sm text-gray-500">No patient linked</p>
              )}
            </InfoCard>

            {/* Destination */}
            <InfoCard title="Destination" icon={<MapPin className="h-5 w-5" />}>
              {mission.location ? (
                <>
                  <InfoRow label="Name" value={mission.location.name} />
                  <InfoRow label="Type" value={mission.location.type} />
                  <InfoRow label="Address" value={mission.location.address} />
                  <InfoRow
                    label="GPS"
                    value={
                      mission.location.latitude != null &&
                        mission.location.longitude != null
                        ? `${mission.location.latitude.toFixed(
                          5,
                        )}, ${mission.location.longitude.toFixed(5)}`
                        : null
                    }
                  />
                </>
              ) : (
                <p className="text-sm text-gray-500">No destination linked</p>
              )}
            </InfoCard>

            {/* Pickup */}
            <InfoCard title="Pickup" icon={<Navigation className="h-5 w-5" />}>
              <InfoRow label="Address" value={mission.pickupAddress} />
              <InfoRow
                label="GPS"
                value={
                  mission.latitude != null && mission.longitude != null
                    ? `${mission.latitude.toFixed(
                      5,
                    )}, ${mission.longitude.toFixed(5)}`
                    : null
                }
              />
              <InfoRow label="Reason" value={mission.reason} />
            </InfoCard>

            {/* Customer / Contract */}
            <InfoCard
              title="Customer & Contract"
              icon={<Building2 className="h-5 w-5" />}
            >
              <InfoRow label="Customer" value={mission.customer?.name} />
              <InfoRow
                label="Contract"
                value={
                  mission.contract
                    ? `${mission.contract.reference} — ${mission.contract.title}`
                    : null
                }
              />
              <InfoRow label="Company" value={mission.company?.name} />
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline" icon={<Calendar className="h-5 w-5" />}>
              <InfoRow
                label="Call Date"
                value={new Date(mission.callDate).toLocaleString()}
              />
              <InfoRow
                label="Dispatched"
                value={
                  mission.dispatchedAt
                    ? new Date(mission.dispatchedAt).toLocaleString()
                    : null
                }
              />
              <InfoRow
                label="On Scene"
                value={
                  mission.arrivedSceneAt
                    ? new Date(mission.arrivedSceneAt).toLocaleString()
                    : null
                }
              />
              <InfoRow
                label="Transporting"
                value={
                  mission.transportedAt
                    ? new Date(mission.transportedAt).toLocaleString()
                    : null
                }
              />
              <InfoRow
                label="Completed"
                value={
                  mission.completedAt
                    ? new Date(mission.completedAt).toLocaleString()
                    : null
                }
              />
            </InfoCard>

            {/* Vehicle & Staff */}
            <InfoCard
              title="Assigned Vehicle & Staff"
              icon={<Ambulance className="h-5 w-5" />}
            >
              {vehicle ? (
                <>
                  <InfoRow label="Registration" value={vehicle.registration} />
                  <InfoRow
                    label="Model"
                    value={
                      vehicle.brand || vehicle.model
                        ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()
                        : null
                    }
                  />
                  <InfoRow label="Level" value={vehicle.level} />
                  <InfoRow label="Status" value={vehicle.status} />
                  {staffMembers.length > 0 && (
                    <div className="border-t border-stroke pt-2 dark:border-strokedark">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        Staff ({staffMembers.length})
                      </p>
                      <ul className="space-y-1">
                        {staffMembers.map((s: any) => (
                          <li key={s.id} className="text-sm">
                            {s.staff
                              ? `${s.staff.firstname} ${s.staff.lastname} (${s.staff.type})`
                              : '—'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No vehicle assigned</p>
              )}
            </InfoCard>

            {/* CTA to map page */}
            <div className="md:col-span-2">
              <div className="flex flex-col items-center justify-between gap-4 rounded-md border border-blue-200 bg-blue-50 p-5 sm:flex-row dark:border-blue-900 dark:bg-blue-950">
                <div className="flex items-center gap-3">
                  <Navigation className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      GPS, distance & estimated time
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Open the dedicated map page
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewMap}
                  className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Open Map →
                </button>
              </div>
            </div>

            {/* Notes */}
            {mission.notes && (
              <div className="md:col-span-2">
                <InfoCard title="Notes" icon={<BadgeCheck className="h-5 w-5" />}>
                  <p className="whitespace-pre-wrap text-sm text-black dark:text-white">
                    {mission.notes}
                  </p>
                </InfoCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Sub-components ----------------

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-stroke p-4 dark:border-strokedark">
      <h4 className="mb-3 flex items-center gap-2 border-b border-stroke pb-2 text-sm font-semibold text-black dark:border-strokedark dark:text-white">
        {icon}
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string | null | undefined;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-gray-500 dark:text-gray-400">
        {label}:
      </span>
      {value ? (
        href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="break-all text-right text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            {value}
          </a>
        ) : (
          <span className="break-all text-right text-black dark:text-white">
            {value}
          </span>
        )
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  );
}