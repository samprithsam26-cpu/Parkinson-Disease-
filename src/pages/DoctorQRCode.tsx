import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download, QrCode as QrCodeIcon, RefreshCw } from 'lucide-react';
import { getDoctorQRCodes, generateQRCodeImage, createDoctorQRCode, deleteQRCode } from '@/utils/qrCode';
import { DoctorQRCode } from '@/types/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';

const DoctorQRCodePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [qrCodes, setQRCodes] = useState<DoctorQRCode[]>([]);
  const [qrImages, setQRImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userType !== 'doctor') {
      navigate('/');
      return;
    }
    loadQRCodes();
  }, [user, navigate]);

  const loadQRCodes = async () => {
    if (!user) return;
    
    const codes = getDoctorQRCodes(user.id);
    setQRCodes(codes);
    
    // Generate images for all QR codes
    const images: Record<string, string> = {};
    for (const qr of codes) {
      try {
        const image = await generateQRCodeImage(qr.qrCode);
        images[qr.id] = image;
      } catch (error) {
        console.error('Error generating QR image:', error);
      }
    }
    setQRImages(images);
  };

  const handleGenerateNewQR = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newQR = await createDoctorQRCode(user.id, user.name, user.email);
      const image = await generateQRCodeImage(newQR.qrCode);
      
      setQRCodes([...qrCodes, newQR]);
      setQRImages({ ...qrImages, [newQR.id]: image });
      
      toast({
        title: "QR Code Generated",
        description: "A new QR code has been created for this session.",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQR = (qrId: string) => {
    if (deleteQRCode(qrId)) {
      setQRCodes(qrCodes.filter(qr => qr.id !== qrId));
      const newImages = { ...qrImages };
      delete newImages[qrId];
      setQRImages(newImages);
      
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been removed.",
      });
    }
  };

  const handleDownloadQR = (qrId: string, qrCode: DoctorQRCode) => {
    const image = qrImages[qrId];
    if (!image) return;
    
    const link = document.createElement('a');
    link.download = `QR_${qrCode.doctorName}_${qrCode.sessionId}.png`;
    link.href = image;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (user?.userType !== 'doctor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <QrCodeIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Doctor QR Codes</h1>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => navigate('/doctor-dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your QR Codes</h2>
            <p className="text-muted-foreground">Scan these QR codes to access the system</p>
          </div>
          <Button onClick={handleGenerateNewQR} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate New QR Code
          </Button>
        </div>

        {qrCodes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCodeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No QR codes yet. Generate one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => (
              <Card key={qr.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Session QR Code</CardTitle>
                      <CardDescription>Session ID: {qr.sessionId.substring(0, 12)}...</CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this QR code? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteQR(qr.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrImages[qr.id] ? (
                    <div className="flex justify-center">
                      <img src={qrImages[qr.id]} alt="QR Code" className="w-full max-w-[250px]" />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[250px] bg-muted">
                      <p className="text-muted-foreground">Loading QR code...</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Created:</span> {formatDate(qr.createdAt)}
                    </div>
                    <div>
                      <span className="font-semibold">Last Sign-In:</span> {formatDate(qr.lastSignIn)}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={qr.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                        {qr.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownloadQR(qr.id, qr)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DoctorQRCodePage;

