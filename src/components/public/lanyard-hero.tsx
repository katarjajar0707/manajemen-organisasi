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
    <section className="-mt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:mt-0 lg:-mt-[4.25rem] mx-auto grid max-w-7xl items-center gap-8 px-4 pt-0 pb-10 md:px-8 md:py-8 lg:grid-cols-12 lg:gap-8 lg:pt-0 lg:pb-0 overflow-x-clip">
      <div className="order-1 -mx-4 w-[calc(100%+2rem)] h-[38rem] sm:mx-0 sm:w-full sm:h-[40rem] md:h-[28rem] lg:order-none lg:col-span-7 lg:h-[calc(100vh-0px)] xl:col-span-7">
        <Lanyard
          frontImage="/lanyard/kartu-depan.png"
          backImage="/lanyard/kartu-belakang.png"
          lanyardImage="/lanyard/lanyard.png"
        />
      </div>

      <div className="order-2 space-y-5 text-center lg:order-none lg:col-span-5 lg:space-y-6 lg:text-left xl:col-span-5 lg:pl-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Bergerak Maju Bersama
        </div>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Terhubung, transparan, dan bergerak bersama {orgName}.
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
          Pantau informasi publik, arus kas, dan kegiatan organisasi dalam satu ruang yang terbuka untuk warga.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Button asChild size="lg" className="gap-2 shadow-sm">
            <Link href="/laporan-keuangan">
              Lihat transparansi keuangan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
