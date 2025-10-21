import { cn } from "@/lib/utils";

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function GradientCard({ children, className, contentClassName }: GradientCardProps) {
  return (
    <div className={cn("relative p-[1px] rounded-lg", className)}>
      <div className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 animate-gradient-xy opacity-30" />
      <div className={cn("relative bg-card text-card-foreground rounded-[7px] h-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
