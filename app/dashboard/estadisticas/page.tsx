"use client";

import { useMemo, useRef, useState } from "react";
import { useIncidents } from "@/context/incidents-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Printer,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  type Incident,
  type IncidentStatus,
  type IncidentType,
} from "@/lib/types";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { ChartLegendList } from "@/components/dashboard/chart-legend-list";
import { EmptyChartState } from "@/components/dashboard/empty-chart-state";
import {
  CHART,
  STATUS_CHART_COLORS,
  TYPE_CHART_COLORS,
  CHART_TICK,
  CHART_TICK_SM,
} from "@/components/dashboard/chart-styles";

type PeriodFilter = "7d" | "30d" | "90d" | "all";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
  all: "Todo el historial",
};

function filterByPeriod(incidents: Incident[], period: PeriodFilter) {
  if (period === "all") return incidents;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return incidents.filter((i) => new Date(i.fechaCreacion) >= cutoff);
}

export default function EstadisticasPage() {
  const { incidents } = useIncidents();
  const printRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<PeriodFilter>("30d");

  const filteredIncidents = useMemo(
    () => filterByPeriod(incidents, period),
    [incidents, period]
  );

  const stats = useMemo(() => {
    const total = filteredIncidents.length;

    const porEstado = Object.keys(INCIDENT_STATUS_LABELS)
      .map((status) => ({
        name: INCIDENT_STATUS_LABELS[status as IncidentStatus],
        value: filteredIncidents.filter((i) => i.estado === status).length,
        status: status as IncidentStatus,
      }))
      .filter((item) => item.value > 0);

    const porTipo = Object.keys(INCIDENT_TYPE_LABELS)
      .map((tipo) => ({
        name: INCIDENT_TYPE_LABELS[tipo as IncidentType],
        value: filteredIncidents.filter((i) => i.tipo === tipo).length,
        tipo: tipo as IncidentType,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const porUbicacion = filteredIncidents.reduce(
      (acc, inc) => {
        const loc = inc.ubicacionTexto.split(" - ")[0];
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const ubicacionData = Object.entries(porUbicacion)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const resueltos = filteredIncidents.filter((i) => i.estado === "resuelto").length;
    const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;

    return { total, porEstado, porTipo, ubicacionData, tasaResolucion, resueltos };
  }, [filteredIncidents]);

  const hasData = stats.total > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estadísticas</h1>
            <p className="text-muted-foreground text-sm">
              Resumen de incidentes — {PERIOD_LABELS[period]}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[200px] bg-input/50">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PERIOD_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <div ref={printRef} className="print-container space-y-6">
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold text-center text-black">
            Reporte de Incidentes - Universidad de la Amazonia
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Periodo: {PERIOD_LABELS[period]} — Generado el{" "}
            {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/80 border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-status-reported/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-reported/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-status-reported" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reportados</p>
                  <p className="text-2xl font-bold tabular-nums text-status-reported">
                    {stats.porEstado.find((s) => s.status === "reportado")?.value ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-status-in-progress/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-in-progress/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-status-in-progress" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En proceso</p>
                  <p className="text-2xl font-bold tabular-nums text-status-in-progress">
                    {stats.porEstado.find((s) => s.status === "en_proceso")?.value ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-status-resolved/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-resolved/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-status-resolved" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resueltos</p>
                  <p className="text-2xl font-bold tabular-nums text-status-resolved">
                    {stats.resueltos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasData ? (
          <Card className="bg-card/80">
            <CardContent className="py-8">
              <EmptyChartState />
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Donut por estado */}
            <Card className="bg-card/80 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Por estado</CardTitle>
                <CardDescription>Distribución del periodo seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.porEstado.length === 0 ? (
                  <EmptyChartState message="Sin incidentes por estado" />
                ) : (
                  <>
                    <div className="h-[220px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.porEstado}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="oklch(0.13 0.01 260)"
                            strokeWidth={2}
                          >
                            {stats.porEstado.map((entry) => (
                              <Cell
                                key={entry.status}
                                fill={STATUS_CHART_COLORS[entry.status]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold tabular-nums">{stats.total}</span>
                        <span className="text-xs text-muted-foreground">total</span>
                      </div>
                    </div>
                    <ChartLegendList
                      items={stats.porEstado.map((e) => ({
                        label: e.name,
                        value: e.value,
                        color: STATUS_CHART_COLORS[e.status],
                      }))}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tasa de resolución */}
            <Card className="bg-card/80 border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Tasa de resolución</CardTitle>
                <CardDescription>Incidentes marcados como resueltos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative h-44 w-44">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 100 100"
                      aria-hidden
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={CHART.mutedRing}
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={CHART.primary}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${stats.tasaResolucion * 2.64} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold tabular-nums text-primary">
                        {stats.tasaResolucion}%
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">resueltos</span>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{stats.resueltos}</span> de{" "}
                    <span className="font-semibold text-foreground">{stats.total}</span> incidentes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Por tipo — barras horizontales */}
            <Card className="bg-card/80 border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Por tipo de incidente</CardTitle>
                <CardDescription>Categorías con al menos un reporte</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.porTipo.length === 0 ? (
                  <EmptyChartState message="Sin datos por tipo" />
                ) : (
                  <div
                    className="min-h-[220px] w-full"
                    style={{ height: Math.max(220, stats.porTipo.length * 48) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.porTipo}
                        layout="vertical"
                        margin={{ top: 4, right: 36, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART.grid}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={CHART_TICK_SM}
                          axisLine={{ stroke: CHART.grid }}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          tick={CHART_TICK}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(0.25 0.01 260 / 0.5)" }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                          {stats.porTipo.map((entry) => (
                            <Cell key={entry.tipo} fill={TYPE_CHART_COLORS[entry.tipo]} />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="right"
                            fill={CHART.axis}
                            fontSize={12}
                            fontWeight={600}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top ubicaciones */}
            <Card className="bg-card/80 border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Top ubicaciones</CardTitle>
                <CardDescription>Lugares con más reportes en el periodo</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.ubicacionData.length === 0 ? (
                  <EmptyChartState message="Sin datos por ubicación" />
                ) : (
                  <div
                    className="min-h-[200px] w-full"
                    style={{ height: Math.max(200, stats.ubicacionData.length * 52) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.ubicacionData}
                        layout="vertical"
                        margin={{ top: 4, right: 36, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART.grid}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={CHART_TICK_SM}
                          axisLine={{ stroke: CHART.grid }}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          tick={CHART_TICK}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(0.25 0.01 260 / 0.5)" }} />
                        <Bar dataKey="value" fill={CHART.primary} radius={[0, 6, 6, 0]} barSize={32}>
                          <LabelList
                            dataKey="value"
                            position="right"
                            fill={CHART.axis}
                            fontSize={12}
                            fontWeight={600}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="hidden print:block mt-8">
          <h2 className="text-lg font-bold mb-4 text-black">Resumen de datos</h2>
          <table className="w-full border-collapse border border-gray-300 text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Métrica</th>
                <th className="border border-gray-300 p-2 text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Total</td>
                <td className="border border-gray-300 p-2">{stats.total}</td>
              </tr>
              {stats.porEstado.map((item) => (
                <tr key={item.status}>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">{item.value}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2">Tasa de resolución</td>
                <td className="border border-gray-300 p-2">{stats.tasaResolucion}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
