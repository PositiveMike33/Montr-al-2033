// ═══════════════════════════════════════════════════════════════════════════════
// THE URBAN ENVIRONMENT: A BATTLESPACE MAP (OVERLAY & TACTICAL CONTROLLER)
// SEE IT. MAP IT. CONTROL IT. (Montréal 2033 Battlespace Intelligence)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { 
  TacticalLayer, 
  MissionState, 
  WeatherCondition, 
  SectorZoneInfo,
  POIType
} from '../types/tacticalBattlespace';
import { 
  Users, 
  Mountain, 
  Cpu, 
  Train, 
  DollarSign, 
  ShieldAlert, 
  EyeOff, 
  Crosshair, 
  CloudRain, 
  Sun, 
  Moon, 
  Radio, 
  FileText, 
  CheckSquare, 
  Square,
  Sparkles,
  Zap,
  Info,
  Compass,
  Maximize2,
  Minimize2,
  Flag,
  ArrowUpRight
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BattlespaceTacticalOverlayProps {
  missionState: MissionState;
  activeFilter: TacticalLayer;
  onFilterChange: (layer: TacticalLayer) => void;
  onToggleTimeOfDay?: () => void;
  onCycleWeather?: () => void;
  stealthTags?: string[];
  isUnderCover?: boolean;
  stealthMultiplier?: number;
  playerPos?: { x: number; y: number };
  onHackTerminal?: () => void;
  isNearTerminal?: boolean;
  onTriggerExfil?: () => void;
  isNearExfil?: boolean;
}

export const BattlespaceTacticalOverlay: React.FC<BattlespaceTacticalOverlayProps> = ({
  missionState,
  activeFilter,
  onFilterChange,
  onToggleTimeOfDay,
  onCycleWeather,
  stealthTags = [],
  isUnderCover = false,
  stealthMultiplier = 1.0,
  playerPos,
  onHackTerminal,
  isNearTerminal = false,
  onTriggerExfil,
  isNearExfil = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'LAYERS' | 'OBJECTIVES' | 'SECTORS' | 'CHECKLIST'>('LAYERS');

  const LAYERS_CONFIG = [
    {
      id: TacticalLayer.NONE,
      name: 'TOUTES LES COUCHES (COMPOSITE)',
      flag: '0x00',
      color: '#00f3ff',
      icon: Compass,
      desc: 'Vue intégrale multicouche rasterisée sur OffscreenCanvas.'
    },
    {
      id: TacticalLayer.POPULATION_DENSITY,
      name: 'DENSITÉ DE POPULATION',
      flag: '0x01',
      color: '#c026d3',
      icon: Users,
      desc: 'Zones de fort trafic piéton. Camouflage social, réduction de l’aggro drone, vol de crédits.'
    },
    {
      id: TacticalLayer.KEY_TERRAIN,
      name: 'TERRAIN CLÉ (POINTS HAUTS)',
      flag: '0x02',
      color: '#f59e0b',
      icon: Mountain,
      desc: 'Promontoires, toits du RÉSO, chokepoints. +35% de portée pour les blasts psychiques.'
    },
    {
      id: TacticalLayer.INFRASTRUCTURE,
      name: 'INFRASTRUCTURE & RELAIS',
      flag: '0x04',
      color: '#eab308',
      icon: Cpu,
      desc: 'Terminaux d’aiguillage et relais de données piratables pour surcharger le réseau.'
    },
    {
      id: TacticalLayer.TRANSPORTATION,
      name: 'RÉSEAU DE TRANSPORT (STM)',
      flag: '0x08',
      color: '#06b6d4',
      icon: Train,
      desc: 'Lignes de métro automatisées et tunnels ferroviaires. Corridors de déplacement rapide.'
    },
    {
      id: TacticalLayer.COMMERCE_FINANCIAL,
      name: 'COMMERCE & DISTRICT FINANCIER',
      flag: '0x10',
      color: '#10b981',
      icon: DollarSign,
      desc: 'Districts corpo Vance à haute sécurité. Coffres de butin Légendaire et Épique.'
    },
    {
      id: TacticalLayer.SECURITY_PRESENCE,
      name: 'SÉCURITÉ & SCANNER SPVM',
      flag: '0x20',
      color: '#ef4444',
      icon: ShieldAlert,
      desc: 'Tourelles biométriques, patrouilles d’élite et zones sous détection instantanée.'
    },
    {
      id: TacticalLayer.LOW_VISIBILITY,
      name: 'FAIBLE VISIBILITÉ (OMBRES)',
      flag: '0x40',
      color: '#64748b',
      icon: EyeOff,
      desc: 'Ruelles sombres et conduits d’évacuation. Cône de détection ennemi réduit de 55% à 70%.'
    },
    {
      id: TacticalLayer.EXFIL_POINT,
      name: 'EXTRACTION (EXFIL ZONE)',
      flag: '0x80',
      color: '#00ff41',
      icon: Flag,
      desc: 'Points d’extraction sécurisés sans détection (Hélisurface, Zodiaque furtif, Rame STM).'
    }
  ];

  return (
    <div className="absolute top-16 left-4 z-30 flex flex-col items-start gap-2 select-none pointer-events-auto">
      {/* 1. Tactical Status HUD Pill (Always Visible) */}
      <div className="bg-[#070b14]/90 backdrop-blur-md border border-[#00f3ff]/40 rounded-lg p-2.5 shadow-[0_0_20px_rgba(0,243,255,0.25)] flex items-center gap-3">
        <button
          onClick={() => {
            sound.playUiClick();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-2 text-xs font-orbitron font-black text-[#00f3ff] hover:text-white transition-all cursor-pointer"
          title="Ouvrir la Doctrine Tactique de l'Environnement Urbain"
        >
          <Compass className={`w-4 h-4 text-[#00f3ff] ${isExpanded ? 'animate-spin' : ''}`} />
          <span className="tracking-wider uppercase">BATTLESPACE 7-LAYERS</span>
          {isExpanded ? <Minimize2 className="w-3 h-3 ml-1" /> : <Maximize2 className="w-3 h-3 ml-1" />}
        </button>

        <div className="h-4 w-[1px] bg-white/20" />

        {/* Current Stealth State */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${isUnderCover ? 'bg-[#00ff41] animate-pulse shadow-[0_0_8px_#00ff41]' : 'bg-yellow-400'}`} />
          <span className={isUnderCover ? 'text-[#00ff41] font-bold' : 'text-yellow-400'}>
            {isUnderCover ? 'COUVERTURE ACTIVE' : 'À DÉCOUVERT'}
          </span>
          <span className="text-gray-400 text-[10px]">
            (Discrétion: ×{stealthMultiplier.toFixed(2)})
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/20" />

        {/* Weather & Time */}
        <div className="flex items-center gap-2">
          {onToggleTimeOfDay && (
            <button
              onClick={onToggleTimeOfDay}
              className="p-1 rounded bg-black/50 border border-white/10 hover:border-[#00f3ff] text-white cursor-pointer transition-all"
              title={`Basculer Jour/Nuit (Actuel: ${missionState.timeOfDay})`}
            >
              {missionState.timeOfDay === 'NIGHT' ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
            </button>
          )}

          {onCycleWeather && (
            <button
              onClick={onCycleWeather}
              className="px-2 py-0.5 rounded bg-black/50 border border-white/10 hover:border-[#00f3ff] text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer transition-all"
              title="Changer la météo tactique"
            >
              <CloudRain className="w-3 h-3 text-cyan-400" />
              <span>{missionState.weather?.name?.split(' ')[0] || 'NEON FOG'}</span>
            </button>
          )}
        </div>

        {/* Quick Context Action Button (e.g. [E] Hack or [F] Exfil) */}
        {isNearTerminal && onHackTerminal && (
          <button
            onClick={onHackTerminal}
            className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400 text-yellow-300 rounded text-[11px] font-orbitron font-bold animate-bounce cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
          >
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>[E] PIRATER RELAIS</span>
          </button>
        )}

        {isNearExfil && onTriggerExfil && (
          <button
            onClick={onTriggerExfil}
            className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/40 border border-[#00ff41] text-[#00ff41] rounded text-[11px] font-orbitron font-bold animate-bounce cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(0,255,65,0.4)]"
          >
            <Flag className="w-3 h-3 text-[#00ff41]" />
            <span>[F] EXFILTRATION IMMÉDIATE</span>
          </button>
        )}
      </div>

      {/* 2. Expanded Multi-Layer Tactical Command Deck */}
      {isExpanded && (
        <div className="w-[380px] md:w-[460px] bg-[#060a14]/95 backdrop-blur-xl border border-[#00f3ff]/50 rounded-xl p-4 shadow-[0_0_30px_rgba(0,243,255,0.3)] text-white space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Banner */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div>
              <h3 className="font-orbitron font-black text-sm text-[#00f3ff] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#00f3ff]" />
                THE URBAN ENVIRONMENT: BATTLESPACE MAP
              </h3>
              <p className="text-[10px] font-mono text-gray-400">
                SEE IT. MAP IT. CONTROL IT. // DOCTRINE MONTRÉAL-2033
              </p>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded">
              STAGE {missionState.stageId}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-[10px] font-orbitron font-bold">
            <button
              onClick={() => setActiveTab('LAYERS')}
              className={`py-1.5 rounded transition-all cursor-pointer ${
                activeTab === 'LAYERS' ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_#00f3ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              7 COUCHES
            </button>
            <button
              onClick={() => setActiveTab('OBJECTIVES')}
              className={`py-1.5 rounded transition-all cursor-pointer ${
                activeTab === 'OBJECTIVES' ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_#00f3ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              OBJECTIFS
            </button>
            <button
              onClick={() => setActiveTab('SECTORS')}
              className={`py-1.5 rounded transition-all cursor-pointer ${
                activeTab === 'SECTORS' ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_#00f3ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              SECTEURS
            </button>
            <button
              onClick={() => setActiveTab('CHECKLIST')}
              className={`py-1.5 rounded transition-all cursor-pointer ${
                activeTab === 'CHECKLIST' ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_#00f3ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              PLANNING
            </button>
          </div>

          {/* TAB 1: 7 TACTICAL ENVIRONMENTAL LAYERS */}
          {activeTab === 'LAYERS' && (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-gray-400 mb-1 flex justify-between">
                <span>FILTRER LA CARTE BITMASK :</span>
                <span className="text-[#00f3ff]">O(1) SPATIAL GRID</span>
              </div>

              {LAYERS_CONFIG.map(layer => {
                const isSelected = activeFilter === layer.id;
                const IconComponent = layer.icon;

                return (
                  <button
                    key={layer.id}
                    onClick={() => {
                      sound.playUiClick();
                      onFilterChange(layer.id);
                    }}
                    className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected 
                        ? 'bg-white/10 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                        : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <div 
                      className="p-1.5 rounded mt-0.5 shrink-0"
                      style={{ backgroundColor: `${layer.color}22`, border: `1px solid ${layer.color}` }}
                    >
                      <IconComponent className="w-3.5 h-3.5" style={{ color: layer.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-orbitron font-bold text-white truncate">
                          {layer.name}
                        </span>
                        <span className="text-[9px] font-mono opacity-60">
                          {layer.flag}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-tight mt-0.5">
                        {layer.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: OPERATOR OBJECTIVES */}
          {activeTab === 'OBJECTIVES' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-black/50 border border-white/10 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs font-orbitron font-bold">
                  <span className="text-[#ff0037] flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" />
                    OBJECTIF PRINCIPAL (HVT)
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {missionState.primaryHVTDefeated ? 'NEUTRALISÉ' : 'EN COURS'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-200">
                  {missionState.objectives.primaryTitle} : {missionState.objectives.primaryDescription}
                </p>
              </div>

              {/* Intel Progress */}
              <div className="p-2.5 bg-black/50 border border-white/10 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-xs font-orbitron font-bold text-[#00f3ff]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    RENSEIGNEMENTS OSINT COLLECTÉS
                  </span>
                  <span>{missionState.objectives.intelCollected} / {missionState.objectives.intelTotal} MB</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (missionState.objectives.intelCollected / missionState.objectives.intelTotal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Exfil Requirement */}
              <div className="p-2.5 bg-black/50 border border-white/10 rounded-lg flex items-center justify-between text-xs font-orbitron">
                <span className="flex items-center gap-1.5 text-[#00ff41]">
                  <ArrowUpRight className="w-4 h-4" />
                  EXFIL SANS DÉTECTION
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  missionState.objectives.exfilWithoutDetection ? 'bg-green-950 border border-green-500 text-green-400' : 'bg-red-950 border border-red-500 text-red-400'
                }`}>
                  {missionState.objectives.exfilWithoutDetection ? 'DISCRÉTION PARFAITE' : 'COMPROMIS'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SECTOR TYPES & URBAN INTELLIGENCE */}
          {activeTab === 'SECTORS' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {missionState.sectors && missionState.sectors.length > 0 ? (
                missionState.sectors.map(sec => (
                  <div key={sec.id} className="p-2.5 bg-black/50 border border-white/10 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-xs font-orbitron font-bold" style={{ color: sec.color }}>
                      <span>{sec.name}</span>
                      <span className="text-[9px] font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">
                        {sec.type}
                      </span>
                    </div>
                    <ul className="text-[10px] text-gray-300 list-disc list-inside space-y-0.5">
                      {sec.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-black/40 text-center text-xs text-gray-400">
                  Cartographie sectorielle en cours de synchronisation synaptique...
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MISSION PLANNING CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>1. DEFINE OBJECTIVE // RÈGLES D'ENGAGEMENT</span>
              </div>
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>2. ASSESS ENVIRONMENT // TOPOGRAPHIE & DENSITÉ</span>
              </div>
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>3. IDENTIFY OPPORTUNITIES // POINTS D'OMBRE & RELAIS</span>
              </div>
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>4. ANALYZE THREATS // SURVEILLANCE & PATROUILLES</span>
              </div>
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>5. PLAN ROUTES // EXTRACTION & VOIES DE SECOURS</span>
              </div>
              <div className="p-2 bg-black/50 border border-white/10 rounded flex items-center gap-2 text-gray-200">
                <CheckSquare className="w-4 h-4 text-[#00ff41]" />
                <span>6. PREPARE & EXECUTE // SOUPLESSE & ADAPTATION</span>
              </div>
            </div>
          )}

          {/* Bottom Footer Intel Tip */}
          <div className="bg-[#00f3ff]/10 border border-[#00f3ff]/30 p-2 rounded text-[10px] text-cyan-200 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#00f3ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">CONSEIL TACTIQUE :</span> Plus votre cartographie est précise, plus vos options d’action sont nombreuses. Exploitez la verticalité pour briser les lignes de mire.
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
