"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="relative max-w-md w-full p-8 rounded-2xl border border-destructive/30 bg-card/60 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Destructive Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-destructive/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            Terjadi Kendala Sistem
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Gagal Memuat Halaman
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Terjadi kesalahan tak terduga saat memproses data server. Silakan coba muat ulang atau kembali ke dashboard.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/60">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
