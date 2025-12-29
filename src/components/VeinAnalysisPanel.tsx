import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, Scan, Check, AlertTriangle, XCircle, Target, Loader2 } from 'lucide-react';

interface VeinAnalysis {
  primaryVein: { x: number; y: number; score: number };
  secondaryVein: { x: number; y: number; score: number };
  avoidVein: { x: number; y: number; score: number };
  injectionPoint: { x: number; y: number };
  overallScore: number;
  confidence: number;
}

export function VeinAnalysisPanel() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VeinAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        primaryVein: { x: 35, y: 40, score: 94 },
        secondaryVein: { x: 60, y: 55, score: 78 },
        avoidVein: { x: 45, y: 70, score: 23 },
        injectionPoint: { x: 35, y: 42 },
        overallScore: 87,
        confidence: 96.4,
      });
      setIsAnalyzing(false);
    }, 2500);
  }, []);

  return (
    <section id="analysis" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            AI Vein Detection
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Advanced Vein Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a high-resolution image of the hand or arm for AI-powered vein detection 
            and optimal injection point identification.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Upload Panel */}
          <motion.div
            className="glass-panel-strong rounded-3xl p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Image Upload
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-vein-primary animate-pulse" />
                Ready
              </div>
            </div>

            <div
              className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                image ? 'border-primary/30' : 'border-border hover:border-primary/50'
              }`}
            >
              {image ? (
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt="Uploaded vein image"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Analysis Overlay */}
                  <AnimatePresence>
                    {analysis && (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {/* Primary Vein Marker */}
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.primaryVein.x}%`, top: `${analysis.primaryVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-vein-primary/30 animate-ping absolute" />
                            <div className="w-8 h-8 rounded-full bg-vein-primary/50 flex items-center justify-center relative">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-vein-primary whitespace-nowrap bg-card/80 px-2 py-0.5 rounded">
                              Primary ({analysis.primaryVein.score}%)
                            </span>
                          </div>
                        </motion.div>

                        {/* Secondary Vein Marker */}
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.secondaryVein.x}%`, top: `${analysis.secondaryVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-warning/50 flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3 text-warning-foreground" />
                            </div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-warning whitespace-nowrap bg-card/80 px-2 py-0.5 rounded">
                              Secondary ({analysis.secondaryVein.score}%)
                            </span>
                          </div>
                        </motion.div>

                        {/* Avoid Vein Marker */}
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.avoidVein.x}%`, top: `${analysis.avoidVein.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-destructive/50 flex items-center justify-center">
                              <XCircle className="w-3 h-3 text-destructive-foreground" />
                            </div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-destructive whitespace-nowrap bg-card/80 px-2 py-0.5 rounded">
                              Avoid
                            </span>
                          </div>
                        </motion.div>

                        {/* Injection Point */}
                        <motion.div
                          className="absolute"
                          style={{ left: `${analysis.injectionPoint.x}%`, top: `${analysis.injectionPoint.y}%` }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <div className="relative">
                            <div className="w-5 h-5 rounded-full bg-destructive shadow-glow-danger flex items-center justify-center animate-pulse">
                              <Target className="w-3 h-3 text-destructive-foreground" />
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Analyzing Overlay */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-foreground font-medium">Analyzing veins...</p>
                        <p className="text-sm text-muted-foreground">AI processing in progress</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-primary/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-medical flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Click to upload image</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="w-4 h-4" />
                {image ? 'Change Image' : 'Upload'}
              </Button>
              <Button
                variant="medical"
                className="flex-1"
                onClick={runAnalysis}
                disabled={!image || isAnalyzing}
              >
                <Scan className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>
          </motion.div>

          {/* Analysis Results Panel */}
          <motion.div
            className="glass-panel-strong rounded-3xl p-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Analysis Results
              </h3>
              {analysis && (
                <span className="px-3 py-1 rounded-full bg-vein-primary/10 text-vein-primary text-sm font-semibold">
                  Complete
                </span>
              )}
            </div>

            {analysis ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Vein Visibility Score</span>
                    <span className="text-2xl font-bold text-gradient-medical">{analysis.overallScore}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-medical rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.overallScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="p-4 rounded-2xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
                    <span className="text-lg font-bold text-foreground">{analysis.confidence}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-vein-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.confidence}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Vein Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Detected Veins</h4>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-vein-primary/10 border border-vein-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-vein-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Primary Vein</p>
                      <p className="text-sm text-muted-foreground">Recommended for injection</p>
                    </div>
                    <span className="font-bold text-vein-primary">{analysis.primaryVein.score}%</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Secondary Vein</p>
                      <p className="text-sm text-muted-foreground">Alternative option</p>
                    </div>
                    <span className="font-bold text-warning">{analysis.secondaryVein.score}%</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-destructive-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Avoid Area</p>
                      <p className="text-sm text-muted-foreground">Not recommended</p>
                    </div>
                    <span className="font-bold text-destructive">{analysis.avoidVein.score}%</span>
                  </div>
                </div>

                {/* Injection Guidance */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Injection Point Identified</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optimal insertion angle: 15-30° at the primary vein location. 
                        Ensure proper antiseptic preparation before procedure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Scan className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-2">No Analysis Yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload an image and click "Run Analysis" to detect veins and identify optimal injection points.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
