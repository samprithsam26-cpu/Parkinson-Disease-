import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Database, Layers, Network, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Project Documentation</h1>
                <p className="text-sm text-muted-foreground">
                  Complete technical documentation and methodology
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/ai-assistant")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Project Overview</CardTitle>
                <CardDescription>
                  Auto Diagnosis of Parkinson's Disease Using Deep Learning on Mixed Emotional Facial Expressions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Abstract</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This project presents a novel deep learning-based approach for the automatic diagnosis of Parkinson's Disease (PD) 
                    through the analysis of mixed emotional facial expressions. By leveraging StarGAN for facial expression synthesis, 
                    FaceQNet for image quality screening, and EfficientNet for feature extraction, the system achieves high accuracy 
                    in distinguishing PD patients from healthy individuals.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Motivation</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Parkinson's Disease affects millions worldwide, causing motor and non-motor symptoms including facial masking 
                    (hypomimia). Traditional diagnosis methods are subjective and time-consuming. This project aims to:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Provide objective, automated screening for early PD detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Reduce diagnostic time and improve accessibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Leverage facial expression analysis as a non-invasive biomarker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Support medical professionals with AI-assisted diagnosis</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Brain className="h-8 w-8 text-primary mb-2" />
                      <h4 className="font-semibold mb-1">Deep Learning Models</h4>
                      <p className="text-sm text-muted-foreground">
                        StarGAN, EfficientNet, and FaceQNet for comprehensive analysis
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Database className="h-8 w-8 text-accent mb-2" />
                      <h4 className="font-semibold mb-1">Multi-Dataset Training</h4>
                      <p className="text-sm text-muted-foreground">
                        Trained on PDFE, CK+, and RaFD datasets
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Layers className="h-8 w-8 text-success mb-2" />
                      <h4 className="font-semibold mb-1">Multi-Emotion Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Analyzes 6 basic emotions for comprehensive diagnosis
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Network className="h-8 w-8 text-warning mb-2" />
                      <h4 className="font-semibold mb-1">High Accuracy</h4>
                      <p className="text-sm text-muted-foreground">
                        Achieves superior performance with concatenated features
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Technologies Used</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="font-semibold text-sm">Frontend:</span>
                      <span className="text-sm text-muted-foreground">React, TypeScript, TailwindCSS</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="font-semibold text-sm">Backend (Planned):</span>
                      <span className="text-sm text-muted-foreground">Python, PyTorch, Flask/FastAPI</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="font-semibold text-sm">Deep Learning:</span>
                      <span className="text-sm text-muted-foreground">StarGAN, EfficientNetV2, FaceQNet</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="font-semibold text-sm">Image Processing:</span>
                      <span className="text-sm text-muted-foreground">OpenCV, Dlib, PIL</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>End-to-end pipeline overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                              │
