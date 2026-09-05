"use client";

import { useState, useEffect } from "react";
import { PengumumanItem } from "@/actions/pengumuman";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Megaphone,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  User,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface DashboardAnnouncementBannerProps {
  announcements: PengumumanItem[];
  userRole?: string;
  userBagianNama?: string;
}

export function DashboardAnnouncementBanner({
  announcements = [],
  userRole = "anggota",
  userBagianNama,
}: DashboardAnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<PengumumanItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load dismissed announcement IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dismissed_announcements");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // ignore JSON parse or localStorage errors
    }
    setIsMounted(true);
  }, []);

  // Filter out announcements that have been dismissed
  const activeAnnouncements = announcements.filter(
    (item) => !dismissedIds.includes(item.id)
  );

  // Keep index within bounds if active announcements shrink
  useEffect(() => {
    if (currentIndex >= activeAnnouncements.length && activeAnnouncements.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeAnnouncements.length, currentIndex]);

  if (!isMounted || activeAnnouncements.length === 0) {
    return null;
  }

  const currentItem = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem("dismissed_announcements", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isTargetedToBagian = currentItem.target === "bagian_tertentu";

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-card p-3 sm:p-3.5 shadow-xs transition-all">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          {/* Left: Icon & Content */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Animated Megaphone Icon */}
            <div className="relative shrink-0 mt-0.5 sm:mt-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Megaphone className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>

            {/* Texts */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Pengumuman</span>
                </Badge>

                {isTargetedToBagian ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                  >
                    Khusus: {currentItem.bagianNama || userBagianNama || "Bagian Terpilih"}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  >
                    Semua Anggota
                  </Badge>
                )}

                <span className="text-[11px] text-muted-foreground hidden md:inline">
                  • {formatDate(currentItem.createdAt)}
                </span>
              </div>

              <div
                className="cursor-pointer group"
                onClick={() => setSelectedAnnouncement(currentItem)}
              >
                <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {currentItem.judul}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                  {currentItem.isi}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
            {/* Pager if multiple */}
            {activeAnnouncements.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handlePrev}
                  title="Sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] font-medium min-w-[28px] text-center">
                  {currentIndex + 1}/{activeAnnouncements.length}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleNext}
                  title="Berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2.5 bg-background/60 hover:bg-background border-amber-500/30 text-foreground hover:text-amber-600 dark:hover:text-amber-400 gap-1 font-medium"
              onClick={() => setSelectedAnnouncement(currentItem)}
            >
              <span>Baca Detail</span>
              <ArrowRight className="h-3 w-3" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-amber-500/10 rounded-lg"
              onClick={(e) => handleDismiss(currentItem.id, e)}
              title="Tutup banner"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Detail Pengumuman */}
      <Dialog
        open={Boolean(selectedAnnouncement)}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
      >
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1"
              >
                <Megaphone className="h-3 w-3" />
                <span>Pengumuman Resmi</span>
              </Badge>
              {selectedAnnouncement?.target === "bagian_tertentu" ? (
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-700 dark:text-blue-300">
                  Khusus: {selectedAnnouncement.bagianNama || "Bagian"}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  Semua Anggota
                </Badge>
              )}
            </div>

            <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {selectedAnnouncement?.judul}
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {selectedAnnouncement ? formatDate(selectedAnnouncement.createdAt) : ""}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedAnnouncement?.authorName} ({selectedAnnouncement?.authorRole})
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto border-y my-1">
            {selectedAnnouncement?.isi}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-row justify-between items-center">
            <Link href="/pengumuman" onClick={() => setSelectedAnnouncement(null)}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Ke Halaman Pengumuman</span>
              </Button>
            </Link>

            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Tutup
              </Button>
              {selectedAnnouncement && (
                <Button
                  size="sm"
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => {
                    handleDismiss(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                >
                  Tandai Selesai Dibaca
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
