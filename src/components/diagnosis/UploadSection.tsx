import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

interface Emotion {
  key: string;
  label: string;
  icon: string;
}

interface UploadSectionProps {
  emotions: Emotion[];
  uploadedImages: Record<string, File>;
  setUploadedImages: (images: Record<string, File>) => void;
}

const UploadSection = ({ emotions, uploadedImages, setUploadedImages }: UploadSectionProps) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = (emotionKey: string, file: File | null) => {
    if (file) {
      setUploadedImages({ ...uploadedImages, [emotionKey]: file });
    } else {
      const newImages = { ...uploadedImages };
      delete newImages[emotionKey];
      setUploadedImages(newImages);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Upload Facial Expression Images</CardTitle>
        <CardDescription>
          Please upload clear facial images for each of the six basic emotions. Ensure good lighting and frontal face view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emotions.map((emotion) => {
            const hasImage = uploadedImages[emotion.key];
            return (
              <div
                key={emotion.key}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  hasImage
                    ? "border-success bg-success/5"
                    : "border-dashed border-border hover:border-primary bg-muted/30"
                }`}
              >
                <input
                  ref={(el) => (fileInputRefs.current[emotion.key] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleFileUpload(emotion.key, file || null);
                  }}
                />

                <div className="text-center">
                  <div className="text-4xl mb-2">{emotion.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{emotion.label}</h3>

                  {hasImage ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => fileInputRefs.current[emotion.key]?.click()}
                        >
                          Change
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFileUpload(emotion.key, null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {uploadedImages[emotion.key] && (
                        <p className="text-xs text-muted-foreground truncate">
                          {uploadedImages[emotion.key].name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRefs.current[emotion.key]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Image Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Clear frontal face view with minimal occlusion</li>
            <li>• Good lighting conditions</li>
            <li>• Resolution: Minimum 224x224 pixels (higher is better)</li>
            <li>• Format: JPG, PNG, or WEBP</li>
            <li>• Single face per image</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
