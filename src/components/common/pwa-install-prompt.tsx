'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'kartatuju-pwa-install-dismissed';

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const wasDismissed = window.localStorage.getItem(DISMISSED_KEY) === 'true';

    if (isStandalone || wasDismissed) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setOpen(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, 'true');
    setOpen(false);
  };

  const installApp = async () => {
    if (!installPrompt) return;

    setInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstalling(false);

    if (choice.outcome === 'accepted') {
      setOpen(false);
    }
  };

  if (!installPrompt) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <DialogTitle>Pasang KartaTuju di perangkat Anda</DialogTitle>
          <DialogDescription>Akses dashboard lebih cepat dari layar utama dengan tampilan seperti aplikasi.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={dismiss} disabled={installing}>
            Nanti saja
          </Button>
          <Button type="button" onClick={installApp} disabled={installing} className="gap-2">
            <Download className="h-4 w-4" />
            {installing ? 'Menyiapkan...' : 'Install aplikasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
