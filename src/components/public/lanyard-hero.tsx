'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Lanyard = dynamic(() => import('@/components/Lanyard'), {
  ssr: false,
  loading: () => <div className="h-full min-h-80 animate-pulse rounded-2xl bg-muted/60" aria-label="Memuat animasi kartu organisasi" />,
});

export function LanyardHero({ orgName }: { orgName: string }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:px-8 lg:grid-cols-2 lg:gap-12 lg:py-14">
      <div className="order-1 h-96 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/15 via-card to-background shadow-md lg:order-none lg:h-[42rem]">
        <Lanyard
          frontImage="/lanyard/kartu-depan.png"
          backImage="/lanyard/kartu-belakang.png"
          lanyardImage="/lanyard/lanyard.png"
        />
      </div>

      <div className="order-2 space-y-5 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Bergerak Maju Bersama
        </div>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Terhubung, transparan, dan bergerak bersama {orgName}.
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
          Pantau informasi publik, arus kas, dan kegiatan organisasi dalam satu ruang yang terbuka untuk warga.
        </p>
        <Button asChild size="lg" className="gap-2 shadow-sm">
          <Link href="/laporan-keuangan">
            Lihat transparansi keuangan <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
