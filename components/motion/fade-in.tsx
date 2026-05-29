"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
}: FadeInProps) {
  const style: CSSProperties = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    animationFillMode: "forwards",
  };

  return (
    <div className={cn("motion-fade-in-up opacity-0", className)} style={style}>
      {children}
    </div>
  );
}
