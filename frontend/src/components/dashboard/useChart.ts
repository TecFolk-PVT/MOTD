"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ChartConfiguration, ChartType } from "chart.js";

export function useChart<TType extends ChartType = ChartType>(
  config: ChartConfiguration<TType> | null,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<TType> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !config) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [config]);

  return canvasRef;
}
