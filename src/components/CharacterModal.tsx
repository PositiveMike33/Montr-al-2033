import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayerAttributes, 
  PlayerStats, 
  AvatarCustomization, 
  HairstyleType, 
  BeardType, 
  OuterwearType, 
  CyberArmType,
  Achievement
} from '../types';
import { 
  X, 
  User, 
  Plus, 
  Shield, 
  Zap, 
  Activity, 
  Cpu, 
  Palette, 
  Flame, 
  Sparkles,
  Award,
  Camera,
  Upload,
  UserCheck,
  CheckCircle2,
  FileText,
  Scan,
  Scissors,
  Shirt,
  Crosshair,
  Layers,
  Wand2,
  Trophy,
  Lock,
  Sword,
  Terminal,
  ShoppingBag
} from 'lucide-react';
import { drawIsometricPlayerHeadToToe, drawWeaponSkinPreview } from '../utils/isometricRenderEngine';
import { WEAPON_SKINS_CATALOG, getWeaponSkinById, WeaponSkin } from '../utils/weaponSkinsData';
import { soundEngine } from '../utils/audio';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  unspentAttributePoints: number;
  attributes: PlayerAttributes;
  stats: PlayerStats;
  customization: AvatarCustomization;
  achievements?: Achievement[];
  unlockedWeaponSkinIds?: string[];
  nanites?: number;
  onAllocateAttribute: (attr: keyof PlayerAttributes) => void;
  onUpdateCustomization: (custom: Partial<AvatarCustomization>) => void;
  onOpenAchievements?: () => void;
  onEquipBadge?: (badgeId: string) => void;
  onEquipWeaponSkin?: (skinId: string) => void;
  onUnlockWeaponSkin?: (skinId: string, cost: number) => void;
}

const NEON_PALETTE = [
  { name: 'Cyber Cyan', hex: '#00f3ff' },
  { name: 'Neon Magenta', hex: '#ff00ff' },
  { name: 'Bio-Green', hex: '#00ff41' },
  { name: 'Solar Amber', hex: '#f2994a' },
  { name: 'Ultra Violet', hex: '#9b51e0' },
  { name: 'Crimson Red', hex: '#ff0044' },
  { name: 'Ghost White', hex: '#ffffff' },
  { name: 'Carbon Black', hex: '#111827' }
];

const HAIR_PALETTE = [
  { name: 'Noir Ébène', hex: '#111111' },
  { name: 'Châtain Foncé', hex: '#3b2219' },
  { name: 'Blond Platine', hex: '#e2d4b7' },
  { name: 'Cyber Cyan', hex: '#00f3ff' },
  { name: 'Neon Magenta', hex: '#ff00ff' },
  { name: 'Rouge Sang', hex: '#dc2626' },
  { name: 'Blanc Synthétique', hex: '#f8fafc' },
  { name: 'Vert Matrice', hex: '#00ff41' }
];

