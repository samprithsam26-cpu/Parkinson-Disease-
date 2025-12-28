import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Upload, FileText, BarChart3, MessageCircle, LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UploadSection from "@/components/diagnosis/UploadSection";
import ResultsDisplay from "@/components/diagnosis/ResultsDisplay";
import { analyzeImages } from "@/utils/imageAnalysis";
import { AnalysisSummary } from "@/utils/imageAnalysis";
import { syncAppointment } from "@/utils/serverSync";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<Record<string, File>>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisSummary | null>(null);

  const emotions = [
    { key: "anger", label: "Anger", icon: "😠" },
    { key: "disgust", label: "Disgust", icon: "🤢" },
    { key: "fear", label: "Fear", icon: "😨" },
    { key: "happiness", label: "Happiness", icon: "😊" },
    { key: "sadness", label: "Sadness", icon: "😢" },
    { key: "surprise", label: "Surprise", icon: "😲" },
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze images based on filenames
    const result = analyzeImages(uploadedImages, user ? {
      name: user.name,
      email: user.email,
      userType: user.userType,
    } : undefined);
    
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setShowResults(true);
    
    // Update patient record if user is a patient
    if (user && user.userType === 'patient') {
      const patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
      const patientIndex = patientRecords.findIndex((p: any) => p.patientId === user.id);
      
      if (patientIndex >= 0) {
        patientRecords[patientIndex].lastLogin = new Date().toISOString();
        patientRecords[patientIndex].totalAnalyses = (patientRecords[patientIndex].totalAnalyses || 0) + 1;
        patientRecords[patientIndex].lastAnalysis = new Date().toISOString();
        patientRecords[patientIndex].status = 'busy';
        localStorage.setItem('pd_patient_records', JSON.stringify(patientRecords));
        
        // Sync updated patient record to server
        import('@/utils/serverSync').then(({ syncPatientRecord }) => {
          syncPatientRecord(patientRecords[patientIndex]).catch(console.error);
        });
      }
    }
  };

  const isReadyToAnalyze = Object.keys(uploadedImages).length === 6;

  const handleBookAppointment = async () => {
    if (!user || user.userType !== 'patient') {
      toast({
        title: "Error",
        description: "Only patients can book appointments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update patient record in localStorage
      const patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
      const patientIndex = patientRecords.findIndex((p: any) => p.patientId === user.id);
      
      if (patientIndex >= 0) {
        const now = new Date().toISOString();
        patientRecords[patientIndex].status = 'book_appointment';
        patientRecords[patientIndex].appointmentRequestedAt = now;
        localStorage.setItem('pd_patient_records', JSON.stringify(patientRecords));

        // Sync appointment event to server
        const appointmentSynced = await syncAppointment({
          patientId: user.id,
          patientName: user.name,
          patientEmail: user.email,
          status: 'book_appointment',
          timestamp: now,
        });

        // Also sync the full patient record to server
        const { syncPatientRecord } = await import('@/utils/serverSync');
        const recordSynced = await syncPatientRecord(patientRecords[patientIndex]);

        if (appointmentSynced && recordSynced) {
          toast({
            title: "Appointment Requested",
            description: "Your appointment request has been sent to the doctor. They will review it shortly.",
          });
        } else {
          toast({
            title: "Appointment Requested (Local)",
            description: "Appointment saved locally. Syncing to server...",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Patient record not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PD DiagnoSys</h1>
                <p className="text-sm text-muted-foreground">Parkinson's Disease Auto-Diagnosis System</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {user && (
                <div className="mr-4 text-sm text-muted-foreground">
                  {user.name} ({user.userType === 'doctor' ? 'Doctor' : user.userType === 'admin' ? 'Admin' : 'Patient'})
                </div>
              )}
              {user && user.userType === 'patient' && (
                <>
                  <Button variant="outline" onClick={() => navigate("/ai-assistant")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/documentation")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/methodology")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Methodology
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          <>
            {/* Introduction Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to PD DiagnoSys</CardTitle>
                <CardDescription className="text-base mt-2">
                  An automated deep learning-based system for Parkinson's Disease diagnosis using mixed emotional facial expressions.
                  Upload facial images displaying six basic emotions to begin analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <div className="p-2 bg-primary rounded-lg">
                      <Upload className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Step 1: Upload Images</h3>
                      <p className="text-sm text-muted-foreground">Provide facial images for all six emotions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <div className="p-2 bg-accent rounded-lg">
                      <Brain className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Step 2: AI Analysis</h3>
                      <p className="text-sm text-muted-foreground">Deep learning model processes features</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <div className="p-2 bg-success rounded-lg">
                      <BarChart3 className="h-5 w-5 text-success-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Step 3: Get Results</h3>
                      <p className="text-sm text-muted-foreground">View diagnosis and confidence scores</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <UploadSection
              emotions={emotions}
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
            />

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!isReadyToAnalyze || isAnalyzing}
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-5 w-5 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Analyze Images
                    </>
                  )}
                </Button>
                {user && user.userType === 'patient' && (
                  <Button
                    size="lg"
                    onClick={handleBookAppointment}
                    variant="outline"
                    className="px-8"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                )}
              </div>
              {!isReadyToAnalyze && (
                <p className="text-center text-muted-foreground">
                  Please upload images for all 6 emotions to proceed
                </p>
              )}
            </div>
          </>
        ) : (
          <ResultsDisplay 
            analysisResult={analysisResult}
            onReset={() => {
              setShowResults(false);
              setUploadedImages({});
              setAnalysisResult(null);
            }} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
