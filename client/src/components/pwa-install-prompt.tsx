import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { isAppInstalled, isIOS } from "@/lib/pwa-utils";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Si ya está instalada, no mostrar
    if (isAppInstalled()) {
      return;
    }

    // Verificar si el usuario ya rechazó el prompt recientemente
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) {
        return; // No mostrar si fue rechazado hace menos de 7 días
      }
    }

    // Mostrar inmediatamente para todos los navegadores
    // Para iOS, siempre mostrar instrucciones manuales
    // Para Android/Chrome, mostrar incluso si beforeinstallprompt no se disparó aún
    setShowPrompt(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] beforeinstallprompt aún no disponible');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] Usuario aceptó instalación');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Error al mostrar prompt de instalación:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage para no molestar por 7 días
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };


  if (!showPrompt) {
    return null;
  }

  // Prompt para iOS
  if (isIOS()) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <CardTitle className="text-base">Instalar Biblioteca Moi</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Agrega esta app a tu pantalla de inicio para acceso rápido
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
              data-testid="button-dismiss-pwa"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Para instalar en iOS:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Toca el botón <strong>Compartir</strong> (ícono cuadrado con flecha ↑)</li>
                <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
                <li>Toca <strong>"Agregar"</strong></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prompt para Android/Chrome
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-base">Instalar Biblioteca Moi</CardTitle>
              <CardDescription className="text-xs mt-1">
                Agrega esta app a tu pantalla de inicio para acceso rápido y sin conexión
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
            data-testid="button-dismiss-pwa"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1"
            data-testid="button-install-pwa"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            data-testid="button-not-now-pwa"
          >
            Ahora no
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
