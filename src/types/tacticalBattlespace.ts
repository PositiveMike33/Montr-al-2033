// ═══════════════════════════════════════════════════════════════════════════════
// THE URBAN ENVIRONMENT: A BATTLESPACE MAP (MONTRÉAL 2033 DOCTRINE)
// Multi-Layer Bitmask Spatial Grid Architecture (O(1) Spatial Queries, Zero GC)
// ═══════════════════════════════════════════════════════════════════════════════

export enum TacticalLayer {
  NONE               = 0,
  POPULATION_DENSITY = 1 << 0, // 0x01: High foot traffic, anonymity, blending, pickpocketing
  KEY_TERRAIN        = 1 << 1, // 0x02: High ground, rooftops, chokepoints, sniper/psi range bonus
  INFRASTRUCTURE     = 1 << 2, // 0x04: Critical terminals, power nodes, hackable relays
  TRANSPORTATION     = 1 << 3, // 0x08: STM automated transit, high-speed movement corridors
  COMMERCE_FINANCIAL = 1 << 4, // 0x10: High value corporate districts, legendary loot chests
  SECURITY_PRESENCE  = 1 << 5, // 0x20: SPVM-Prime turrets, biometric scanners, elite patrols
  LOW_VISIBILITY     = 1 << 6, // 0x40: Dark alleys, conduits, shadow cover, -70% enemy detection
  EXFIL_POINT        = 1 << 7, // 0x80: Extraction zones (helipads, subway conduits, rooftop lines)
}

export type WeatherType = 'CLEAR' | 'ACID_RAIN' | 'NEON_FOG' | 'ION_STORM';

export interface WeatherCondition {
  type: WeatherType;
  name: string;
  stealthBonus: number;        // Discretion multiplier (e.g., +0.35 for Neon Fog)
  hackSpeedModifier: number;   // Hack speed multiplier
  visibilityModifier: number;  // Vision range multiplier
  description: string;
}

export type POIType = 
  | 'OBSERVATION_POINT'
  | 'CHOKEPOINT'
  | 'TERMINAL_HUB'
  | 'HIGH_VALUE_TARGET'
  | 'EXFIL_EXTRACTION';

export interface TacticalPOI {
  id: string;
  type: POIType;
  name: string;
  x: number; // Grid tile coordinate X
  y: number; // Grid tile coordinate Y
  worldX: number; // World pixel X
  worldY: number; // World pixel Y
  hacked?: boolean;
  discovered?: boolean;
  intelReward?: number;
  nanoCreditsReward?: number;
  description: string;
}

export interface OperatorObjectives {
  primaryTitle: string;
  primaryDescription: string;
  primaryCompleted: boolean;
  intelTotal: number;
  intelCollected: number;
  contactEstablished: boolean;
  exfilWithoutDetection: boolean;
  detectedCount: number;
}

export interface MissionPlanningChecklist {
  defineObjective: boolean;
  assessEnvironment: boolean;
  identifyOpportunities: boolean;
  analyzeThreats: boolean;
  planRoutes: boolean;
  prepareExecute: boolean;
}

export interface MissionState {
  stageId: number;
  stageName: string;
  timeOfDay: 'DAY' | 'NIGHT';
  weather: WeatherCondition;
  primaryHVTDefeated: boolean;
  intelCollected: number;
  exfilUnlocked: boolean;
  stealthLevel: number; // 0 to 100%
  underCover: boolean;
  currentSector: string;
  objectives: OperatorObjectives;
  checklist: MissionPlanningChecklist;
}

export interface SectorZoneInfo {
  id: string;
  name: string;
  type: 'HIGH_DENSITY' | 'INDUSTRIAL' | 'FINANCIAL' | 'TRANSIT_HUB' | 'RESIDENTIAL';
  tacticalLayers: number;
  bulletPoints: string[];
  color: string;
}
