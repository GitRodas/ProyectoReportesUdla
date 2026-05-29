"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getUserProfile,
  upsertUserProfile,
  resolveRole,
} from "@/lib/supabase/profiles";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { withTimeout } from "@/lib/supabase/timeout";

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Solo carga inicial de sesión (no usar en botones de formulario) */
  isLoading: boolean;
  isInitializing: boolean;
  supabaseReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    email: string,
    password: string,
    nombre: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseReady) {
      setIsInitializing(false);
      return;
    }

    const supabase = getSupabase();

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
        }
      } catch {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void getUserProfile(session.user.id)
          .then(setUser)
          .catch(() => setUser(null));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseReady]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabaseReady) {
        return {
          success: false,
          error: "Configure Supabase en .env.local (ver README.md).",
        };
      }

      try {
        const supabase = getSupabase();
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        );

        if (error) {
          return { success: false, error: getSupabaseErrorMessage(error) };
        }

        if (!data.user) {
          return { success: false, error: "No se pudo iniciar sesión." };
        }

        const profile = await withTimeout(getUserProfile(data.user.id));
        if (!profile) {
          return {
            success: false,
            error: "Perfil no encontrado. Ejecute el SQL en supabase/schema.sql.",
          };
        }

        setUser(profile);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : getSupabaseErrorMessage(err),
        };
      }
    },
    [supabaseReady]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      nombre: string
    ): Promise<AuthResult> => {
      if (!supabaseReady) {
        return {
          success: false,
          error: "Configure Supabase en .env.local (ver README.md).",
        };
      }

      try {
        const supabase = getSupabase();
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: { nombre: nombre.trim() },
            },
          })
        );

        if (error) {
          return { success: false, error: getSupabaseErrorMessage(error) };
        }

        if (!data.user) {
          return { success: false, error: "No se pudo crear la cuenta." };
        }

        if (!data.session) {
          return {
            success: false,
            error:
              "Revise su correo para confirmar la cuenta, o desactive 'Confirm email' en Supabase → Authentication.",
          };
        }

        let profile = await withTimeout(getUserProfile(data.user.id));
        const role = resolveRole(email.trim());

        if (profile) {
          if (profile.role !== role || profile.nombre !== nombre.trim()) {
            profile = await withTimeout(
              upsertUserProfile(data.user.id, email.trim(), nombre.trim())
            );
          }
        } else {
          profile = await withTimeout(
            upsertUserProfile(data.user.id, email.trim(), nombre.trim())
          );
        }

        setUser(profile);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : getSupabaseErrorMessage(err),
        };
      }
    },
    [supabaseReady]
  );

  const logout = useCallback(async () => {
    if (supabaseReady) {
      await getSupabase().auth.signOut();
    }
    setUser(null);
  }, [supabaseReady]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isInitializing,
        isInitializing,
        supabaseReady,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
