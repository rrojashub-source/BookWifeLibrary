// Utilidades para PWA (Progressive Web App)

/**
 * Registra el Service Worker para funcionalidad PWA
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado:', registration.scope);
          
          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('[PWA] Error al registrar Service Worker:', error);
        });
    });
  }
}

/**
 * Verifica si la app ya está instalada
 */
export function isAppInstalled(): boolean {
  // Para iOS
  if ((window.navigator as any).standalone) {
    return true;
  }
  
  // Para Android y otros navegadores
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  return false;
}

/**
 * Detecta si el dispositivo es iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detecta si puede mostrar prompt de instalación
 */
export function canShowInstallPrompt(): boolean {
  // iOS Safari no soporta beforeinstallprompt, solo instalación manual
  if (isIOS()) {
    return !isAppInstalled();
  }
  
  // Chrome/Edge soportan beforeinstallprompt
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Hook para manejar instalación PWA
 */
export function usePWAInstall() {
  let deferredPrompt: any = null;

  // Capturar evento de instalación
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Prompt de instalación disponible');
  });

  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No hay prompt disponible');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`[PWA] Instalación: ${outcome}`);
    deferredPrompt = null;
    
    return outcome === 'accepted';
  };

  return {
    canInstall: deferredPrompt !== null,
    isInstalled: isAppInstalled(),
    isIOS: isIOS(),
    showInstallPrompt
  };
}

/**
 * Limpia el caché del Service Worker
 */
export async function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('[PWA] Caché limpiado');
    }
  }
}

/**
 * Desregistra el Service Worker (para debugging)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[PWA] Service Worker desregistrado');
    }
  }
}
