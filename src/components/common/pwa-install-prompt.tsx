'use client';

import { useEffect, useState } from 'react';
import { Download, Plus, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isIosDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    if (isStandalone) {
      return;
    }

    const detectIosTimer = window.setTimeout(() => {
      setIsIos(isIosDevice);
      if (isIosDevice) setIsAvailable(true);
    }, 0);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsAvailable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsAvailable(false);
      setIsInstalled(true);
      setShowIosInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(detectIosTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!installPrompt) return;

    setInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstalling(false);

    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsAvailable(false);
      setIsInstalled(true);
    }
  };

  if (!isAvailable || isInstalled) return null;

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={installApp} disabled={installing} className="gap-1.5 text-xs h-8">
        <Download className="h-3.5 w-3.5" />
        {installing ? 'Menyiapkan...' : 'Install'}
      </Button>

      {isIos && (
        <Dialog open={showIosInstructions} onOpenChange={setShowIosInstructions}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Install KartaTuju</DialogTitle>
              <DialogDescription>
                Di Safari, pilih tombol Bagikan lalu pilih <strong>Tambahkan ke Layar Utama</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 rounded-md bg-muted/50 p-3 text-sm text-foreground">
              <Share className="h-4 w-4" /> Bagikan <span aria-hidden="true">→</span> <Plus className="h-4 w-4" /> Tambahkan ke Layar Utama
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setShowIosInstructions(false)}>
                Mengerti
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
