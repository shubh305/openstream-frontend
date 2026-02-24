import * as React from "react";
import { cn } from "@/lib/utils";

interface StudioCardProps extends React.ComponentProps<"div"> {
  title?: string;
  headerAction?: React.ReactNode;
  variant?: "default" | "glass" | "terminal";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "default" | "none" | "large" | "full";
}

export function StudioCard({
  title,
  headerAction,
  variant = "glass",
  padding = "lg",
  rounded = "large",
  className,
  children,
  ...props
}: StudioCardProps) {
  const variants = {
    default: "bg-noir-terminal/20 border-white/5",
    glass: "glasswork border-white/5 bg-noir-terminal/40 backdrop-blur-3xl",
    terminal: "bg-noir-terminal border-white/5",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const roundedness = {
    default: "rounded-2xl",
    none: "rounded-none",
    large: "rounded-[2.5rem]",
    full: "rounded-[3rem]",
  };

  return (
    <div className="flex flex-col h-full group">
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-2 mb-3 shrink-0">
          {title && (
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              {title}
            </h2>
          )}
          {headerAction}
        </div>
      )}
      <div
        className={cn(
          "flex-1 border transition-all hover:border-white/10 flex flex-col overflow-hidden",
          variants[variant],
          paddings[padding],
          roundedness[rounded],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function StudioCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shrink-0 mb-6", className)} {...props} />;
}

export function StudioCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1", className)} {...props} />;
}

export function StudioCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shrink-0 pt-6", className)} {...props} />;
}
