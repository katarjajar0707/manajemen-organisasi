import type { Metadata, Viewport } from 'next';
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
  metadataBase: new URL('https://kartatuju.vercel.app'),
  title: {
    default: 'KartaTuju | Manajemen Organisasi',
    template: '%s | KartaTuju',
  },
  description: 'Platform digital untuk mengelola anggota, struktur organisasi, agenda, inventaris, dokumen, dan transparansi informasi organisasi.',
  applicationName: 'KartaTuju',
  appleWebApp: {
    capable: true,
    title: 'KartaTuju',
    statusBarStyle: 'default',
  },
  authors: [{ name: 'KartaTuju' }],
  creator: 'KartaTuju',
  publisher: 'KartaTuju',
  category: 'website',
  alternates: {
    canonical: 'https://kartatuju.vercel.app/',
  },
  openGraph: {
    title: 'KartaTuju | Manajemen Organisasi',
    description: 'Platform digital untuk mengelola anggota, struktur organisasi, agenda, inventaris, dokumen, dan transparansi informasi organisasi.',
    url: 'https://kartatuju.vercel.app/',
    siteName: 'KartaTuju',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: 'https://kartatuju.vercel.app/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KartaTuju | Manajemen Organisasi',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KartaTuju | Manajemen Organisasi',
    description: 'Platform digital untuk mengelola anggota, struktur organisasi, agenda, inventaris, dokumen, dan transparansi informasi organisasi.',
    images: ['https://kartatuju.vercel.app/og-image.svg'],
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

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('karta-theme-color');
                const allowed = ['green','blue','orange','pink','red'];
                const value = allowed.includes(saved || '') ? saved : 'green';
                document.documentElement.setAttribute('data-color-theme', value);
              } catch (error) {
                document.documentElement.setAttribute('data-color-theme', 'green');
              }
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
