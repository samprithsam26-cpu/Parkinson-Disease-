import { AnalysisSummary } from './imageAnalysis';

export function generateReport(analysis: AnalysisSummary): string {
  const date = new Date().toLocaleString();
  const diagnosis = analysis.diagnosis === 'PD' ? 'Parkinson\'s Disease' : 'Non-Parkinson\'s Disease';
  
  let report = `
═══════════════════════════════════════════════════════════════
           PD DIAGNOSYS - DIAGNOSTIC REPORT
═══════════════════════════════════════════════════════════════

Report Generated: ${date}

═══════════════════════════════════════════════════════════════
                    PATIENT INFORMATION
═══════════════════════════════════════════════════════════════
`;

  if (analysis.patientInfo) {
    report += `
Name: ${analysis.patientInfo.name}
Email: ${analysis.patientInfo.email}
User Type: ${analysis.patientInfo.userType === 'doctor' ? 'Doctor' : 'Patient'}
`;
  } else {
    report += `
Name: Not Available
Email: Not Available
User Type: Not Available
`;
  }

  report += `
═══════════════════════════════════════════════════════════════
                    DIAGNOSIS RESULTS
═══════════════════════════════════════════════════════════════

Diagnosis: ${diagnosis}
Confidence Level: ${analysis.confidence}%

${analysis.diagnosis === 'PD' 
  ? '⚠️  The analysis indicates patterns consistent with Parkinson\'s Disease.'
  : '✓  The analysis indicates normal facial motor control patterns.'
}

═══════════════════════════════════════════════════════════════
              EMOTION-WISE ANALYSIS SCORES
═══════════════════════════════════════════════════════════════
`;

  analysis.emotionScores.forEach((emotion) => {
    const bar = '█'.repeat(Math.floor(emotion.score / 5));
    report += `
${emotion.emotion.padEnd(15)}: ${emotion.score.toFixed(1)}% ${bar}
`;
  });

  report += `
═══════════════════════════════════════════════════════════════
                    TECHNICAL DETAILS
═══════════════════════════════════════════════════════════════

Model Architecture:
  • Feature Extractor: EfficientNetV2
  • Expression Synthesis: StarGAN
  • Quality Filter: FaceQNet
  • Classifier: Fully Connected Layer (6d × 2)

Training Datasets:
  • PDFE (Parkinson's Disease Facial Expression dataset)
  • CK+ (Extended Cohn-Kanade dataset)
  • RaFD (Radboud Faces Database)

═══════════════════════════════════════════════════════════════
                    MEDICAL DISCLAIMER
═══════════════════════════════════════════════════════════════

This is an AI-assisted diagnostic tool for research purposes.
Results should not replace professional medical diagnosis.
Always consult qualified healthcare professionals for medical
advice and clinical diagnosis.

═══════════════════════════════════════════════════════════════
                    END OF REPORT
═══════════════════════════════════════════════════════════════
`;

  return report;
}

export function downloadReport(analysis: AnalysisSummary) {
  const report = generateReport(analysis);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PD_Diagnosis_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

