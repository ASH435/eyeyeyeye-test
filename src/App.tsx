/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Cpu, RefreshCcw, AlertTriangle } from 'lucide-react';

// Assets
const SCREAM_SFX = "https://actions.google.com/sounds/v1/horror/ghost_female_scream.ogg";
const AMBIENCE_SFX = "https://actions.google.com/sounds/v1/ambiences/wind_heavy_with_whistle.ogg";
const HEARTBEAT_SFX = "https://actions.google.com/sounds/v1/human/heartbeat_slow.ogg";
// A very creepy distorted image
const JUMPSCARE_IMAGE = "https://bloody-disgusting.com/wp-content/uploads/2023/12/Art-the-Clown-Santa-Terrifier-3.jpg"; 

enum State {
  IDLE,
  CALIBRATING,
  TESTING,
  PRE_SCARE,
  JUMPSCARE
}

export default function App() {
  const [state, setState] = useState<State>(State.IDLE);
  const [progress, setProgress] = useState(0);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 });
  const [testTime, setTestTime] = useState(0);
  
  const screamAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambienceAudioRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const startCalibration = () => {
    setState(State.CALIBRATING);
    addLog("Initializing Neural Interface...");
    
    // Play subtle ambience
    if (ambienceAudioRef.current) {
      ambienceAudioRef.current.loop = true;
      ambienceAudioRef.current.volume = 0.3;
      ambienceAudioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (state === State.CALIBRATING) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setState(State.TESTING);
            addLog("Calibration complete. Precision tracking active.");
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Test Phase Logic: Move the dot
  useEffect(() => {
    if (state === State.TESTING) {
      const interval = setInterval(() => {
        setTestTime(t => t + 100);
        
        // Randomly move dot slowly
        setDotPos({
          x: 40 + Math.random() * 20 + Math.sin(Date.now() / 1000) * 10,
          y: 40 + Math.random() * 20 + Math.cos(Date.now() / 1000) * 10,
        });

        if (testTime > 8000) { // After 8 seconds of testing
          setState(State.PRE_SCARE);
          addLog("ANOMALOUS ACTIVITY DETECTED.");
          if (heartbeatAudioRef.current) {
            heartbeatAudioRef.current.loop = true;
            heartbeatAudioRef.current.play().catch(() => {});
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [state, testTime]);

  const triggerJumpscare = useCallback(() => {
    setState(State.JUMPSCARE);
    if (screamAudioRef.current) {
      screamAudioRef.current.currentTime = 0;
      screamAudioRef.current.volume = 1.0;
      screamAudioRef.current.play().catch(() => {});
    }
    // Shake the screen via motion logic
  }, []);

  useEffect(() => {
    if (state === State.PRE_SCARE) {
      const timer = setTimeout(() => {
        triggerJumpscare();
      }, 4000); // 4 seconds of creepy silence/suspense
      return () => clearTimeout(timer);
    }
  }, [state, triggerJumpscare]);

  return (
    <div className="min-h-screen bg-[#050000] text-white font-sans selection:bg-red-600 selection:text-white overflow-hidden flex flex-col items-center justify-center relative p-4">
      {/* Audio elements */}
      <audio ref={screamAudioRef} src={SCREAM_SFX} preload="auto" />
      <audio ref={ambienceAudioRef} src={AMBIENCE_SFX} preload="auto" />
      <audio ref={heartbeatAudioRef} src={HEARTBEAT_SFX} preload="auto" />

      {/* Distorted Background Layer */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,#300,transparent_70%)] animate-pulse" />
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)', backgroundSize: '100% 3px' }} />
      </div>

      <div className="z-10 w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px] -z-10" />
        
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-600 rounded-md">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold leading-none">Diagnostic v4.2</span>
              <span className="text-xs font-black tracking-tight">VISION PRECISION SCAN</span>
            </div>
          </div>
          <div className="bg-red-600/10 border border-red-500/30 px-3 py-1 rounded-full">
            <span className="text-[10px] text-red-500 font-bold animate-pulse">SOUND ENABLED</span>
          </div>
        </div>

        {/* Main Interface Content */}
        <div className="p-10 space-y-8 flex-1 min-h-[420px] flex flex-col justify-center">
          {state === State.IDLE && (
            <div className="text-center space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Activity className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-shadow">NEURAL RESPONSE<br/>CALIBRATION</h1>
                <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                  Focus your retina on the central stimulus. Measure micro-saccade precision for high-latency ocular environments.
                </p>
              </div>
              <button 
                onClick={startCalibration}
                className="group relative px-10 py-4 bg-white text-black font-black uppercase text-sm tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 mx-auto shadow-xl"
              >
                INITIALIZE TEST <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          )}

          {state === State.CALIBRATING && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Final Scan Status</span>
                    <span className="text-xl font-bold">SYNAPTIC MAPPING...</span>
                  </div>
                  <span className="text-2xl font-black italic">{progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full w-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-[10px] space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 p-4 bg-red-600/30 blur-sm" />
                    <div className="opacity-40 uppercase font-black">Subsystem {i+1}</div>
                    <div className="text-white/80 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                       {Math.random().toString(16).substring(2, 12).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(state === State.TESTING || state === State.PRE_SCARE) && (
            <div className="flex flex-col flex-1 gap-8">
              <div className="flex-1 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm relative overflow-hidden cursor-none">
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40" />

                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-4/5 h-4/5 border-2 border-dotted border-white rounded-full animate-spin-slow" />
                </div>
                
                {/* The Target Dot */}
                <motion.div 
                  animate={{
                    left: `${dotPos.x}%`,
                    top: `${dotPos.y}%`
                  }}
                  transition={{ type: 'spring', damping: 12, stiffness: 60 }}
                  className="absolute w-3 h-3 bg-red-600 rounded-full shadow-[0_0_20px_#ff0000] -translate-x-1/2 -translate-y-1/2"
                />

                {state === State.PRE_SCARE && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-600/5 backdrop-blur-[2px]">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: [0, 1, 0.8, 1], scale: 1 }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                      className="bg-black/80 backdrop-blur-2xl border border-red-500/50 px-6 py-4 text-red-500 text-xs font-black uppercase tracking-[0.2em] flex flex-col items-center gap-2 shadow-[0_0_50px_rgba(255,0,0,0.3)] rounded-lg"
                    >
                      <Activity className="w-6 h-6 animate-pulse" />
                      RE-CALIBRATING SENSORS...
                    </motion.div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-1">
                 <p className="text-white/40 text-[11px] uppercase tracking-[0.3em] font-medium animate-pulse">
                  {state === State.PRE_SCARE ? "DO NOT BLINK. DO NOT MOVE." : "KEEP STEADY GAZE ON THE RED DOT"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* System Logs Panel */}
        <div className="bg-black/60 backdrop-blur-3xl p-6 border-t border-white/10 flex flex-col gap-2 min-h-[120px] relative">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
          <div className="text-[10px] opacity-30 uppercase font-black tracking-widest mb-1">Live Telemetry Stream</div>
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div 
                key={log + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`text-[11px] flex items-center gap-3 ${log.includes('ANOMALOUS') ? 'text-red-500' : 'text-white/70'}`}
              >
                <span className="opacity-20 font-mono">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className={`tracking-tight ${log.includes('ANOMALOUS') ? 'font-black' : 'font-medium'}`}>{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Jumpscare Layer */}
      <AnimatePresence>
        {state === State.JUMPSCARE && (
          <motion.div 
            initial={{ opacity: 0, scale: 2 }}
            animate={{ 
              opacity: 1, 
              scale: [2, 1, 1.1, 1],
              x: [0, -20, 20, -10, 10, 0],
              y: [0, 20, -20, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.1,
              x: { duration: 0.1, repeat: Infinity },
              y: { duration: 0.1, repeat: Infinity }
            }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <img 
              src={JUMPSCARE_IMAGE} 
              className="w-full h-full object-cover filter brightness-[1.2] contrast-[1.5] sepia-[0.3]"
              alt="Jumpscare"
              referrerPolicy="no-referrer"
            />
            {/* Visual Glitch Overlays */}
            <div className="absolute inset-0 bg-red-500 mix-blend-overlay opacity-30 animate-pulse" />
            <div className="absolute inset-0 bg-white opacity-10 animate-flash" />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.4; }
        }
        .animate-flash {
          animation: flash 0.05s infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
