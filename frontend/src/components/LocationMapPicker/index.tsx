"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { LocationMapPickerProps } from "./types";

// Re-export types so consumers can import from one place
export type { LocationMapPickerProps, Coordinates } from "./types";

const LocationMapPickerClient = dynamic(
    () => import("./LocationMapPicker"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-stroke bg-gray-100 dark:border-form-strokedark dark:bg-form-input">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

export default function LocationMapPicker(props: LocationMapPickerProps) {
    return <LocationMapPickerClient {...props} />;
}