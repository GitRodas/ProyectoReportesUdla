"use client";

interface LegendItem {
  label: string;
  value: number;
  color: string;
}

export function ChartLegendList({ items }: { items: LegendItem[] }) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li
            key={item.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground truncate">{item.label}</span>
            </div>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">{item.value}</span>
              {" · "}
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
