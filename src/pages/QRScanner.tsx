import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { parseQRCodeString, updateQRCodeSignIn } from '@/utils/qrCode';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode as QrCodeIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const QRScanner = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanAreaId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setStatus('scanning');
      
      // Wait for the element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.getElementById(scanAreaId);
      if (!element) {
        throw new Error('QR scanner element not found');
      }
      
      const scanner = new Html5Qrcode(scanAreaId);
      scannerRef.current = scanner;

      // Try to get camera permissions first
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) {
          throw new Error('No cameras found. Please ensure your device has a camera.');
        }
        
        // Use back camera if available, otherwise use first camera
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        const cameraId = backCamera?.id || devices[0].id;
        
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            videoConstraints: {
              facingMode: 'environment',
            },
          },
          (decodedText) => {
            handleQRCodeScanned(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent during scanning)
            // Only log if it's a real error
            if (!errorMessage.includes('NotFoundException')) {
              console.debug('Scanning:', errorMessage);
            }
          }
        );
      } catch (cameraError: any) {
        console.log('Camera ID method failed, trying facingMode:', cameraError.message);
        // Fallback to facingMode if camera ID fails
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleQRCodeScanned(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors
            if (!errorMessage.includes('NotFoundException')) {
              console.debug('Scanning:', errorMessage);
            }
          }
        );
      }
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to start camera. Please check permissions and try again.",
        variant: "destructive",
      });
      setScanning(false);
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignore
        }
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setStatus('idle');
  };

  const handleQRCodeScanned = async (qrCodeString: string) => {
    setScannedData(qrCodeString);
    setStatus('success');
    await stopScanning();

    const parsed = parseQRCodeString(qrCodeString);
    if (!parsed) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for this system.",
        variant: "destructive",
      });
      setStatus('error');
      return;
    }

    // Update QR code sign-in
    const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
    const qrCode = qrCodes.find((qr: any) => qr.sessionId === parsed.sessionId);
    if (qrCode) {
      updateQRCodeSignIn(qrCode.id);
    }

    // Find doctor user and login
    const users = JSON.parse(localStorage.getItem('pd_users') || '[]');
    const doctor = users.find((u: any) => u.id === parsed.doctorId && u.userType === 'doctor');
    
    if (doctor) {
      const success = await login(doctor.email, doctor.password, 'doctor');
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${doctor.name}!`,
        });
        navigate('/doctor-dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Could not log in with this QR code.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Doctor Not Found",
        description: "The doctor associated with this QR code was not found.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <QrCodeIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Scan your doctor QR code to access the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <div className="text-center py-8">
              <QrCodeIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Click the button below to start scanning</p>
              <Button onClick={startScanning} size="lg">
                Start Scanning
              </Button>
            </div>
          )}

          {status === 'scanning' && (
            <div className="space-y-4">
              <div id={scanAreaId} className="w-full min-h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Initializing camera...</p>
              </div>
              <Button onClick={stopScanning} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            </div>
          )}

          {status === 'success' && scannedData && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
              <p className="text-lg font-semibold">QR Code Scanned Successfully!</p>
              <p className="text-sm text-muted-foreground">Processing login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8 space-y-4">
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
              <p className="text-lg font-semibold">Scan Failed</p>
              <p className="text-sm text-muted-foreground">Please try again</p>
              <Button onClick={() => setStatus('idle')} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
};

export default QRScanner;

