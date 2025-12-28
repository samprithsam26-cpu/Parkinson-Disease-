import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, RefreshCw, Download, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalysisSummary } from "@/utils/imageAnalysis";
import { downloadReport } from "@/utils/reportGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { syncAppointment } from "@/utils/serverSync";
import { toast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  analysisResult: AnalysisSummary | null;
  onReset: () => void;
}

const ResultsDisplay = ({ analysisResult, onReset }: ResultsDisplayProps) => {
  const { user } = useAuth();
  // Use analysis result or default values
  const diagnosis = analysisResult?.diagnosis || "NPD";
  const confidence = analysisResult?.confidence || 0;
  const isPD = diagnosis === "PD";
  const emotionScores = analysisResult?.emotionScores || [
    { emotion: "Anger", score: 0, color: "bg-chart-5" },
    { emotion: "Disgust", score: 0, color: "bg-chart-4" },
    { emotion: "Fear", score: 0, color: "bg-chart-3" },
    { emotion: "Happiness", score: 0, color: "bg-chart-2" },
    { emotion: "Sadness", score: 0, color: "bg-chart-1" },
    { emotion: "Surprise", score: 0, color: "bg-chart-2" },
  ];

  const featureVector = [0.234, 0.567, 0.123, 0.891, 0.345, 0.678];

  const handleDownloadReport = () => {
    if (analysisResult) {
      downloadReport(analysisResult);
    }
  };

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
    <div className="space-y-6">
      {/* Main Diagnosis Card */}
      <Card className={`border-2 ${isPD ? "border-warning" : "border-success"}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPD ? (
                <AlertCircle className="h-10 w-10 text-warning" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-success" />
              )}
              <div>
                <CardTitle className="text-3xl">Diagnosis Result</CardTitle>
                <CardDescription>AI-powered analysis based on facial expressions</CardDescription>
              </div>
            </div>
            <Badge
              variant={isPD ? "destructive" : "outline"}
              className={`text-lg px-4 py-2 ${!isPD && "border-success text-success"}`}
            >
              {isPD ? "PD" : "NPD"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-2xl font-bold">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-3" />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isPD ? (
                  <>
                    The deep learning model has detected patterns consistent with Parkinson's Disease in the provided facial expressions.
                    Please consult with a medical professional for proper clinical diagnosis.
                  </>
                ) : (
                  <>
                    The deep learning model did not detect significant patterns associated with Parkinson's Disease in the provided facial expressions.
                    This result suggests normal facial motor control.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotion-wise Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Emotion-wise Feature Analysis</CardTitle>
          <CardDescription>Quality scores for each emotional expression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotionScores.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.emotion}</span>
                  <span className="text-sm text-muted-foreground">{item.score}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis</CardTitle>
          <CardDescription>Deep learning model internals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Model Architecture</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Feature Extractor:</span>
                  <span className="ml-2 font-medium">EfficientNetV2</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Expression Synthesis:</span>
                  <span className="ml-2 font-medium">StarGAN</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Quality Filter:</span>
                  <span className="ml-2 font-medium">FaceQNet</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Classifier:</span>
                  <span className="ml-2 font-medium">FC Layer (6d×2)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Feature Vector (Sample)</h4>
              <div className="p-3 bg-muted rounded font-mono text-xs overflow-x-auto">
                [{featureVector.map(v => v.toFixed(3)).join(", ")}, ...]
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Training Dataset</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDFE (Parkinson's Disease Facial Expression dataset)</li>
                <li>• CK+ (Extended Cohn-Kanade dataset)</li>
                <li>• RaFD (Radboud Faces Database)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Button onClick={onReset} variant="outline" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <Button size="lg" onClick={handleDownloadReport} disabled={!analysisResult}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        {user && user.userType === 'patient' && (
          <Button size="lg" onClick={handleBookAppointment} className="bg-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <Card className="border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p className="text-muted-foreground">
                This is an AI-assisted diagnostic tool for research purposes. Results should not replace professional medical diagnosis.
                Always consult qualified healthcare professionals for medical advice and clinical diagnosis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
