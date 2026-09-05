"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/actions/admin-users";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${userName}?`)) {
      startTransition(async () => {
        await deleteUser(userId);
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-destructive" 
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
