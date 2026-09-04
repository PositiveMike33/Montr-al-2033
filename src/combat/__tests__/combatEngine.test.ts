// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Suite de Tests Automatisés de Simulation & Validation Mathématique Déterministe
// ═══════════════════════════════════════════════════════════════════════════

import { 
  CombatState, 
  Combatant, 
  CombatAction 
} from '../core/types';
import { 
  AttackCommand, 
  SpellCommand, 
  DefendCommand, 
  CheerCommand 
} from '../core/Command';
import { 
  applyMutationPacket, 
  cloneCombatState, 
  replayCombatHistory 
} from '../core/Reducer';
import { 
  calculateFFXDefNum, 
  calculateFFXPhysicalDamage 
} from '../gas/DamageCalculation';
import { 
  CTBEngine, 
  calculateTickSpeed 
} from '../scheduling/CTBEngine';
import { 
  ATBEngine, 
  DEFAULT_ATB_CONFIG 
} from '../scheduling/ATBEngine';
import { DEFAULT_PACING_TIMINGS } from '../presentation/AsyncCombatSequencer';
import { createFFBattleState } from '../core/battleFactory';
import { GameplayTagManager } from '../gas/GameplayTags';
import { AbilitySystemComponent } from '../gas/AbilitySystemComponent';
import { GameplayEffectDefinition } from '../gas/GameplayEffect';
import { GambitEngine, GambitRule } from '../ai/GambitEngine';
import { UtilityAIEngine } from '../ai/UtilityAI';

// Utilitaires de création d'entités de test
function createTestCombatant(id: string, name: string, side: 'player' | 'enemy', overrides?: Partial<Combatant>): Combatant {
  const defaultActions: CombatAction[] = [
    {
      id: 'attack',
      name: 'Attaque Cyber-Lame',
      description: 'Coup physique standard',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 0,
      rank: 3,
      dmCon: 16
    },
    {
      id: 'quick_hit',
      name: 'Coup Éclair (Quick Hit)',
      description: 'Attaque ultrarapide Rang 1',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 12,
      rank: 1,
      dmCon: 16
    },
    {
      id: 'psi_lance',
      name: 'Psi Lance',
      description: 'Sort d’assaut psychique',
      category: 'psi',
      scope: 'single_enemy',
      mpCost: 20,
      rank: 4,
      dmCon: 28,
      element: 'psi',
      prohibitedTags: ['State.Debuff.Silence']
    },
    {
      id: 'cure_nanites',
      name: 'Nanites de Soin',
      description: 'Restaure des points de vie',
      category: 'tech',
      scope: 'single_ally',
      mpCost: 15,
      rank: 3
    }
  ];

  return {
    id,
    name,
    side,
    level: 25,
    stats: {
      hp: 2500,
      maxHp: 2500,
      mp: 150,
      maxMp: 150,
      strength: 45,
      defense: 60,
      magic: 40,
      magicDefense: 50,
      agility: 42,
      luck: 20,
      accuracy: 90,
      evasion: 25,
      cheerStacks: 0,
      focusStacks: 0
    },
    tags: [],
    actions: defaultActions,
    currentTick: 15,
    tickSpeed: 5,
    atbCurrent: 0,
    atbMax: 1000,
    isDefending: false,
    gambitsActive: true,
    isDead: false,
    ...overrides
  };
}

