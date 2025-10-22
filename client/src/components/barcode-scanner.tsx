import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (code: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScanSuccess }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Get list of video devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        toast({
          title: "Error de Cámara",
          description: "No se encontró ninguna cámara disponible",
          variant: "destructive",
        });
        setIsScanning(false);
        onOpenChange(false);
        return;
      }

      // Try to use rear camera via constraints (works better on iOS)
      try {
        // Use constraints to request rear camera
        await codeReader.decodeFromConstraints(
          { 
            video: { 
              facingMode: 'environment' // Request rear camera
            } 
          },
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              // Validate that it looks like an ISBN (10 or 13 digits)
              if (/^\d{10,13}$/.test(code)) {
                onScanSuccess(code);
                stopScanning();
                onOpenChange(false);
                toast({
                  title: "✅ Código Escaneado",
                  description: `ISBN: ${code}`,
                });
              }
            }
            // Ignore errors - they happen constantly while scanning
          }
        );
      } catch (constraintError) {
        // Fallback to device selection if constraints fail
        console.warn("Constraints failed, trying device selection:", constraintError);
        
        // Prefer back camera on mobile devices
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('environment')
        );

        const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

        // Start decoding from video device
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              // Validate that it looks like an ISBN (10 or 13 digits)
              if (/^\d{10,13}$/.test(code)) {
                onScanSuccess(code);
                stopScanning();
                onOpenChange(false);
                toast({
                  title: "✅ Código Escaneado",
                  description: `ISBN: ${code}`,
                });
              }
            }
            // Ignore errors - they happen constantly while scanning
          }
        );
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      });
      setIsScanning(false);
      onOpenChange(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onOpenChange(false);
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
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white">Iniciando cámara...</p>
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
