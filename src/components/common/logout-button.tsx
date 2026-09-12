"use client";

import { useTransition } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends ButtonProps {
  showText?: boolean;
  text?: string;
  description?: string;
}

export function LogoutButton({
  showText = true,
  text = "Keluar",
  description,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 cursor-pointer transition-colors",
        className
      )}
      {...props}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <LogOut className="h-4 w-4 shrink-0" />
      )}
      {showText && (
        <span className="min-w-0 text-left">
          <span className="block">{isPending ? "Keluar..." : text}</span>
          {description && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{description}</span>}
        </span>
      )}
    </Button>
  );
}
