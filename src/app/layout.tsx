import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://manajemen-organisasi.vercel.app/'),
  title: 'KartaTuju',
  description: 'Selasa, 04 Agustus 2026',
  applicationName: 'KartaTuju',
  authors: [{ name: 'KartaTuju' }],
  creator: 'KartaTuju',
  publisher: 'KartaTuju',
  category: 'website',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KartaTuju',
    description: 'Selasa, 04 Agustus 2026',
    url: '/',
    siteName: 'KartaTuju',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: '/logo.png',
        alt: 'KartaTuju',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KartaTuju',
    description: 'Selasa, 04 Agustus 2026',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/logo192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/logo192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
