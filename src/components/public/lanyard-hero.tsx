'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FoldText from '@/components/public/fold-text';
import TextType from '@/components/public/text-type';

const Lanyard = dynamic(() => import('@/components/Lanyard'), {
  ssr: false,
  loading: () => <div className="h-full min-h-80 animate-pulse rounded-2xl bg-muted/60" aria-label="Memuat animasi kartu organisasi" />,
});

export function LanyardHero({ orgName }: { orgName: string }) {
  return (
    <section className="relative -mt-[calc(4.25rem+env(safe-area-inset-top,0px))] min-h-[100dvh] lg:min-h-screen w-full overflow-x-clip flex flex-col justify-end lg:justify-center">
      {/* Background Lanyard Layer (Mundur 1 lapis ke belakang dan menyentuh paling atas layar) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto flex items-start justify-center">
        <Lanyard
          position={[0, 0, 20]}
          gravity={[0, -40, 0]}
          frontImage="/lanyard/kartu-depan.png"
          backImage="/lanyard/kartu-belakang.png"
          lanyardImage="/lanyard/lanyard.png"
          className="w-full h-full"
        />
      </div>

      {/* Hero Content Section (Glass Effect dengan Backdrop Blur menempel di bagian bawah layar mobile) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8 lg:pb-0 pointer-events-none flex flex-col justify-end">
        <div className="pointer-events-auto max-w-xl mx-auto lg:mx-0 w-full space-y-4 sm:space-y-6 text-center lg:text-left rounded-3xl border border-white/20 dark:border-white/10 bg-background/65 dark:bg-background/45 p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 mt-[46vh] sm:mt-[36vh] md:mt-24 lg:mt-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-xs">
            <Sparkles className="h-3.5 w-3.5" /> Bergerak Maju Bersama
          </div>

          <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            <FoldText
              text={`Terhubung, transparan, dan bergerak bersama ${orgName}.`}
              splitBy="char"
              hinge="top"
              trigger="scroll"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              color="currentColor"
            />
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 min-h-[2.75rem] sm:min-h-[3rem]">
            <TextType
              as="span"
              text={[
                "Pantau informasi publik, arus kas, dan kegiatan organisasi dalam satu ruang yang terbuka untuk warga.",
                "Transparansi keuangan real-time — dari bendahara langsung ke seluruh warga.",
                "Agenda kegiatan, laporan kas, dan profil anggota — semua dalam satu platform.",
              ]}
              typingSpeed={40}
              deletingSpeed={20}
              pauseDuration={2800}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-primary font-light"
              startOnVisible={true}
              loop={true}
              className="text-sm sm:text-base"
            />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start pt-1">
            <Button asChild size="lg" className="gap-2 shadow-md w-full sm:w-auto">
              <Link href="/laporan-keuangan">
                Lihat transparansi keuangan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
