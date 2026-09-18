'use client';

import dynamic from 'next/dynamic';
import type { MissionGpsResponse } from '@/lib/api/mission.api';

const MissionMap = dynamic(() => import('./MissionMap'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[480px] items-center justify-center rounded-md border border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
            <span className="text-sm text-gray-500">Loading map…</span>
        </div>
    ),
});

export default function MissionMapWrapper({
    data,
    height,
}: {
    data: MissionGpsResponse;
    height?: number | string;
}) {
    return <MissionMap data={data} height={height} />;
}