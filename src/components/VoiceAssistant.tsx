import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Bot, User } from 'lucide-react';
import '@/types/speech.d.ts';

interface Message {
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const aiResponses = [
  "Hello! I'm your VeinSight AI medical assistant. How can I help you with your venous access procedure today?",
  "Based on the vein analysis, I recommend targeting the primary vein located in the upper forearm. The visibility score of 94% indicates excellent conditions for IV insertion.",
  "For optimal results, ensure the patient's arm is positioned at heart level and apply a tourniquet 3-4 inches above the intended puncture site.",
  "The insertion angle should be between 15 to 30 degrees. Once you see blood return, lower the angle and advance slightly before threading the catheter.",
  "Remember to release the tourniquet before flushing, and always confirm placement with a saline flush. Is there anything specific you'd like me to clarify?",
];

export function VoiceAssistant() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const responseIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('');
          
          setCurrentTranscript(transcript);
          
          if (event.results[event.results.length - 1].isFinal) {
            addMessage('user', transcript);
            setCurrentTranscript('');
            setTimeout(() => respondAsAI(), 1500);
          }
        };
        
        recognitionRef.current.onend = () => {
          if (isCallActive && !isMuted) {
            recognitionRef.current?.start();
          }
        };
      }
    }
    
    return () => {
      synthRef.current?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addMessage = (role: 'ai' | 'user', text: string) => {
    setMessages((prev) => [...prev, { role, text, timestamp: new Date() }]);
  };

  const speak = useCallback((text: string) => {
    if (synthRef.current && isSpeakerOn) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => {
        setIsAISpeaking(false);
        if (!isMuted && isCallActive) {
          setIsListening(true);
          recognitionRef.current?.start();
        }
      };
      
      synthRef.current.speak(utterance);
    }
  }, [isSpeakerOn, isMuted, isCallActive]);

  const respondAsAI = useCallback(() => {
    const response = aiResponses[responseIndexRef.current % aiResponses.length];
    responseIndexRef.current++;
    addMessage('ai', response);
    speak(response);
  }, [speak]);

  const startCall = () => {
    setIsCallActive(true);
    setMessages([]);
    responseIndexRef.current = 0;
    
    setTimeout(() => {
      const greeting = aiResponses[0];
      addMessage('ai', greeting);
      speak(greeting);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsAISpeaking(false);
    synthRef.current?.cancel();
    recognitionRef.current?.stop();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (isCallActive && !isAISpeaking) {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <section id="assistant" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            AI Voice Assistant
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Talk to Your Medical AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get real-time voice guidance for venous access procedures. Our AI assistant 
            provides step-by-step instructions and answers your medical questions.
          </p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-panel-strong rounded-3xl overflow-hidden">
            {/* Call Header */}
            <div className="p-6 bg-gradient-medical text-primary-foreground text-center">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
                animate={isCallActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="w-12 h-12" />
              </motion.div>
              <h3 className="font-display text-xl font-bold">VeinSight AI Assistant</h3>
              <p className="text-white/80 text-sm mt-1">
                {isCallActive 
                  ? isAISpeaking 
                    ? 'Speaking...' 
                    : isListening 
                      ? 'Listening...' 
                      : 'Connected'
                  : 'Ready to assist'}
              </p>
              
              {isCallActive && (
                <motion.p
                  className="text-2xl font-mono mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formatTime(callDuration)}
                </motion.p>
              )}
            </div>

            {/* Conversation Display */}
            <AnimatePresence>
              {isCallActive && (
                <motion.div
                  className="max-h-64 overflow-y-auto p-4 space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'ai' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {msg.role === 'ai' ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[80%] ${
                        msg.role === 'ai' 
                          ? 'bg-primary/10 rounded-tl-sm' 
                          : 'bg-muted rounded-tr-sm'
                      }`}>
                        <p className="text-sm text-foreground">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {currentTranscript && (
                    <motion.div
                      className="flex gap-2 flex-row-reverse"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="p-3 rounded-2xl rounded-tr-sm bg-muted/50 max-w-[80%]">
                        <p className="text-sm text-muted-foreground italic">{currentTranscript}...</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice Visualization */}
            <AnimatePresence>
              {isCallActive && (isAISpeaking || isListening) && (
                <motion.div
                  className="flex justify-center gap-1 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full ${isAISpeaking ? 'bg-primary' : 'bg-vein-primary'}`}
                      animate={{
                        height: [8, 24, 8],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-center gap-4">
                {isCallActive && (
                  <>
                    <Button
                      variant={isMuted ? 'destructive' : 'glass'}
                      size="iconLg"
                      onClick={toggleMute}
                      className="rounded-full"
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                    
                    <Button
                      variant="endCall"
                      size="iconXl"
                      onClick={endCall}
                    >
                      <PhoneOff className="w-7 h-7" />
                    </Button>
                    
                    <Button
                      variant={isSpeakerOn ? 'glass' : 'secondary'}
                      size="iconLg"
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className="rounded-full"
                    >
                      {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </Button>
                  </>
                )}
                
                {!isCallActive && (
                  <Button
                    variant="call"
                    size="iconXl"
                    onClick={startCall}
                  >
                    <Phone className="w-7 h-7" />
                  </Button>
                )}
              </div>
              
              {!isCallActive && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Tap to start voice consultation
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
