import React, { useState, useEffect, useRef } from 'react';
import { 
  Crosshair, 
  Map as MapIcon, 
  Gamepad2, 
  Layers, 
  Radio, 
  Terminal, 
  Smartphone, 
  Monitor, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Cpu, 
  ShieldAlert, 
  Navigation,
  ArrowLeft,
  Search,
  Satellite,
  Train,
  Eye,
  Zap,
  Sparkles,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { MontrealTacticalMap } from './MontrealTacticalMap';
import { STMBusStatusReport } from '../services/stmService';
import { sound } from '../utils/audio';

type ViewMode = 'auto' | 'android' | 'desktop';
type TacticalFilter = 'centre-ville' | 'tour-vance' | 'ile-complete' | 'cyber-dark' | 'satellite';

interface Coordinates {
  lat: number;
  lng: number;
  altitude: string;
  sector: string;
}

interface TacticalMontrealAppProps {
  onLaunchGame?: () => void;
  onBackToHub?: () => void;
  onOpenSophiaChat?: (prompt?: string) => void;
  stmLiveReport?: STMBusStatusReport | null;
  hackedPins?: string[];
  onHackPin?: (pinId: string, label: string) => void;
  onTriggerOrbitalScan?: () => void;
  isStandalone?: boolean;
}

export const TacticalMontrealApp: React.FC<TacticalMontrealAppProps> = ({
  onLaunchGame,
  onBackToHub,
  onOpenSophiaChat,
  stmLiveReport,
  hackedPins = [],
  onHackPin,
  onTriggerOrbitalScan,
  isStandalone = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('auto');
  const [activeFilter, setActiveFilter] = useState<TacticalFilter>('tour-vance');
  const [stmLayerActive, setStmLayerActive] = useState<boolean>(true);
  const [isARPGModalOpen, setIsARPGModalOpen] = useState<boolean>(false);
  const [isSophiaModalOpen, setIsSophiaModalOpen] = useState<boolean>(false);
  const [sophiaInput, setSophiaInput] = useState<string>('');
  const [sophiaLog, setSophiaLog] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'DEUS_EX_SOPHIA',
      text: 'Matrice cartographique de Montréal 2033 initialisée. Données OSM, SkyFi 0.3m et STM connectées.',
      time: '20:33:00'
    }
  ]);
  const [coords, setCoords] = useState<Coordinates>({ 
    lat: 45.5017, 
    lng: -73.5673, 
    altitude: '142m',
    sector: 'VILLE-MARIE'
  });
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Force le re-render / resize des layers cartographiques lors du switch
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Déclencheur simulant l'invalidation de taille de carte SIG
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [viewMode, activeFilter]);

  const isMobileLayout = 
    viewMode === 'android' || 
    (viewMode === 'auto' && typeof window !== 'undefined' && window.innerWidth < 1024);

  const handleFilterChange = (filter: TacticalFilter) => {
    sound.playLoot();
    setActiveFilter(filter);
    if (filter === 'tour-vance') {
      setCoords({ lat: 45.4996, lng: -73.5717, altitude: '185m', sector: 'TOUR CIBC / VANCE HQ' });
    } else if (filter === 'centre-ville') {
      setCoords({ lat: 45.5017, lng: -73.5673, altitude: '142m', sector: 'PLACE VILLE-MARIE' });
    } else if (filter === 'ile-complete') {
      setCoords({ lat: 45.5088, lng: -73.5878, altitude: '233m', sector: 'MONT-ROYAL & ÎLE' });
    } else if (filter === 'cyber-dark') {
      setCoords({ lat: 45.5038, lng: -73.5709, altitude: '95m', sector: 'RÉSO SOUTERRAIN' });
    } else if (filter === 'satellite') {
      setCoords({ lat: 45.5050, lng: -73.5515, altitude: '450km', sector: 'ORBITE SKYFI 0.3M' });
    }
  };

  const handleSendSophia = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sophiaInput.trim()) return;
    const userText = sophiaInput.trim();
    setSophiaInput('');
    sound.playLoot();
    setSophiaLog(prev => [...prev, { sender: 'OPÉRATEUR', text: userText, time: new Date().toLocaleTimeString() }]);

    if (onOpenSophiaChat) {
      onOpenSophiaChat(userText);
    }

    setTimeout(() => {
      setSophiaLog(prev => [
        ...prev,
        {
          sender: 'DEUS_EX_SOPHIA',
          text: `« Directive analysée : "${userText}". Vecteur de vulnérabilité identifié à la Tour CIBC / Place Ville-Marie. Protocoles d'attaque synchronisés avec l'ARPG. »`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-[#060913] text-[#e0e7ff] font-mono select-none overflow-x-hidden flex flex-col">
      
      {/* 1. TOP DEDICATED CONTROL BAR - SWITCH SANS SUPERPOSITION */}
      <header data-snap-point="EN-TÊTE" className="w-full bg-[#0a0f1d]/95 border-b border-cyan-500/30 backdrop-blur-md px-3 py-2 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_20px_rgba(0,255,255,0.08)] snap-section">
        
        {/* Titre & Statut */}
        <div className="flex items-center gap-2 min-w-0">
          {onBackToHub && (
            <button
              onClick={() => {
                sound.playLoot();
                onBackToHub();
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-950 hover:text-white transition-all cursor-pointer shrink-0"
              title="Retour au Command Center Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-cyan-300 uppercase leading-none truncate">
              CARTE TACTIQUE MONTRÉAL // SIG GÉOSPATIAL
            </div>
            <div className="text-[9px] text-slate-400 leading-tight truncate">
              NEURAL GRID TACTICAL LINK • MONTRÉAL 2033
            </div>
          </div>
        </div>

        {/* Sélecteur de Vue Manuel : ANDROID / DESKTOP / AUTO */}
        <div className="flex items-center bg-[#050b14] p-0.5 rounded-lg border border-cyan-500/40 shrink-0">
          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('android');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'android' 
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                : 'text-cyan-400/70 hover:text-cyan-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ANDROID</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('desktop');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'desktop' 
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                : 'text-cyan-400/70 hover:text-cyan-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>DESKTOP</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('auto');
            }}
            className={`px-2 py-1 rounded text-[9px] font-semibold transition-all cursor-pointer ${
              viewMode === 'auto' ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            AUTO
          </button>
        </div>

        {/* Badge Statut compact */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] text-emerald-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>100% FONCTIONNEL</span>
        </div>
      </header>

      {/* 2. CONTENEUR PRINCIPAL ADAPTATIF */}
      <main data-scroll-container className={`flex-1 w-full mx-auto p-2 sm:p-4 overflow-y-auto touch-pan-y overflow-x-hidden snap-scroll-y ${isMobileLayout ? 'max-w-md' : 'max-w-[1850px]'}`}>
        
        {/* BOUTONS D'ACTION SUPÉRIEURS (SNAP POINT 1) */}
        <div data-snap-point="ACTIONS & ARPG" className="grid grid-cols-2 gap-2 mb-3 snap-section">
          <button 
            onClick={() => {
              sound.playLoot();
              setIsSophiaModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500/40 text-purple-300 hover:border-purple-400 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.2)] active:scale-95 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">SOPHIA AI INTEL</span>
          </button>

          <button 
            onClick={() => {
              sound.playLoot();
              handleFilterChange('ile-complete');
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0b172a] border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)] active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">CARTE COMPLÈTE</span>
          </button>

          {/* LANCEUR ARPG MAÎTRE (PLEINE LARGEUR) */}
          <button 
            onClick={() => {
              sound.playVictory();
              if (onLaunchGame) {
                onLaunchGame();
              } else {
                setIsARPGModalOpen(true);
              }
            }}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-black font-extrabold text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer hover:brightness-110"
          >
            <Gamepad2 className="w-4 h-4 text-black shrink-0" />
            <span className="truncate">LANCER LE JEU ARPG HACK & SMASH</span>
          </button>
        </div>

        {/* 3. DISPOSITION EN MODE DESKTOP OU MOBILE */}
        <div className={`${isMobileLayout ? 'flex flex-col gap-3' : 'grid grid-cols-12 gap-4'}`}>
          
          {/* COLONNE GAUCHE (DESKTOP) OU PANNEAU HAUT (MOBILE) */}
          <div className={`${isMobileLayout ? 'w-full' : 'col-span-3'} flex flex-col gap-3`}>
            
            {/* Boîte Coordonnées GPS / Télémesure (SNAP POINT 2) */}
            <div data-snap-point="GPS / TÉLÉMESURE" className="bg-[#0b1325]/90 rounded-xl border border-cyan-500/30 p-3 shadow-lg snap-section">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 border-b border-cyan-500/20 pb-1.5 mb-2">
                <span className="flex items-center gap-1.5 truncate">
                  <Crosshair className="w-3.5 h-3.5 shrink-0" />
                  GÉO-POSITION RECTIFIÉE
                </span>
                <span className="text-emerald-400 text-[9px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  LIVE GPS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400">LAT:</span>
                  <span className="text-cyan-300 font-bold ml-1">{coords.lat.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-slate-400">LNG:</span>
                  <span className="text-cyan-300 font-bold ml-1">{coords.lng.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-slate-400">ALT:</span>
                  <span className="text-purple-300 font-bold ml-1">{coords.altitude}</span>
                </div>
                <div>
                  <span className="text-slate-400">SECTEUR:</span>
                  <span className="text-amber-300 font-bold ml-1 truncate">{coords.sector}</span>
                </div>
              </div>
            </div>

            {/* Ruban Défilable des Filtres de Secteurs (SNAP POINT 3) */}
            <div data-snap-point="POINTS STRATÉGIQUES" className="bg-[#0b1325]/90 rounded-xl border border-cyan-500/30 p-2.5 shadow-lg snap-section">
              <div className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyan-400" />
                <span>Points Stratégiques 2033</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                {[
                  { id: 'centre-ville', label: 'Centre-Ville' },
                  { id: 'tour-vance', label: '🎯 Tour Vance' },
                  { id: 'ile-complete', label: 'Île Complète' },
                  { id: 'cyber-dark', label: '🌌 Cyber Dark' },
                  { id: 'satellite', label: '🛰️ Satellite HD' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterChange(tab.id as TacticalFilter)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition-all border cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-pink-600/30 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                        : 'bg-[#080e1a] border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ZONE CENTRALE : CARTE TACTIQUE CYBERPUNK MONTRÉAL (SNAP POINT 4) */}
          <div data-snap-point="CARTE TACTIQUE SIG" className="snap-section flex flex-col">
            <div 
              ref={mapContainerRef}
              className={`w-full relative rounded-xl border border-cyan-500/50 overflow-hidden bg-[#040812] shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between ${
                isMobileLayout ? 'h-[45dvh] min-h-[300px]' : 'h-[calc(100vh-170px)] min-h-[580px]'
              }`}
            >
              {/* Actual Montreal Interactive Tactical Map */}
              <div className="absolute inset-0 z-0">
                <MontrealTacticalMap
                  stmLiveReport={stmLiveReport}
                  hackedPins={hackedPins}
                  onHackPin={onHackPin}
                  onTriggerOrbitalScan={onTriggerOrbitalScan}
                  activeServiceId="map_montreal"
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Quick Bar Overlay: Télémétrie STM GTFS-Realtime */}
              <div className="relative z-20 mt-auto bg-[#091122]/90 backdrop-blur border-t border-cyan-500/30 p-2 text-[10px] flex items-center justify-between pointer-events-auto">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={stmLayerActive}
                    onChange={(e) => setStmLayerActive(e.target.checked)}
                    className="accent-cyan-400 rounded cursor-pointer"
                  />
                  <span className="text-cyan-200">🚌 Flux STM GTFS-Realtime</span>
                </label>
                <span className="text-[9px] text-emerald-400 font-bold">SYNCHRO 60FPS</span>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE (DESKTOP) OU PANNEAU BAS (MOBILE) */}
          <div className={`${isMobileLayout ? 'w-full' : 'col-span-3'} flex flex-col gap-3`}>
            
            {/* Contrôleur SIG Géospatial (SNAP POINT 5) */}
            <div data-snap-point="SIG GÉOSPATIAL" className="bg-[#0b1325]/90 rounded-xl border border-purple-500/30 p-3 shadow-lg snap-section">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 border-b border-purple-500/20 pb-1.5 mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>CONTRÔLEUR DU SIG GÉOSPATIAL</span>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Densité du maillage :</span>
                  <span className="text-cyan-400 font-bold">1024 Relais</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Interférence corporative :</span>
                  <span className="text-rose-400 font-bold">78.4%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Surveillance Drones :</span>
                  <span className="text-amber-300 font-bold">ALERTE NIVEAU 3</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                <span>ENCRYPTAGE NEURAL :</span>
                <span className="text-emerald-400 font-bold">ACTIF (33Hz)</span>
              </div>
            </div>

            {/* Statut des 4 Bastions de Montréal (SNAP POINT 6) */}
            <div data-snap-point="4 BASTIONS MONTRÉAL" className="bg-[#0b1325]/90 rounded-xl border border-cyan-500/30 p-3 shadow-lg space-y-1.5 snap-section">
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-2">
                4 Bastions Gouvernementaux
              </div>
              {[
                { name: '1. Bassin Vieux-Port', status: 'VULNÉRABLE', color: 'text-emerald-400' },
                { name: '2. Galeries Ville-Marie', status: 'VERROUILLÉ', color: 'text-amber-400' },
                { name: '3. Mont-Royal Millénaire', status: 'FORTIFIÉ', color: 'text-rose-400' },
                { name: '4. Citadelle Orbitale PVM', status: 'APEX NODE', color: 'text-purple-400' },
              ].map((bastion, i) => (
                <div key={i} className="flex items-center justify-between text-[9px] bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-300">{bastion.name}</span>
                  <span className={`font-bold ${bastion.color}`}>{bastion.status}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>

      {/* MODAL SOPHIA AI INTEL */}
      {isSophiaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-xl bg-[#090e1a] border-2 border-purple-500 rounded-2xl p-4 shadow-[0_0_40px_rgba(168,85,247,0.4)] flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-purple-300">DEUS EX SOPHIA // NEURAL INTEL</h3>
              </div>
              <button 
                onClick={() => setIsSophiaModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded cursor-pointer"
              >
                FERMER [ESC]
              </button>
            </div>

            <div className="h-60 bg-[#04060e] border border-purple-500/30 rounded-xl p-3 overflow-y-auto space-y-2 text-xs">
              {sophiaLog.map((log, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="text-[9px] text-cyan-400 font-bold block">[{log.time}] {log.sender}</span>
                  <p className="text-gray-200">{log.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendSophia} className="flex gap-2">
              <input
                type="text"
                value={sophiaInput}
                onChange={(e) => setSophiaInput(e.target.value)}
                placeholder="Transmettre une requête stratégique à Sophia..."
                className="flex-1 bg-[#050811] border border-purple-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:brightness-110"
              >
                TRANSMETTRE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL JEU ARPG (HACK & SMASH ENGINE) */}
      {isARPGModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-2xl bg-[#090e1a] border-2 border-cyan-500 rounded-2xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-cyan-300">MONTRÉAL 2033 // ARPG ENGINE</h3>
              </div>
              <button 
                onClick={() => setIsARPGModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded cursor-pointer"
              >
                FERMER [ESC]
              </button>
            </div>

            <div className="h-64 bg-[#03060d] border border-cyan-500/40 rounded-xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0,transparent_70%)]" />
              <ShieldAlert className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
              <p className="text-xs text-cyan-200 font-bold mb-1">MOTEUR 60 FPS INTÉGRÉ PRÊT AU COMBAT</p>
              <p className="text-[10px] text-slate-400 max-w-md">
                Arbre de compétences hybride Hacking & Psychique déverrouillé. Progression de 1 à 99 et 10 paliers de difficulté opérationnels.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setIsARPGModalOpen(false);
                  if (onLaunchGame) onLaunchGame();
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-cyan-400 cursor-pointer"
              >
                ENTRER DANS LA MATRICE MONTRÉALAISE
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
