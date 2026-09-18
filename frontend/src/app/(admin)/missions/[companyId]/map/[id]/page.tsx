// app/missions/[companyId]/map/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Navigation,
  Activity,
} from 'lucide-react';
import MissionGpsCard from '@/components/missions/MissionGpsCard';
import { useMissionGps } from '@/hooks/useMissionGps';

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

export default function MissionMapPage() {
  const router = useRouter();
  const { companyId, id } = useParams<{ companyId: string; id: string }>();

  // ✅ hits GET /missions/:id/gps
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMissionGps(id, 15_000);

  const handleBack = () => router.push(`/missions/${companyId}/${id}`);
  const handleBackToList = () => router.push(`/missions/${companyId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          ❌ {(error as Error)?.message ?? 'Mission not found'}
          <button
            onClick={handleBackToList}
            className="mt-3 block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Missions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Mission Details
          </button>
          <button
            onClick={handleBackToList}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            All Missions
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${isFetching ? 'text-blue-600' : 'text-gray-400'
              }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isFetching ? 'animate-pulse bg-blue-500' : 'bg-gray-300'
                }`}
            />
            {isFetching ? 'Refreshing…' : 'Live every 15s'}
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Title card */}
      <div className="mb-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-black dark:text-white">
              <Navigation className="h-6 w-6 text-blue-600" />
              Mission {data.mission.code} — Live Map
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {data.patient?.fullname ?? 'Patient'} →{' '}
              {data.destination?.name ?? 'Destination'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[data.mission.status] ?? 'bg-gray-100 text-gray-800'
                }`}
            >
              {data.mission.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
              <Activity className="h-3.5 w-3.5" />
              {data.mission.priority}
            </span>
          </div>
        </div>
      </div>

      {/* The map + distance + ETA */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <MissionGpsCard data={data} />
      </div>
    </div>
  );
}