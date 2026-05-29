"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Incident, IncidentStatus } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  subscribeIncidents,
  createIncident,
  updateIncidentStatus as updateStatusInDb,
  groupIncidents as groupInDb,
} from "@/lib/supabase/incidents";
import { uploadIncidentImage } from "@/lib/supabase/storage";
import { withTimeout } from "@/lib/supabase/timeout";
import { useAuth } from "@/context/auth-context";

export interface NewIncidentInput
  extends Omit<Incident, "id" | "fechaCreacion" | "estado" | "imagenURL"> {
  imageFile: File;
}

interface IncidentsContextType {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
  addIncident: (input: NewIncidentInput) => Promise<void>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<void>;
  getIncidentById: (id: string) => Incident | undefined;
  filterByStatus: (status: IncidentStatus | "todos") => Incident[];
  filterByType: (type: string | "todos") => Incident[];
  groupIncidents: (incidentIds: string[]) => Promise<void>;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(
  undefined
);

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !isAuthenticated) {
      setIncidents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeIncidents(
      (data) => {
        setIncidents(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  const addIncident = useCallback(
    async (input: NewIncidentInput) => {
      if (!user) throw new Error("Debe iniciar sesión para reportar.");

      const imagenURL = await withTimeout(
        uploadIncidentImage(input.imageFile, user.id),
        60000,
        "La subida de la foto tardó demasiado. Verifique Storage en Supabase."
      );

      await withTimeout(createIncident({
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        tipo: input.tipo,
        descripcion: input.descripcion,
        imagenURL,
        ubicacionTexto: input.ubicacionTexto,
        latitud: input.latitud,
        longitud: input.longitud,
      }));
    },
    [user]
  );

  const updateIncidentStatus = useCallback(
    async (id: string, status: IncidentStatus) => {
      const incident = incidents.find((i) => i.id === id);
      await updateStatusInDb(id, status, incident?.grupoId);
    },
    [incidents]
  );

  const getIncidentById = useCallback(
    (id: string) => incidents.find((inc) => inc.id === id),
    [incidents]
  );

  const filterByStatus = useCallback(
    (status: IncidentStatus | "todos") => {
      if (status === "todos") return incidents;
      return incidents.filter((inc) => inc.estado === status);
    },
    [incidents]
  );

  const filterByType = useCallback(
    (type: string | "todos") => {
      if (type === "todos") return incidents;
      return incidents.filter((inc) => inc.tipo === type);
    },
    [incidents]
  );

  const groupIncidents = useCallback(async (incidentIds: string[]) => {
    await groupInDb(incidentIds);
  }, []);

  return (
    <IncidentsContext.Provider
      value={{
        incidents,
        isLoading,
        error,
        addIncident,
        updateIncidentStatus,
        getIncidentById,
        filterByStatus,
        filterByType,
        groupIncidents,
      }}
    >
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentsContext);
  if (context === undefined) {
    throw new Error("useIncidents must be used within an IncidentsProvider");
  }
  return context;
}
