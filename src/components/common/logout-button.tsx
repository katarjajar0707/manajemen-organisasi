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
      {description ? (
        <>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive sm:h-9 sm:w-9">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </span>
          {showText && (
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-medium">{isPending ? "Keluar..." : text}</span>
              <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">{description}</span>
            </span>
          )}
        </>
      ) : (
        <>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0" />
          )}
          {showText && (
            <span className="min-w-0 text-left">
              <span className="block">{isPending ? "Keluar..." : text}</span>
            </span>
          )}
        </>
      )}
    </Button>
  );
}
