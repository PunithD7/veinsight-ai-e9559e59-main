import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Wind } from 'lucide-react';

function ECGWave() {
  const pathRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    }
  }, []);

  return (
    <svg
      viewBox="0 0 600 100"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="hsl(199 89% 48%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d="M0,50 L50,50 L60,50 L70,30 L80,70 L90,20 L100,80 L110,50 L120,50 L200,50 L210,50 L220,30 L230,70 L240,20 L250,80 L260,50 L270,50 L350,50 L360,50 L370,30 L380,70 L390,20 L400,80 L410,50 L420,50 L500,50 L510,50 L520,30 L530,70 L540,20 L550,80 L560,50 L600,50"
        fill="none"
        stroke="url(#ecgGradient)"
        strokeWidth="2"
        className="ecg-line"
      />
    </svg>
  );
}

interface VitalCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

function VitalCard({ icon: Icon, label, value, unit, status }: VitalCardProps) {
  const statusColors = {
    normal: 'border-vein-primary/30 bg-vein-primary/5',
    warning: 'border-warning/30 bg-warning/5',
    critical: 'border-destructive/30 bg-destructive/5',
  };

  const valueColors = {
    normal: 'text-vein-primary',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  return (
    <motion.div
      className={`glass-panel rounded-2xl p-5 border-2 ${statusColors[status]}`}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          status === 'normal' ? 'bg-vein-primary/10' : 
          status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
        }`}>
          <Icon className={`w-5 h-5 ${valueColors[status]}`} />
        </div>
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          status === 'normal' ? 'bg-vein-primary' : 
          status === 'warning' ? 'bg-warning' : 'bg-destructive'
        }`} />
      </div>
      
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-display ${valueColors[status]}`}>
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </motion.div>
  );
}

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <>{displayValue}</>;
}

export function MedicalDashboard() {
  const [bpm, setBpm] = useState(72);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(65, Math.min(85, prev + change));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Real-Time Monitoring
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Medical Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor patient vitals in real-time with our FDA-grade dashboard. 
            Track heart rate, blood pressure, oxygen saturation, and more.
          </p>
        </motion.div>

        {/* ECG Display */}
        <motion.div
          className="glass-panel-strong rounded-3xl p-6 mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">ECG Monitor</h3>
                <p className="text-sm text-muted-foreground">Lead II</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive animate-heartbeat" />
              <span className="text-2xl font-bold font-display text-foreground">{bpm}</span>
              <span className="text-sm text-muted-foreground">BPM</span>
            </div>
          </div>
          
          <div className="h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
            <ECGWave />
          </div>
        </motion.div>

        {/* Vital Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <VitalCard
              icon={Heart}
              label="Heart Rate"
              value={bpm.toString()}
              unit="bpm"
              status="normal"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <VitalCard
              icon={Activity}
              label="Blood Pressure"
              value="120/80"
              unit="mmHg"
              status="normal"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <VitalCard
              icon={Droplets}
              label="SpO₂"
              value="98"
              unit="%"
              status="normal"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <VitalCard
              icon={Wind}
              label="Resp. Rate"
              value="16"
              unit="/min"
              status="normal"
            />
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          className="grid sm:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold font-display text-gradient-medical">
              <AnimatedNumber value={2847} />
            </p>
            <p className="text-muted-foreground mt-2">Procedures Today</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold font-display text-vein-primary">
              <AnimatedNumber value={99} />%
            </p>
            <p className="text-muted-foreground mt-2">Success Rate</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold font-display text-foreground">
              <AnimatedNumber value={156} />
            </p>
            <p className="text-muted-foreground mt-2">Active Patients</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
