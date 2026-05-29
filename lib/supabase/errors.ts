export function getSupabaseErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: string }).message);

    if (message.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (message.includes("User already registered")) {
      return "Este correo ya está registrado.";
    }
    if (message.includes("Password should be at least")) {
      return "La contraseña no cumple los requisitos mínimos.";
    }
    if (message.includes("Email not confirmed")) {
      return "Debe confirmar su correo antes de iniciar sesión.";
    }

    return message;
  }
  return "Ocurrió un error inesperado. Intente de nuevo.";
}
