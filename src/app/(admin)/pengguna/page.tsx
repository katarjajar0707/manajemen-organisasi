import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, UserPlus, MoreVertical, Edit, Trash2 } from "lucide-react";

export default function UserManagementPage() {
  const users = [
    { id: "1", nama: "Ahmad Zaki", email: "zaki@katar.id", role: "ketua", bagian: "Pengurus Inti" },
    { id: "2", nama: "Siti Rahma", email: "siti@katar.id", role: "anggota", bagian: "Bendahara" },
    { id: "3", nama: "Budi Santoso", email: "budi@katar.id", role: "admin", bagian: "Administrator" },
    { id: "4", nama: "Rian Hidayat", email: "rian@katar.id", role: "anggota", bagian: "Acara & Kegiatan" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna & Role</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun login pengurus, penugasan bagian, dan hak akses (Role: Admin / Ketua / Anggota).
          </p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto text-xs h-8">
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Daftar Pengguna Sistem</CardTitle>
          <CardDescription className="text-xs">Akun yang memiliki hak akses login ke sistem manajemen.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground">{u.nama}</h4>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge
                    variant={
                      u.role === "admin"
                        ? "default"
                        : u.role === "ketua"
                        ? "warning"
                        : "secondary"
                    }
                    className="capitalize text-[10px] py-0 px-2 shrink-0"
                  >
                    {u.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>Bagian: <strong className="text-foreground">{u.bagian}</strong></span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Bagian</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nama}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                    <TableCell>{u.bagian}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "admin"
                            ? "default"
                            : u.role === "ketua"
                            ? "warning"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
