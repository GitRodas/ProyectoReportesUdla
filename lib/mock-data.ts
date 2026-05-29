import type { Incident, User } from "./types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "estudiante@udla.edu.co",
    nombre: "Carlos Rodríguez",
    role: "usuario",
    fechaCreacion: new Date("2024-01-15"),
  },
  {
    id: "user-2",
    email: "admin@udla.edu.co",
    nombre: "María García",
    role: "administrador",
    fechaCreacion: new Date("2024-01-10"),
  },
  {
    id: "user-3",
    email: "docente@udla.edu.co",
    nombre: "Juan Pérez",
    role: "usuario",
    fechaCreacion: new Date("2024-02-20"),
  },
];

// Mock Incidents
export const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    usuarioId: "user-1",
    usuarioNombre: "Carlos Rodríguez",
    tipo: "bano",
    descripcion:
      "Fuga de agua en el lavamanos del baño de hombres del segundo piso. El agua no para de correr y está desperdiciando recursos.",
    imagenURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    ubicacionTexto: "Bloque A - Aulas",
    latitud: 1.6144,
    longitud: -75.6062,
    fechaCreacion: new Date("2026-05-25T10:30:00"),
    estado: "reportado",
  },
  {
    id: "inc-002",
    usuarioId: "user-3",
    usuarioNombre: "Juan Pérez",
    tipo: "electricidad",
    descripcion:
      "Las luces del pasillo del tercer piso parpadean constantemente. Puede causar molestias visuales y posible riesgo eléctrico.",
    imagenURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    ubicacionTexto: "Bloque B - Laboratorios",
    latitud: 1.6145,
    longitud: -75.6060,
    fechaCreacion: new Date("2026-05-24T14:15:00"),
    estado: "en_proceso",
  },
  {
    id: "inc-003",
    usuarioId: "user-1",
    usuarioNombre: "Carlos Rodríguez",
    tipo: "infraestructura",
    descripcion:
      "Grieta visible en la pared del salón 301. Se ha expandido en las últimas semanas y necesita revisión urgente.",
    imagenURL: "https://images.unsplash.com/photo-1558618047-f4b511d0d5e1?w=400",
    ubicacionTexto: "Bloque A - Aulas",
    fechaCreacion: new Date("2026-05-23T09:00:00"),
    estado: "resuelto",
  },
  {
    id: "inc-004",
    usuarioId: "user-3",
    usuarioNombre: "Juan Pérez",
    tipo: "seguridad",
    descripcion:
      "Puerta de emergencia del bloque C no abre correctamente. Representa un riesgo en caso de evacuación.",
    imagenURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    ubicacionTexto: "Bloque C - Biblioteca",
    latitud: 1.6143,
    longitud: -75.6058,
    fechaCreacion: new Date("2026-05-22T16:45:00"),
    estado: "en_proceso",
  },
  {
    id: "inc-005",
    usuarioId: "user-1",
    usuarioNombre: "Carlos Rodríguez",
    tipo: "limpieza",
    descripcion:
      "Acumulación de basura cerca de la cafetería. Atrae insectos y genera mal olor en el área.",
    imagenURL: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    ubicacionTexto: "Bloque E - Cafetería",
    fechaCreacion: new Date("2026-05-21T11:30:00"),
    estado: "resuelto",
  },
  {
    id: "inc-006",
    usuarioId: "user-3",
    usuarioNombre: "Juan Pérez",
    tipo: "bano",
    descripcion:
      "Inodoro dañado en el baño de mujeres del primer piso. No funciona la descarga.",
    imagenURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    ubicacionTexto: "Bloque D - Administrativo",
    fechaCreacion: new Date("2026-05-20T08:20:00"),
    estado: "reportado",
  },
  {
    id: "inc-007",
    usuarioId: "user-1",
    usuarioNombre: "Carlos Rodríguez",
    tipo: "electricidad",
    descripcion:
      "Toma corriente quemado en el laboratorio de cómputo. Salió humo y olor a quemado.",
    imagenURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    ubicacionTexto: "Bloque B - Laboratorios",
    latitud: 1.6146,
    longitud: -75.6061,
    fechaCreacion: new Date("2026-05-19T13:00:00"),
    estado: "resuelto",
  },
  {
    id: "inc-008",
    usuarioId: "user-3",
    usuarioNombre: "Juan Pérez",
    tipo: "infraestructura",
    descripcion:
      "Ventana rota en el auditorio principal. Entra agua cuando llueve.",
    imagenURL: "https://images.unsplash.com/photo-1558618047-f4b511d0d5e1?w=400",
    ubicacionTexto: "Bloque F - Auditorio",
    fechaCreacion: new Date("2026-05-18T15:30:00"),
    estado: "reportado",
  },
];

// Helper functions for mock data
export function getIncidentsByStatus(status: string): Incident[] {
  if (status === "todos") return mockIncidents;
  return mockIncidents.filter((inc) => inc.estado === status);
}

export function getIncidentsByUser(userId: string): Incident[] {
  return mockIncidents.filter((inc) => inc.usuarioId === userId);
}

export function getIncidentById(id: string): Incident | undefined {
  return mockIncidents.find((inc) => inc.id === id);
}

export function getStatistics() {
  const total = mockIncidents.length;
  const porEstado = {
    reportado: mockIncidents.filter((i) => i.estado === "reportado").length,
    en_proceso: mockIncidents.filter((i) => i.estado === "en_proceso").length,
    resuelto: mockIncidents.filter((i) => i.estado === "resuelto").length,
  };
  const porTipo = mockIncidents.reduce(
    (acc, inc) => {
      acc[inc.tipo] = (acc[inc.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return { total, porEstado, porTipo };
}
