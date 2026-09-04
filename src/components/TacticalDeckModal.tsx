import React, { useState } from 'react';
import { 
  Globe, 
  Satellite, 
  Radio, 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  Zap, 
  Eye, 
  MapPin, 
  Train, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { TacticalBridgeState } from '../utils/cyberToolsBridge';

interface TacticalDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  tacticalState: TacticalBridgeState;
  onTriggerOrbitalScan: () => void;
  onTriggerShadowBrokerDrone: () => void;
  onTriggerSophiaSTMOverload: () => void;
}

export const TacticalDeckModal: React.FC<TacticalDeckModalProps> = ({
  isOpen,
  onClose,
  tacticalState,
  onTriggerOrbitalScan,
  onTriggerShadowBrokerDrone,
  onTriggerSophiaSTMOverload
}) => {
  const [activeTab, setActiveTab] = useState<'world_monitor' | 'shadowbroker' | 'sophia_stm'>('world_monitor');

  if (!isOpen) return null;

  const { worldMonitor, shadowBroker, sophiaSTM, terminalLogs } = tacticalState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-sans select-none">
      <div className="relative w-full max-w-5xl bg-[#090b10] border border-[#00f3ff55] shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col max-h-[96vh] sm:max-h-[90vh] overflow-hidden text-gray-200 rounded-lg sm:rounded-none">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#0e131f] border-b border-[#00f3ff33]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-lg font-orbitron font-black text-white tracking-wider flex items-center gap-1.5 sm:gap-2 truncate">
                <span>THIRTY3</span> <span className="text-[#00f3ff] truncate">// CONSOLE TACTIQUE</span>
              </h2>
              <p className="text-[9px] sm:text-[10px] font-mono text-[#00f3ff]/70 tracking-widest uppercase truncate">
                Interconnexion Opérationnelle • 3 Outils Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-[#00ff4122] border border-[#00ff41] text-[#00ff41] flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                DOCKER MESH: ACTIF
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer rounded"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#00f3ff22] bg-[#0b0e14] overflow-x-auto no-scrollbar touch-pan-x">
          <button
            onClick={() => setActiveTab('world_monitor')}
            className={`flex-1 min-w-[120px] py-2.5 sm:py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-orbitron text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'world_monitor'
                ? 'border-[#00f3ff] bg-[#00f3ff15] text-[#00f3ff] shadow-[0_4px_15px_rgba(0,243,255,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f3ff]" />
            <span>1. World Monitor</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 bg-[#00f3ff22] text-[#00f3ff]">PORT 3000</span>
          </button>

          <button
            onClick={() => setActiveTab('shadowbroker')}
            className={`flex-1 min-w-[120px] py-2.5 sm:py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-orbitron text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'shadowbroker'
                ? 'border-[#f59e0b] bg-[#f59e0b15] text-[#f59e0b] shadow-[0_4px_15px_rgba(245,158,11,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f59e0b]" />
            <span>2. ShadowBroker</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 bg-[#f59e0b22] text-[#f59e0b]">PORT 8001</span>
          </button>

          <button
            onClick={() => setActiveTab('sophia_stm')}
            className={`flex-1 min-w-[120px] py-2.5 sm:py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-orbitron text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sophia_stm'
                ? 'border-[#ff00ff] bg-[#ff00ff15] text-[#ff00ff] shadow-[0_4px_15px_rgba(255,0,255,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff00ff]" />
            <span>3. Sophia & STM</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 bg-[#ff00ff22] text-[#ff00ff]">PORT 8000</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 touch-pan-y">
          
          {/* TAB 1: WORLD MONITOR */}
          {activeTab === 'world_monitor' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#10141f] border border-[#00f3ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Niveau de Menace Global</div>
                  <div className="text-xl font-orbitron font-bold text-[#ff0044] flex items-center gap-2 mt-1">
                    <ShieldAlert className="w-5 h-5 text-[#ff0044] animate-bounce" />
                    {worldMonitor.threatLevel} // URGENCE MAX
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-mono">
                    Confinement actif de Montréal par Viktor Vance.
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#00f3ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Constellation Satellite</div>
                  <div className="text-xl font-orbitron font-bold text-[#00f3ff] flex items-center gap-2 mt-1">
                    <Satellite className="w-5 h-5 text-[#00f3ff]" />
                    {worldMonitor.activeSatellites} SATELLITES SKYFI
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-mono">
                    Résolution optique 0.3m sur Sainte-Catherine.
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#00f3ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Action Tactique en Jeu</div>
                  <button
                    onClick={onTriggerOrbitalScan}
                    disabled={!worldMonitor.orbitalScanReady}
                    className={`w-full mt-2 py-2 px-3 font-orbitron text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      worldMonitor.orbitalScanReady
                        ? 'bg-[#00f3ff] text-black hover:bg-[#00f3ff]/90 shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    {worldMonitor.orbitalScanReady ? 'SCAN ORBITAL [TOUCHE 6]' : `RECHARGE (${worldMonitor.orbitalCooldown}S)`}
                  </button>
                  <div className="text-[9px] text-[#00f3ff] mt-1.5 text-center font-mono">
                    +20% Crit & Détection des Caches pendant 12s
                  </div>
                </div>
              </div>

              {/* Chokepoints Monitor */}
              <div className="bg-[#10141f] border border-[#00f3ff33] p-4">
                <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Chokepoints Urbains Sous Surveillance Satellitaire
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {worldMonitor.monitoredChokepoints.map((chk, i) => (
                    <div key={i} className="bg-[#0b0e14] border border-[#ffffff11] p-3 flex items-center justify-between">
                      <span>{chk}</span>
                      <span className="text-[#00ff41] text-[10px] font-bold">100% FLUX LIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHADOWBROKER OSINT */}
          {activeTab === 'shadowbroker' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#10141f] border border-[#f59e0b33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Secteur Cible Infiltré</div>
                  <div className="text-sm font-orbitron font-bold text-[#f59e0b] mt-1">
                    {shadowBroker.targetDistrict}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-mono">
                    Tours SPVM compromises : {shadowBroker.spvmSurveillanceTowersHacked} / {shadowBroker.totalTowers}
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#f59e0b33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Balises de Renseignement IA</div>
                  <div className="text-xl font-orbitron font-bold text-white mt-1">
                    {shadowBroker.osintPins.length} PINS DÉTECTÉS
                  </div>
                  <div className="text-[10px] text-[#f59e0b] mt-2 font-mono">
                    Cibles prioritaires : Serveur Vance & Patrouilles
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#f59e0b33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Action Tactique en Jeu</div>
                  <button
                    onClick={onTriggerShadowBrokerDrone}
                    disabled={!shadowBroker.reconDroneReady}
                    className={`w-full mt-2 py-2 px-3 font-orbitron text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      shadowBroker.reconDroneReady
                        ? 'bg-[#f59e0b] text-black hover:bg-[#f59e0b]/90 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {shadowBroker.reconDroneReady ? 'DRONE INFILTRATEUR [TOUCHE 7]' : `RECHARGE (${shadowBroker.droneCooldown}S)`}
                  </button>
                  <div className="text-[9px] text-[#f59e0b] mt-1.5 text-center font-mono">
                    Brouille le radar SPVM & Réduit la vitesse ennemie de 40%
                  </div>
                </div>
              </div>

              {/* OSINT Pins List */}
              <div className="bg-[#10141f] border border-[#f59e0b33] p-4">
                <h3 className="text-xs font-orbitron font-bold text-[#f59e0b] uppercase mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Cartographie OSINT en Temps Réel (Montréal 2033)
                </h3>
                <div className="space-y-2">
                  {shadowBroker.osintPins.map(pin => (
                    <div key={pin.id} className="bg-[#0b0e14] border border-[#ffffff11] p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${pin.type === 'threat' ? 'bg-[#ff0044]' : pin.type === 'intel' ? 'bg-[#00f3ff]' : 'bg-[#00ff41]'}`} />
                        <div>
                          <div className="text-xs font-bold text-white font-orbitron">{pin.label}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{pin.description}</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        GPS: {pin.lat.toFixed(4)}° N, {pin.lng.toFixed(4)}° W
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEUS EX SOPHIA & STM MATRIX */}
          {activeTab === 'sophia_stm' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#10141f] border border-[#ff00ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Moteur d'Inférence IA de Sophia</div>
                  <div className="text-sm font-orbitron font-bold text-[#ff00ff] mt-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff00ff]" />
                    {sophiaSTM.aiInferenceEngine}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-mono">
                    Génération Deepfake : {sophiaSTM.deepfakeProgressPercent}% complet
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#ff00ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Réseau STM Montréal Intercepté</div>
                  <div className="text-base font-orbitron font-bold text-[#00ff41] mt-1 flex items-center gap-2">
                    <Train className="w-4 h-4 text-[#00ff41]" />
                    {sophiaSTM.activeBusesTracked} VÉHICULES LIVE
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 font-mono">
                    Statut Métro : <span className="text-[#ff00ff] font-bold">{sophiaSTM.metroStatus}</span>
                  </div>
                </div>

                <div className="bg-[#10141f] border border-[#ff00ff33] p-4">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Action Tactique en Jeu</div>
                  <button
                    onClick={onTriggerSophiaSTMOverload}
                    disabled={!sophiaSTM.matrixOverloadReady}
                    className={`w-full mt-2 py-2 px-3 font-orbitron text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      sophiaSTM.matrixOverloadReady
                        ? 'bg-[#ff00ff] text-white hover:bg-[#ff00ff]/90 shadow-[0_0_20px_rgba(255,0,255,0.5)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {sophiaSTM.matrixOverloadReady ? 'DIFFUSER DEEPFAKE [TOUCHE 8]' : `RECHARGE (${sophiaSTM.matrixCooldown}S)`}
                  </button>
                  <div className="text-[9px] text-[#ff00ff] mt-1.5 text-center font-mono">
                    Étourdit tous les ennemis (Stagger 4s) & Invoque des Insurgés
                  </div>
                </div>
              </div>

              {/* Intercepted STM Lines */}
              <div className="bg-[#10141f] border border-[#ff00ff33] p-4">
                <h3 className="text-xs font-orbitron font-bold text-[#ff00ff] uppercase mb-3 flex items-center gap-2">
                  <Train className="w-4 h-4" /> Lignes STM Actives Contrôlées par Deus Ex Sophia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {sophiaSTM.stmLinesIntercepted.map((line, i) => (
                    <div key={i} className="bg-[#0b0e14] border border-[#ffffff11] p-3 flex items-center justify-between">
                      <span>{line}</span>
                      <span className="text-[#ff00ff] text-[10px] font-bold">BYPASS ACTIF</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE OLLAMA / DEUS EX SOPHIA INFERENCE TERMINAL */}
              <div className="bg-[#0d0718] border-2 border-[#ff00ff55] p-4 shadow-[0_0_30px_rgba(255,0,255,0.15)] relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff00ff] animate-ping" />
                    <span className="text-xs font-orbitron font-black text-white uppercase tracking-wider">
                      FLUX D'INFÉRENCE HYBRIDE LIVE // OLLAMA: DEUS_EX_SOPHIA:LATEST
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff00ff22] border border-[#ff00ff] text-[#ff00ff]">
                    8.0B Gemma-4 (Q4_K_M)
                  </span>
                </div>

                <div className="bg-[#06030b] border border-[#ff00ff33] p-3 font-mono text-xs text-gray-200 leading-relaxed min-h-[60px] flex items-center">
                  <span className="text-[#ff00ff] font-bold mr-2">SOPHIA :</span>
                  <span>{sophiaSTM.lastAiResponse || 'Initialisation de l’inférence quantique...'}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={onTriggerSophiaSTMOverload}
                    className="px-3 py-1.5 bg-[#ff00ff22] hover:bg-[#ff00ff44] border border-[#ff00ff] text-[#ff00ff] font-orbitron text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    1. Faille de Viktor Vance
                  </button>
                  <button
                    onClick={onTriggerSophiaSTMOverload}
                    className="px-3 py-1.5 bg-[#00f3ff22] hover:bg-[#00f3ff44] border border-[#00f3ff] text-[#00f3ff] font-orbitron text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Cpu className="w-3 h-3" />
                    2. Script Deepfake de Vérité
                  </button>
                  <button
                    onClick={onTriggerSophiaSTMOverload}
                    className="px-3 py-1.5 bg-[#00ff4122] hover:bg-[#00ff4144] border border-[#00ff41] text-[#00ff41] font-orbitron text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Train className="w-3 h-3" />
                    3. Détourner Métro Place-des-Arts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Logs (Simulated Docker Bridge Traffic) */}
          <div className="bg-[#06080c] border border-[#00f3ff22] p-3 font-mono text-[10px] space-y-1">
            <div className="text-gray-400 font-bold flex items-center gap-1 mb-1">
              <Terminal className="w-3 h-3 text-[#00f3ff]" />
              JOURNAL DES PAQUETS DOCKER // TEMPS RÉEL :
            </div>
            {terminalLogs.slice(-4).map((log, i) => (
              <div key={i} className="text-[#00f3ff]/90">{log}</div>
            ))}
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0e131f] border-t border-[#00f3ff33] flex justify-between items-center text-[10px] font-mono text-gray-400">
          <div>Raccourci Clavier en jeu : <span className="text-white font-bold">[T]</span> ou <span className="text-white font-bold">[TAB]</span></div>
          <div className="text-[#00ff41]">CONNEXION CRYPTO-QUANTIQUE SÉCURISÉE</div>
        </div>

      </div>
    </div>
  );
};
