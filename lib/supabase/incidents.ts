import type { Incident, IncidentStatus, IncidentType } from "@/lib/types";
import { getSupabase } from "./client";

export interface IncidentRow {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  tipo: IncidentType;
  descripcion: string;
  imagen_url: string;
  ubicacion_texto: string;
  latitud: number | null;
  longitud: number | null;
  fecha_creacion: string;
  estado: IncidentStatus;
  grupo_id: string | null;
}

export function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    usuarioNombre: row.usuario_nombre,
    tipo: row.tipo,
    descripcion: row.descripcion,
    imagenURL: row.imagen_url,
    ubicacionTexto: row.ubicacion_texto,
    latitud: row.latitud ?? undefined,
    longitud: row.longitud ?? undefined,
    fechaCreacion: new Date(row.fecha_creacion),
    estado: row.estado,
    grupoId: row.grupo_id ?? undefined,
  };
}

export async function fetchIncidents(): Promise<Incident[]> {
  const { data, error } = await getSupabase()
    .from("incidents")
    .select("*")
    .order("fecha_creacion", { ascending: false });

  if (error) throw error;
  return (data as IncidentRow[]).map(mapIncident);
}

export function subscribeIncidents(
  onData: (incidents: Incident[]) => void,
  onError?: (error: Error) => void
): () => void {
  const supabase = getSupabase();

  const load = async () => {
    try {
      onData(await fetchIncidents());
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  void load();

  const channel = supabase
    .channel("incidents-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "incidents" },
      () => {
        void load();
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function createIncident(
  data: Omit<Incident, "id" | "fechaCreacion" | "estado">
): Promise<string> {
  const { data: row, error } = await getSupabase()
    .from("incidents")
    .insert({
      usuario_id: data.usuarioId,
      usuario_nombre: data.usuarioNombre,
      tipo: data.tipo,
      descripcion: data.descripcion,
      imagen_url: data.imagenURL,
      ubicacion_texto: data.ubicacionTexto,
      latitud: data.latitud ?? null,
      longitud: data.longitud ?? null,
      estado: "reportado",
    })
    .select("id")
    .single();

  if (error) throw error;
  return row.id as string;
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  grupoId?: string
): Promise<void> {
  const supabase = getSupabase();

  if (grupoId) {
    const { error } = await supabase
      .from("incidents")
      .update({ estado: status })
      .eq("grupo_id", grupoId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("incidents")
    .update({ estado: status })
    .eq("id", id);
  if (error) throw error;
}

export async function groupIncidents(incidentIds: string[]): Promise<void> {
  const groupId = `group-${Date.now()}`;
  const { error } = await getSupabase()
    .from("incidents")
    .update({ grupo_id: groupId })
    .in("id", incidentIds);
  if (error) throw error;
}