const SKIN_TONES = [
  { name: 'Pâle Synthétique', hex: '#faebd7' },
  { name: 'Beige Clair', hex: '#f5d0b5' },
  { name: 'Doré Chaud', hex: '#e8b88a' },
  { name: 'Olive Naturel', hex: '#c68642' },
  { name: 'Bronze Foncé', hex: '#8d5524' },
  { name: 'Chrome Bionique', hex: '#94a3b8' }
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  level,
  unspentAttributePoints,
  attributes,
  stats,
  customization,
  achievements = [],
  unlockedWeaponSkinIds = ['skin_default'],
  nanites = 0,
  onAllocateAttribute,
  onUpdateCustomization,
  onOpenAchievements,
  onEquipBadge,
  onEquipWeaponSkin,
  onUnlockWeaponSkin
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'persona' | 'head_to_toe' | 'badges' | 'weapon_skins'>('head_to_toe');
  const [bioInput, setBioInput] = useState(customization.personalBio || '');
  const [nameInput, setNameInput] = useState(customization.realName || 'Neo-Hacker');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSkinPreviewId, setSelectedSkinPreviewId] = useState<string>(customization.activeWeaponSkinId || 'skin_default');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const weaponCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeBadge = achievements.find((a) => a.id === customization.activeBadgeId);
  const unlockedBadgesCount = achievements.filter((a) => a.unlocked).length;
  const unlockedSkinsCount = WEAPON_SKINS_CATALOG.filter((s) => unlockedWeaponSkinIds.includes(s.id)).length;

  // Live 3D Weapon Skin Preview Renderer
  useEffect(() => {
    if (!isOpen || activeTab !== 'weapon_skins') return;
    const canvas = weaponCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const skin = getWeaponSkinById(selectedSkinPreviewId);
    let animId: number;

    const renderWeapon = () => {
      drawWeaponSkinPreview(ctx, skin, canvas.width, canvas.height, Date.now());
      animId = requestAnimationFrame(renderWeapon);
    };

    animId = requestAnimationFrame(renderWeapon);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, activeTab, selectedSkinPreviewId]);

  // Live 3D Isometric Preview Renderer in Studio
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;

    const renderPreview = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark futuristic pedestal background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid Circle Base
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 18;

      ctx.save();
      ctx.strokeStyle = `${customization.auraColor}33`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 26, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Hologram ring
      ctx.strokeStyle = customization.auraColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 65, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Slowly rotate for 360 inspection or mouse aim
      rotationAngle += 0.01;

      // Draw Diablo-style Isometric Head-to-Toe Character
      drawIsometricPlayerHeadToToe(
        ctx,
        {
          x: cx,
          y: cy - 10,
          angle: rotationAngle,
          radius: 18,
          isAttacking: false,
          comboStep: 0,
          isDashing: false,
          dashTimer: 0,
          trail: []
        },
        customization,
        undefined,
        Date.now(),
        { vx: Math.cos(rotationAngle) * 2, vy: Math.sin(rotationAngle) * 2 }
      );

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, customization, activeTab]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          onUpdateCustomization({ 
            photoUrl: result,
            hairstyle: 'slick_back',
            beardStyle: 'stubble',
            skinTone: '#f5d0b5',
            outerwear: 'neo_trenchcoat',
            cyberArm: 'left_chrome'
          });
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBio = () => {
    onUpdateCustomization({
      realName: nameInput,
      personalBio: bioInput
    });
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'neo_classic' | 'samurai_cyber' | 'infiltrator_stealth' | 'street_rebel') => {
    if (preset === 'neo_classic') {
      onUpdateCustomization({
        realName: 'Néo Montréal 2033',
        hairstyle: 'slick_back',
        hairColor: '#111111',
        skinTone: '#f5d0b5',
        beardStyle: 'stubble',
        outerwear: 'neo_trenchcoat',
        visorColor: '#00f3ff',
        bladeColor: '#00f3ff',
        auraColor: '#00f3ff',
        suitColor: '#0b0f19',
        cyberArm: 'left_chrome'
      });
    } else if (preset === 'samurai_cyber') {
      onUpdateCustomization({
        realName: 'Ronin des Silos',
        hairstyle: 'samurai_bun',
        hairColor: '#ffffff',
        skinTone: '#faebd7',
        beardStyle: 'cyber_goatee',
        outerwear: 'corp_duster',
        visorColor: '#ff00ff',
        bladeColor: '#ff00ff',
        auraColor: '#9b51e0',
        suitColor: '#1e1b4b',
        cyberArm: 'dual_bionic'
      });
    } else if (preset === 'infiltrator_stealth') {
      onUpdateCustomization({
        realName: 'Spectre SPVM Purge',
        hairstyle: 'cyber_fade',
        hairColor: '#3b2219',
        skinTone: '#e8b88a',
        beardStyle: 'clean',
        outerwear: 'stealth_jacket',
        visorColor: '#00ff41',
        bladeColor: '#00ff41',
        auraColor: '#00ff41',
        suitColor: '#022c22',
        cyberArm: 'left_chrome'
      });
    } else if (preset === 'street_rebel') {
      onUpdateCustomization({
        realName: 'Rebelle Ville-Marie',
        hairstyle: 'neon_mohawk',
        hairColor: '#ff0044',
        skinTone: '#c68642',
        beardStyle: 'tactical_beard',
        outerwear: 'exo_tactical_vest',
        visorColor: '#f2994a',
        bladeColor: '#ff0044',
        auraColor: '#f2994a',
        suitColor: '#1f2937',
        cyberArm: 'right_plasma'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-6xl max-h-[94vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold text-white tracking-wider uppercase italic">
                STUDIO DIABLO 3D // PERSONNALISATION DU HÉROS DE LA TÊTE AU PIED
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // {customization.realName || 'Hacker Rebelle'} - Niveau {level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs switcher */}
            <div className="flex bg-[#050506] border border-[#ffffff22] p-0.5">
              <button
                onClick={() => setActiveTab('head_to_toe')}
                className={`px-3 py-1 text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'head_to_toe' 
                    ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>PERSONNAGE</span>
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-3 py-1 text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'badges' 
                    ? 'bg-[#f59e0b] text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>BADGES & TITRES ({unlockedBadgesCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('weapon_skins')}
                className={`px-3 py-1 text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'weapon_skins' 
                    ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sword className="w-3.5 h-3.5" />
                <span>SKINS D'ARMES ({unlockedSkinsCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('persona')}
                className={`px-3 py-1 text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'persona' 
                    ? 'bg-[#ff00ff] text-black shadow-[0_0_10px_rgba(255,0,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>INCARNATION</span>
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1 text-xs font-orbitron font-bold transition-all ${
                  activeTab === 'matrix' 
                    ? 'bg-[#00ff41] text-black shadow-[0_0_10px_rgba(0,255,65,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ATTRIBUTS & STATS
              </button>
            </div>

            {unspentAttributePoints > 0 && (
              <div className="flex items-center gap-2 bg-[#00f3ff22] border border-[#00f3ff] px-3 py-1 text-[#00f3ff] font-orbitron font-bold text-xs animate-pulse">
                <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                <span>{unspentAttributePoints} Points</span>
              </div>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-cyber-radial">
          
          {/* TAB 1: HEAD-TO-TOE DIABLO ISOMETRIC CUSTOMIZER */}
          {activeTab === 'head_to_toe' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: 3D Isometric Diablo Live Holo-Stage Preview */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="bg-[#11111a] border border-[#00f3ff44] p-4 flex flex-col items-center relative overflow-hidden">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-[11px] font-orbitron font-bold text-[#00f3ff] uppercase flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5" />
                      Rendu 3D Isométrique Diablo
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 bg-black/60 px-2 py-0.5 border border-[#ffffff11]">
                      60 FPS LIVE
                    </span>
                  </div>

                  {/* 3D Isometric Canvas View */}
                  <div className="w-full h-56 rounded border border-[#00f3ff33] relative overflow-hidden flex items-center justify-center bg-[#040810] shadow-[inset_0_0_30px_rgba(0,243,255,0.15)]">
                    <canvas
                      ref={previewCanvasRef}
                      width={280}
                      height={220}
                      className="block"
                    />

                    {/* Floating Avatar Face Badge if Photo Uploaded */}
                    {customization.photoUrl && (
                      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/80 border border-[#00f3ff] px-2 py-1 shadow-[0_0_10px_#00f3ff]">
                        <img 
                          src={customization.photoUrl} 
                          alt="Photo Link" 
                          className="w-6 h-6 rounded-full object-cover border border-[#ff00ff]"
                        />
                        <span className="text-[9px] font-mono text-[#00f3ff]">SCAN BIO ACTIF</span>
                      </div>
                    )}

                    {/* Active Badge on Holo-Stage */}
                    {activeBadge && (
                      <div 
                        className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono font-bold bg-black/85 backdrop-blur-sm"
                        style={{
                          borderColor: activeBadge.badgeColor,
                          color: activeBadge.badgeColor,
                          boxShadow: `0 0 10px ${activeBadge.badgeColor}44`
                        }}
                      >
                        <span>{activeBadge.badgeIcon}</span>
                        <span>{activeBadge.badgeTitle}</span>
                      </div>
                    )}

                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-400">
                      ANGLE ISOMÉTRIQUE 45°
                    </div>
                  </div>

                  {/* Active Badge Quick Switch Button */}
                  <div className="w-full mt-2 p-2 bg-[#090912] border border-[#ffffff11] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#f59e0b]" />
                      <div className="text-left">
                        <div className="text-[9px] font-mono text-gray-400">INSIGNE DE PROFIL :</div>
                        <div 
                          className="text-[11px] font-orbitron font-bold truncate max-w-[140px]"
                          style={{ color: activeBadge ? activeBadge.badgeColor : '#888' }}
                        >
                          {activeBadge ? activeBadge.badgeTitle : 'Aucun insigne équipé'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('badges')}
                      className="px-2 py-1 bg-[#1a1a24] hover:bg-[#f59e0b] text-gray-200 hover:text-black border border-[#f59e0b44] text-[10px] font-orbitron font-bold transition-all"
                    >
                      CHANGER
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="w-full mt-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-orbitron text-gray-400 uppercase flex items-center gap-1">
                      <Wand2 className="w-3 h-3 text-[#ff00ff]" />
                      Presets Rapides Inspirés des Photos :
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => applyPreset('neo_classic')}
                        className="p-1.5 bg-[#050506] hover:bg-[#00f3ff]/20 border border-[#00f3ff44] hover:border-[#00f3ff] text-[10px] font-mono text-left transition-all text-white"
                      >
                        ⚡ Néo Moderne (Photo)
                      </button>
                      <button
                        onClick={() => applyPreset('samurai_cyber')}
                        className="p-1.5 bg-[#050506] hover:bg-[#ff00ff]/20 border border-[#ff00ff44] hover:border-[#ff00ff] text-[10px] font-mono text-left transition-all text-white"
                      >
                        🗡️ Cyber-Samouraï
                      </button>
                      <button
                        onClick={() => applyPreset('infiltrator_stealth')}
                        className="p-1.5 bg-[#050506] hover:bg-[#00ff41]/20 border border-[#00ff4144] hover:border-[#00ff41] text-[10px] font-mono text-left transition-all text-white"
                      >
                        🥷 Infiltrateur SPVM
                      </button>
                      <button
                        onClick={() => applyPreset('street_rebel')}
                        className="p-1.5 bg-[#050506] hover:bg-[#f2994a]/20 border border-[#f2994a44] hover:border-[#f2994a] text-[10px] font-mono text-left transition-all text-white"
                      >
                        🔥 Rebelle de Montréal
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Center Column: Head, Face, Hair & Skin */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="bg-[#11111a] border border-[#ffffff11] p-4 flex flex-col gap-3">
                  <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] tracking-wider uppercase flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Tête, Coupe de Cheveux & Peau
                  </h3>

                  {/* Hairstyle Selector */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Coupe de Cheveux</label>
                    <select
                      value={customization.hairstyle || 'slick_back'}
                      onChange={(e) => onUpdateCustomization({ hairstyle: e.target.value as HairstyleType })}
                      className="w-full bg-[#050506] border border-[#ffffff22] text-xs font-mono text-white p-2 outline-none focus:border-[#00f3ff]"
                    >
                      <option value="slick_back">Slicked Back Néo (Stylé & Tranchant)</option>
                      <option value="cyber_fade">Cyber Fade Moderne (Dégradé Côtés)</option>
                      <option value="neon_mohawk">Mohawk Néon Rebelle</option>
                      <option value="samurai_bun">Topknot Cyber-Samouraï</option>
                      <option value="undercut">Undercut Tactique</option>
                      <option value="buzzcut">Buzzcut Militaire Ultra-Court</option>
                      <option value="long_flowing">Cheveux Longs Flottants</option>
                    </select>
                  </div>

                  {/* Hair Color Palette */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Couleur des Cheveux</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {HAIR_PALETTE.map((item) => (
                        <button
                          key={item.hex}
                          title={item.name}
                          onClick={() => onUpdateCustomization({ hairColor: item.hex })}
                          className={`w-6 h-6 rounded-xs border transition-transform ${customization.hairColor === item.hex ? 'border-white scale-110 ring-2 ring-cyan-400' : 'border-transparent'}`}
                          style={{ backgroundColor: item.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Skin Tone Selector */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Teinte de Peau Réaliste</label>
                    <div className="flex gap-2 flex-wrap">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone.hex}
                          title={tone.name}
                          onClick={() => onUpdateCustomization({ skinTone: tone.hex })}
                          className={`w-7 h-7 rounded border transition-transform ${customization.skinTone === tone.hex ? 'border-white scale-110 ring-2 ring-cyan-400' : 'border-black/50'}`}
                          style={{ backgroundColor: tone.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Beard / Facial Hair */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Pilosité Faciale & Barbe</label>
                    <select
                      value={customization.beardStyle || 'stubble'}
                      onChange={(e) => onUpdateCustomization({ beardStyle: e.target.value as BeardType })}
                      className="w-full bg-[#050506] border border-[#ffffff22] text-xs font-mono text-white p-2 outline-none focus:border-[#00f3ff]"
                    >
                      <option value="clean">Rasé de près (Clean Shaven)</option>
                      <option value="stubble">Barbe de 3 Jours (Stubble Néo)</option>
                      <option value="cyber_goatee">Bouc Cybernétique Précis</option>
                      <option value="tactical_beard">Barbe Tactique Pleine</option>
                    </select>
                  </div>

                  {/* Visor / Optical Eyes Color */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Optique Visière AR Néon</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {NEON_PALETTE.map((item) => (
                        <button
                          key={item.hex}
                          title={item.name}
                          onClick={() => onUpdateCustomization({ visorColor: item.hex })}
                          className={`w-6 h-6 border transition-transform ${customization.visorColor === item.hex ? 'border-white scale-110 ring-2 ring-cyan-400' : 'border-transparent'}`}
                          style={{ backgroundColor: item.hex }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Outerwear, Armor, Arms, Legs & Weapons */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="bg-[#11111a] border border-[#ffffff11] p-4 flex flex-col gap-3">
                  <h3 className="text-xs font-orbitron font-bold text-[#ff00ff] tracking-wider uppercase flex items-center gap-2">
                    <Shirt className="w-4 h-4" />
                    Vêtements, Bionique & Armes
                  </h3>

                  {/* Outerwear / Trenchcoat Style */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Manteau / Vêtement Extérieur</label>
                    <select
                      value={customization.outerwear || 'neo_trenchcoat'}
                      onChange={(e) => onUpdateCustomization({ outerwear: e.target.value as OuterwearType })}
                      className="w-full bg-[#050506] border border-[#ffffff22] text-xs font-mono text-white p-2 outline-none focus:border-[#ff00ff]"
                    >
                      <option value="neo_trenchcoat">Long Trenchcoat Néo Flottant (Matrix)</option>
                      <option value="stealth_jacket">Veste Tactique Furtive Ajustée</option>
                      <option value="exo_tactical_vest">Harnais Renforcé Exo-Squelette</option>
                      <option value="corp_duster">Pardessus d'Élite Corporatiste</option>
                    </select>
                  </div>

                  {/* Cyber Arm Implant */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Prothèse de Bras Cybernétique</label>
                    <select
                      value={customization.cyberArm || 'left_chrome'}
                      onChange={(e) => onUpdateCustomization({ cyberArm: e.target.value as CyberArmType })}
                      className="w-full bg-[#050506] border border-[#ffffff22] text-xs font-mono text-white p-2 outline-none focus:border-[#ff00ff]"
                    >
                      <option value="left_chrome">Bras Gauche Chrome Brossé (Gantelet PSI)</option>
                      <option value="right_plasma">Bras Droit Plasma Surchargé</option>
                      <option value="dual_bionic">Double Bionique Militaire</option>
                      <option value="none">Bras Biologiques d'Origine</option>
                    </select>
                  </div>

                  {/* Blade Energy Glow */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Teinte de Lame Plasma / Katana</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {NEON_PALETTE.map((item) => (
                        <button
                          key={item.hex}
                          title={item.name}
                          onClick={() => onUpdateCustomization({ bladeColor: item.hex })}
                          className={`w-6 h-6 border transition-transform ${customization.bladeColor === item.hex ? 'border-white scale-110 ring-2 ring-pink-400' : 'border-transparent'}`}
                          style={{ backgroundColor: item.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Aura Color */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Aura Psionique / Halo Synaptique</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {NEON_PALETTE.map((item) => (
                        <button
                          key={item.hex}
                          title={item.name}
                          onClick={() => onUpdateCustomization({ auraColor: item.hex })}
                          className={`w-6 h-6 border transition-transform ${customization.auraColor === item.hex ? 'border-white scale-110 ring-2 ring-pink-400' : 'border-transparent'}`}
                          style={{ backgroundColor: item.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Suit Color */}
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">Couleur de la Combinaison</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['#0b0f19', '#1e293b', '#334155', '#1e1b4b', '#022c22', '#31101e'].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => onUpdateCustomization({ suitColor: hex })}
                          className={`w-6 h-6 border transition-transform ${customization.suitColor === hex ? 'border-white scale-110 ring-2 ring-white' : 'border-transparent'}`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERSONA & PHOTO SCAN */}
          {activeTab === 'persona' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Photo Upload & Biometric Scanner */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-[#11111a] border border-[#ff00ff33] p-5 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="text-xs font-orbitron font-bold text-[#ff00ff] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    Numérisation Faciale & Rendu Ultra-Réaliste
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mb-4">
                    Importez votre photo pour matérialiser votre version cyberpunk parfaite de la tête au pied dans l'univers de Montréal 2033.
                  </p>

                  {/* Avatar Display Frame */}
                  <div className="relative w-40 h-40 border-2 border-[#00f3ff] p-1 bg-[#050506] shadow-[0_0_30px_rgba(0,243,255,0.3)] mb-4 flex items-center justify-center overflow-hidden">
                    {customization.photoUrl ? (
                      <img 
                        src={customization.photoUrl} 
                        alt="Cyberpunk Avatar" 
                        className="w-full h-full object-cover filter contrast-125 saturate-110" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                        <User className="w-12 h-12 text-gray-600 animate-pulse" />
                        <span className="text-[10px] font-mono">Aucun Scan Actif</span>
                      </div>
                    )}

                    {isScanning && (
                      <div className="absolute inset-0 bg-[#00f3ff22] flex flex-col items-center justify-center backdrop-blur-xs">
                        <div className="w-full h-1 bg-[#00f3ff] shadow-[0_0_15px_#00f3ff] animate-bounce" />
                        <span className="text-[10px] font-orbitron font-bold text-white mt-2 bg-black/80 px-2 py-0.5">
                          RECONSTRUCTION 3D...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <label className="cursor-pointer w-full py-2.5 px-4 bg-[#ff00ff]/20 hover:bg-[#ff00ff] border border-[#ff00ff] text-white hover:text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                    <Upload className="w-4 h-4" />
                    <span>{customization.photoUrl ? 'Remplacer la Photo' : 'Importer Votre Photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  {customization.photoUrl && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#00ff41]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Matrice biologique synchronisée de la tête au pied</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Persona & Lore Description */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="bg-[#11111a] border border-[#00f3ff33] p-5 flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-[#00f3ff] uppercase">
                    <FileText className="w-4 h-4" />
                    Description & Histoire du Héros
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    Définissez la personnalité, le style vestimentaire et les motivations de votre personnage pour enrichir l'immersion dans Montréal 2033.
                  </p>

                  {/* Name Input */}
                  <div>
                    <label className="text-[10px] font-orbitron text-gray-400 mb-1 block uppercase font-mono">
                      Nom de Code ou Vrai Nom
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="ex: Alex 'Zero' Tremblay / Neo"
                      className="w-full bg-[#050506] border border-[#ffffff22] text-sm font-orbitron text-white p-2.5 outline-none focus:border-[#00f3ff]"
                    />
                  </div>

                  {/* Bio Textarea */}
                  <div className="flex-1 flex flex-col">
                    <label className="text-[10px] font-orbitron text-gray-400 mb-1 block uppercase font-mono">
                      Description Psychologique & Origines de la Rébellion
                    </label>
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Décrivez votre apparence idéale, vos tatouages cybernétiques, votre regard, vos motivations pour libérer Montréal de la surveillance corporatiste..."
                      rows={5}
                      className="w-full flex-1 bg-[#050506] border border-[#ffffff22] text-xs font-sans text-gray-200 p-3 outline-none focus:border-[#00f3ff] resize-none leading-relaxed"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    onClick={handleSaveBio}
                    className="w-full py-2.5 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Enregistrer la Persona Ultra-Réaliste</span>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ATTRIBUTES & MATRIX */}
          {activeTab === 'matrix' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Column 1: Core Attributes */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] tracking-wider flex items-center gap-2 uppercase">
                  <Cpu className="w-4 h-4" />
                  Matrice Synaptique
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Synaptic Power */}
                  <div className="p-3.5 bg-[#11111a] border-l-2 border-[#00f3ff] border-t border-r border-b border-[#ffffff11]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-[#00f3ff] flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#00f3ff]" />
                        Synaptic Power
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{attributes.synapticPower}</span>
                        {unspentAttributePoints > 0 && (
                          <button
                            onClick={() => onAllocateAttribute('synapticPower')}
                            className="p-1 bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-black transition-all font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-[#222] my-1.5">
                      <div className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" style={{ width: `${Math.min(100, attributes.synapticPower * 3)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Dégâts psioniques (+5), réserve d'énergie mentale (+10 PSI) et chance de critique psychique.
                    </p>
                  </div>

                  {/* Cyber Overclock */}
                  <div className="p-3.5 bg-[#11111a] border-l-2 border-[#ff00ff] border-t border-r border-b border-[#ffffff11]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-[#ff00ff] flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#ff00ff]" />
                        Cyber Overclock
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{attributes.cyberOverclock}</span>
                        {unspentAttributePoints > 0 && (
                          <button
                            onClick={() => onAllocateAttribute('cyberOverclock')}
                            className="p-1 bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-black transition-all font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-[#222] my-1.5">
                      <div className="h-full bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]" style={{ width: `${Math.min(100, attributes.cyberOverclock * 3)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Vitesse d'exécution des hacks, réduction de recharges (+0.4%) et perforation de blindage.
                    </p>
                  </div>

                  {/* Bio-Armor */}
                  <div className="p-3.5 bg-[#11111a] border-l-2 border-[#00ff41] border-t border-r border-b border-[#ffffff11]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-[#00ff41] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#00ff41]" />
                        Bio-Armor
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{attributes.bioArmor}</span>
                        {unspentAttributePoints > 0 && (
                          <button
                            onClick={() => onAllocateAttribute('bioArmor')}
                            className="p-1 bg-[#00ff41] hover:bg-[#00ff41]/80 text-black transition-all font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-[#222] my-1.5">
                      <div className="h-full bg-[#00ff41] shadow-[0_0_8px_#00ff41]" style={{ width: `${Math.min(100, attributes.bioArmor * 3)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Points de vie max (+25 PV), absorption cinétique (+2 armure) et régénération.
                    </p>
                  </div>

                  {/* Neural Reflex */}
                  <div className="p-3.5 bg-[#11111a] border-l-2 border-[#f2994a] border-t border-r border-b border-[#ffffff11]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-[#f2994a] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#f2994a]" />
                        Neural Reflex
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{attributes.neuralReflex}</span>
                        {unspentAttributePoints > 0 && (
                          <button
                            onClick={() => onAllocateAttribute('neuralReflex')}
                            className="p-1 bg-[#f2994a] hover:bg-[#f2994a]/80 text-black transition-all font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-[#222] my-1.5">
                      <div className="h-full bg-[#f2994a] shadow-[0_0_8px_#f2994a]" style={{ width: `${Math.min(100, attributes.neuralReflex * 3)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Vitesse synaptique, chance d'esquive (+0.5%) et dégâts physiques au corps-à-corps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Derived Combat Telemetry */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <h3 className="text-xs font-orbitron font-bold text-[#ff00ff] tracking-wider flex items-center gap-2 uppercase">
                  <Award className="w-4 h-4" />
                  Télémétrie de Combat
                </h3>

                <div className="bg-[#11111a] border border-[#ffffff11] p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Bio-Santé Maximale</span>
                    <span className="font-bold text-[#ff0044] font-mono">{stats.maxHp} PV</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Énergie Synaptique (PSI)</span>
                    <span className="font-bold text-[#00f3ff] font-mono">{stats.maxPsi} MHZ</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Dégâts Physiques / Lame</span>
                    <span className="font-bold text-[#00ff41] font-mono">{stats.physicalDamage} PTS</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Dégâts Psioniques & EMP</span>
                    <span className="font-bold text-[#00f3ff] font-mono">{stats.psiDamage} PTS</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Blindage Exo-Squelette</span>
                    <span className="font-bold text-gray-200 font-mono">{stats.armor} PTS</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Chance Coup Critique</span>
                    <span className="font-bold text-[#f2994a] font-mono">{stats.critChance.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Multiplicateur Critique</span>
                    <span className="font-bold text-[#f2994a] font-mono">{stats.critDamage}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Vitesse de Déplacement</span>
                    <span className="font-bold text-gray-200 font-mono">{stats.moveSpeed.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                    <span className="text-gray-400 font-mono">Réduction des Recharges</span>
                    <span className="font-bold text-[#ff00ff] font-mono">{stats.cooldownReduction.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 text-xs">
                    <span className="text-gray-400 font-mono">Chance d'Esquive Synaptique</span>
                    <span className="font-bold text-[#00ff41] font-mono">{stats.dodgeChance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BADGES & TITRES DE PRESTIGE */}
          {activeTab === 'badges' && (
            <div className="flex flex-col gap-5">
              {/* Top Showcase Banner */}
              <div className="bg-[#11111a] border border-[#f59e0b44] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b]">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-orbitron font-bold text-white uppercase tracking-wider">
                      INSIGNES ET TITRES DE PRESTIGE ACCOMPLIS
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      {unlockedBadgesCount} / {achievements.length} Badges Déverrouillés dans la Matrice de Montréal
                    </p>
                  </div>
                </div>

                {onOpenAchievements && (
                  <button
                    onClick={onOpenAchievements}
                    className="px-4 py-2 bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                  >
                    <Trophy className="w-4 h-4" />
                    OUVRIR L'ARBRE DES SUCCÈS [U]
                  </button>
                )}
              </div>

              {/* Active Badge Spotlight */}
              {activeBadge && (
                <div className="bg-[#0b0f19] border border-[#00f3ff44] p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 flex items-center justify-center text-2xl border bg-black/60 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                      style={{ borderColor: activeBadge.badgeColor }}
                    >
                      {activeBadge.badgeIcon}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-gray-400">INSIGNE ACTUELLEMENT AFFICHÉ SUR LE PROFIL & HUD :</div>
                      <div 
                        className="text-base font-orbitron font-bold"
                        style={{ color: activeBadge.badgeColor }}
                      >
                        {activeBadge.badgeTitle} — {activeBadge.title}
                      </div>
                      <div className="text-xs text-gray-300 font-sans mt-0.5">
                        {activeBadge.description}
                      </div>
                    </div>
                  </div>

                  {activeBadge.statBonus && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-gray-400">BONUS PASSIF ACTIF :</span>
                      <div className="text-xs font-mono font-bold text-[#00ff41]">
                        {activeBadge.statBonus.description}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {achievements.map((ach) => {
                  const isEquipped = customization.activeBadgeId === ach.id;
                  const progressPct = Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100));

                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 border transition-all flex flex-col justify-between ${
                        ach.unlocked
                          ? isEquipped
                            ? 'bg-[#181824] border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                            : 'bg-[#11111a] border-[#ffffff18] hover:border-[#f59e0b]'
                          : 'bg-[#08080c] border-[#ffffff0a] opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className={`w-9 h-9 flex items-center justify-center text-lg border ${
                                ach.unlocked ? 'bg-black/60' : 'bg-[#181820] text-gray-600 border-[#ffffff11]'
                              }`}
                              style={ach.unlocked ? { borderColor: ach.badgeColor } : {}}
                            >
                              {ach.unlocked ? ach.badgeIcon : <Lock className="w-4 h-4 text-gray-500" />}
                            </div>
                            <div>
                              <div 
                                className="text-xs font-orbitron font-bold"
                                style={{ color: ach.unlocked ? ach.badgeColor : '#777' }}
                              >
                                {ach.badgeTitle}
                              </div>
                              <div className="text-[10px] font-mono text-gray-400">
                                {ach.title}
                              </div>
                            </div>
                          </div>

                          {ach.unlocked && isEquipped && (
                            <span className="text-[9px] font-mono font-bold text-[#00ff41] bg-[#00ff4115] border border-[#00ff41] px-1.5 py-0.5">
                              ÉQUIPÉ
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-300 font-sans mb-2 line-clamp-2">
                          {ach.description}
                        </p>

                        {!ach.unlocked && (
                          <div className="mb-2">
                            <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1">
                              <span>Progression</span>
                              <span>{progressPct}% ({ach.currentValue}/{ach.targetValue})</span>
                            </div>
                            <div className="w-full h-1 bg-[#222]">
                              <div className="h-full bg-[#00f3ff]" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#ffffff0a] flex items-center justify-between gap-2">
                        {ach.statBonus && (
                          <span className="text-[9px] font-mono text-[#00ff41]">
                            {ach.statBonus.description}
                          </span>
                        )}

                        {ach.unlocked ? (
                          <button
                            onClick={() => {
                              if (onEquipBadge) onEquipBadge(ach.id);
                            }}
                            className={`px-2.5 py-1 text-[10px] font-orbitron font-bold transition-all ml-auto ${
                              isEquipped
                                ? 'bg-[#00ff41] text-black'
                                : 'bg-[#1e1e2c] hover:bg-[#f59e0b] text-gray-200 hover:text-black border border-[#ffffff22]'
                            }`}
                          >
                            {isEquipped ? '✓ ACTIF' : 'ÉQUIPER'}
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-500 ml-auto flex items-center gap-1">
                            <Lock className="w-3 h-3" /> VERROUILLÉ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: WEAPON SKINS (Visual Cosmétiques sans impact sur les stats) */}
          {activeTab === 'weapon_skins' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: 3D Live Weapon Showcase (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="bg-[#0b0d16] border border-[#00f3ff44] p-4 flex flex-col items-center relative overflow-hidden">
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-[#00f3ff]" />
                      <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                        Rendu Photonique 3D
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 bg-black/50 px-2 py-0.5 border border-white/10">
                      PARTICULES // 60 FPS
                    </span>
                  </div>

                  {/* Weapon Canvas */}
                  <div className="relative w-full aspect-[16/10] bg-[#05070f] border border-white/10 flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={weaponCanvasRef}
                      width={380}
                      height={240}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Selected Skin Specs */}
                  {(() => {
                    const skin = getWeaponSkinById(selectedSkinPreviewId);
                    const isUnlocked = unlockedWeaponSkinIds.includes(skin.id);
                    const isEquipped = (customization.activeWeaponSkinId || 'skin_default') === skin.id;

                    const getRarityBadgeStyle = (rarity: string) => {
                      switch (rarity) {
                        case 'legendary': return 'border-[#f2994a] text-[#f2994a] bg-[#f2994a15]';
                        case 'epic': return 'border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff15]';
                        case 'rare': return 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff15]';
                        default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
                      }
                    };

                    return (
                      <div className="w-full mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-orbitron font-bold text-white">{skin.name}</h3>
                            <p className="text-[11px] font-mono text-[#00f3ff]">{skin.subtitle}</p>
                          </div>
                          <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 border uppercase ${getRarityBadgeStyle(skin.rarity)}`}>
                            {skin.rarity}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#05060b] p-2.5 border border-white/5">
                          {skin.description}
                        </p>

                        {/* Particle & Shader metadata */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="p-2 bg-[#080a14] border border-white/5 flex justify-between">
                            <span className="text-gray-400">Type Particules:</span>
                            <span className="text-white font-bold uppercase">{skin.particleType}</span>
                          </div>
                          <div className="p-2 bg-[#080a14] border border-white/5 flex justify-between">
                            <span className="text-gray-400">Énergie Lame:</span>
                            <span className="text-[#00f3ff] font-bold">{(skin.glowIntensity * 4.2).toFixed(0)} GW</span>
                          </div>
                        </div>

                        {/* Visual only disclaimer */}
                        <div className="p-2.5 bg-[#00f3ff0a] border border-[#00f3ff33] text-[10px] font-mono text-[#00f3ff] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>Skin purement cosmétique — conserve 100% des statistiques de votre arme équipée.</span>
                        </div>

                        {/* Equip / Unlock Action */}
                        <div className="pt-1">
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                if (onEquipWeaponSkin) onEquipWeaponSkin(skin.id);
                                soundEngine.playWeaponSkinEquip();
                              }}
                              className={`w-full py-2.5 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isEquipped
                                  ? 'bg-[#00ff41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                                  : 'bg-[#00f3ff] hover:bg-[#00f3ffcc] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                              }`}
                            >
                              <Sword className="w-4 h-4" />
                              <span>{isEquipped ? '✓ APPARENCE ACTUELLEMENT ÉQUIPÉE' : 'ÉQUIPER CETTE TEXTURE D’ARME'}</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 bg-[#18080c] border border-red-500/30 text-center">
                                <span className="text-[10px] font-mono text-red-400 flex items-center justify-center gap-1">
                                  <Lock className="w-3 h-3" /> {skin.unlockCondition}
                                </span>
                              </div>

                              {skin.priceNanites && onUnlockWeaponSkin && (
                                <button
                                  onClick={() => {
                                    if (nanites >= skin.priceNanites!) {
                                      onUnlockWeaponSkin(skin.id, skin.priceNanites!);
                                      soundEngine.playWeaponSkinEquip();
                                    }
                                  }}
                                  disabled={nanites < skin.priceNanites}
                                  className={`w-full py-2 font-orbitron font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    nanites >= skin.priceNanites
                                      ? 'bg-[#f2994a] hover:bg-[#f2994acc] text-black shadow-[0_0_15px_rgba(242,153,74,0.4)]'
                                      : 'bg-[#1a1a24] text-gray-500 border border-white/10 cursor-not-allowed'
                                  }`}
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  <span>DÉBLOQUER DIRECTEMENT ({skin.priceNanites.toLocaleString()} NANITES)</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Column: Grid of All Weapon Skins (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                      COLLECTION DE TEXTURES & SHADERS D'ARMES ({unlockedSkinsCount} / {WEAPON_SKINS_CATALOG.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#f2994a] bg-[#f2994a15] px-2.5 py-0.5 border border-[#f2994a44]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{nanites.toLocaleString()} Nanites</span>
                  </div>
                </div>

                {/* Skins Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[520px] custom-scrollbar pr-1">
                  {WEAPON_SKINS_CATALOG.map((skin) => {
                    const isUnlocked = unlockedWeaponSkinIds.includes(skin.id);
                    const isEquipped = (customization.activeWeaponSkinId || 'skin_default') === skin.id;
                    const isSelected = selectedSkinPreviewId === skin.id;

                    const getRarityBorder = (rarity: string) => {
                      switch (rarity) {
                        case 'legendary': return 'border-[#f2994a] shadow-[0_0_12px_rgba(242,153,74,0.2)]';
                        case 'epic': return 'border-[#ff00ff] shadow-[0_0_12px_rgba(255,0,255,0.2)]';
                        case 'rare': return 'border-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.2)]';
                        default: return 'border-gray-600';
                      }
                    };

                    return (
                      <div
                        key={skin.id}
                        onClick={() => setSelectedSkinPreviewId(skin.id)}
                        className={`p-3 border transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected 
                            ? 'bg-[#121629] ring-2 ring-[#00f3ff]' 
                            : 'bg-[#090b14] hover:bg-[#0e1220]'
                        } ${getRarityBorder(skin.rarity)}`}
                      >
                        <div>
                          {/* Top Row */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span 
                              className="text-[9px] font-orbitron font-bold uppercase px-1.5 py-0.2 border"
                              style={{ color: skin.bladeColor, borderColor: `${skin.bladeColor}66` }}
                            >
                              {skin.rarity}
                            </span>

                            {isEquipped ? (
                              <span className="text-[9px] font-mono text-[#00ff41] bg-[#00ff4120] px-1.5 py-0.5 border border-[#00ff41]">
                                ✓ ÉQUIPÉ
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-[9px] font-mono text-[#00f3ff] bg-[#00f3ff15] px-1.5 py-0.5 border border-[#00f3ff44]">
                                DÉBLOQUÉ
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-400 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5 text-gray-500" /> VERROUILLÉ
                              </span>
                            )}
                          </div>

                          {/* Weapon Visual Color Beam Indicator */}
                          <div 
                            className="h-1.5 w-full mb-2 rounded-sm"
                            style={{ 
                              background: `linear-gradient(to right, ${skin.bladeColor}, ${skin.secondaryColor})`,
                              boxShadow: `0 0 8px ${skin.bladeColor}`
                            }}
                          />

                          <h4 className="text-xs font-orbitron font-bold text-white truncate">
                            {skin.name}
                          </h4>
                          <p className="text-[10px] font-mono text-gray-400 truncate mb-1">
                            {skin.subtitle}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-2">
                          <span className="text-[9px] font-mono text-gray-400 uppercase">
                            {skin.particleType} fx
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isUnlocked ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSkinPreviewId(skin.id);
                                  if (onEquipWeaponSkin) onEquipWeaponSkin(skin.id);
                                  soundEngine.playWeaponSkinEquip();
                                }}
                                className={`px-2 py-0.5 text-[10px] font-orbitron font-bold transition-all ${
                                  isEquipped
                                    ? 'bg-[#00ff41] text-black'
                                    : 'bg-[#00f3ff22] hover:bg-[#00f3ff] text-[#00f3ff] hover:text-black border border-[#00f3ff]'
                                }`}
                              >
                                {isEquipped ? 'ACTIF' : 'ÉQUIPER'}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSkinPreviewId(skin.id);
                                }}
                                className="px-2 py-0.5 text-[10px] font-orbitron text-gray-400 hover:text-white bg-white/5 border border-white/10"
                              >
                                DÉTAILS
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

