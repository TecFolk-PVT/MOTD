"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { FabricUnitValue } from "@/lib/fabrics";

export type MeasurementUnit = FabricUnitValue; // "meters" | "wara"

const DEFAULT_UNIT: MeasurementUnit = "meters";

/**
 * Fetches the authenticated customer's preferred measurement unit
 * (meters or wara) from /api/customer/customerSettings.
 * Falls back to "meters" when not logged in / on error.
 */
export function useMeasurementUnit() {
  const [unit, setUnit] = useState<MeasurementUnit>(DEFAULT_UNIT);

  useEffect(() => {
    let cancelled = false;

    const fetchUnit = async () => {
      try {
        const res = await api.get<{ measurementUnit?: MeasurementUnit }>(
          "/api/customer/customerSettings",
        );
        if (cancelled) return;
        if (res.measurementUnit === "meters" || res.measurementUnit === "wara") {
          setUnit(res.measurementUnit);
        }
      } catch {
        // Not authenticated / API unavailable → keep default (meters)
        if (cancelled) return;
        setUnit(DEFAULT_UNIT);
      }
    };

    fetchUnit();

    return () => {
      cancelled = true;
    };
  }, []);

  const isWara = unit === "wara";

  const formatLength = useCallback(
    (valueInMeters: number | null | undefined): string => {
      if (valueInMeters == null || !Number.isFinite(valueInMeters)) return "";
      if (isWara) {
        const wara = valueInMeters / 0.9144;
        return `${wara.toFixed(2)} wara`;
      }
      return `${valueInMeters.toFixed(2)} m`;
    },
    [isWara],
  );

  return { unit, isWara, formatLength };
}

