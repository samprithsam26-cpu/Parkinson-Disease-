import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Methodology = () => {
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
                <h1 className="text-2xl font-bold">Methodology & Architecture</h1>
                <p className="text-sm text-muted-foreground">System workflow and technical diagrams</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/ai-assistant")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>System Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

    [User] → Upload 6 Facial Expression Images
                          ↓
    ┌─────────────────────────────────────────┐
    │   1. PREPROCESSING MODULE               │
    │   • Face Detection (OpenCV/Dlib)        │
    │   • Facial Landmark Detection           │
    │   • Affine Alignment                    │
    │   • Center Crop & Resize (128→224)      │
    │   • Normalization                       │
    └────────────────┬────────────────────────┘
                     ↓
    ┌─────────────────────────────────────────┐
    │   2. STARGAN SYNTHESIS MODULE           │
    │   • Generate Missing Expressions        │
    │   • Adversarial Loss Function           │
    │   • Classification Loss                 │
    │   • Cycle Consistency Loss              │
    │   Output: Synthetic Expression Images   │
    └────────────────┬────────────────────────┘
                     ↓
    ┌─────────────────────────────────────────┐
    │   3. FACEQNET QUALITY SCREENING         │
    │   • Assess Image Quality Score          │
    │   • Filter Low Quality Images           │
    │   • Threshold: Quality > 0.75           │
    │   Output: High Quality Image Set        │
    └────────────────┬────────────────────────┘
                     ↓
    ┌─────────────────────────────────────────┐
    │   4. EFFICIENTNET FEATURE EXTRACTION    │
    │   For each emotion image:               │
    │   • Forward pass through EfficientNet   │
    │   • Extract feature vector (d-dim)      │
    │   • Pool & flatten features             │
    │   Output: 6 feature vectors             │
    └────────────────┬────────────────────────┘
                     ↓
    ┌─────────────────────────────────────────┐
    │   5. FEATURE CONCATENATION              │
    │   • Concatenate all 6 vectors           │
    │   • Dimension: 6d                       │
    │   • Apply normalization                 │
    └────────────────┬────────────────────────┘
                     ↓
    ┌─────────────────────────────────────────┐
    │   6. CLASSIFICATION MODULE              │
    │   • Fully Connected Layer (6d × 2)      │
    │   • Softmax Activation                  │
    │   • Binary Output: PD / Non-PD          │
    │   • Confidence Score Calculation        │
    └────────────────┬────────────────────────┘
                     ↓
    [Result] ← Display Diagnosis + Confidence`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>StarGAN Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────┐
│                    STARGAN ARCHITECTURE                      │
└──────────────────────────────────────────────────────────────┘

Input Image (128×128×3) + Target Emotion Label
                 ↓
    ┌────────────────────────────┐
    │       GENERATOR (G)        │
    │                            │
    │  Encoder:                  │
    │    Conv(7×7, 64)           │
    │    ↓ Conv(4×4, 128) ↓2     │
    │    ↓ Conv(4×4, 256) ↓2     │
    │                            │
    │  Bottleneck:               │
    │    6× ResNet Blocks        │
    │                            │
    │  Decoder:                  │
    │    ↑ Deconv(4×4, 128) ×2   │
    │    ↑ Deconv(4×4, 64) ×2    │
    │    Conv(7×7, 3)            │
    │    Tanh Activation         │
    └────────────┬───────────────┘
                 ↓
    Generated Image (128×128×3)
                 ↓
    ┌────────────────────────────┐
    │     DISCRIMINATOR (D)      │
    │                            │
    │  Conv(4×4, 64)             │
    │  ↓ Conv(4×4, 128) ↓2       │
    │  ↓ Conv(4×4, 256) ↓2       │
    │  ↓ Conv(4×4, 512) ↓2       │
    │  ↓ Conv(4×4, 1024) ↓2      │
    │  ↓ Conv(4×4, 2048) ↓2      │
    │                            │
    │  Output Branches:          │
    │  ├─ Real/Fake (1)          │
    │  └─ Emotion Class (6)      │
    └────────────────────────────┘

Loss Functions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Adversarial Loss (L_adv):
   L_adv = -E[log D(G(x,c))]
   
2. Domain Classification Loss (L_cls):
   L_cls = E[-log D_cls(c|x)]
   
3. Reconstruction Loss (L_rec):
   L_rec = E[||x - G(G(x,c'),c)||₁]

Total Generator Loss:
L_G = L_adv + λ_cls·L_cls + λ_rec·L_rec`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EfficientNet Feature Extraction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌────────────────────────────────────────────────────────────┐
│             EFFICIENTNET ARCHITECTURE                      │
└────────────────────────────────────────────────────────────┘

Input: 224×224×3 RGB Image
         ↓
┌────────────────────────┐
│  Stage 1: Stem         │
│  Conv 3×3, stride 2    │
│  Output: 112×112×32    │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 2: MBConv1      │
│  Mobile Inverted Block │
│  Output: 112×112×16    │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 3: MBConv6      │
│  6× Blocks, stride 2   │
│  Output: 56×56×24      │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 4: MBConv6      │
│  6× Blocks, stride 2   │
│  Output: 28×28×40      │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 5: MBConv6      │
│  6× Blocks, stride 2   │
│  Output: 14×14×80      │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 6: MBConv6      │
│  9× Blocks, stride 1   │
│  Output: 14×14×112     │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 7: MBConv6      │
│  9× Blocks, stride 2   │
│  Output: 7×7×192       │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Stage 8: MBConv6      │
│  9× Blocks, stride 1   │
│  Output: 7×7×320       │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│  Head: Conv 1×1        │
│  Global Avg Pool       │
│  Output: 1280-D Vector │
└────────────────────────┘

Feature Vector (d = 1280)
Concatenate 6 emotions → 6d = 7680-D`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Flow Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                         │
└────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │   User Interface (React App)     │
        │   • Image Upload Forms           │
        │   • Result Display               │
        └───────────┬──────────────────────┘
                    │ HTTP POST
                    │ /api/predict
                    ↓
        ┌──────────────────────────────────┐
        │   Backend API (Flask/FastAPI)    │
        │   • Request Validation           │
        │   • Image Buffering              │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   Preprocessing Pipeline         │
        │   • Face Detection               │
        │   • Alignment & Cropping         │
        │   • Normalization                │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   StarGAN Synthesis (Optional)   │
        │   • Check image quality          │
        │   • Generate missing expressions │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   FaceQNet Quality Check         │
        │   • Assess synthetic images      │
        │   • Filter poor quality          │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   Feature Extraction             │
        │   • Load EfficientNet model      │
        │   • Extract features per emotion │
        │   • Concatenate feature vectors  │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   Classification                 │
        │   • Feed to FC layer             │
        │   • Softmax activation           │
        │   • Binary prediction: PD/Non-PD │
        └───────────┬──────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────────┐
        │   Response Formation             │
        │   • Create JSON response         │
        │   • Include confidence scores    │
        │   • Add metadata                 │
        └───────────┬──────────────────────┘
                    │ HTTP Response
                    │ JSON
                    ↓
        ┌──────────────────────────────────┐
        │   User Interface Display         │
        │   • Parse response               │
        │   • Render results               │
        │   • Show visualizations          │
        └──────────────────────────────────┘`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE                        │
└─────────────────────────────────────────────────────────────┘

PHASE 1: StarGAN Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dataset: CK+ + RaFD
   ↓
[Data Augmentation]
   ↓
[StarGAN Training]
   • Epochs: 200
   • Batch Size: 16
   • Adam optimizer (lr=1e-4)
   ↓
[Save Model Weights]
   stargan_generator.pth
   stargan_discriminator.pth

─────────────────────────────

PHASE 2: Synthetic Data Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dataset: PDFE + CK+ + RaFD
   ↓
[Generate Missing Expressions]
   Using trained StarGAN
   ↓
[FaceQNet Filtering]
   Keep quality > 0.75
   ↓
[Combined Dataset]
   Original + High-Quality Synthetic

─────────────────────────────

PHASE 3: EfficientNet Fine-tuning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Load Pre-trained EfficientNet]
   ImageNet weights
   ↓
[Freeze First 80% Layers]
   ↓
[Fine-tune on Emotion Data]
   • Dataset: Combined Dataset
   • Epochs: 50
   • Batch Size: 32
   • SGD optimizer (lr=1e-3)
   ↓
[Feature Extraction Mode]
   Remove classification head
   Keep only backbone
   ↓
[Save Feature Extractor]
   efficientnet_features.pth

─────────────────────────────

PHASE 4: Classifier Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Extract Features]
   For all PDFE images
   6 emotions per subject
   ↓
[Concatenate Features]
   6 × 1280 = 7680-D
   ↓
[Train FC Classifier]
   • Input: 7680-D
   • Hidden: 2048 → 512
   • Output: 2 (PD/Non-PD)
   • Epochs: 100
   • Batch Size: 64
   • Adam optimizer (lr=1e-4)
   • Loss: Cross-Entropy
   ↓
[Validation & Testing]
   5-fold cross-validation
   Test on held-out set
   ↓
[Save Final Model]
   classifier.pth

─────────────────────────────

EVALUATION METRICS
━━━━━━━━━━━━━━━━━━
• Accuracy
• Precision
• Recall
• F1-Score
• ROC-AUC
• Confusion Matrix`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Methodology;
