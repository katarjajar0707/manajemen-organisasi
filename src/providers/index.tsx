'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(222 39% 12%)',
            border: '1px solid hsl(217 33% 22%)',
            color: 'hsl(210 40% 95%)',
          },
        }}
      />
    </ThemeProvider>
  );
}
