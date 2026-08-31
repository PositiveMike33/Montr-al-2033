// ═══════════════════════════════════════════════════════════════════════════════
// CADRAGE D'ÉCRAN & MODES D'AFFICHAGE MANUELS (ANDROID VS DESKTOP / LAPTOP)
// DOCTRINE MONTRÉAL 2033 // ZERO OVERFLOW TACTICAL VIEWPORT
// ═══════════════════════════════════════════════════════════════════════════════

export type DeviceViewportMode = 'desktop' | 'android';
export type AndroidOrientation = 'portrait' | 'landscape';

export interface DeviceFramingSettings {
  mode: DeviceViewportMode;
  orientation: AndroidOrientation;
  showBezel: boolean;
  modelName: string;
  screenWidth: number;
  screenHeight: number;
}

export const DEVICE_PRESETS = {
  desktop: {
    name: '💻 Mode Desktop / Laptop (Écran Large Widescreen)',
    shortName: 'DESKTOP / LAPTOP',
    aspect: '16:9 / 16:10 Panoramique',
    description: 'Affichage plein écran haute résolution. Idéal pour les ordinateurs portables, moniteurs 1080p, 1440p, 4K et stations de travail.'
  },
  android: {
    name: '📱 Mode Android (Smartphone / Terminal Cyberpunk)',
    shortName: 'ANDROID MOBILE',
    aspect: '9:19.5 (1080×2340 / 390×844 dp)',
    description: 'Cadrage smartphone vertical/horizontal strict, sans débordement ni scroll parasite. Optimisé pour Samsung Galaxy, Google Pixel et appareils Android.'
  }
};
