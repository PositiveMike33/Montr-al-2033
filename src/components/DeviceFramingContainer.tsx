// ═══════════════════════════════════════════════════════════════════════════════
// CADRAGE D'ÉCRAN TACTIQUE : DISPOSITIF D'AFFICHAGE ANDROID VS DESKTOP/LAPTOP
// DOCTRINE MONTRÉAL 2033 // DOUBLE MODE MANUEL SANS DÉBORDEMENT
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, 
  Monitor, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Wifi, 
  Battery, 
  Radio, 
  Sparkles,
  Zap,
  Sliders,
  Shield,
  Layers
} from 'lucide-react';
import { DeviceViewportMode, AndroidOrientation, DEVICE_PRESETS } from '../types/deviceFraming';
import { sound } from '../utils/audio';

interface DeviceFramingContainerProps {
  children: React.ReactNode;
  onModeChange?: (mode: DeviceViewportMode) => void;
  externalMode?: DeviceViewportMode;
}

export const DeviceFramingContainer: React.FC<DeviceFramingContainerProps> = ({
  children,
  onModeChange,
  externalMode
}) => {
  // Load saved preference or default to desktop
  const [internalMode, setInternalMode] = useState<DeviceViewportMode>(() => {
    if (externalMode) return externalMode;
    const saved = localStorage.getItem('montreal2033_viewport_mode');
    if (saved === 'android' || saved === 'desktop') return saved;
    // Auto-detect initial based on screen width
    return window.innerWidth < 768 ? 'android' : 'desktop';
  });

  const mode = externalMode ?? internalMode;

  const [orientation, setOrientation] = useState<AndroidOrientation>('portrait');
  const [showBezel, setShowBezel] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('20:33');
  const [batteryLevel] = useState<number>(98);
  const [isWindowNarrow, setIsWindowNarrow] = useState<boolean>(() => window.innerWidth < 768);

  // Window resize observer to detect small native mobile screens
  useEffect(() => {
    const handleResize = () => {
      setIsWindowNarrow(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Montreal 2033 Clock simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMode = useCallback((newMode: DeviceViewportMode) => {
    sound.playUiClick();
    setInternalMode(newMode);
    localStorage.setItem('montreal2033_viewport_mode', newMode);
    if (onModeChange) onModeChange(newMode);
  }, [onModeChange]);

  const handleToggleOrientation = useCallback(() => {
    sound.playUiClick();
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  const handleToggleBezel = useCallback(() => {
    sound.playUiClick();
    setShowBezel(prev => !prev);
  }, []);

  // 1. DESKTOP / LAPTOP MODE : Full Screen Expansive Layout
  if (mode === 'desktop') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black text-gray-100 select-none font-sans">
        {/* Floating Manual Mode Switcher Pill */}
        <div className="fixed bottom-3 left-3 z-[9999] pointer-events-auto">
          <div className="bg-[#090d16]/90 backdrop-blur-md border border-[#00f3ff]/40 rounded-full px-3 py-1.5 shadow-[0_0_20px_rgba(0,243,255,0.35)] flex items-center gap-2 text-xs font-orbitron">
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">CADRAGE :</span>
            
            <button
              onClick={() => handleToggleMode('desktop')}
              className="px-2.5 py-1 rounded-full bg-[#00f3ff] text-black font-black flex items-center gap-1.5 shadow-[0_0_10px_#00f3ff] transition-all cursor-pointer"
              title="Mode Desktop / Laptop Actif (Écran Large)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[10px] tracking-wider">💻 DESKTOP</span>
            </button>

            <button
              onClick={() => handleToggleMode('android')}
              className="px-2.5 py-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Basculer vers le Mode Manuel Android (Smartphone Cyberpunk)"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#00ff41]" />
              <span className="text-[10px] tracking-wider">📱 ANDROID</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // 2. ANDROID MODE : Cyberpunk Neural Smartphone Framed Viewport
  // If native screen is already small (< 768px), fill screen directly with safe mobile paddings
  const isDirectMobile = isWindowNarrow || !showBezel;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03060c] flex flex-col items-center justify-center font-sans select-none">
      
      {/* Background Ambience for Desktop viewing of Android Mode */}
      {!isDirectMobile && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-cyber-grid" />
      )}

      {/* Floating Control Bar in Android Framed Mode on Desktop (positioned bottom to avoid any header collision) */}
      {!isWindowNarrow && !isDirectMobile && (
        <div className="fixed bottom-3 right-3 z-[9999] pointer-events-auto flex items-center gap-2 bg-[#090d16]/95 backdrop-blur-md border border-[#00ff41]/50 rounded-full px-3.5 py-1.5 shadow-[0_0_25px_rgba(0,255,65,0.3)] text-xs font-orbitron">
          <span className="text-[10px] text-[#00ff41] font-bold flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">CHÂSSIS :</span> ANDROID
          </span>

          <div className="h-3 w-[1px] bg-white/20" />

          {/* Switch to Desktop */}
          <button
            onClick={() => handleToggleMode('desktop')}
            className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 hover:border-[#00f3ff] text-cyan-300 hover:text-white text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            title="Basculer en mode plein écran Desktop / Laptop"
          >
            <Monitor className="w-3 h-3 text-[#00f3ff]" />
            <span>💻 DESKTOP</span>
          </button>

          {/* Orientation Toggle */}
          <button
            onClick={handleToggleOrientation}
            className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 hover:border-[#00ff41] text-green-300 hover:text-white text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            title={`Basculer l'orientation (${orientation === 'portrait' ? 'Paysage' : 'Portrait'})`}
          >
            <RotateCw className="w-3 h-3 text-[#00ff41]" />
            <span className="hidden md:inline">{orientation === 'portrait' ? 'PAYSAGE' : 'PORTRAIT'}</span>
          </button>

          {/* Toggle Phone Bezel Frame */}
          <button
            onClick={handleToggleBezel}
            className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 hover:border-yellow-400 text-yellow-300 hover:text-white text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            title="Activer/Désactiver le châssis physique du smartphone"
          >
            {showBezel ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden md:inline">{showBezel ? 'SANS CHÂSSIS' : 'AVEC CHÂSSIS'}</span>
          </button>
        </div>
      )}

      {/* The Framing Container */}
      <div 
        className={`transition-all duration-300 ease-out relative flex flex-col ${
          isDirectMobile 
            ? 'w-full h-[100dvh] max-h-[100dvh] overflow-hidden' 
            : orientation === 'portrait'
              ? 'w-[420px] max-w-[95vw] h-[92vh] max-h-[890px] rounded-[44px] border-[10px] border-[#131826] shadow-[0_0_60px_rgba(0,255,65,0.25),0_0_0_2px_#00ff4166] bg-black ring-1 ring-white/10 overflow-hidden'
              : 'w-[890px] max-w-[95vw] h-[480px] max-h-[92vh] rounded-[44px] border-[10px] border-[#131826] shadow-[0_0_60px_rgba(0,255,65,0.25),0_0_0_2px_#00ff4166] bg-black ring-1 ring-white/10 overflow-hidden'
        }`}
      >
        {/* Android High-Tech Top Status Bar & Notch / Optical Sensor */}
        {!isDirectMobile && orientation === 'portrait' && (
          <div className="h-7 bg-[#070b14] px-6 flex items-center justify-between text-[11px] font-mono text-gray-300 shrink-0 select-none z-50 border-b border-white/5">
            {/* Clock */}
            <span className="font-bold text-white tracking-wider">{currentTime}</span>

            {/* Neural Optical Sensor / Front Punch Hole */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/80 border border-[#00f3ff44]">
              <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_6px_#00f3ff]" />
              <span className="text-[9px] font-orbitron font-bold text-[#00f3ff]">NEURAL-LINK</span>
            </div>

            {/* Status Icons: 5G, Wifi, Battery */}
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-[9px] font-bold text-[#00ff41]">5G+</span>
              <Wifi className="w-3 h-3 text-[#00ff41]" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">{batteryLevel}%</span>
                <Battery className="w-3.5 h-3.5 text-[#00ff41]" />
              </div>
            </div>
          </div>
        )}

        {/* Main Wrapped Application Viewport */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex flex-col touch-pan-y">
          {children}
        </div>

        {/* Android Bottom Gesture Navigation Home Pill */}
        {!isDirectMobile && orientation === 'portrait' && (
          <div className="h-4 bg-[#070b14] flex items-center justify-center shrink-0 z-50">
            <div className="w-28 h-1 bg-white/40 rounded-full hover:bg-[#00f3ff] transition-colors" />
          </div>
        )}
      </div>

    </div>
  );
};
