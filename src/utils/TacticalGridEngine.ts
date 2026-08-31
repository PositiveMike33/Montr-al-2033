// ═══════════════════════════════════════════════════════════════════════════════
// THE URBAN ENVIRONMENT: BATTLESPACE GRID ENGINE (MONTRÉAL 2033)
// Zero-GC Bitmask Spatial Grid (Uint16Array) & Offscreen Canvas Layering
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  TacticalLayer, 
  MissionState, 
  WeatherCondition, 
  TacticalPOI, 
  SectorZoneInfo,
  POIType
} from '../types/tacticalBattlespace';

export const WEATHER_CONDITIONS: Record<string, WeatherCondition> = {
  CLEAR: {
    type: 'CLEAR',
    name: 'Ciel Dégagé Néon',
    stealthBonus: 0.0,
    hackSpeedModifier: 1.0,
    visibilityModifier: 1.0,
    description: 'Visibilité optimale. Patrouilles SPVM en vigilance standard.'
  },
  ACID_RAIN: {
    type: 'ACID_RAIN',
    name: 'Pluie d’Acide & Toxines',
    stealthBonus: 0.20,
    hackSpeedModifier: 0.9,
    visibilityModifier: 0.8,
    description: 'La pluie acide disperse les capteurs optiques et réduit le bruit de vos pas.'
  },
  NEON_FOG: {
    type: 'NEON_FOG',
    name: 'Brume Nocturne & Vapeur Cryo',
    stealthBonus: 0.35,
    hackSpeedModifier: 1.15,
    visibilityModifier: 0.65,
    description: 'Épaisse vapeur cryogénique du Saint-Laurent. +35% de discrétion, lignes de mire réduites.'
  },
  ION_STORM: {
    type: 'ION_STORM',
    name: 'Tempête Ionique Magnétique',
    stealthBonus: 0.25,
    hackSpeedModifier: 1.5,
    visibilityModifier: 0.75,
    description: 'Surcharge électromagnétique. Radar ennemi brouillé, hacks 50% plus rapides.'
  }
};

export class TacticalGridEngine {
  public width: number;
  public height: number;
  public cellSize: number;
  public grid: Uint16Array;
  public pois: TacticalPOI[] = [];
  public sectors: SectorZoneInfo[] = [];

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private heatmapDirty: boolean = true;
  private activeFilter: TacticalLayer = TacticalLayer.NONE;

  constructor(width: number = 128, height: number = 128, cellSize: number = 32) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = new Uint16Array(width * height);
    
