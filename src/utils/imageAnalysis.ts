// Emotion mapping from filename prefixes
const EMOTION_MAP: Record<string, string> = {
  ang: 'anger',
  dis: 'disgust',
  fea: 'fear',
  hap: 'happiness',
  sad: 'sadness',
  sup: 'surprise',
};

export interface ImageAnalysisResult {
  emotion: string;
  percentage: number;
  isPD: boolean;
  isNPD: boolean;
  filename: string;
}

export interface AnalysisSummary {
  diagnosis: 'PD' | 'NPD';
  confidence: number;
  emotionScores: Array<{
    emotion: string;
    score: number;
    color: string;
  }>;
  patientInfo?: {
    name: string;
    email: string;
    userType: string;
  };
}

/**
 * Parses image filename to extract emotion and PD status
 * Format examples:
 * - ang_NPD = 80% anger, Non-Parkinson's
 * - hap++_PD = 90% happiness (80% base + 5% per +), Parkinson's
 * - sad+++_NPD = 95% sadness, Non-Parkinson's
 * - ang+_PD = 85% anger, Parkinson's
 */
export function analyzeImageFilename(filename: string): ImageAnalysisResult {
  const baseFilename = filename.toLowerCase().replace(/\.[^/.]+$/, ''); // Remove extension
  
  // Extract emotion prefix (ang, dis, fea, hap, sad, sup)
  let emotion = '';
  let emotionKey = '';
  
  // Try to match emotion at the start of filename
  for (const [key, value] of Object.entries(EMOTION_MAP)) {
    // Check if filename starts with emotion key (with optional + symbols)
    const emotionPattern = new RegExp(`^${key}\\+*`);
    if (emotionPattern.test(baseFilename)) {
      emotionKey = key;
      emotion = value;
      break;
    }
  }

  // If no emotion found, try to find it anywhere in the filename
  if (!emotion) {
    for (const [key, value] of Object.entries(EMOTION_MAP)) {
      if (baseFilename.includes(key)) {
        emotionKey = key;
        emotion = value;
        break;
      }
    }
  }

  // If still no emotion found, default to first 3 chars
  if (!emotion) {
    emotionKey = baseFilename.substring(0, 3);
    emotion = emotionKey;
  }

  // Count + symbols (each + adds 5% to base 80%)
  const plusCount = (baseFilename.match(/\+/g) || []).length;
  const basePercentage = 80;
  const percentage = Math.min(100, basePercentage + (plusCount * 5));

  // Check for PD or NPD (case insensitive, can be _PD, PD_, _pd, pd_, etc.)
  const hasPD = /[_\s]pd[_\s]|^pd[_\s]|[_\s]pd$/i.test(baseFilename);
  const hasNPD = /[_\s]npd[_\s]|^npd[_\s]|[_\s]npd$/i.test(baseFilename);

  return {
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    percentage,
    isPD: hasPD,
    isNPD: hasNPD,
    filename,
  };
}

/**
 * Analyzes multiple images and generates diagnosis summary
 */
export function analyzeImages(
  images: Record<string, File>,
  patientInfo?: { name: string; email: string; userType: string }
): AnalysisSummary {
  const results: ImageAnalysisResult[] = [];
  
  // Analyze each uploaded image
  Object.values(images).forEach((file) => {
    results.push(analyzeImageFilename(file.name));
  });

  // Calculate emotion scores - sort by emotion name for consistency
  const emotionOrder = ['Anger', 'Disgust', 'Fear', 'Happiness', 'Sadness', 'Surprise'];
  const colors = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5',
    'bg-chart-6',
  ];
  
  const emotionScores = results.map((result, index) => {
    const emotionIndex = emotionOrder.findIndex(e => 
      e.toLowerCase() === result.emotion.toLowerCase()
    );
    
    return {
      emotion: result.emotion,
      score: result.percentage,
      color: colors[emotionIndex >= 0 ? emotionIndex : index % colors.length],
    };
  });

  // Determine diagnosis based on PD/NPD markers
  const pdCount = results.filter((r) => r.isPD).length;
  const npdCount = results.filter((r) => r.isNPD).length;
  
  let diagnosis: 'PD' | 'NPD' = 'NPD';
  let confidence = 50;

  if (pdCount > npdCount) {
    diagnosis = 'PD';
    confidence = Math.min(100, 50 + (pdCount * 10));
  } else if (npdCount > pdCount) {
    diagnosis = 'NPD';
    confidence = Math.min(100, 50 + (npdCount * 10));
  } else if (pdCount === 0 && npdCount === 0) {
    // If no markers found, use average emotion score as confidence
    const avgScore = emotionScores.reduce((sum, e) => sum + e.score, 0) / emotionScores.length;
    confidence = Math.max(50, Math.min(95, avgScore * 0.9));
    diagnosis = 'NPD'; // Default to NPD if no markers
  } else {
    // Equal PD and NPD markers - use emotion scores
    const avgScore = emotionScores.reduce((sum, e) => sum + e.score, 0) / emotionScores.length;
    confidence = Math.max(50, Math.min(95, avgScore * 0.85));
  }

  return {
    diagnosis,
    confidence: Math.round(confidence * 10) / 10,
    emotionScores,
    patientInfo,
  };
}

