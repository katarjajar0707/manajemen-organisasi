"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, AlertCircle, Edit } from "lucide-react";
import { createUser, updateUser } from "@/actions/admin-users";

type Bagian = { id: string; nama: string };
type User = { id: string; nama: string; role: string; bagian_id: string | null };

export function UserFormModal({
  bagianList,
  mode = "add",
  userToEdit,
}: {
  bagianList: Bagian[];
  mode?: "add" | "edit";
  userToEdit?: User;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      let res;
      if (isEdit && userToEdit) {
        res = await updateUser(userToEdit.id, formData);
      } else {
        res = await createUser(formData);
      }
      
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2 w-full sm:w-auto text-xs h-8">
            <UserPlus className="h-4 w-4" />
            <span>Tambah Pengguna</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Hak Akses Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Ubah role atau bagian untuk pengguna ini." : "Buat akun login baru untuk pengurus/anggota Karang Taruna."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input id="nama" name="nama" defaultValue={userToEdit?.nama} readOnly={isEdit} required={!isEdit} />
            </div>
            {!isEdit && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password Sementara</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
              </>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role / Hak Akses</Label>
              <Select name="role" defaultValue={userToEdit?.role || "anggota"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ketua">Ketua</SelectItem>
                  <SelectItem value="anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bagian_id">Bagian / Departemen</Label>
              <Select name="bagian_id" defaultValue={userToEdit?.bagian_id || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Kosong (Khusus Admin/Ketua)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Kosong --</SelectItem>
                  {bagianList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Anggota wajib memilih bagian. Admin/Ketua bisa dikosongkan.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/40">
              <div className="grid gap-1.5">
                <Label htmlFor="kontak" className="text-xs">No. WhatsApp / HP</Label>
                <Input id="kontak" name="kontak" placeholder="0812xxxx (opsional)" className="h-8 text-xs" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rt_rw" className="text-xs">Wilayah (RT / RW)</Label>
                <Input id="rt_rw" name="rt_rw" placeholder="RT 03 / RW 05" defaultValue="RT 01 / RW 05" className="h-8 text-xs" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="jabatan" className="text-xs">Spesifikasi Jabatan (Opsional)</Label>
              <Input id="jabatan" name="jabatan" placeholder="Contoh: Koordinator Lapangan, Anggota" className="h-8 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
