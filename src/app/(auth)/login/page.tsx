import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-2 shadow-md">
            KT
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Portal Masuk Pengurus</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data, catatan, keuangan & struktur Karang Taruna
          </p>
        </div>

        <Card className="shadow-lg border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Masuk ke Akun</CardTitle>
            <CardDescription>
              Gunakan email & password pengurus yang telah terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="pengurus@karangtaruna.id"
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Link href="/dashboard" className="block pt-2">
              <Button className="w-full gap-2" size="lg">
                <ShieldCheck className="h-4 w-4" />
                <span>Masuk Sekarang</span>
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="text-xs text-center text-muted-foreground justify-center border-t py-4">
            Akses dibatasi hanya untuk pengurus & anggota terdaftar.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
