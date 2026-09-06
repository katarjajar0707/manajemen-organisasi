import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="relative max-w-md w-full p-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-secondary text-muted-foreground border border-border/40">
            Error 404 • Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman atau data yang Anda cari tidak tersedia, telah dipindahkan, atau Anda tidak memiliki izin akses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Ke Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Portal Publik
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
