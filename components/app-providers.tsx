"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { IncidentsProvider } from "@/context/incidents-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <IncidentsProvider>{children}</IncidentsProvider>
    </AuthProvider>
  );
}
