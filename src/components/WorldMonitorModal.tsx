import React, { useState } from 'react';
import { Globe, ShieldAlert, Wifi, X, Terminal, Radio, RefreshCw, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

interface WorldMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityClearance?: number;
}

export const WorldMonitorModal: React.FC<WorldMonitorModalProps> = ({
  isOpen,
  onClose,
  securityClearance = 3
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const handleRefresh = () => {
    sound.playLoot();
    setIsSyncing(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleOpenExternal = () => {
    sound.playVictory();
    window.open('http://localhost:3000/embed?layers=earthquakes&center=20%2C-110.441&zoom=1&theme=dark&variant=tech', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 font-mono select-none">
      <div className="relative w-full max-w-5xl rounded-xl border border-cyan-500/50 bg-[#080d16] shadow-[0_0_40px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden text-cyan-400">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-black border-b border-cyan-500/30">
          <div className="flex items-center space-x-3 min-w-0">
            <Globe className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="text-xs tracking-widest text-cyan-300 font-bold uppercase flex items-center gap-2 truncate">
                <span className="truncate">RÉSEAU ARGUS // TÉLÉMÉTRIE GÉOSPHÉRIQUE MONTRÉAL-2033</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-cyan-900/60 border border-cyan-500 rounded text-cyan-300 shrink-0">
                  CLEARANCE LVL {securityClearance}
                </span>
              </div>
              <p className="text-[11px] text-cyan-600 truncate">Surveillance sismique et perturbations de réseau orbital</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleOpenExternal}
              title="Ouvrir dans un nouvel onglet"
              className="p-1.5 rounded bg-cyan-950/50 border border-cyan-700/50 hover:border-cyan-400 hover:text-cyan-200 text-cyan-400 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              title="Resynchroniser le flux"
              className="p-1.5 rounded bg-cyan-950/50 border border-cyan-700/50 hover:border-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                sound.playUiClick();
                onClose();
              }}
              className="p-1.5 rounded bg-red-950/40 border border-red-800/60 hover:bg-red-900/80 hover:text-red-200 text-red-400 transition-colors cursor-pointer"
              title="Fermer le terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-2 text-[11px] bg-black/70 border-b border-cyan-900/50">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping shrink-0" />
            <span className="truncate">FLUX EN DIRECT : <strong className="text-emerald-400">CONNECTÉ (PORT 3000)</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">COUCHE : SÉISMES & IMPACTS CRUSTAUX</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">LATENCE SYNAPTIQUE : ~12ms</span>
          </div>
        </div>

        {/* Intégration de l'Iframe Live Map */}
        <div className="relative w-full bg-black p-2">
          <div className="relative border border-cyan-500/30 rounded-lg overflow-hidden">
            <iframe
              key={iframeKey}
              src="http://localhost:3000/embed?layers=earthquakes&center=20%2C-110.441&zoom=1&theme=dark&variant=tech"
              title="World Monitor live map"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                width: '100%',
                height: '480px',
                border: 0,
                display: 'block',
                filter: 'contrast(1.05) brightness(0.95)'
              }}
              allowFullScreen
            />
            {/* Overlay scanline effet cyberpunk */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30" />
          </div>
        </div>

        {/* Console Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-cyan-900/40 text-[11px] text-cyan-600">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>SYSTÈME : Node_ARGUS_Global_Grid_v2033.4</span>
          </div>
          <div className="hidden sm:block text-[10px]">Protocole : localhost:3000 // Infiltration de flux biométrique active</div>
        </div>

      </div>
    </div>
  );
};
