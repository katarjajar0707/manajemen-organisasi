import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserFormModal } from "./components/user-form-modal";
import { DeleteUserButton } from "./components/delete-user-button";
import { getUsers } from "@/actions/admin-users";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserManagementPage() {
  const supabase = await createClient();

  const [currentProfile, users, { data: bagianList }] = await Promise.all([
    getProfile(),
    getUsers(),
    supabase.from("bagian").select("id, nama").order("nama"),
  ]);
  
  if (!currentProfile || currentProfile.role !== "admin") {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center">
        <Card className="border shadow-sm p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Akses Khusus Administrator</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Halaman ini hanya dapat diakses oleh akun dengan peran <strong>Administrator</strong>. 
              Sebagai pengurus/anggota, Anda dapat mengelola profil akun Anda sendiri melalui halaman Profil.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/profil">
              <Button size="sm" variant="outline" className="gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Profil Saya</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna & Role</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun login pengurus, penugasan bagian, dan hak akses (Role: Admin / Ketua / Anggota).
          </p>
        </div>
        <UserFormModal bagianList={bagianList || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Daftar Pengguna Sistem</CardTitle>
          <CardDescription className="text-xs">Akun yang memiliki hak akses login ke sistem manajemen.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {users.map((u: any) => (
              <div key={u.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground">{u.nama}</h4>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                  <Badge
                    variant={
                      u.role === "admin"
                        ? "default"
                        : u.role === "ketua"
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize text-[10px] py-0 px-2 shrink-0"
                  >
                    {u.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>Bagian: <strong className="text-foreground">{u.bagian?.nama || "-"}</strong></span>
                  <div className="flex items-center gap-1">
                    <UserFormModal 
                      bagianList={bagianList || []} 
                      mode="edit" 
                      userToEdit={{ id: u.id, nama: u.nama, role: u.role, bagian_id: u.bagian_id }} 
                    />
                    <DeleteUserButton userId={u.id} userName={u.nama} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Bagian</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nama}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">@{u.username}</TableCell>
                    <TableCell>{u.bagian?.nama || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "admin"
                            ? "default"
                            : u.role === "ketua"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <UserFormModal 
                          bagianList={bagianList || []} 
                          mode="edit" 
                          userToEdit={{ id: u.id, nama: u.nama, role: u.role, bagian_id: u.bagian_id }} 
                        />
                        <DeleteUserButton userId={u.id} userName={u.nama} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