function createInitialTestState(): CombatState {
  const player = createTestCombatant('thirty3', 'Thirty3', 'player');
  const enemy = createTestCombatant('viktor_vance', 'Viktor Vance', 'enemy', {
    stats: {
      hp: 8000,
      maxHp: 8000,
      mp: 300,
      maxMp: 300,
      strength: 55,
      defense: 75,
      magic: 50,
      magicDefense: 65,
      agility: 30,
      luck: 15,
      accuracy: 85,
      evasion: 10,
      cheerStacks: 0,
      focusStacks: 0
    }
  });

  return {
    id: 'test_battle_01',
    turnMode: 'CTB',
    atbMode: 'active',
    globalTick: 0,
    turnCount: 0,
    activeCombatantId: 'thirty3',
    combatants: {
      thirty3: player,
      viktor_vance: enemy
    },
    orderQueue: [],
    timelinePreview: [],
    history: [],
    isBattleOver: false,
    winner: null
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXÉCUTION DES TESTS
// ─────────────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 MONTRÉAL 2033 — VALIDATION COMPLÈTE DU MOTEUR DE COMBAT FF');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ───────────────────────────────────────────────────────────
  // TEST 1: Formule Mathématique Non-Linéaire FFX (DefNum Parabolique)
  // ───────────────────────────────────────────────────────────
  console.log('▶ [1/7] Test des Formules de Dégâts Non-Linéaires FFX');
  
  // DefNum(0) = ⌊(-280.4)² / 110⌋ + 16 = ⌊78624.16 / 110⌋ + 16 = 714 + 16 = 730
  const defNum0 = calculateFFXDefNum(0);
  assert(defNum0 === 730, 'DefNum à 0 défense vaut 730 (Mitigation nulle)', `Reçu: ${defNum0}`);

  // DefNum(255) = ⌊(255 - 280.4)² / 110⌋ + 16 = ⌊645.16 / 110⌋ + 16 = 5 + 16 = 21
  const defNum255 = calculateFFXDefNum(255);
  assert(defNum255 >= 16 && defNum255 <= 30, 'DefNum à 255 défense offre une très forte atténuation', `Reçu: ${defNum255}`);

  const testPlayer = createTestCombatant('p1', 'Player', 'player', { stats: { ...createTestCombatant('p1', 'P', 'player').stats, strength: 50 } });
  const testEnemy = createTestCombatant('e1', 'Enemy', 'enemy', { stats: { ...createTestCombatant('e1', 'E', 'enemy').stats, defense: 50 } });

  // Dégâts sans buff (évaluation déterministe hors RNG)
  const standardDmg = calculateFFXPhysicalDamage({ source: testPlayer, target: testEnemy, dmCon: 16, allowCritical: false, variance: 1.0 });
  assert(standardDmg.damage > 0, 'Dégâts physiques FFX calculés avec succès', `Dégâts: ${standardDmg.damage}`);

  // Dégâts avec Cheer sur la cible (réduction)
  testEnemy.stats.cheerStacks = 5;
  const cheerDmg = calculateFFXPhysicalDamage({ source: testPlayer, target: testEnemy, dmCon: 16, allowCritical: false, variance: 1.0 });
  assert(cheerDmg.damage < standardDmg.damage, '5 cumuls de Cheer réduisent les dégâts subis', `Cheer Dmg: ${cheerDmg.damage} vs ${standardDmg.damage}`);
  testEnemy.stats.cheerStacks = 0;

  // Dégâts avec Posture de Défense (Protect) : réduction de 50%
  testEnemy.isDefending = true;
  const defendDmg = calculateFFXPhysicalDamage({ source: testPlayer, target: testEnemy, dmCon: 16, allowCritical: false, variance: 1.0 });
  assert(defendDmg.damage <= Math.ceil(standardDmg.damage * 0.6), 'Posture de défense divise les dégâts par 2 environ', `Defend: ${defendDmg.damage}`);
  testEnemy.isDefending = false;

  // ───────────────────────────────────────────────────────────
  // TEST 2: Patron Commande & Validation Atomique
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [2/7] Test du Patron Commande & Validation des Préconditions');
  const state = createInitialTestState();
  const player = state.combatants.thirty3;
  const enemy = state.combatants.viktor_vance;

  // Commande valide
  const attackCmd = new AttackCommand(player.actions[0], player.id, [enemy.id]);
  const valResult1 = attackCmd.validate(state);
  assert(valResult1.isValid, 'Validation réussie pour une attaque valide');

  // Commande avec Silence bloquant la magie
  player.tags.push('State.Debuff.Silence');
  const spellAction = player.actions.find(a => a.id === 'psi_lance')!;
  const spellCmd = new SpellCommand(spellAction, player.id, [enemy.id]);
  const valResult2 = spellCmd.validate(state);
  assert(!valResult2.isValid && valResult2.reason!.includes('Silence'), 'Action bloquée par State.Debuff.Silence', valResult2.reason);
  player.tags = [];

  // Exécution de la commande et génération du paquet atomique
  const packet = attackCmd.execute(state);
  assert(packet.mutations.length > 0, 'La commande produit un paquet de mutations atomiques');
  assert(packet.cues.length > 0, 'La commande génère les Cues visuels correspondants');

  // ───────────────────────────────────────────────────────────
  // TEST 3: Reducer Pur & Event Sourcing Déterministe
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [3/7] Test du Reducer & Déterminisme Mathématique');
  const oldEnemyHp = state.combatants.viktor_vance.stats.hp;
  const nextState = applyMutationPacket(state, packet);

  assert(nextState.combatants.viktor_vance.stats.hp < oldEnemyHp, 'Application atomique réussie : PV de la cible diminués', `Nouveaux PV: ${nextState.combatants.viktor_vance.stats.hp}`);
  assert(state.combatants.viktor_vance.stats.hp === oldEnemyHp, 'Immutabilité : l’état d’origine est resté inchangé');
  assert(nextState.history.length === 1, 'Événement consigné dans l’historique Event Sourcing');

  // ───────────────────────────────────────────────────────────
  // TEST 4: Ordonnancement CTB & Projection Prédictive
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [4/7] Test du Moteur CTB (Tick Speed, Rangs, Projection)');
  assert(calculateTickSpeed(10) === 8, 'Agilité 10 -> Tick Speed 8');
  assert(calculateTickSpeed(45) === 5, 'Agilité 45 -> Tick Speed 5');
  assert(calculateTickSpeed(180) === 2, 'Agilité 180 -> Tick Speed 2');

  CTBEngine.initializeBattleCT(state.combatants);
  const turnInfo = CTBEngine.advanceToNextTurn(state);
  assert(turnInfo !== null, 'Avancement au tour suivant dans le CTB');
  assert(state.activeCombatantId !== null, `Acteur actif désigné: ${state.activeCombatantId}`);

  // Projection de timeline sur 8 tours
  const timeline = CTBEngine.projectTimeline(state, 8);
  assert(timeline.length === 8, 'Projection déterministe de 8 tours futurs générée avec succès');
  
  const timelineQuick = CTBEngine.projectTimeline(state, 8, { rank: 1 });
  const timelineHeavy = CTBEngine.projectTimeline(state, 8, { rank: 6 });
  const thirty3QuickTurn = timelineQuick.find(e => e.combatantId === 'thirty3')?.projectedTick ?? 0;
  const thirty3HeavyTurn = timelineHeavy.find(e => e.combatantId === 'thirty3')?.projectedTick ?? 0;
  assert(thirty3QuickTurn < thirty3HeavyTurn, 'Quick Hit (Rang 1) reprogramme le joueur bien plus tôt que Rang 6', `Quick: ${thirty3QuickTurn} vs Heavy: ${thirty3HeavyTurn}`);

  // ───────────────────────────────────────────────────────────
  // TEST 5: Ordonnancement ATB Continu (Modes Actif / Attente)
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [5/7] Test du Moteur ATB (Accumulation, Modes Actif/Wait)');
  const atbState = createInitialTestState();
  atbState.turnMode = 'ATB';
  atbState.atbMode = 'active';

  // Tick en mode actif : les accumulateurs progressent
  ATBEngine.stepATB(atbState, false);
  const p1Atb = atbState.combatants.thirty3.atbCurrent;
  assert(p1Atb > 0, 'La jauge ATB progresse à chaque tick en mode actif', `ATB: ${p1Atb}`);

  // Mode Wait avec menu ouvert : les jauges doivent être gelées
  atbState.atbMode = 'wait';
  const beforeWaitAtb = atbState.combatants.thirty3.atbCurrent;
  ATBEngine.stepATB(atbState, true); // Menu ouvert
  assert(atbState.combatants.thirty3.atbCurrent === beforeWaitAtb, 'En mode Wait avec menu ouvert, l’accumulation ATB est suspendue');

  // ───────────────────────────────────────────────────────────
  // TEST 6: Gameplay Ability System (Tags, Effets, DoT Periodic Ticks)
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [6/7] Test du Gameplay Ability System (GAS, Tags, Stacking Policies)');
  assert(GameplayTagManager.hasTag(['State.Debuff.Silence', 'Damage.Element.Psi'], 'State.Debuff') === true, 'Correspondance hiérarchique State.Debuff -> State.Debuff.Silence');
  assert(GameplayTagManager.hasTag(['State.Buff.Haste'], 'State.Debuff') === false, 'Non-correspondance Buff vs Debuff');

  const ascOwner = createTestCombatant('asc_test', 'ASCOwner', 'player');
  const asc = new AbilitySystemComponent(ascOwner);

  // Application d'un effet Poison DoT avec politique RefreshDuration
  const poisonEffect: GameplayEffectDefinition = {
    id: 'poison_dot',
    name: 'Neuro-Toxine',
    durationPolicy: 'has_duration',
    durationTurns: 3,
    stackingPolicy: 'RefreshDuration',
    maxStacks: 3,
    periodicTrigger: 'OnTurnStart',
    periodicMagnitude: -50,
    grantedTags: ['State.Debuff.Poison'],
    modifiers: []
  };

  asc.applyEffect(poisonEffect, 'enemy');
  assert(asc.hasTag('State.Debuff.Poison'), 'Le tag State.Debuff.Poison est correctement octroyé');
  
  // Ticks périodiques au début du tour
  const initialHp = ascOwner.stats.hp;
  const tickResult = asc.processPeriodicTicks('OnTurnStart');
  assert(tickResult.hpDelta === -50, 'Le DoT de poison applique -50 PV au début du tour');
  assert(ascOwner.stats.hp === initialHp - 50, 'PV déduits par le tick de poison');

  // ───────────────────────────────────────────────────────────
  // TEST 7: Gambits FFXII O(R·E) & Utility AI
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [7/7] Test des Gambits FFXII & Utility AI');
  const allyInjured = createTestCombatant('ally1', 'Compagnon', 'player', {
    stats: { ...createTestCombatant('ally1', 'C', 'player').stats, hp: 400, maxHp: 2000 } // < 30% HP
  });
  const gambitState = createInitialTestState();
  gambitState.combatants.ally1 = allyInjured;

  const rules: GambitRule[] = [
    {
      id: 'r1',
      name: 'Allié PV < 30% -> Nanites de Soin',
      enabled: true,
      priority: 1,
      targetFilter: 'allies',
      predicateType: 'hp_less_than_percent',
      predicateValue: 30,
      actionId: 'cure_nanites'
    },
    {
      id: 'r2',
      name: 'Ennemi -> Attaque',
      enabled: true,
      priority: 2,
      targetFilter: 'enemies',
      predicateType: 'always_true',
      actionId: 'attack'
    }
  ];

  const decidedCommand = GambitEngine.evaluateGambits(gambitState.combatants.thirty3, rules, gambitState);
  assert(decidedCommand !== null, 'Le moteur de Gambits sélectionne une commande');
  assert(decidedCommand?.action.id === 'cure_nanites', 'Règle prioritaire n°1 validée : Soin de l’allié blessé');
  assert(decidedCommand?.targetIds[0] === 'ally1', 'Cible de soin correctement résolue');

  // Test Utility AI
  const boss = gambitState.combatants.viktor_vance;
  const utilityCommand = UtilityAIEngine.selectBestAction(boss, gambitState, 0.0); // Argmax
  assert(utilityCommand !== null, 'L’Utility AI résout une action optimale pour le boss');

  // ───────────────────────────────────────────────────────────
  // TEST 8: Pacing, Délais de Combat & Fluidité de Pattern
  // ───────────────────────────────────────────────────────────
  console.log('\n▶ [8/8] Test du Pacing, Délais & Fluidité de Pattern');

  // 8.1: Avantage d'initiative CTB et temporisation du premier assaut ennemi
  const pacingState = createFFBattleState({
    playerLevel: 10,
    playerHp: 1500,
    playerMaxHp: 1500,
    playerPsi: 100,
    playerMaxPsi: 100
  });

  CTBEngine.initializeBattleCT(pacingState.combatants);
  const pLeader = pacingState.combatants.thirty3;
  const pDrone = pacingState.combatants.companion_drone;
  const eBoss = pacingState.combatants.viktor_vance;
  const eMinion = pacingState.combatants.spvm_elite;

  assert(pLeader.currentTick < eBoss.currentTick, 'Le joueur commence avec un CT d’ouverture bien plus rapide que le boss ennemi');
  assert(eBoss.currentTick < eMinion.currentTick, 'Les attaques ennemies sont échelonnées pour éviter un assaut simultané');

  // 8.2: Initialisation asymétrique ATB
  const atbPacingCombatants = { ...pacingState.combatants };
  ATBEngine.initializeBattleATB(atbPacingCombatants);
  assert(atbPacingCombatants.thirty3.atbCurrent >= 800, 'Thirty3 commence à ≥80% ATB pour permettre une action quasi immédiate');
  assert(atbPacingCombatants.viktor_vance.atbCurrent <= 350, 'Le boss commence avec une jauge basse (≤35%) pour offrir un délai d’observation tactique');
  assert(atbPacingCombatants.spvm_elite.atbCurrent < atbPacingCombatants.viktor_vance.atbCurrent, 'Les jauges ennemies ATB sont échelonnées');

  // 8.3: Cadence de l'accumulateur ATB optimisée (BattleSpeed 2)
  const atbInc = ATBEngine.calculateATBIncrement(pLeader);
  assert(atbInc >= 16, `Incrément ATB réactif et dynamique (ΔATB = ${atbInc} / tick)`);

  // 8.4: Durée de l'animation d'attaque (AsyncCombatSequencer) condensée
  const totalAnimDuration = DEFAULT_PACING_TIMINGS.dashDurationMs + 
    DEFAULT_PACING_TIMINGS.windupDurationMs + 
    DEFAULT_PACING_TIMINGS.impactHoldDurationMs + 
    DEFAULT_PACING_TIMINGS.returnDurationMs;
  assert(totalAnimDuration <= 600, `Durée totale d'animation d'attaque fluide et punchy (${totalAnimDuration}ms ≤ 600ms, au lieu des anciens 930ms)`);

  // Synthèse
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`RÉSULTAT: ${passed} réussis, ${failed} échoués sur ${passed + failed} assertions.`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Erreur inattendue dans la suite de tests:', err);
  process.exit(1);
});
