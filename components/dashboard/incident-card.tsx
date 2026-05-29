"use client";

import type { Incident } from "@/lib/types";
import { INCIDENT_STATUS_LABELS, INCIDENT_TYPE_LABELS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IncidentCardProps {
  incident: Incident;
  showUser?: boolean;
}

const statusColors: Record<string, string> = {
  reportado: "bg-status-reported/20 text-status-reported border-status-reported/30",
  en_proceso: "bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30",
  resuelto: "bg-status-resolved/20 text-status-resolved border-status-resolved/30",
};

const typeIcons: Record<string, string> = {
  bano: "bg-blue-500/10 text-blue-400",
  electricidad: "bg-yellow-500/10 text-yellow-400",
  infraestructura: "bg-orange-500/10 text-orange-400",
  seguridad: "bg-red-500/10 text-red-400",
  limpieza: "bg-emerald-500/10 text-emerald-400",
  otro: "bg-gray-500/10 text-gray-400",
};

export function IncidentCard({ incident, showUser = true }: IncidentCardProps) {
  return (
    <Link href={`/dashboard/incidente/${incident.id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0">
              <Image
                src={incident.imagenURL}
                alt={`Incidente: ${incident.descripcion.slice(0, 30)}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                      typeIcons[incident.tipo]
                    )}
                  >
                    {incident.tipo === "bano" && "🚿"}
                    {incident.tipo === "electricidad" && "⚡"}
                    {incident.tipo === "infraestructura" && "🏗️"}
                    {incident.tipo === "seguridad" && "🔒"}
                    {incident.tipo === "limpieza" && "🧹"}
                    {incident.tipo === "otro" && "📋"}
                  </span>
                  <div>
                    <p className="font-medium text-sm">
                      {INCIDENT_TYPE_LABELS[incident.tipo]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{incident.id.slice(-4)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs", statusColors[incident.estado])}>
                  {INCIDENT_STATUS_LABELS[incident.estado]}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {incident.descripcion}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {incident.ubicacionTexto}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(incident.fechaCreacion), "dd MMM yyyy", {
                    locale: es,
                  })}
                </div>
                {showUser && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {incident.usuarioNombre}
                  </div>
                )}
              </div>

              {incident.grupoId && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Incidente agrupado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
