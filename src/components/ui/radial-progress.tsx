
"use client";

import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RadialProgress({ value = 0, size = 150, strokeWidth = 10, className }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorClass = value >= 75 ? 'text-green-500' : value >= 50 ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-in-out", colorClass)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={cn("absolute text-3xl font-bold font-headline", colorClass)}>
        {value}
      </span>
    </div>
  );
}
