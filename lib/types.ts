// Types for the Incident Reporting System

export type IncidentType =
  | "bano"
  | "electricidad"
  | "infraestructura"
  | "seguridad"
  | "limpieza"
  | "otro";

export type IncidentStatus = "reportado" | "en_proceso" | "resuelto";

export type UserRole = "usuario" | "administrador";

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  fechaCreacion: Date;
}

export interface Incident {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  tipo: IncidentType;
  descripcion: string;
  imagenURL: string;
  ubicacionTexto: string;
  latitud?: number;
  longitud?: number;
  fechaCreacion: Date;
  estado: IncidentStatus;
  grupoId?: string;
}

export interface IncidentGroup {
  id: string;
  incidentIds: string[];
  fechaCreacion: Date;
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  bano: "Baño",
  electricidad: "Electricidad",
  infraestructura: "Infraestructura",
  seguridad: "Seguridad",
  limpieza: "Limpieza",
  otro: "Otro",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reportado: "Reportado",
  en_proceso: "En Proceso",
  resuelto: "Resuelto",
};

export const INCIDENT_TYPE_ICONS: Record<IncidentType, string> = {
  bano: "🚿",
  electricidad: "⚡",
  infraestructura: "🏗️",
  seguridad: "🔒",
  limpieza: "🧹",
  otro: "📋",
};

// Campus locations for the University
export const CAMPUS_LOCATIONS = [
  "Bloque A - Aulas",
  "Bloque B - Laboratorios",
  "Bloque C - Biblioteca",
  "Bloque D - Administrativo",
  "Bloque E - Cafetería",
  "Bloque F - Auditorio",
  "Zona Deportiva",
  "Parqueadero Principal",
  "Parqueadero Secundario",
  "Jardines Centrales",
  "Baños Externos",
  "Otro",
];
