import { BarChart3 } from "lucide-react";

export function EmptyChartState({ message }: { message?: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
        <BarChart3 className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {message ?? "No hay datos en este periodo"}
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Prueba otro rango de fechas o registra incidentes para ver estadísticas.
      </p>
    </div>
  );
}
