import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border-border",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "bg-transparent text-foreground border-border",
        success:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
        accent:
          "bg-accent/10 text-accent border-accent/20",
        info:
          "bg-sky-500/10 text-sky-400 border-sky-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
