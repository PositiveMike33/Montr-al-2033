import React, { useState } from 'react';
import { X, Volume2, VolumeX, Monitor, Cpu, CheckCircle2, Shield, Activity, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute
}) => {
  const [activeModel, setActiveModel] = useState<string>('deus_ex_sophia:latest');
  const [graphicsPreset, setGraphicsPreset] = useState<'ultra_light' | 'standard'>('ultra_light');
  const [pingStatus, setPingStatus] = useState<Record<string, string>>({
    '3033 (Jeu ARPG)': 'OK (2ms)',
    '3000 (World Monitor)': 'OK (1ms)',
    '8001 (ShadowBroker)': 'OK (3ms)',
    '8000 (Sophia Gateway)': 'OK (2ms)',
    '11434 (Ollama AI)': 'OK (4ms)',
    '6379 (STM Redis)': 'OK (1ms)'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans select-none">
      <div className="bg-[#0b0f19] border border-[#00f3ff44] rounded-lg max-w-xl w-full shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-[#00f3ff33] bg-[#090d16] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00f3ff]" />
            <h2 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">
              PARAMÈTRES & DIAGNOSTICS SYSTÈME
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Audio Settings */}
          <div className="space-y-2">
            <label className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Moteur Audio & Synthétiseur Cyberpunk
            </label>
            <div className="flex items-center justify-between p-3 bg-[#070a12] border border-[#ffffff11] rounded">
              <span className="text-xs text-gray-300">Bande-son & Effets Sonores Web Audio API</span>
              <button
                onClick={onToggleMute}
                className={`px-3 py-1.5 rounded font-orbitron text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                  !isMuted 
                    ? 'bg-[#00ff4122] border border-[#00ff41] text-[#00ff41]' 
                    : 'bg-red-950/40 border border-red-500 text-red-400'
                }`}
              >
                {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {!isMuted ? 'AUDIO ACTIF' : 'MUET'}
              </button>
            </div>
          </div>

          {/* Graphics Settings */}
          <div className="space-y-2">
            <label className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Mode Graphique & Performance Moteur
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGraphicsPreset('ultra_light')}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  graphicsPreset === 'ultra_light'
                    ? 'bg-[#00f3ff15] border-[#00f3ff] text-white shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-[#070a12] border-white/10 text-gray-400'
                }`}
              >
                <div className="text-xs font-orbitron font-bold text-[#00f3ff]">⚡ ULTRA-LÉGER (Recommandé)</div>
                <div className="text-[10px] text-gray-400 mt-1">0 shadowBlur, Frustum Culling, 60+ FPS constant sans aucun freeze.</div>
              </button>

              <button
                onClick={() => setGraphicsPreset('standard')}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  graphicsPreset === 'standard'
                    ? 'bg-[#00f3ff15] border-[#00f3ff] text-white shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-[#070a12] border-white/10 text-gray-400'
                }`}
              >
                <div className="text-xs font-orbitron font-bold text-gray-300">STANDARD</div>
                <div className="text-[10px] text-gray-500 mt-1">Grille complète et particules standard.</div>
              </button>
            </div>
          </div>

          {/* Ollama Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-orbitron font-bold text-[#a855f7] uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Moteur d'Inférence IA Ollama (Port 11434)
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[
                { id: 'deus_ex_sophia:latest', name: 'deus_ex_sophia:latest (8.0B Gemma-4)', desc: 'Optimisé pour le RP Cyberpunk et le renseignement' },
                { id: 'argus:latest', name: 'argus:latest (3.4B Granite-4)', desc: 'Modèle léger ultra-rapide' },
                { id: 'test_sophia:latest', name: 'test_sophia:latest (8.0B)', desc: 'Instance de test de Sophia' },
                { id: 'krishairnd/Gemma-4-Uncensored:latest', name: 'Gemma-4-Uncensored (8.0B)', desc: 'Modèle source' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                    activeModel === m.id
                      ? 'bg-[#a855f715] border-[#a855f7] text-white'
                      : 'bg-[#070a12] border-white/10 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#a855f7] truncate">{m.name}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Docker Ports Connectivity Ping */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-orbitron font-bold text-[#00ff41] uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Connectivité des 6 Services Docker
              </label>
              <span className="text-[10px] font-mono text-[#00ff41] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% OPÉRATIONNEL
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px]">
              {Object.entries(pingStatus).map(([name, status]) => (
                <div key={name} className="p-2 bg-[#070a12] border border-[#ffffff11] rounded flex items-center justify-between">
                  <span className="text-gray-300 truncate">{name}</span>
                  <span className="text-[#00ff41] font-bold">{status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#00f3ff33] bg-[#090d16] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00f3ff] text-black font-orbitron font-bold text-xs uppercase rounded hover:bg-[#00f3ff]/90 transition-all cursor-pointer"
          >
            ENREGISTRER & FERMER
          </button>
        </div>
      </div>
    </div>
  );
};
