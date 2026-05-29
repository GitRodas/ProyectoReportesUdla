import type { User, UserRole } from "@/lib/types";
import { getSupabase } from "./client";

export interface ProfileRow {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  created_at: string;
}

export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized) ? "administrador" : "usuario";
}

export function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    role: row.role,
    fechaCreacion: new Date(row.created_at),
  };
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("id, email, nombre, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProfile(data as ProfileRow);
}

export async function upsertUserProfile(
  userId: string,
  email: string,
  nombre: string
): Promise<User> {
  const role = resolveRole(email);
  const { data, error } = await getSupabase()
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email.trim(),
        nombre: nombre.trim(),
        role,
      },
      { onConflict: "id" }
    )
    .select("id, email, nombre, role, created_at")
    .single();

  if (error) throw error;
  return mapProfile(data as ProfileRow);
}
