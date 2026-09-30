"use client";

import { useCallback } from "react";
import type { Coordinates } from "@/components/LocationMapPicker";

interface WithCoords {
  latitude?: number;
  longitude?: number;
}

export function useMapPicker<T extends WithCoords>(
  formData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>
) {
  const handleMapChange = useCallback(
    ({ latitude, longitude }: Coordinates) => {
      setFormData((prev) => ({ ...prev, latitude, longitude }));
    },
    [setFormData]
  );

  return {
    latitude: formData.latitude,
    longitude: formData.longitude,
    handleMapChange,
  };
}