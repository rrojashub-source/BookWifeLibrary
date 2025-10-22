import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (code: string) => void;
}

type ScannerState = 'idle' | 'requesting-permission' | 'starting' | 'ready' | 'error';

export function BarcodeScanner({ open, onOpenChange, onScanSuccess }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setState('requesting-permission');
      console.log('📸 Solicitando acceso a la cámara...');
      
      // Timeout de 10 segundos para detectar si la cámara no inicia
      timeoutRef.current = setTimeout(() => {
        if (state !== 'ready') {
          console.error('⏱️ Timeout: La cámara no respondió en 10 segundos');
          setState('error');
          setErrorMessage('La cámara tardó demasiado en responder. Por favor, verifica los permisos e intenta de nuevo.');
        }
      }, 10000);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      setState('starting');
      console.log('📋 Obteniendo lista de cámaras...');

      // Get list of video devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      console.log(`📷 Encontradas ${videoInputDevices.length} cámaras:`, videoInputDevices.map(d => d.label));
      
      if (videoInputDevices.length === 0) {
        console.error('❌ No se encontró ninguna cámara');
        setState('error');
        setErrorMessage('No se encontró ninguna cámara disponible en este dispositivo');
        toast({
          title: "Error de Cámara",
          description: "No se encontró ninguna cámara disponible",
          variant: "destructive",
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        return;
      }

      // Try to use rear camera via constraints (works better on iOS)
      try {
        console.log('🎯 Intentando usar cámara trasera con constraints...');
        
        // Use constraints to request rear camera
        const result = await codeReader.decodeFromConstraints(
          { 
            video: { 
              facingMode: 'environment' // Request rear camera
            } 
          },
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              console.log('📖 Código detectado:', code);
              // Validate that it looks like an ISBN (10 or 13 digits)
              if (/^\d{10,13}$/.test(code)) {
                console.log('✅ Código ISBN válido');
                onScanSuccess(code);
                stopScanning();
                onOpenChange(false);
                toast({
                  title: "✅ Código Escaneado",
                  description: `ISBN: ${code}`,
                });
              } else {
                console.log('⚠️ Código no es ISBN válido');
              }
            }
            // Ignore errors - they happen constantly while scanning
          }
        );
        
        console.log('✅ Cámara iniciada con constraints');
        setState('ready');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
      } catch (constraintError) {
        // Fallback to device selection if constraints fail
        console.warn("⚠️ Constraints fallaron, intentando selección de dispositivo:", constraintError);
        
        // Prefer back camera on mobile devices
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );

        const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;
        const selectedDevice = videoInputDevices.find(d => d.deviceId === selectedDeviceId);
        console.log('📷 Usando cámara:', selectedDevice?.label || selectedDeviceId);

        // Start decoding from video device
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              console.log('📖 Código detectado:', code);
              // Validate that it looks like an ISBN (10 or 13 digits)
              if (/^\d{10,13}$/.test(code)) {
                console.log('✅ Código ISBN válido');
                onScanSuccess(code);
                stopScanning();
                onOpenChange(false);
                toast({
                  title: "✅ Código Escaneado",
                  description: `ISBN: ${code}`,
                });
              } else {
                console.log('⚠️ Código no es ISBN válido');
              }
            }
            // Ignore errors - they happen constantly while scanning
          }
        );
        
        console.log('✅ Cámara iniciada con device selection');
        setState('ready');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    } catch (error: any) {
      console.error("❌ Error starting camera:", error);
      
      let errorMsg = "No se pudo acceder a la cámara.";
      
      // Specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg = "Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMsg = "No se encontró ninguna cámara en este dispositivo.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMsg = "La cámara ya está en uso por otra aplicación. Cierra otras apps que usen la cámara e intenta de nuevo.";
      } else if (error.name === 'OverconstrainedError') {
        errorMsg = "No se pudo acceder a la cámara trasera. Intenta de nuevo.";
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      setState('error');
      setErrorMessage(errorMsg);
      
      toast({
        title: "Error de Cámara",
        description: errorMsg,
        variant: "destructive",
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const stopScanning = () => {
    console.log('🛑 Deteniendo escáner...');
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setState('idle');
    setErrorMessage('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanning();
    onOpenChange(false);
  };

  const handleRetry = () => {
    setErrorMessage('');
    setState('idle');
    startScanning();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código de Barras
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              muted
            />
            
            {/* Loading overlay */}
            {(state === 'requesting-permission' || state === 'starting') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-white text-center px-4">
                  {state === 'requesting-permission' 
                    ? 'Solicitando permiso de cámara...' 
                    : 'Iniciando cámara...'}
                </p>
                <p className="text-white/60 text-sm mt-2 text-center px-4">
                  Si aparece un mensaje, permite el acceso a la cámara
                </p>
              </div>
            )}
            
            {/* Error overlay */}
            {state === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-white text-center mb-4">{errorMessage}</p>
                <Button 
                  onClick={handleRetry}
                  variant="secondary"
                  data-testid="button-retry-camera"
                >
                  Reintentar
                </Button>
              </div>
            )}
            
            {/* Ready indicator */}
            {state === 'ready' && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Escaneando...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Coloca el código de barras del libro frente a la cámara
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Funciona con códigos ISBN-10 e ISBN-13
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleClose}
            data-testid="button-close-scanner"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
