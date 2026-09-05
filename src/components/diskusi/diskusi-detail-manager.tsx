"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  AtSign,
  MessageCircle,
  Heart,
  Pin,
  Share2,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  CornerDownRight,
} from "lucide-react";
import { INITIAL_THREADS, ThreadItem } from "./diskusi-manager";

interface ReplyItem {
  id: string;
  author: string;
  role: string;
  content: string;
  time: string;
  likesCount: number;
  isLiked?: boolean;
}

const INITIAL_REPLIES: Record<string, ReplyItem[]> = {
  "1": [
    {
      id: "r1",
      author: "Siti Rahma",
      role: "Bendahara Umum",
      content:
        "Untuk estimasi pagu anggaran lomba per RT disiapkan total Rp 1.500.000. Mohon rincian belanja hadiah dan konsumsi juri dibuatkan draft excel/proposal kasarnya ya tim acara.",
      time: "2 jam lalu",
      likesCount: 5,
      isLiked: false,
    },
    {
      id: "r2",
      author: "Diki Kurniawan",
      role: "Koordinator Sarpras",
      content:
        "Untuk perlengkapan seperti tali tambang, karung goni, bendera tiang, dan sound portable wireless sudah siap pakai di gudang sekretariat. Nanti tim sarpras standby H-1 untuk setting lapangan.",
      time: "1 jam lalu",
      likesCount: 3,
      isLiked: true,
    },
    {
      id: "r3",
      author: "Azzam Azhari",
      role: "Ketua Karang Taruna",
      content:
        "Bagus sekali inisiatifnya. Pastikan juga melibatkan karang taruna unit RT agar mereka merasa punya peran aktif. Jadwalkan rapat teknis offline hari Sabtu malam ini ya teman-teman.",
      time: "45 menit lalu",
      likesCount: 7,
      isLiked: false,
    },
  ],
  "2": [
    {
      id: "r2-1",
      author: "Diki Kurniawan",
      role: "Koordinator Sarpras",
      content:
        "Formulir cetak peminjaman sudah ditaruh di meja sekretariat dan versi form online Google Form juga siap di blast ke grup RT/RW.",
      time: "Kemarin, 16:00",
      likesCount: 2,
      isLiked: false,
    },
  ],
};

interface DiskusiDetailManagerProps {
  id: string;
}

export function DiskusiDetailManager({ id }: DiskusiDetailManagerProps) {
  // Find thread or fallback
  const foundThread = INITIAL_THREADS.find((t) => t.id === id) || {
    id,
    tipe: "diskusi" as const,
    judul: "Topik Pembahasan Karang Taruna",
    isi: "Isi detail pembahasan koordinasi antar seksi dan pengurus.",
    author: "Pengurus",
    authorRole: "Divisi Terkait",
    bagian: "Umum",
    mentions: ["@Semua"],
    balasanCount: 2,
    likesCount: 5,
    isLiked: false,
    isPinned: false,
    time: "Baru saja",
    tags: ["Umum"],
  };

  const [thread, setThread] = useState<ThreadItem>(foundThread);
  const [replies, setReplies] = useState<ReplyItem[]>(INITIAL_REPLIES[id] || []);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Azzam Azhari (Ketua)");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleThreadLike = () => {
    setThread((prev) => {
      const isLiked = !prev.isLiked;
      return {
        ...prev,
        isLiked,
        likesCount: isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
      };
    });
  };

  const handleToggleReplyLike = (replyId: string) => {
    setReplies((prev) =>
      prev.map((r) => {
        if (r.id === replyId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newReply: ReplyItem = {
      id: Date.now().toString(),
      author: replyAuthor.split("(")[0].trim() || "Saya",
      role: replyAuthor.includes("(") ? replyAuthor.replace(/^[^(]*\(([^)]*)\).*$/, "$1") : "Anggota",
      content: replyText.trim(),
      time: "Baru saja",
      likesCount: 0,
      isLiked: false,
    };

    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
    setThread((prev) => ({ ...prev, balasanCount: prev.balasanCount + 1 }));
  };

  const handleInsertMention = (mentionTag: string) => {
    setReplyText((prev) => `${prev} ${mentionTag} `);
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
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
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
                <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1">
                  <Pin className="h-3 w-3 fill-amber-500" />
                  <span>Tersemat</span>
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">• {thread.bagian}</span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {thread.time}
            </span>
          </div>

          <CardTitle className="text-xl sm:text-2xl leading-snug">{thread.judul}</CardTitle>

          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground border-b pb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
              {thread.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">{thread.author}</p>
              <p className="text-[11px] text-muted-foreground">{thread.authorRole} • {thread.bagian}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {thread.isi}
          </p>

          {/* Mention Badges */}
          {thread.mentions && thread.mentions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AtSign className="h-3 w-3 text-primary" /> Mentioned:
              </span>
              {thread.mentions.map((m, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs text-primary bg-primary/10 font-medium"
                >
                  {m}
                </Badge>
              ))}
            </div>
          )}

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-1">
              {thread.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t bg-muted/20 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs ${
              thread.isLiked ? "text-rose-500 font-semibold" : "text-muted-foreground"
            }`}
            onClick={handleToggleThreadLike}
          >
            <Heart className={`h-4 w-4 ${thread.isLiked ? "fill-rose-500" : ""}`} />
            <span>{thread.likesCount} Dukungan</span>
          </Button>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            <span>{replies.length} Tanggapan Aktif</span>
          </div>
        </CardFooter>
      </Card>

      {/* Replies Thread */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>Balasan & Umpan Balik ({replies.length})</span>
          </h3>
          <span className="text-xs text-muted-foreground">Urutkan: Terlama ke Terbaru</span>
        </div>

        {replies.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-muted-foreground text-xs">
            Belum ada balasan untuk thread ini. Jadilah yang pertama memberikan masukan di bawah!
          </Card>
        ) : (
          replies.map((reply, idx) => (
            <Card key={reply.id} className="bg-card/70 border hover:border-primary/20 transition-all">
              <CardHeader className="py-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {reply.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{reply.author}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {reply.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{reply.time}</span>
                </div>
              </CardHeader>
              <CardContent className="py-2 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {reply.content}
              </CardContent>
              <CardFooter className="py-2 pt-1 border-t bg-muted/10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs gap-1 ${
                    reply.isLiked ? "text-rose-500" : "text-muted-foreground"
                  }`}
                  onClick={() => handleToggleReplyLike(reply.id)}
                >
                  <Heart className={`h-3 w-3 ${reply.isLiked ? "fill-rose-500" : ""}`} />
                  <span>{reply.likesCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary gap-1"
                  onClick={() => handleInsertMention(`@${reply.author}`)}
                >
                  <CornerDownRight className="h-3 w-3" />
                  <span>Balas @{reply.author.split(" ")[0]}</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}

        {/* Input Balasan Baru */}
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="py-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Tulis Balasan sebagai:
              </span>
              <Input
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                className="h-6 w-48 text-xs font-normal"
                placeholder="Nama & Jabatan Anda"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Textarea
              placeholder="Tuliskan masukan, kesiapan peralatan, atau koordinasi tugas di sini..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="text-xs leading-relaxed"
            />

            {/* Quick Mention Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
                <span className="text-[11px]">Cepat tag:</span>
                {["@Ketua", "@Bendahara", "@Sarpras", "@Acara"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertMention(tag)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="gap-1.5 h-8 px-4"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Komentar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
