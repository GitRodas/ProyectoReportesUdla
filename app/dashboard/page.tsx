"use client";

import { useState } from "react";
import { useIncidents } from "@/context/incidents-context";
import { useAuth } from "@/context/auth-context";
import { IncidentCard } from "@/components/dashboard/incident-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import type { IncidentStatus, IncidentType } from "@/lib/types";
import { INCIDENT_STATUS_LABELS, INCIDENT_TYPE_LABELS } from "@/lib/types";
import { FadeIn } from "@/components/motion/fade-in";
import { AnimatedNumber } from "@/components/motion/animated-number";

export default function DashboardPage() {
  const { incidents } = useIncidents();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "todos">(
    "todos"
  );
  const [typeFilter, setTypeFilter] = useState<IncidentType | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus =
      statusFilter === "todos" || incident.estado === statusFilter;
    const matchesType = typeFilter === "todos" || incident.tipo === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      incident.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.ubicacionTexto.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // Stats
  const stats = {
    reportado: incidents.filter((i) => i.estado === "reportado").length,
    en_proceso: incidents.filter((i) => i.estado === "en_proceso").length,
    resuelto: incidents.filter((i) => i.estado === "resuelto").length,
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Bienvenido, {user?.nombre?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground">
              Gestiona los incidentes reportados en el campus
            </p>
          </div>
          <Link href="/dashboard/nuevo">
            <Button className="gap-2 btn-glow transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Nuevo Reporte
            </Button>
          </Link>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FadeIn delay={80}>
        <Card className="border-status-reported/20 bg-status-reported/5 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reportados
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-status-reported" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-reported tabular-nums">
              <AnimatedNumber value={stats.reportado} />
            </div>
            <p className="text-xs text-muted-foreground">
              Pendientes de atención
            </p>
          </CardContent>
        </Card>
        </FadeIn>

        <FadeIn delay={160}>
        <Card className="border-status-in-progress/20 bg-status-in-progress/5 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Proceso
            </CardTitle>
            <Clock className="w-4 h-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-in-progress tabular-nums">
              <AnimatedNumber value={stats.en_proceso} />
            </div>
            <p className="text-xs text-muted-foreground">
              Siendo atendidos
            </p>
          </CardContent>
        </Card>
        </FadeIn>

        <FadeIn delay={240}>
        <Card className="border-status-resolved/20 bg-status-resolved/5 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resueltos
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-resolved tabular-nums">
              <AnimatedNumber value={stats.resuelto} />
            </div>
            <p className="text-xs text-muted-foreground">
              Completados
            </p>
          </CardContent>
        </Card>
        </FadeIn>
      </div>

      <FadeIn delay={320}>
      <Card className="hover-lift">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar incidentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input/50"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as IncidentStatus | "todos")
                }
              >
                <SelectTrigger className="w-[140px] bg-input/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(INCIDENT_STATUS_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as IncidentType | "todos")
                }
              >
                <SelectTrigger className="w-[160px] bg-input/50">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {Object.entries(INCIDENT_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      </FadeIn>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Incidentes ({filteredIncidents.length})
          </h2>
        </div>

        {filteredIncidents.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No se encontraron incidentes</p>
              <p className="text-sm mt-1">
                Intenta ajustar los filtros o crea un nuevo reporte
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredIncidents.map((incident, index) => (
              <FadeIn key={incident.id} delay={400 + index * 60}>
                <IncidentCard incident={incident} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
