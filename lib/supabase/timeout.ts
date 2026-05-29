export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 20000,
  message = "La operación tardó demasiado. Verifique su conexión y la configuración de Supabase."
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}
