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
  Legend,
} from "recharts";
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  type Incident,
  type IncidentStatus,
  type IncidentType,
} from "@/lib/types";

const STATUS_COLORS: Record<IncidentStatus, string> = {
  reportado: "#eab308",
  en_proceso: "#3b82f6",
  resuelto: "#22c55e",
};

const TYPE_COLORS: Record<IncidentType, string> = {
  bano: "#3b82f6",
  electricidad: "#eab308",
  infraestructura: "#f97316",
  seguridad: "#ef4444",
  limpieza: "#22c55e",
  otro: "#6b7280",
};

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

    // By status
    const porEstado = Object.keys(INCIDENT_STATUS_LABELS).map((status) => ({
      name: INCIDENT_STATUS_LABELS[status as IncidentStatus],
      value: filteredIncidents.filter((i) => i.estado === status).length,
      status: status as IncidentStatus,
    }));

    // By type
    const porTipo = Object.keys(INCIDENT_TYPE_LABELS).map((tipo) => ({
      name: INCIDENT_TYPE_LABELS[tipo as IncidentType],
      value: filteredIncidents.filter((i) => i.tipo === tipo).length,
      tipo: tipo as IncidentType,
    })).filter((item) => item.value > 0);

    // By location
    const porUbicacion = filteredIncidents.reduce(
      (acc, inc) => {
        const loc = inc.ubicacionTexto;
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const ubicacionData = Object.entries(porUbicacion)
      .map(([name, value]) => ({ name: name.split(" - ")[0], value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Resolution rate
    const resueltos = filteredIncidents.filter((i) => i.estado === "resuelto").length;
    const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;

    return { total, porEstado, porTipo, ubicacionData, tasaResolucion };
  }, [filteredIncidents]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estadísticas</h1>
            <p className="text-muted-foreground text-sm">
              Resumen de incidentes reportados
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
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* Print Container */}
      <div ref={printRef} className="print-container">
        {/* Print Header - only visible when printing */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold text-center">
            Reporte de Incidentes - Universidad de la Amazonia
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Periodo: {PERIOD_LABELS[period]} — Generado el{" "}
            {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-status-reported/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-reported/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-status-reported" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reportados</p>
                  <p className="text-2xl font-bold text-status-reported">
                    {stats.porEstado.find((s) => s.status === "reportado")?.value || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-status-in-progress/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-in-progress/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-status-in-progress" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Proceso</p>
                  <p className="text-2xl font-bold text-status-in-progress">
                    {stats.porEstado.find((s) => s.status === "en_proceso")?.value || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-status-resolved/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-status-resolved/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-status-resolved" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resueltos</p>
                  <p className="text-2xl font-bold text-status-resolved">
                    {stats.porEstado.find((s) => s.status === "resuelto")?.value || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes por Estado</CardTitle>
              <CardDescription>
                Distribución de incidentes según su estado actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.porEstado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.porEstado.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Type Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes por Tipo</CardTitle>
              <CardDescription>
                Cantidad de incidentes por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.porTipo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {stats.porTipo.map((entry) => (
                        <Cell key={entry.tipo} fill={TYPE_COLORS[entry.tipo]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Location Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Ubicaciones</CardTitle>
              <CardDescription>
                Lugares con más incidentes reportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ubicacionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resolution Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Resolución</CardTitle>
              <CardDescription>
                Porcentaje de incidentes resueltos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="hsl(var(--muted))"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="hsl(var(--primary))"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${stats.tasaResolucion * 5.02} 502`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{stats.tasaResolucion}%</span>
                    <span className="text-sm text-muted-foreground">Resueltos</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {stats.porEstado.find((s) => s.status === "resuelto")?.value || 0} de {stats.total} incidentes han sido resueltos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table for Print */}
        <div className="hidden print:block mt-8">
          <h2 className="text-lg font-bold mb-4">Resumen de Datos</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Métrica</th>
                <th className="border border-gray-300 p-2 text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Total de Incidentes</td>
                <td className="border border-gray-300 p-2">{stats.total}</td>
              </tr>
              {stats.porEstado.map((item) => (
                <tr key={item.status}>
                  <td className="border border-gray-300 p-2">Incidentes {item.name}</td>
                  <td className="border border-gray-300 p-2">{item.value}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2">Tasa de Resolución</td>
                <td className="border border-gray-300 p-2">{stats.tasaResolucion}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
