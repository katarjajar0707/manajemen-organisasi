import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserFormModal } from './components/user-form-modal';
import { DeleteUserButton } from './components/delete-user-button';
import { UserDataTable } from './components/user-data-table';
import { getUsers } from '@/actions/admin-users';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UserManagementPage() {
  const [currentProfile, users, bagianList] = await Promise.all([getProfile(), getUsers(), getCachedBagianOptions()]);

  if (!currentProfile || currentProfile.role !== 'admin') {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center">
        <Card className="border shadow-sm p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Akses Khusus Administrator</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Halaman ini hanya dapat diakses oleh akun dengan peran <strong>Administrator</strong>. Sebagai pengurus/anggota, Anda dapat mengelola profil akun Anda sendiri melalui halaman Profil.
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
          <p className="text-sm text-muted-foreground">Kelola akun login pengurus, penugasan bagian, dan hak akses (Role: Admin / Ketua / Anggota).</p>
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
                    <p className="text-[10px] text-muted-foreground/70 truncate max-w-[180px]">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'default' : u.role === 'ketua' ? 'destructive' : 'secondary'} className="capitalize text-[10px] py-0 px-2 shrink-0">
                    {u.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>
                    Bagian: <strong className="text-foreground">{u.bagian?.nama || '-'}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <UserFormModal bagianList={bagianList || []} mode="edit" userToEdit={{ id: u.id, nama: u.nama, username: u.username, email: u.email, nomor_wa: u.nomor_wa, role: u.role, bagian_id: u.bagian_id }} />
                    <DeleteUserButton userId={u.id} userName={u.nama} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <UserDataTable users={users} bagianList={bagianList || []} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
