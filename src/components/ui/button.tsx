import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:-translate-y-px',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
        outline: 'border border-border bg-transparent text-foreground hover:bg-secondary hover:border-primary/30',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        accent: 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, loading = false, loadingText = 'Sabar di Sayang Tuhan', children, disabled, ...props }, ref) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
