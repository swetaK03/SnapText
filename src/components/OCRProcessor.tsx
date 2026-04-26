"use client";

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Languages, 
  FileText, 
  Zap, 
  Camera, 
  CircleDot,
  FileType, 
  FileDown,
  X,
  CameraOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import { performAIOCR } from '@/ai/flows/ocr-flow';

export function OCRProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasCameraPermission(true);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use this feature.',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setImage(dataUri);
        stopCamera();
        processOCR(dataUri);
      }
    }
  };

  const processOCR = async (imageSource: string) => {
    setLoading(true);
    setProgress(20); // Initial progress
    setText('');

    try {
      // Use the high-precision AI flow instead of local Tesseract for handwriting
      setProgress(50);
      const { extractedText } = await performAIOCR({ imageDataUri: imageSource });
      
      setText(extractedText);
      setProgress(100);
      
      toast({
        title: "Extraction Complete",
        description: "Marathi text recognized successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "OCR Error",
        description: "Failed to process text. Please ensure the image is clear.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setImage(dataUri);
        processOCR(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setImage(dataUri);
        processOCR(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ description: "Text copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snaptext-export-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ description: "Text file downloaded" });
  };

  const downloadAsPdf = () => {
    if (!text) return;
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 10, 10);
      doc.save(`snaptext-export-${Date.now()}.pdf`);
      toast({ description: "PDF file downloaded" });
    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        description: "Failed to generate PDF." 
      });
    }
  };

  const reset = () => {
    setImage(null);
    setText('');
    setProgress(0);
    stopCamera();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center justify-center gap-2">
          SnapText <Zap className="w-6 h-6 text-accent" />
        </h1>
        <p className="text-muted-foreground">High-Accuracy Marathi OCR with AI Optimization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card 
            className={cn(
              "relative border-2 border-dashed h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 bg-card/50 shadow-inner overflow-hidden",
              loading && "pointer-events-none opacity-80"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {isCameraActive ? (
              <div className="relative w-full h-full bg-black">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  playsInline 
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                    className="rounded-full h-12 w-12"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={(e) => { e.stopPropagation(); captureImage(); }}
                    className="rounded-full bg-accent text-white h-14 w-14 shadow-lg active:scale-95 transition-transform"
                  >
                    <CircleDot className="w-8 h-8" />
                  </Button>
                </div>
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-black/80 text-white z-20">
                    <div className="space-y-4">
                      <CameraOff className="w-12 h-12 mx-auto opacity-50" />
                      <p>Camera permission denied or unavailable.</p>
                      <Button variant="outline" onClick={stopCamera}>Close</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : image ? (
              <div className="relative w-full h-full p-4">
                <img src={image} alt="Source" className="w-full h-full object-contain rounded-md" />
                {!loading && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-6 right-6 shadow-md rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 p-8 text-center w-full">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Upload className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-xl font-bold">Upload or Capture</p>
                  <p className="text-sm text-muted-foreground mt-1">AI-Enhanced Marathi & Hindi OCR</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-primary text-primary hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1 bg-primary"
                    onClick={startCamera}
                  >
                    <Camera className="w-4 h-4 mr-2" /> Camera
                  </Button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*"
              onChange={onFileChange}
            />
            <canvas ref={canvasRef} className="hidden" />
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
             <span className="px-3 py-1.5 bg-secondary/50 rounded-full flex items-center gap-1.5">
               <Languages className="w-3.5 h-3.5" /> Marathi
             </span>
             <span className="px-3 py-1.5 bg-secondary/50 rounded-full flex items-center gap-1.5">
               <Languages className="w-3.5 h-3.5" /> Hindi
             </span>
             <span className="px-3 py-1.5 bg-secondary/50 rounded-full flex items-center gap-1.5">
               <Languages className="w-3.5 h-3.5" /> English
             </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          <Card className="flex-1 flex flex-col overflow-hidden bg-card border-none shadow-xl">
            <div className="p-4 border-b flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <FileText className="w-4.5 h-4.5 text-accent" />
                Extracted Text
              </div>
              <div className="flex gap-2">
                {text && (
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-primary" />}
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="p-0 flex-1 relative min-h-[400px]">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-6 bg-background/80 backdrop-blur-md z-10">
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-between text-xs font-bold text-primary">
                      <span>AI PROCESSING...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full bg-primary/10" />
                    <p className="text-sm font-bold animate-pulse text-primary tracking-widest uppercase">Analyzing script strokes...</p>
                  </div>
                </div>
              )}
              
              <Textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Marathi text will appear here..."
                className="w-full h-full min-h-[400px] resize-none border-none focus-visible:ring-0 p-6 text-xl leading-relaxed font-marathi whitespace-pre-wrap"
                readOnly={loading}
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-3">
             <Button 
               variant="outline"
               disabled={!text || loading} 
               onClick={downloadAsTxt}
               className="font-bold h-12 rounded-xl flex gap-2"
             >
               <FileType className="w-4 h-4" /> TXT
             </Button>
             <Button 
               variant="outline"
               disabled={!text || loading} 
               onClick={downloadAsPdf}
               className="font-bold h-12 rounded-xl flex gap-2"
             >
               <FileDown className="w-4 h-4" /> PDF
             </Button>
             <Button 
               onClick={copyToClipboard}
               disabled={!text || loading}
               className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-lg transition-transform active:scale-95 flex gap-2"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied' : 'Copy Full Text'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
