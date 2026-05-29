"use client";

import type { TooltipProps } from "recharts";

export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = label ?? item.name ?? "";
  const value = item.value ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="text-xs text-muted-foreground">{name}</p>
      <p className="text-lg font-semibold text-foreground tabular-nums">
        {value} {value === 1 ? "incidente" : "incidentes"}
      </p>
    </div>
  );
}
