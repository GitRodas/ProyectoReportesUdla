"use client";

import { useState } from "react";
import { useIncidents } from "@/context/incidents-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Link2,
  Shield,
  Filter,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  type IncidentStatus,
} from "@/lib/types";
import { redirect } from "next/navigation";

const statusColors: Record<string, string> = {
  reportado: "bg-status-reported/20 text-status-reported border-status-reported/30",
  en_proceso: "bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30",
  resuelto: "bg-status-resolved/20 text-status-resolved border-status-resolved/30",
};

export default function AdminPage() {
  const { incidents, updateIncidentStatus, groupIncidents } = useIncidents();
  const { user } = useAuth();
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "todos">("todos");
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  // Check admin access
  if (user?.role !== "administrador") {
    redirect("/dashboard");
  }

  // Filter incidents
  const filteredIncidents =
    statusFilter === "todos"
      ? incidents
      : incidents.filter((i) => i.estado === statusFilter);

  // Handle selection
  const toggleSelection = (id: string) => {
    setSelectedIncidents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIncidents.length === filteredIncidents.length) {
      setSelectedIncidents([]);
    } else {
      setSelectedIncidents(filteredIncidents.map((i) => i.id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: IncidentStatus) => {
    await Promise.all(
      selectedIncidents.map((id) => updateIncidentStatus(id, status))
    );
    setSelectedIncidents([]);
  };

  const handleGroupIncidents = async () => {
    if (selectedIncidents.length >= 2) {
      await groupIncidents(selectedIncidents);
      setSelectedIncidents([]);
      setShowGroupDialog(false);
    }
  };

  // Stats
  const stats = {
    total: incidents.length,
    reportado: incidents.filter((i) => i.estado === "reportado").length,
    en_proceso: incidents.filter((i) => i.estado === "en_proceso").length,
    resuelto: incidents.filter((i) => i.estado === "resuelto").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground text-sm">
              Gestiona todos los incidentes reportados
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-status-reported/20">
          <CardContent className="p-4">
            <p className="text-sm text-status-reported">Reportados</p>
            <p className="text-2xl font-bold text-status-reported">{stats.reportado}</p>
          </CardContent>
        </Card>
        <Card className="border-status-in-progress/20">
          <CardContent className="p-4">
            <p className="text-sm text-status-in-progress">En Proceso</p>
            <p className="text-2xl font-bold text-status-in-progress">{stats.en_proceso}</p>
          </CardContent>
        </Card>
        <Card className="border-status-resolved/20">
          <CardContent className="p-4">
            <p className="text-sm text-status-resolved">Resueltos</p>
            <p className="text-2xl font-bold text-status-resolved">{stats.resuelto}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as IncidentStatus | "todos")}
              >
                <SelectTrigger className="w-[160px] bg-input/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIncidents.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedIncidents.length} seleccionado(s)
                </span>
              )}
            </div>

            {selectedIncidents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Select
                  onValueChange={(value) => handleBulkStatusUpdate(value as IncidentStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cambiar estado a..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedIncidents.length >= 2 && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowGroupDialog(true)}
                  >
                    <Link2 className="w-4 h-4" />
                    Agrupar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incidentes</CardTitle>
          <CardDescription>
            Selecciona incidentes para cambiar su estado o agruparlos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIncidents.length === filteredIncidents.length &&
                        filteredIncidents.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                  <TableHead className="hidden lg:table-cell">Reportado por</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="w-8 h-8 opacity-50" />
                        <p>No hay incidentes con este filtro</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className={cn(
                        selectedIncidents.includes(incident.id) && "bg-primary/5"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIncidents.includes(incident.id)}
                          onCheckedChange={() => toggleSelection(incident.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {incident.id.slice(-6)}
                        {incident.grupoId && (
                          <div className="flex items-center gap-1 text-primary mt-1">
                            <Link2 className="w-3 h-3" />
                            <span className="text-[10px]">Agrupado</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>
                            {incident.tipo === "bano" && "🚿"}
                            {incident.tipo === "electricidad" && "⚡"}
                            {incident.tipo === "infraestructura" && "🏗️"}
                            {incident.tipo === "seguridad" && "🔒"}
                            {incident.tipo === "limpieza" && "🧹"}
                            {incident.tipo === "otro" && "📋"}
                          </span>
                          <span className="text-sm">
                            {INCIDENT_TYPE_LABELS[incident.tipo]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {incident.ubicacionTexto}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {incident.usuarioNombre}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {format(new Date(incident.fechaCreacion), "dd/MM/yy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={incident.estado}
                          onValueChange={(value) =>
                            updateIncidentStatus(incident.id, value as IncidentStatus)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-[130px] h-8 text-xs",
                              statusColors[incident.estado]
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(INCIDENT_STATUS_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/incidente/${incident.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agrupar Incidentes</DialogTitle>
            <DialogDescription>
              Al agrupar estos {selectedIncidents.length} incidentes, los cambios
              de estado en cualquiera de ellos se aplicarán a todo el grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Incidentes seleccionados:
            </p>
            <div className="mt-2 space-y-2">
              {selectedIncidents.map((id) => {
                const incident = incidents.find((i) => i.id === id);
                return incident ? (
                  <div
                    key={id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <span className="font-mono text-xs">{id.slice(-6)}</span>
                    <span className="text-sm">
                      {INCIDENT_TYPE_LABELS[incident.tipo]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      - {incident.ubicacionTexto}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGroupIncidents} className="gap-2">
              <Link2 className="w-4 h-4" />
              Confirmar Agrupación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