│              6 Facial Expression Images                     │
│      (Anger, Disgust, Fear, Happy, Sad, Surprise)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 1: StarGAN                            │
│           Facial Expression Synthesis                       │
│  • Generates missing/poor quality expressions               │
│  • Adversarial Loss + Classification Loss                   │
│  • Reconstruction Loss                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 STEP 2: FaceQNet                            │
│          High-Quality Image Screening                       │
│  • Quality assessment of synthetic images                   │
│  • Filters low-quality outputs                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: EfficientNet                           │
│           Deep Feature Extraction                           │
│  • Extracts features from each emotion                      │
│  • Pre-trained on CK+ and RaFD datasets                    │
│  • Transfer learning with fine-tuning                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 4: Classification Layer                      │
│         Feature Concatenation + FC Layer                    │
│  • Concatenates 6 emotion feature vectors                   │
│  • Fully connected layer (6d × 2)                          │
│  • Binary classification: PD / Non-PD                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   OUTPUT LAYER                              │
│        Diagnosis Result + Confidence Score                  │
└─────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Component Details</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">StarGAN (Expression Synthesis)</h4>
                      <p className="text-sm text-muted-foreground">
                        Generates synthetic facial expressions to augment training data and fill missing emotions.
                        Uses adversarial training with cycle consistency loss.
                      </p>
                    </div>
                    <div className="border-l-4 border-accent pl-4">
                      <h4 className="font-semibold mb-1">FaceQNet (Quality Screening)</h4>
                      <p className="text-sm text-muted-foreground">
                        Assesses the quality of generated images to ensure only high-quality synthetic images
                        are used for training and inference.
                      </p>
                    </div>
                    <div className="border-l-4 border-success pl-4">
                      <h4 className="font-semibold mb-1">EfficientNet (Feature Extraction)</h4>
                      <p className="text-sm text-muted-foreground">
                        Efficient and accurate CNN architecture that extracts deep features from facial images.
                        Pre-trained on ImageNet and fine-tuned on emotion datasets.
                      </p>
                    </div>
                    <div className="border-l-4 border-warning pl-4">
                      <h4 className="font-semibold mb-1">Classification Layer</h4>
                      <p className="text-sm text-muted-foreground">
                        Concatenates feature vectors from all 6 emotions and feeds into a fully connected layer
                        for final PD/Non-PD classification.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datasets Used</CardTitle>
                <CardDescription>Training and evaluation datasets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">PDFE (Parkinson's Disease Facial Expression)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Primary dataset containing facial images of PD patients and healthy controls displaying various emotions.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Subjects:</span>
                        <span className="ml-2 font-medium">PD patients + Controls</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Emotions:</span>
                        <span className="ml-2 font-medium">6 basic emotions</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">CK+ (Extended Cohn-Kanade)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Widely-used facial expression database with 593 sequences from 123 subjects.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Images:</span>
                        <span className="ml-2 font-medium">~10,000+</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Subjects:</span>
                        <span className="ml-2 font-medium">123 participants</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">RaFD (Radboud Faces Database)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      High-quality facial expression database with diverse poses and lighting conditions.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Images:</span>
                        <span className="ml-2 font-medium">8,040</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Expressions:</span>
                        <span className="ml-2 font-medium">8 expressions × 5 angles</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Preprocessing Pipeline</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">1.</span>
                      <span><strong className="text-foreground">Face Detection:</strong> OpenCV Haar Cascade or Dlib HOG detector</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">2.</span>
                      <span><strong className="text-foreground">Landmark Detection:</strong> 68-point facial landmarks using Dlib</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">3.</span>
                      <span><strong className="text-foreground">Alignment:</strong> Affine transformation based on eye coordinates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">4.</span>
                      <span><strong className="text-foreground">Cropping:</strong> Center crop to 128×128 pixels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">5.</span>
                      <span><strong className="text-foreground">Resizing:</strong> Upscale to 224×224 for model input</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">6.</span>
                      <span><strong className="text-foreground">Normalization:</strong> Mean=[0.485, 0.456, 0.406], Std=[0.229, 0.224, 0.225]</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-foreground mt-0.5">7.</span>
                      <span><strong className="text-foreground">Augmentation:</strong> Horizontal flip, random rotation (±5°)</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
                <CardDescription>Technical specifications and code structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommended Project Structure</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`project-root/
├── backend/
│   ├── models/
│   │   ├── stargan.py          # StarGAN implementation
│   │   ├── efficientnet.py     # EfficientNet feature extractor
│   │   ├── faceqnet.py         # Quality assessment model
│   │   └── classifier.py       # Final classification model
│   ├── training/
│   │   ├── train_stargan.py    # StarGAN training script
│   │   ├── train_classifier.py # Classifier training
│   │   └── config.py           # Training configuration
│   ├── inference/
│   │   ├── predict.py          # Inference pipeline
│   │   └── utils.py            # Helper functions
│   ├── preprocessing/
│   │   ├── face_detection.py   # Face detection & alignment
│   │   ├── augmentation.py     # Data augmentation
│   │   └── quality_filter.py   # Image quality filtering
│   ├── api/
│   │   ├── app.py              # Flask/FastAPI application
│   │   └── routes.py           # API endpoints
│   └── requirements.txt
├── frontend/                    # This React application
├── data/
│   ├── raw/                     # Original datasets
│   ├── processed/               # Preprocessed images
│   └── synthetic/               # StarGAN generated images
├── notebooks/
│   ├── exploration.ipynb        # Data exploration
│   └── experiments.ipynb        # Model experiments
├── weights/
│   ├── stargan_weights.pth
│   ├── efficientnet_weights.pth
│   └── classifier_weights.pth
└── docs/
    ├── README.md
    └── methodology.pdf`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Training Configuration</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">StarGAN Training</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Epochs:</span>
                          <span className="ml-2 font-medium">200</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Batch Size:</span>
                          <span className="ml-2 font-medium">16</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Learning Rate:</span>
                          <span className="ml-2 font-medium">0.0001</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Optimizer:</span>
                          <span className="ml-2 font-medium">Adam</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">EfficientNet Fine-tuning</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Epochs:</span>
                          <span className="ml-2 font-medium">50</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Batch Size:</span>
                          <span className="ml-2 font-medium">32</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Learning Rate:</span>
                          <span className="ml-2 font-medium">0.001</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Freeze Layers:</span>
                          <span className="ml-2 font-medium">First 80%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Classifier Training</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Epochs:</span>
                          <span className="ml-2 font-medium">100</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Batch Size:</span>
                          <span className="ml-2 font-medium">64</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Learning Rate:</span>
                          <span className="ml-2 font-medium">0.0001</span>
                        </div>
                        <div className="p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">Loss Function:</span>
                          <span className="ml-2 font-medium">Cross-Entropy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">API Integration Guide</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Backend API Endpoint</h4>
                    <pre className="text-xs overflow-x-auto mb-3">
{`POST /api/predict
Content-Type: multipart/form-data

Request Body:
{
  "anger": <File>,
  "disgust": <File>,
  "fear": <File>,
  "happiness": <File>,
  "sadness": <File>,
  "surprise": <File>
}

Response:
{
  "diagnosis": "PD" | "Non-PD",
  "confidence": 87.3,
  "emotion_scores": {
    "anger": 92.1,
    "disgust": 84.5,
    ...
  },
  "feature_vector": [0.234, 0.567, ...],
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Expected Results</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Accuracy: 87-92%</li>
                        <li>• Precision: 85-90%</li>
                        <li>• Recall: 82-88%</li>
                        <li>• F1-Score: 84-89%</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Processing Time</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Preprocessing: ~2-3 seconds</li>
                        <li>• Feature Extraction: ~5-7 seconds</li>
                        <li>• Classification: ~0.5 seconds</li>
                        <li>• Total: ~8-10 seconds</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Future Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Real-time Video Analysis:</strong> Extend to continuous monitoring via webcam</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Severity Assessment:</strong> Multi-class classification for disease stage detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Mobile Application:</strong> Deploy as mobile app for accessible screening</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Multi-Modal Fusion:</strong> Combine with voice analysis and gait detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Explainable AI:</strong> Add attention maps and LIME/SHAP explanations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
