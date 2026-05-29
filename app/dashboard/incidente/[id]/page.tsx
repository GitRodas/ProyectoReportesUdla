"use client";

import { use } from "react";
import { useIncidents } from "@/context/incidents-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  type IncidentStatus,
} from "@/lib/types";
import { notFound } from "next/navigation";

const statusColors: Record<string, string> = {
  reportado: "bg-status-reported/20 text-status-reported border-status-reported/30",
  en_proceso: "bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30",
  resuelto: "bg-status-resolved/20 text-status-resolved border-status-resolved/30",
};

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getIncidentById, updateIncidentStatus, isLoading } = useIncidents();
  const { user } = useAuth();
  const incident = getIncidentById(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        Cargando incidente...
      </div>
    );
  }

  if (!incident) {
    notFound();
  }

  const isAdmin = user?.role === "administrador";

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    await updateIncidentStatus(incident.id, newStatus);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {incident.tipo === "bano" && "🚿"}
              {incident.tipo === "electricidad" && "⚡"}
              {incident.tipo === "infraestructura" && "🏗️"}
              {incident.tipo === "seguridad" && "🔒"}
              {incident.tipo === "limpieza" && "🧹"}
              {incident.tipo === "otro" && "📋"}
            </span>
            <div>
              <h1 className="text-2xl font-bold">
                {INCIDENT_TYPE_LABELS[incident.tipo]}
              </h1>
              <p className="text-muted-foreground text-sm">
                Incidente #{incident.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Select
              value={incident.estado}
              onValueChange={(value) =>
                handleStatusChange(value as IncidentStatus)
              }
            >
              <SelectTrigger className={cn("w-[160px]", statusColors[incident.estado])}>
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
          ) : (
            <Badge
              variant="outline"
              className={cn("text-sm px-3 py-1", statusColors[incident.estado])}
            >
              {INCIDENT_STATUS_LABELS[incident.estado]}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <Card className="overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={incident.imagenURL}
              alt={`Fotografía del incidente: ${incident.descripcion.slice(0, 50)}`}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <a
              href={incident.imagenURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver imagen completa
            </a>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {incident.descripcion}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">
                    {incident.ubicacionTexto}
                  </p>
                  {incident.latitud && incident.longitud && (
                    <a
                      href={`https://www.google.com/maps?q=${incident.latitud},${incident.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Ver en Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fecha de Reporte</p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(incident.fechaCreacion),
                      "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                      { locale: es }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reportado por</p>
                  <p className="text-sm text-muted-foreground">
                    {incident.usuarioNombre}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Estado Actual</p>
                  <p className="text-sm text-muted-foreground">
                    {INCIDENT_STATUS_LABELS[incident.estado]}
                  </p>
                </div>
              </div>

              {incident.grupoId && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    Este incidente está agrupado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Los cambios de estado se aplicarán a todos los incidentes
                    del grupo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
