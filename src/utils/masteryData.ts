import { AbilityMasteryData, AbilityType, AbilityMasteryTier } from '../types';

export const INITIAL_ABILITY_MASTERY: Record<AbilityType, AbilityMasteryData> = {
  primary: {
    id: 'primary',
    name: 'Cyber-Lame Monomoléculaire',
    subtitle: 'Attaque principale au corps-à-corps à haute fréquence',
    icon: 'Sword',
    hotkey: 'Clic Gauche / J',
    branch: 'cyber',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 25,
        perkName: 'Fente Éclair Accélérée',
        perkDesc: 'Augmente la vitesse d\'enchaînement des combos de 15% et ajoute +5% de vitesse de déplacement après un coup.',
        unlocked: false,
        statBonusDesc: '+15% Vitesse d\'Attaque'
      },
      {
        tier: 2,
        reqUses: 75,
        perkName: 'Balayage Cinétique Lourd',
        perkDesc: 'Le troisième coup du combo projette une onde de choc tranchante avec un recul (knockback) puissant.',
        unlocked: false,
        statBonusDesc: '+25% Rayon & Knockback'
      },
      {
        tier: 3,
        reqUses: 160,
        perkName: 'Perforation d\'Exo-Armure',
        perkDesc: 'Chaque coup critique tranche le blindage ennemi, réduisant leur résistance physique de 35% pendant 4s.',
        unlocked: false,
        statBonusDesc: '+35% Pénétration d\'Armure'
      }
    ]
  },
  lance: {
    id: 'lance',
    name: 'Javelot Synaptique',
    subtitle: 'Projection d\'un rayon psionique perforant longue portée',
    icon: 'Crosshair',
    hotkey: 'Q / Touche 1',
    branch: 'psychic',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 15,
        perkName: 'Vélocité Hypersonique',
        perkDesc: 'Augmente la vitesse du projectile de 30% et confère +15% de dégâts bruts au premier ennemi touché.',
        unlocked: false,
        statBonusDesc: '+30% Vitesse Projectile'
      },
      {
        tier: 2,
        reqUses: 45,
        perkName: 'Choc Axonal Stun',
        perkDesc: 'Le javelot électrocute et étourdit (Stun) tous les ennemis traversés pendant 1.2 seconde.',
        unlocked: false,
        statBonusDesc: 'Stun 1.2s Garanti'
      },
      {
        tier: 3,
        reqUses: 100,
        perkName: 'Détonation Synaptique Terminale',
        perkDesc: 'À l\'impact final, le javelot implose en libérant une nova psionique infligeant 180% de dégâts de zone.',
        unlocked: false,
        statBonusDesc: 'Nova Psionique Finale (180% Dégâts)'
      }
    ]
  },
  emp: {
    id: 'emp',
    name: 'Surcharge EMP Radiale',
    subtitle: 'Décharge électromagnétique de zone désactivant les circuits',
    icon: 'Radio',
    hotkey: 'W / Touche 2',
    branch: 'cyber',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 15,
        perkName: 'Rayon d\'Impulsion Étendu',
        perkDesc: 'Augmente le rayon de l\'onde de choc EMP de 25% et la durée d\'étourdissement de +0.8s.',
        unlocked: false,
        statBonusDesc: '+25% Rayon & +0.8s Stun'
      },
      {
        tier: 2,
        reqUses: 45,
        perkName: 'Court-Circuit Résiduel',
        perkDesc: 'Les ennemis affectés subissent une décharge continue (DoT électrique) infligeant 80% des dégâts sur 3s.',
        unlocked: false,
        statBonusDesc: 'DoT Électrique 3s (80% Dmg)'
      },
      {
        tier: 3,
        reqUses: 90,
        perkName: 'Désarmement Matériel Global',
        perkDesc: 'Neutralise les canons cybernétiques ennemis, réduisant leurs dégâts de 50% pendant 5 secondes.',
        unlocked: false,
        statBonusDesc: '-50% Dégâts Ennemis (5s)'
      }
    ]
  },
  vortex: {
    id: 'vortex',
    name: 'Faille Gravitationnelle Psionique',
    subtitle: 'Singularité attirant et broyant les unités ennemies',
    icon: 'Disc',
    hotkey: 'E / Touche 3',
    branch: 'psychic',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 12,
        perkName: 'Aspiration Gravitique Violente',
        perkDesc: 'Amplifie la force d\'attraction du vortex de 40% et augmente la zone d\'aspiration de 20%.',
        unlocked: false,
        statBonusDesc: '+40% Force d\'Aspiration'
      },
      {
        tier: 2,
        reqUses: 35,
        perkName: 'Vortex Prolongé & Déchirure',
        perkDesc: 'Prolonge la durée du vortex de 2.5 secondes et augmente la cadence des impulsions de dégâts.',
        unlocked: false,
        statBonusDesc: '+2.5s Durée & +30% Ticks'
      },
      {
        tier: 3,
        reqUses: 75,
        perkName: 'Siphon Neural de Bio-Santé',
        perkDesc: 'Convertit 10% de tous les dégâts infligés par le vortex en Bio-Santé et Énergie Psionique pour le joueur.',
        unlocked: false,
        statBonusDesc: '10% Vampirisme HP / PSI'
      }
    ]
  },
  bulletTime: {
    id: 'bulletTime',
    name: 'Distorsion Temporelle Overdrive',
    subtitle: 'Accélération synaptique ralentissant l\'écoulement du temps',
    icon: 'Flame',
    hotkey: 'R / Touche 4',
    branch: 'cyber',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 10,
        perkName: 'Ralentissement Réflexe Profond',
        perkDesc: 'Les ennemis sont désormais ralentis de 80% (au lieu de 70%), accordant un contrôle absolu du champ de bataille.',
        unlocked: false,
        statBonusDesc: '80% Ralentissement Ennemis'
      },
      {
        tier: 2,
        reqUses: 30,
        perkName: 'Focalisation Critique Axonale',
        perkDesc: 'Tant que le Bullet-Time est actif, les chances de coup critique sont augmentées de +25%.',
        unlocked: false,
        statBonusDesc: '+25% Chances Critiques'
      },
      {
        tier: 3,
        reqUses: 65,
        perkName: 'Reset Instantané du Dash',
        perkDesc: 'Activer l\'Overdrive réinitialise instantanément le temps de recharge du Dash et confère 15 i-frames gratuites.',
        unlocked: false,
        statBonusDesc: 'Reset Dash & +15 i-Frames'
      }
    ]
  },
  dash: {
    id: 'dash',
    name: 'Micro-Déphasage Furtif',
    subtitle: 'Esquive ultra-rapide avec frames d\'invulnérabilité (i-frames)',
    icon: 'Zap',
    hotkey: 'Espace / Shift',
    branch: 'psychic',
    usesCount: 0,
    currentTier: 0,
    tiers: [
      {
        tier: 1,
        reqUses: 25,
        perkName: 'I-Frames Renforcées',
        perkDesc: 'Augmente la durée d\'invulnérabilité du dash de 40% (traversée sécurisée des tirs lourds).',
        unlocked: false,
        statBonusDesc: '+40% Durée d\'Invulnérabilité'
      },
      {
        tier: 2,
        reqUses: 75,
        perkName: 'Onde de Choc Cinétique au Départ',
        perkDesc: 'Le dash repousse violemment les ennemis au point de départ et inflige 60 dégâts de collision.',
        unlocked: false,
        statBonusDesc: 'Knockback & Dégâts de Choc'
      },
      {
        tier: 3,
        reqUses: 150,
        perkName: 'Déphasage Quantique sans Coût',
        perkDesc: 'Le dash consomme 0 énergie et augmente la vitesse de déplacement de 20% pendant 2 secondes.',
        unlocked: false,
        statBonusDesc: '0 Coût & +20% Move Speed (2s)'
      }
    ]
  }
};

/**
 * Increment ability usage and update tiers
 */
export function recordAbilityUsage(
  currentMastery: Record<AbilityType, AbilityMasteryData>,
  abilityId: AbilityType
): { updatedMastery: Record<AbilityType, AbilityMasteryData>; newlyUnlockedTier: AbilityMasteryTier | null } {
  const currentAbility = currentMastery[abilityId];
  if (!currentAbility) return { updatedMastery: currentMastery, newlyUnlockedTier: null };

  const newUses = currentAbility.usesCount + 1;
  let newlyUnlockedTier: AbilityMasteryTier | null = null;

  const updatedTiers = currentAbility.tiers.map((t) => {
    if (!t.unlocked && newUses >= t.reqUses) {
      newlyUnlockedTier = { ...t, unlocked: true };
      return { ...t, unlocked: true };
    }
    return t;
  });

  const currentTier = updatedTiers.filter((t) => t.unlocked).length;

  const updatedAbility: AbilityMasteryData = {
    ...currentAbility,
    usesCount: newUses,
    currentTier,
    tiers: updatedTiers
  };

  return {
    updatedMastery: {
      ...currentMastery,
      [abilityId]: updatedAbility
    },
    newlyUnlockedTier
  };
}
