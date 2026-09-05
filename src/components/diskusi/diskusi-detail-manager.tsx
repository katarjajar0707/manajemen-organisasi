"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  AtSign,
  MessageCircle,
  Heart,
  Pin,
  Share2,
  Clock,
  Trash2,
  Edit,
  MoreVertical,
  Loader2,
  AlertCircle,
  CornerDownRight,
} from "lucide-react";
import {
  DiskusiItem,
  DiskusiBalasanItem,
  createDiskusiBalasan,
  deleteDiskusiBalasan,
  deleteDiskusi,
  togglePinDiskusi,
} from "@/actions/diskusi";

interface BagianOption {
  id: string;
  nama: string;
  slug: string;
}

interface DiskusiDetailManagerProps {
  initialThread: DiskusiItem;
  initialReplies: DiskusiBalasanItem[];
  bagianList: BagianOption[];
  currentUserId?: string;
  userRole?: string;
  currentUserBagianId?: string | null;
}

export function DiskusiDetailManager({
  initialThread,
  initialReplies,
  bagianList,
  currentUserId,
  userRole = "anggota",
}: DiskusiDetailManagerProps) {
  const router = useRouter();
  const [thread, setThread] = useState<DiskusiItem>(initialThread);
  const [replies, setReplies] = useState<DiskusiBalasanItem[]>(initialReplies);
  const [replyText, setReplyText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Transitions
  const [isReplying, startReplyTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyToDeleteId, setReplyToDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManageThread =
    userRole === "admin" || userRole === "ketua" || thread.dibuatOleh === currentUserId;

  const canManageReply = (reply: DiskusiBalasanItem) => {
    return userRole === "admin" || userRole === "ketua" || reply.dibuatOleh === currentUserId;
  };

  const formatRelativeTime = (dateIso: string) => {
    try {
      const date = new Date(dateIso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Baru saja";
      if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Baru saja";
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    setErrorMessage(null);
    startReplyTransition(async () => {
      const res = await createDiskusiBalasan(thread.id, replyText);
      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Gagal mengirim balasan.");
        return;
      }

      setReplies((prev) => [...prev, res.data!]);
      setReplyText("");
      setThread((prev) => ({ ...prev, balasanCount: prev.balasanCount + 1 }));
    });
  };

  const handleDeleteReply = (replyId: string) => {
    startDeleteTransition(async () => {
      const res = await deleteDiskusiBalasan(replyId, thread.id);
      if (res.success) {
        setReplies((prev) => prev.filter((r) => r.id !== replyId));
        setReplyToDeleteId(null);
        setThread((prev) => ({ ...prev, balasanCount: Math.max(0, prev.balasanCount - 1) }));
      } else {
        alert(res.error || "Gagal menghapus balasan.");
      }
    });
  };

  const handleDeleteThread = () => {
    startDeleteTransition(async () => {
      const res = await deleteDiskusi(thread.id);
      if (res.success) {
        router.push("/diskusi");
      } else {
        alert(res.error || "Gagal menghapus topik.");
      }
    });
  };

  const handleTogglePin = () => {
    startDeleteTransition(async () => {
      const newPinned = !thread.isPinned;
      const res = await togglePinDiskusi(thread.id, newPinned);
      if (res.success) {
        setThread((prev) => ({ ...prev, isPinned: newPinned }));
      } else {
        alert(res.error || "Gagal mengubah sematan.");
      }
    });
  };

  const handleInsertMention = (bagianNama: string) => {
    setReplyText((prev) => (prev ? `${prev} @${bagianNama} ` : `@${bagianNama} `));
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/diskusi">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Papan Diskusi</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedLink ? "Link Tersalin!" : "Bagikan"}</span>
          </Button>
        </div>
      </div>

      {/* Main Post Card */}
      <Card className="border-primary/20 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={thread.tipe === "diskusi" ? "default" : "secondary"} className="text-xs">
                {thread.tipe === "diskusi" ? "Topik Diskusi" : "Catatan Bersama"}
              </Badge>
              {thread.isPinned && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1"
                >
                  <Pin className="h-3 w-3 fill-amber-500" />
                  <span>Tersemat</span>
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">• {thread.bagianPembuatNama || "Umum"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(thread.createdAt)}
              </span>

              {canManageThread && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(userRole === "admin" || userRole === "ketua") && (
                      <DropdownMenuItem onClick={handleTogglePin}>
                        <Pin className="h-3.5 w-3.5 mr-2" />
                        <span>{thread.isPinned ? "Lepas Sematan" : "Sematkan di Atas"}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      <span>Hapus Topik</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <CardTitle className="text-xl sm:text-2xl leading-snug">{thread.judul}</CardTitle>

          <div className="flex items-center gap-2.5 pt-1 text-xs text-muted-foreground border-b pb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {thread.authorName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">{thread.authorName}</p>
              <p className="text-[11px] text-muted-foreground">
                {thread.authorRole} • {thread.bagianPembuatNama || "Umum"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {thread.isi && (
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {thread.isi}
            </p>
          )}

          {/* Mention Badges */}
          {thread.mentions && thread.mentions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AtSign className="h-3 w-3 text-primary" /> Mentioned:
              </span>
              {thread.mentions.map((m) => (
                <Badge
                  key={m.id}
                  variant="secondary"
                  className="text-xs text-primary bg-primary/10 font-medium"
                >
                  @{m.bagianNama}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2.5 text-xs gap-1.5 ${
                isLiked ? "text-rose-500 font-medium" : "text-muted-foreground"
              }`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isLiked ? "Didukung" : "Dukung Topik Ini"}</span>
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{thread.balasanCount} Balasan</span>
          </div>
        </CardFooter>
      </Card>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>Balasan & Diskusi ({replies.length})</span>
          </h2>
        </div>

        {/* Existing Replies List */}
        <div className="space-y-3">
          {replies.length === 0 ? (
            <Card className="border-dashed py-8 text-center bg-card/50">
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Belum ada tanggapan pada topik ini. Jadilah yang pertama memberikan masukan!
                </p>
              </CardContent>
            </Card>
          ) : (
            replies.map((r) => (
              <Card key={r.id} className="border-border/60 hover:border-border transition-colors">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                      {r.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground">{r.authorName}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 px-1 text-muted-foreground">
                          {r.authorRole}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {r.authorBagian || "Pengurus"} • {formatRelativeTime(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  {canManageReply(r) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => setReplyToDeleteId(r.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="py-1 pb-3 px-4 text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {r.isi}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reply Form */}
        <Card className="border-primary/30 bg-muted/10 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <CornerDownRight className="h-4 w-4 text-primary" />
              <span>Tuliskan Tanggapan Anda</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Komentar akan langsung terlihat oleh seluruh pengurus organisasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 text-xs bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Textarea
              placeholder="Ketik tanggapan, solusi, atau konfirmasi di sini..."
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              rows={3}
              className="text-xs leading-relaxed bg-background"
            />

            {/* Quick Mention Toolbar */}
            {bagianList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
                  <AtSign className="h-3 w-3 text-primary" /> Tag Cepat:
                </span>
                {bagianList.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleInsertMention(b.nama)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground/80 hover:text-primary transition-colors border"
                  >
                    @{b.nama}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 justify-end">
            <Button
              size="sm"
              className="gap-2 h-8 text-xs bg-primary hover:bg-primary/90"
              onClick={handleSendReply}
              disabled={isReplying || !replyText.trim()}
            >
              {isReplying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Kirim Balasan</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Thread Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Topik Diskusi?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus topik ini? Seluruh balasan dan mention terkait akan ikut terhapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteThread} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              <span>Hapus Permanen</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Dialog */}
      <Dialog open={!!replyToDeleteId} onOpenChange={(open) => !open && setReplyToDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Balasan?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus balasan ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setReplyToDeleteId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => replyToDeleteId && handleDeleteReply(replyToDeleteId)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              <span>Hapus</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