    // Initialisation du buffer hors-écran pour le pré-rendu (Zero GC Render Loop)
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width * cellSize;
    this.offscreenCanvas.height = height * cellSize;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: true })!;
  }

  public setTile(x: number, y: number, layer: TacticalLayer): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y * this.width + x] |= layer;
      this.heatmapDirty = true;
    }
  }

  public clearTileLayer(x: number, y: number, layer: TacticalLayer): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y * this.width + x] &= ~layer;
      this.heatmapDirty = true;
    }
  }

  public fillRectLayer(x0: number, y0: number, w: number, h: number, layer: TacticalLayer): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gx = x0 + dx;
        const gy = y0 + dy;
        if (gx >= 0 && gx < this.width && gy >= 0 && gy < this.height) {
          this.grid[gy * this.width + gx] |= layer;
        }
      }
    }
    this.heatmapDirty = true;
  }

  public hasLayer(worldX: number, worldY: number, layer: TacticalLayer): boolean {
    const gx = Math.floor(worldX / this.cellSize);
    const gy = Math.floor(worldY / this.cellSize);
    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return false;
    return (this.grid[gy * this.width + gx] & layer) !== 0;
  }

  public getLayerBitmask(worldX: number, worldY: number): number {
    const gx = Math.floor(worldX / this.cellSize);
    const gy = Math.floor(worldY / this.cellSize);
    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return 0;
    return this.grid[gy * this.width + gx];
  }

  /**
   * Calcule le rayon de détection effectif d'une patrouille ennemie (O(1))
   */
  public evaluateEnemyPerception(
    playerX: number, 
    playerY: number, 
    baseRadius: number,
    mission: MissionState
  ): number {
    let effectiveRadius = baseRadius;

    // Modificateurs environnementaux
    if (mission.timeOfDay === 'NIGHT') effectiveRadius *= 0.82;
    effectiveRadius *= (1 - (mission.weather?.stealthBonus || 0));

    // Analyse de la zone occupée par le joueur (O(1))
    if (this.hasLayer(playerX, playerY, TacticalLayer.LOW_VISIBILITY)) {
      effectiveRadius *= 0.45; // Ombre / Ruelles (-55% de détection)
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.POPULATION_DENSITY)) {
      effectiveRadius *= 0.60; // Camouflage dans la foule civile
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.KEY_TERRAIN)) {
      effectiveRadius *= 1.25; // Joueur à découvert sur un promontoire
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.SECURITY_PRESENCE)) {
      effectiveRadius *= 1.40; // Zone sous scanner actif SPVM
    }

    return Math.max(40, effectiveRadius);
  }

  /**
   * Analyse le status de discrétion du joueur
   */
  public getStealthEvaluation(playerX: number, playerY: number, mission: MissionState): {
    stealthMultiplier: number;
    activeTags: string[];
    isUnderCover: boolean;
    isInChokepoint: boolean;
  } {
    const tags: string[] = [];
    let multiplier = 1.0;
    let isUnderCover = false;
    let isInChokepoint = false;

    if (this.hasLayer(playerX, playerY, TacticalLayer.LOW_VISIBILITY)) {
      tags.push('CAMOUFLAGE OMBRE (-55% DÉTECTION)');
      multiplier += 0.55;
      isUnderCover = true;
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.POPULATION_DENSITY)) {
      tags.push('FOULE CIVILE (ANONYMAT TOTAL)');
      multiplier += 0.40;
      isUnderCover = true;
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.TRANSPORTATION)) {
      tags.push('CORRIDOR STM (+25% VITESSE)');
      multiplier += 0.15;
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.INFRASTRUCTURE)) {
      tags.push('RELAIS PIRATABLE DISPONIBLE');
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.KEY_TERRAIN)) {
      tags.push('POINT HAUT / GORGE TACTIQUE (+35% PORTÉE PSI)');
      isInChokepoint = true;
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.SECURITY_PRESENCE)) {
      tags.push('⚠️ ALERTE : SCANNER SPVM BIOMÉTRIQUE');
      multiplier -= 0.35;
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.COMMERCE_FINANCIAL)) {
      tags.push('SECTEUR CORPO HAUTE VALEUR');
    }
    if (this.hasLayer(playerX, playerY, TacticalLayer.EXFIL_POINT)) {
      tags.push('🎯 POINT D’EXTRACTION SÉCURISÉ');
    }

    return {
      stealthMultiplier: Math.max(0.1, multiplier),
      activeTags: tags,
      isUnderCover,
      isInChokepoint
    };
  }

  /**
   * Pré-rendu optimisé des calques du Battlespace sur l'OffscreenCanvas
   */
  public bakeStaticTacticalLayers(filterLayer: TacticalLayer = TacticalLayer.NONE): void {
    this.activeFilter = filterLayer;
    const ctx = this.offscreenCtx;
    ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // Dessin vectoriel matriciel des calques
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const val = this.grid[y * this.width + x];
        if (val === 0) continue;

        const px = x * this.cellSize;
        const py = y * this.cellSize;

        // Si filtre actif, on affiche uniquement la couche sélectionnée en éclat
        if (filterLayer !== TacticalLayer.NONE && (val & filterLayer) === 0) {
          continue;
        }

        // 1. POPULATION_DENSITY (0x01) -> Mauve / Violet Cyber
        if (val & TacticalLayer.POPULATION_DENSITY) {
          ctx.fillStyle = filterLayer ? 'rgba(192, 38, 211, 0.45)' : 'rgba(168, 85, 247, 0.16)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        // 2. KEY_TERRAIN (0x02) -> Orange / Ambre Tactique
        if (val & TacticalLayer.KEY_TERRAIN) {
          ctx.fillStyle = filterLayer ? 'rgba(249, 115, 22, 0.45)' : 'rgba(245, 158, 11, 0.18)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
          // Hachures
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + this.cellSize, py + this.cellSize);
          ctx.stroke();
        }

        // 3. INFRASTRUCTURE (0x04) -> Jaune / Doré Énergétique
        if (val & TacticalLayer.INFRASTRUCTURE) {
          ctx.fillStyle = filterLayer ? 'rgba(234, 179, 8, 0.5)' : 'rgba(234, 179, 8, 0.18)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        // 4. TRANSPORTATION (0x08) -> Bleu Cyan STM
        if (val & TacticalLayer.TRANSPORTATION) {
          ctx.fillStyle = filterLayer ? 'rgba(6, 182, 212, 0.45)' : 'rgba(0, 243, 255, 0.15)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        // 5. COMMERCE_FINANCIAL (0x10) -> Vert Émeraude Dollars/Credits
        if (val & TacticalLayer.COMMERCE_FINANCIAL) {
          ctx.fillStyle = filterLayer ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 255, 136, 0.15)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        // 6. SECURITY_PRESENCE (0x20) -> Rouge Alerte SPVM
        if (val & TacticalLayer.SECURITY_PRESENCE) {
          ctx.fillStyle = filterLayer ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 0, 55, 0.20)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
          // Contour d'alerte
          ctx.strokeStyle = 'rgba(255, 0, 55, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, this.cellSize - 2, this.cellSize - 2);
        }

        // 7. LOW_VISIBILITY (0x40) -> Noir Profond / Ombre Furtive
        if (val & TacticalLayer.LOW_VISIBILITY) {
          ctx.fillStyle = filterLayer ? 'rgba(15, 23, 42, 0.75)' : 'rgba(10, 15, 30, 0.45)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }

        // 8. EXFIL_POINT (0x80) -> Vert Néon Clignotant Extraction
        if (val & TacticalLayer.EXFIL_POINT) {
          ctx.fillStyle = 'rgba(0, 255, 65, 0.35)';
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
          ctx.strokeStyle = '#00ff41';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, this.cellSize, this.cellSize);
        }
      }
    }

    this.heatmapDirty = false;
  }

  /**
   * Rendu ultra-rapide en 1 appel sur le Canvas principal (Zero GC)
   */
  public renderLayerToCanvas(
    ctx: CanvasRenderingContext2D, 
    cameraX: number, 
    cameraY: number,
    filterLayer: TacticalLayer = TacticalLayer.NONE
  ): void {
    if (this.heatmapDirty || this.activeFilter !== filterLayer) {
      this.bakeStaticTacticalLayers(filterLayer);
    }
    ctx.drawImage(this.offscreenCanvas, -cameraX, -cameraY);
  }

  /**
   * Rendu des Points d'Intérêt Tactiques (POIs) : Observation, Chokepoint, Terminal, HVT, Exfil
   */
  public renderPOIs(
    ctx: CanvasRenderingContext2D, 
    cameraX: number, 
    cameraY: number, 
    animTime: number
  ): void {
    this.pois.forEach(poi => {
      const screenX = poi.worldX - cameraX;
      const screenY = poi.worldY - cameraY;

      ctx.save();
      ctx.translate(screenX, screenY);

      if (poi.type === 'OBSERVATION_POINT') {
        // Oeil de reconnaissance
        ctx.fillStyle = '#00f3ff';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#00f3ff';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OBS POINT', 0, 22);
      } else if (poi.type === 'CHOKEPOINT') {
        // Triangle d'étranglement / Point haut
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 10);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CHOKEPOINT', 0, 22);
      } else if (poi.type === 'TERMINAL_HUB') {
        // Borne de piratage
        const pulse = 1 + Math.sin(animTime * 4) * 0.15;
        ctx.fillStyle = poi.hacked ? '#10b981' : '#eab308';
        ctx.strokeStyle = poi.hacked ? '#34d399' : '#fde047';
        ctx.lineWidth = 2;
        ctx.strokeRect(-10 * pulse, -10 * pulse, 20 * pulse, 20 * pulse);
        ctx.fillStyle = poi.hacked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)';
        ctx.fillRect(-10 * pulse, -10 * pulse, 20 * pulse, 20 * pulse);

        ctx.fillStyle = poi.hacked ? '#34d399' : '#fde047';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(poi.hacked ? 'PIRATÉ [OK]' : 'TERMINAL', 0, 22);
      } else if (poi.type === 'HIGH_VALUE_TARGET') {
        // Cible prioritaire HVT
        const pulse = Math.sin(animTime * 6) * 4;
        ctx.strokeStyle = '#ff0037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
        ctx.moveTo(0, -20); ctx.lineTo(0, 20);
        ctx.stroke();

        ctx.fillStyle = '#ff0037';
        ctx.font = 'bold 10px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HVT TARGET', 0, 28);
      } else if (poi.type === 'EXFIL_EXTRACTION') {
        // Point d'extraction
        const pulse = Math.sin(animTime * 5) * 3;
        ctx.strokeStyle = '#00ff41';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
        ctx.lineWidth = 2;
        
        // Triangle vert d'exfil
        ctx.beginPath();
        ctx.moveTo(0, -18 - pulse);
        ctx.lineTo(14, 10);
        ctx.lineTo(-14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 10px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXFIL ZONE', 0, 25);
      }

      ctx.restore();
    });
  }

  /**
   * Génération procédurale du Battlespace pour les 4 Stages de Montréal 2033
   */
  public generateMontrealStageTacticalMap(stageId: number): MissionState {
    this.grid.fill(0);
    this.pois = [];
    this.sectors = [];

    let stageName = 'Le Vieux-Port Submergé';
    let weather = WEATHER_CONDITIONS.NEON_FOG;
    let timeOfDay: 'DAY' | 'NIGHT' = 'NIGHT';
    let sectorList: SectorZoneInfo[] = [];

    if (stageId === 1) {
      // ══════════════════════════════════════════════════════════
      // STAGE 1 : LE VIEUX-PORT SUBMERGÉ (MONTRÉAL 2033)
      // ══════════════════════════════════════════════════════════
      stageName = 'Le Vieux-Port Submergé';
      weather = WEATHER_CONDITIONS.NEON_FOG; // +35% furtivité
      timeOfDay = 'NIGHT';

      // 1. Quais & Bassins Industriels (LOW_VISIBILITY + INFRASTRUCTURE)
      this.fillRectLayer(4, 4, 30, 20, TacticalLayer.LOW_VISIBILITY | TacticalLayer.INFRASTRUCTURE);
      this.fillRectLayer(40, 4, 25, 25, TacticalLayer.SECURITY_PRESENCE); // Patrouilles de Drones Vance

      // 2. Silos à Grains & Promontoires Élevés (KEY_TERRAIN)
      this.fillRectLayer(15, 30, 18, 14, TacticalLayer.KEY_TERRAIN);
      this.fillRectLayer(45, 35, 20, 16, TacticalLayer.KEY_TERRAIN);

      // 3. Corridors du Bassin Peel (TRANSPORTATION)
      this.fillRectLayer(2, 50, 60, 6, TacticalLayer.TRANSPORTATION);

      // 4. District Corporatiste Vance Flottant (COMMERCE_FINANCIAL + SECURITY_PRESENCE)
      this.fillRectLayer(35, 58, 25, 20, TacticalLayer.COMMERCE_FINANCIAL | TacticalLayer.SECURITY_PRESENCE);

      // 5. Zone d'extraction (Héliport du Quai de l'Horloge)
      this.fillRectLayer(56, 56, 6, 6, TacticalLayer.EXFIL_POINT);

      // POIs
      this.pois = [
        {
          id: 'poi_s1_obs1',
          type: 'OBSERVATION_POINT',
          name: 'Sommet Silo #5',
          x: 22,
          y: 36,
          worldX: 22 * this.cellSize,
          worldY: 36 * this.cellSize,
          description: 'Surplomb idéal sur les patrouilles de drones et le bassin Peel.'
        },
        {
          id: 'poi_s1_choke',
          type: 'CHOKEPOINT',
          name: 'Pont Levant Électrifié',
          x: 32,
          y: 50,
          worldX: 32 * this.cellSize,
          worldY: 50 * this.cellSize,
          description: 'Gorge tactique étroite. Permet de canaliser et désintégrer les poursuivants.'
        },
        {
          id: 'poi_s1_term',
          type: 'TERMINAL_HUB',
          name: 'Relais Vance Port #04',
          x: 12,
          y: 12,
          worldX: 12 * this.cellSize,
          worldY: 12 * this.cellSize,
          hacked: false,
          intelReward: 25,
          nanoCreditsReward: 250,
          description: 'Pirater ce relais coupe l’éclairage de sécurité et active le brouillard cryo.'
        },
        {
          id: 'poi_s1_hvt',
          type: 'HIGH_VALUE_TARGET',
          name: 'Commandant Cyber-SPVM',
          x: 48,
          y: 14,
          worldX: 48 * this.cellSize,
          worldY: 14 * this.cellSize,
          description: 'Porteur du pass d’accès cryptographique pour déverrouiller l’exfil.'
        },
        {
          id: 'poi_s1_exfil',
          type: 'EXFIL_EXTRACTION',
          name: 'Zodiaque Furtif Quai Horloge',
          x: 58,
          y: 58,
          worldX: 58 * this.cellSize,
          worldY: 58 * this.cellSize,
          description: 'Point d’extraction finale vers le fleuve Saint-Laurent.'
        }
      ];

      sectorList = [
        {
          id: 'sec_industrial',
          name: 'Quais des Silos Abandonnés',
          type: 'INDUSTRIAL',
          tacticalLayers: TacticalLayer.LOW_VISIBILITY | TacticalLayer.INFRASTRUCTURE,
          bulletPoints: ['Trafic piéton très limité', 'Points d’entrée multiples', 'Ombres épaisses pour infiltration'],
          color: '#f59e0b'
        },
        {
          id: 'sec_security',
          name: 'Périmètre de Sécurité SPVM',
          type: 'HIGH_DENSITY',
          tacticalLayers: TacticalLayer.SECURITY_PRESENCE,
          bulletPoints: ['Surveillance saturée', 'Patrouilles de drones blindés', 'Éviter les lignes de mire ouvertes'],
          color: '#ef4444'
        }
      ];

    } else if (stageId === 2) {
      // ══════════════════════════════════════════════════════════
      // STAGE 2 : LES GALERIES SOUTERRAINES DE VILLE-MARIE (RÉSO)
      // ══════════════════════════════════════════════════════════
      stageName = 'Les Galeries du RÉSO';
      weather = WEATHER_CONDITIONS.CLEAR;
      timeOfDay = 'NIGHT';

      // 1. Foules Civiles Massives du RÉSO (POPULATION_DENSITY)
      this.fillRectLayer(6, 6, 28, 28, TacticalLayer.POPULATION_DENSITY);
      this.fillRectLayer(36, 10, 24, 20, TacticalLayer.POPULATION_DENSITY | TacticalLayer.COMMERCE_FINANCIAL);

      // 2. Lignes STM Automatisées (TRANSPORTATION)
      this.fillRectLayer(0, 38, 64, 8, TacticalLayer.TRANSPORTATION);

      // 3. Postes de Contrôle Biométriques (SECURITY_PRESENCE)
      this.fillRectLayer(28, 48, 16, 14, TacticalLayer.SECURITY_PRESENCE);

      // 4. Conduits d'Évacuation Sombres (LOW_VISIBILITY)
      this.fillRectLayer(4, 48, 20, 14, TacticalLayer.LOW_VISIBILITY);

      // 5. Exfiltration (Bouche Métro Bonaventure)
      this.fillRectLayer(54, 54, 8, 8, TacticalLayer.EXFIL_POINT);

      this.pois = [
        {
          id: 'poi_s2_obs',
          type: 'OBSERVATION_POINT',
          name: 'Mezzanine Complexe Desjardins',
          x: 20,
          y: 20,
          worldX: 20 * this.cellSize,
          worldY: 20 * this.cellSize,
          description: 'Observation panoramique des flux civils et des agents corpo infiltrés.'
        },
        {
          id: 'poi_s2_term',
          type: 'TERMINAL_HUB',
          name: 'Aiguillage STM Ligne Orange',
          x: 18,
          y: 42,
          worldX: 18 * this.cellSize,
          worldY: 42 * this.cellSize,
          hacked: false,
          intelReward: 35,
          nanoCreditsReward: 400,
          description: 'Provoque une surcharge électrique sur les rails, électrocutant les tourelles.'
        },
        {
          id: 'poi_s2_hvt',
          type: 'HIGH_VALUE_TARGET',
          name: 'Courtier Noir Vance Industries',
          x: 46,
          y: 18,
          worldX: 46 * this.cellSize,
          worldY: 18 * this.cellSize,
          description: 'Possède les schémas synaptiques du réseau de défense corporatiste.'
        },
        {
          id: 'poi_s2_exfil',
          type: 'EXFIL_EXTRACTION',
          name: 'Rame Express Bonaventure',
          x: 58,
          y: 58,
          worldX: 58 * this.cellSize,
          worldY: 58 * this.cellSize,
          description: 'Échappée immédiate via la ligne de métro automatisée.'
        }
      ];

      sectorList = [
        {
          id: 'sec_reso_crowd',
          name: 'Galeries Commerciales RÉSO',
          type: 'HIGH_DENSITY',
          tacticalLayers: TacticalLayer.POPULATION_DENSITY | TacticalLayer.COMMERCE_FINANCIAL,
          bulletPoints: ['Camouflage social absolu', 'Vol de crédits sur les civils corpo', 'Dissimulation des attaques'],
          color: '#c026d3'
        },
        {
          id: 'sec_transit',
          name: 'Corridors de Transit STM',
          type: 'TRANSIT_HUB',
          tacticalLayers: TacticalLayer.TRANSPORTATION,
          bulletPoints: ['Déplacement ultra-rapide', 'Surcharge des transformateurs', 'Réseau ferroviaire interconnecté'],
          color: '#06b6d4'
        }
      ];

    } else if (stageId === 3) {
      // ══════════════════════════════════════════════════════════
      // STAGE 3 : LE MONT-ROYAL MILLÉNAIRE
      // ══════════════════════════════════════════════════════════
      stageName = 'Le Mont-Royal Millénaire';
      weather = WEATHER_CONDITIONS.ION_STORM; // Hacks +50%
      timeOfDay = 'NIGHT';

      // 1. Sentiers Élevés & Belvédères (KEY_TERRAIN)
      this.fillRectLayer(8, 8, 30, 22, TacticalLayer.KEY_TERRAIN);
      this.fillRectLayer(38, 20, 24, 20, TacticalLayer.KEY_TERRAIN);

      // 2. Antennes & Relais Synaptiques (INFRASTRUCTURE)
      this.fillRectLayer(14, 34, 16, 16, TacticalLayer.INFRASTRUCTURE);

      // 3. Forêt Sombre & Ravins (LOW_VISIBILITY)
      this.fillRectLayer(4, 42, 30, 18, TacticalLayer.LOW_VISIBILITY);

      // 4. Dômes de Haute Sécurité Privée (SECURITY_PRESENCE)
      this.fillRectLayer(40, 4, 20, 14, TacticalLayer.SECURITY_PRESENCE);

      // 5. Exfiltration (Téléphérique Condamné)
      this.fillRectLayer(54, 52, 8, 8, TacticalLayer.EXFIL_POINT);

      this.pois = [
        {
          id: 'poi_s3_obs',
          type: 'OBSERVATION_POINT',
          name: 'Croix Lumineuse du Mont-Royal',
          x: 20,
          y: 16,
          worldX: 20 * this.cellSize,
          worldY: 16 * this.cellSize,
          description: 'Point culminant. Décuple la portée de vos décharges psychiques de 40%.'
        },
        {
          id: 'poi_s3_choke',
          type: 'CHOKEPOINT',
          name: 'Sentier du Serpentin Roitelet',
          x: 34,
          y: 28,
          worldX: 34 * this.cellSize,
          worldY: 28 * this.cellSize,
          description: 'Goulot naturel. Les tirs en ligne droite touchent tous les assaillants.'
        },
        {
          id: 'poi_s3_term',
          type: 'TERMINAL_HUB',
          name: 'Antenne Synaptique Vance #01',
          x: 22,
          y: 40,
          worldX: 22 * this.cellSize,
          worldY: 40 * this.cellSize,
          hacked: false,
          intelReward: 50,
          nanoCreditsReward: 600,
          description: 'Désactive les boucliers cinétiques de toute l’escouade d’élite adverse.'
        },
        {
          id: 'poi_s3_exfil',
          type: 'EXFIL_EXTRACTION',
          name: 'Câble Tyrolienne Souterrain',
          x: 58,
          y: 56,
          worldX: 58 * this.cellSize,
          worldY: 56 * this.cellSize,
          description: 'Descente vertigineuse vers le centre-ville.'
        }
      ];

      sectorList = [
        {
          id: 'sec_highland',
          name: 'Belvédères & Crêtes Rocheuses',
          type: 'RESIDENTIAL',
          tacticalLayers: TacticalLayer.KEY_TERRAIN,
          bulletPoints: ['Avantage de hauteur écrasant', 'Bonus de portée d’attaque', 'Lignes de tir plongeantes'],
          color: '#f59e0b'
        }
      ];

    } else {
      // ══════════════════════════════════════════════════════════
      // STAGE 4 : LA CITADELLE DE LA PLACE-VILLE-MARIE (MAX THREAT)
      // ══════════════════════════════════════════════════════════
      stageName = 'La Citadelle Place-Ville-Marie';
      weather = WEATHER_CONDITIONS.ACID_RAIN;
      timeOfDay = 'NIGHT';

      // 1. Sanctuaire Financier Hautement Sécurisé (COMMERCE_FINANCIAL + SECURITY_PRESENCE)
      this.fillRectLayer(8, 8, 48, 40, TacticalLayer.COMMERCE_FINANCIAL | TacticalLayer.SECURITY_PRESENCE);

      // 2. Serveurs Centraux Vance (INFRASTRUCTURE)
      this.fillRectLayer(20, 20, 24, 20, TacticalLayer.INFRASTRUCTURE);

      // 3. Toits du Gratte-Ciel (KEY_TERRAIN + EXFIL)
      this.fillRectLayer(46, 44, 16, 16, TacticalLayer.KEY_TERRAIN | TacticalLayer.EXFIL_POINT);

      this.pois = [
        {
          id: 'poi_s4_hvt',
          type: 'HIGH_VALUE_TARGET',
          name: 'Nexus IA Centrale ARES-9',
          x: 32,
          y: 30,
          worldX: 32 * this.cellSize,
          worldY: 30 * this.cellSize,
          description: 'Cœur cybernétique de la tyrannie corporatiste à détruire.'
        },
        {
          id: 'poi_s4_term',
          type: 'TERMINAL_HUB',
          name: 'Mainframe Coffre Bancaire',
          x: 16,
          y: 16,
          worldX: 16 * this.cellSize,
          worldY: 16 * this.cellSize,
          hacked: false,
          intelReward: 100,
          nanoCreditsReward: 2000,
          description: 'Transfère 2000 nano-crédits et déverrouille l’armure mythique.'
        },
        {
          id: 'poi_s4_exfil',
          type: 'EXFIL_EXTRACTION',
          name: 'Hélisurface Sommet PVM',
          x: 54,
          y: 52,
          worldX: 54 * this.cellSize,
          worldY: 52 * this.cellSize,
          description: 'Évacuation aérienne finale sous le feu nourri.'
        }
      ];

      sectorList = [
        {
          id: 'sec_corpo_citadel',
          name: 'District Bancaire & QG Vance',
          type: 'FINANCIAL',
          tacticalLayers: TacticalLayer.COMMERCE_FINANCIAL | TacticalLayer.SECURITY_PRESENCE,
          bulletPoints: ['Coffres Légendaires sécurisés', 'Scanners biométriques continus', 'Cible de très haute valeur'],
          color: '#10b981'
        }
      ];
    }

    this.sectors = sectorList;

    const mission: MissionState = {
      stageId,
      stageName,
      timeOfDay,
      weather,
      primaryHVTDefeated: false,
      intelCollected: 0,
      exfilUnlocked: false,
      stealthLevel: 100,
      underCover: true,
      currentSector: sectorList[0]?.name || 'Secteur Urbain Infiltré',
      objectives: {
        primaryTitle: stageId === 4 ? 'Neutraliser le Nexus IA ARES-9' : 'Éliminer le Commandant Vance',
        primaryDescription: 'Pénétrer le périmètre sans déclencher l’alarme globale du district.',
        primaryCompleted: false,
        intelTotal: 100,
        intelCollected: 0,
        contactEstablished: false,
        exfilWithoutDetection: true,
        detectedCount: 0
      },
      checklist: {
        defineObjective: true,
        assessEnvironment: true,
        identifyOpportunities: false,
        analyzeThreats: false,
        planRoutes: false,
        prepareExecute: false
      }
    };

    return mission;
  }
}
