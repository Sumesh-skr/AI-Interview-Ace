import { cn } from "@/lib/utils";
import React from "react";

interface NeonGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function NeonGlow({ children, className }: NeonGlowProps) {
  return (
    <div className={cn("neon-glow-effect", className)}>
      {children}
    </div>
  );
}
