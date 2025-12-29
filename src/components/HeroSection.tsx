import { motion } from 'framer-motion';
import { Hand3D } from './Hand3D';
import { Button } from '@/components/ui/button';
import { Scan, Phone, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Zap, label: 'AI-Powered', desc: 'Real-time analysis' },
  { icon: Shield, label: 'FDA-Grade', desc: 'Clinical accuracy' },
  { icon: Scan, label: '99.2%', desc: 'Detection rate' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vein-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vein-primary" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Advanced Venous Access Technology
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-foreground">AI-Powered</span>
              <br />
              <span className="text-gradient-medical">Vein Detection</span>
              <br />
              <span className="text-foreground">System</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Revolutionary medical imaging technology that provides real-time vein 
              visualization with unprecedented accuracy. Reduce failed IV attempts 
              and improve patient outcomes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="medical" size="xl">
                <Scan className="h-5 w-5" />
                Start Analysis
              </Button>
              <Button variant="outline" size="xl">
                <Phone className="h-5 w-5" />
                Talk to AI Assistant
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-medical flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - 3D Hand */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glow Background */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full blur-2xl" />
              
              {/* 3D Hand Container */}
              <div className="relative glass-panel-strong rounded-3xl overflow-hidden h-full">
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-vein-primary animate-pulse" />
                    <span className="text-sm font-medium text-foreground">Live Analysis</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    3D VIEW
                  </div>
                </div>
                
                <Hand3D />
              </div>

              {/* Floating Stats */}
              <motion.div
                className="absolute -right-4 top-1/4 glass-panel rounded-xl p-4 shadow-glass-strong"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-gradient-medical">98.7%</p>
              </motion.div>

              <motion.div
                className="absolute -left-4 bottom-1/4 glass-panel rounded-xl p-4 shadow-glass-strong"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs text-muted-foreground">Veins Detected</p>
                <p className="text-2xl font-bold text-vein-primary">3</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
