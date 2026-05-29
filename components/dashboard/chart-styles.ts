import type { IncidentStatus, IncidentType } from "@/lib/types";

/** Colores alineados con globals.css — legibles en tema oscuro */
export const CHART = {
  grid: "oklch(0.32 0.01 260)",
  axis: "oklch(0.72 0 0)",
  axisMuted: "oklch(0.55 0 0)",
  tooltipBg: "oklch(0.18 0.01 260)",
  tooltipBorder: "oklch(0.35 0.01 260)",
  primary: "oklch(0.72 0.19 155)",
  mutedRing: "oklch(0.28 0.01 260)",
};

export const STATUS_CHART_COLORS: Record<IncidentStatus, string> = {
  reportado: "oklch(0.78 0.16 85)",
  en_proceso: "oklch(0.68 0.17 230)",
  resuelto: "oklch(0.72 0.19 155)",
};

export const TYPE_CHART_COLORS: Record<IncidentType, string> = {
  bano: "oklch(0.68 0.17 230)",
  electricidad: "oklch(0.78 0.16 85)",
  infraestructura: "oklch(0.70 0.18 45)",
  seguridad: "oklch(0.62 0.20 25)",
  limpieza: "oklch(0.72 0.19 155)",
  otro: "oklch(0.58 0.02 260)",
};

export const CHART_TICK = { fill: CHART.axis, fontSize: 12 };
export const CHART_TICK_SM = { fill: CHART.axisMuted, fontSize: 11 };
