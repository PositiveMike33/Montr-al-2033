import React, { useState } from 'react';
import {
  Globe,
  Search,
  Users,
  Compass,
  Building,
  Coins,
  ShieldAlert,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key,
  Database,
  Award,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import {
  MAXINTEL_FRAMEWORK_INFO,
  OSINT_TOOLS_CATALOG,
  GAME_CHARACTER_DOSSIERS,
  OSINT_ACADEMY_MISSIONS,
  GameCharacterTargetDossier,
  OSINTMissionExercise,
  OSINTToolReference
} from '../utils/maxintelData';
import { sound } from '../utils/audio';

interface MaxIntelOSINTAcademyProps {
  onAwardBtcSats?: (sats: number) => void;
  onAwardXp?: (xp: number) => void;
  onClose?: () => void;
  onLaunchGame?: () => void;
  isStandalone?: boolean;
}

export const MaxIntelOSINTAcademy: React.FC<MaxIntelOSINTAcademyProps> = ({
  onAwardBtcSats,
  onAwardXp,
  onClose,
  onLaunchGame,
  isStandalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'targets' | 'methodologies' | 'tools' | 'terminal'>('missions');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(GAME_CHARACTER_DOSSIERS[0].id);
  const [selectedMissionId, setSelectedMissionId] = useState<string>(OSINT_ACADEMY_MISSIONS[0].id);
  
  // Mission progression & answers state
  const [userQueryInput, setUserQueryInput] = useState<string>('');
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mtl2033_maxintel_completed_missions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [missionFeedback, setMissionFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [totalSatsEarned, setTotalSatsEarned] = useState<number>(0);

  // Terminal Simulator State
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'MAXINTEL OSINT FRAMEWORK v4.2 [https://maxintel.org/]',
    'INITIALISATION DU MODULE D’INVESTIGATION SUR LES PERSONNAGES DE MONTRÉAL 2033...',
    'Tapez "help" pour afficher la liste des commandes OSINT ou sélectionnez une mission.',
    '------------------------------------------------------------------------------------'
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  const selectedMission = OSINT_ACADEMY_MISSIONS.find(m => m.id === selectedMissionId) || OSINT_ACADEMY_MISSIONS[0];
  const selectedCharacter = GAME_CHARACTER_DOSSIERS.find(c => c.id === selectedCharacterId) || GAME_CHARACTER_DOSSIERS[0];
  const isMissionCompleted = completedMissions.includes(selectedMission.id);

  // Intelligent Validator for OSINT Academy Exercises
  const validateOSINTQuery = (input: string, mission: OSINTMissionExercise): { isValid: boolean; customError?: string } => {
    const raw = input.trim().toLowerCase();
    
    // Check if user submitted unreplaced template brackets
    if (raw.includes('<domaine>') || raw.includes('<extension>') || raw.includes('<terme>') || raw.includes('<pseudo>') || raw.includes('<lieu>') || (raw.includes('<') && raw.includes('>'))) {
      return {
        isValid: false,
        customError: '💡 ATTENTION : Vous avez envoyé le modèle théorique avec les balises "< >". Vous devez remplacer <domaine> par "vance-dynamics.mtl", <extension> par "pdf", etc.'
      };
    }

    // Mission 01: Dorking Vance Corp (Order-independent token verification)
    if (mission.id === 'mission_dork_vance') {
      const hasDomain = raw.includes('vance-dynamics.mtl') || raw.includes('vance-dynamics') || (raw.includes('site:') && raw.includes('vance'));
      const hasPdf = raw.includes('filetype:pdf') || raw.includes('ext:pdf') || raw.includes('pdf');
      if (hasDomain && hasPdf) {
        return { isValid: true };
      }
    }

    // Mission 02: SunCalc GEOINT
    if (mission.id === 'mission_geoint_mont_royal') {
      if (raw.includes('suncalc') || raw.includes('sun calc') || raw.includes('sun-calc') || raw.includes('suncalc.org') || raw.includes('suncalc.net') || raw.includes('ombre')) {
        return { isValid: true };
      }
    }

    // Mission 03: Sherlock / Maigret SOCMINT
    if (mission.id === 'mission_socmint_thirty3') {
      if (raw.includes('sherlock') || raw.includes('maigret') || raw.includes('whatsmyname') || raw.includes('blackbird') || raw.includes('sherlock-project') || raw.includes('sherlock project')) {
        return { isValid: true };
      }
    }

    // Mission 04: Mempool Blockchain Forensics
    if (mission.id === 'mission_crypto_drouin') {
      if (raw.includes('mempool') || raw.includes('mempool.space') || raw.includes('blockchair') || raw.includes('blockchain.com') || raw.includes('blockchain') || raw.includes('utxo')) {
        return { isValid: true };
      }
    }

    // Mission 05: Darknet .onion
    if (mission.id === 'mission_darkint_ares9') {
      if (raw.includes('.onion') || raw.includes('onion') || raw.includes('tor')) {
        return { isValid: true };
      }
    }

    // Direct match against acceptable answers list
    const isDirectMatch = mission.acceptableAnswers.some(ans => {
      const cleanAns = ans.toLowerCase().trim();
      return raw === cleanAns || raw.includes(cleanAns) || cleanAns.includes(raw);
    });

    return { isValid: isDirectMatch };
  };

  // Handle mission verification
  const handleValidateMission = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = userQueryInput.trim();
    if (!cleanInput) {
      setMissionFeedback({
        status: 'error',
        message: 'VEUILLEZ ENTRER UNE COMMANDE // Le champ est vide. Tapez votre requête OSINT.'
      });
      return;
    }

    const { isValid, customError } = validateOSINTQuery(cleanInput, selectedMission);

    if (isValid) {
      sound.playVictory();
      setMissionFeedback({
        status: 'success',
        message: 'SUCCÈS // Requête OSINT validée ! Dossier secret déverrouillé et récompenses attribuées.'
      });

      if (!completedMissions.includes(selectedMission.id)) {
        const nextCompleted = [...completedMissions, selectedMission.id];
        setCompletedMissions(nextCompleted);
        try {
          localStorage.setItem('mtl2033_maxintel_completed_missions', JSON.stringify(nextCompleted));
        } catch {}

        if (onAwardBtcSats) onAwardBtcSats(selectedMission.btcRewardSats);
        if (onAwardXp) onAwardXp(selectedMission.xpReward);
        setTotalSatsEarned(prev => prev + selectedMission.btcRewardSats);

        setTerminalHistory(prev => [
          ...prev,
          `[OSINT SUCCESS] Mission "${selectedMission.title}" complétée avec succès !`,
          `+${selectedMission.btcRewardSats} Satoshis Bitcoin versés | +${selectedMission.xpReward} XP Cyber-Synaptique.`
        ]);
      }
    } else {
      sound.playEmpExplosion();
      setMissionFeedback({
        status: 'error',
        message: customError || 'ÉCHEC // Syntaxe ou outil incorrect. Analysez les indices ou consultez le guide MaxIntel.'
      });
    }
  };

  // Handle Terminal Commands
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    sound.playLoot();

    const lower = cmd.toLowerCase();
    let response = '';

    if (lower === 'help') {
      response = 'Commandes disponibles : dork <cible>, sherlock <pseudo>, geoint <lieu>, btc <adresse>, targets, missions, clear';
    } else if (lower === 'clear') {
      setTerminalHistory(['MAXINTEL OSINT FRAMEWORK v4.2 [https://maxintel.org/]']);
      return;
    } else if (lower === 'targets') {
      response = 'Cibles sous mandat OSINT : Viktor Vance, Thirty3, Commandant Drouin, ARES-9, Seigneur Abaddon.';
    } else if (lower === 'missions') {
      response = `Missions terminées : ${completedMissions.length}/${OSINT_ACADEMY_MISSIONS.length}. Rendez-vous dans l'onglet "Missions Pratiques" pour pratiquer.`;
    } else if (lower.startsWith('dork')) {
      response = `[GOOGLE DORKING SIMULATOR] Analyse de la requête pour "${cmd.replace('dork', '').trim()}"... 3 documents PDF confidentiels découverts sur les serveurs de Vance Corp !`;
    } else if (lower.startsWith('sherlock')) {
      response = `[SHERLOCK SOCMINT] Balayage de 400+ réseaux sociaux... Alias repéré sur GitHub, ProtonMail, et Mastodon Underground MTL.`;
    } else if (lower.startsWith('geoint')) {
      response = `[GEOINT SUNCALC] Calcul d’ombre et azimut... Emplacement confirmé : Belvédère Kondiaronk, Mont-Royal (45.5048° N, 73.5872° W).`;
    } else if (lower.startsWith('btc')) {
      response = `[BLOCKCHAIN MEMPOOL] Transaction repérée dans le bloc #834920 ! Montant : 5.40 BTC transférés depuis Vance Holdings.`;
    } else {
      response = `Commande exécutée : "${cmd}". Résultat transmis à la matrice Sophia AI pour corrélation.`;
    }

    setTerminalHistory(prev => [...prev, `> ${cmd}`, response]);
  };

  return (
    <div className={`flex flex-col h-full w-full bg-[#050811] text-gray-200 font-mono select-none overflow-hidden ${isStandalone ? 'p-4' : ''}`}>
      
      {/* Top Banner: MaxIntel Brand & Header */}
      <div className="bg-gradient-to-r from-[#0a1226] via-[#091522] to-[#0a1226] p-4 border-b border-[#00f3ff44] flex flex-wrap items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00f3ff15] border border-[#00f3ff] flex items-center justify-center text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Search className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-black text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#38bdf8] to-[#00ff41]">
                MAXINTEL // OSINT ACADEMY & CHARACTER RECON
              </h1>
              <span className="px-2 py-0.5 text-[10px] bg-[#00f3ff22] border border-[#00f3ff55] text-[#00f3ff] font-bold rounded">
                v4.2 LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-2">
              <span>Méthodologie officielle d'investigation en sources ouvertes • </span>
              <a 
                href={MAXINTEL_FRAMEWORK_INFO.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-[#00f3ff] hover:underline flex items-center gap-1 font-bold"
              >
                <span>maxintel.org</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Global Progress & Rewards Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0b1424] border border-[#00ff4144] rounded-lg flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00ff41]" />
            <span className="text-xs font-orbitron font-bold text-white">
              {completedMissions.length}/{OSINT_ACADEMY_MISSIONS.length} MISSIONS
            </span>
          </div>

          <a
            href={MAXINTEL_FRAMEWORK_INFO.url}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] font-orbitron font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,243,255,0.2)] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>OUVRIR MAXINTEL.ORG</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[#080d1a] border-b border-white/10 overflow-x-auto shrink-0">
        <button
          onClick={() => { sound.playLoot(); setActiveTab('missions'); }}
          className={`px-3.5 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'missions'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_12px_rgba(0,243,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>1. Missions Pratiques ({completedMissions.length}/{OSINT_ACADEMY_MISSIONS.length})</span>
        </button>

        <button
          onClick={() => { sound.playLoot(); setActiveTab('targets'); }}
          className={`px-3.5 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'targets'
              ? 'bg-[#f59e0b] text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Dossiers Cibles du Jeu ({GAME_CHARACTER_DOSSIERS.length})</span>
        </button>

        <button
          onClick={() => { sound.playLoot(); setActiveTab('methodologies'); }}
          className={`px-3.5 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'methodologies'
              ? 'bg-[#38bdf8] text-black shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>3. Piliers Méthodologiques MaxIntel</span>
        </button>

        <button
          onClick={() => { sound.playLoot(); setActiveTab('tools'); }}
          className={`px-3.5 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tools'
              ? 'bg-[#00ff41] text-black shadow-[0_0_12px_rgba(0,255,65,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>4. Outils & Dorks Indexés ({OSINT_TOOLS_CATALOG.length})</span>
        </button>

        <button
          onClick={() => { sound.playLoot(); setActiveTab('terminal'); }}
          className={`px-3.5 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'terminal'
              ? 'bg-[#ff00ff] text-black shadow-[0_0_12px_rgba(255,0,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>5. Simulateur Terminal OSINT</span>
        </button>
      </div>

      {/* Main Tab Content Display */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* TAB 1: MISSIONS PRATIQUES (INTERACTIVE OSINT CHALLENGES) */}
        {activeTab === 'missions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
            {/* Left: Missions List Selection */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="p-2.5 bg-[#091122] border border-[#00f3ff33] rounded-lg flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase">
                  EXERCICES D'INVESTIGATION OSINT
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Gagnez des Satoshis & Débloquez les Secrets
                </span>
              </div>

              <div className="space-y-2">
                {OSINT_ACADEMY_MISSIONS.map(mission => {
                  const isDone = completedMissions.includes(mission.id);
                  const isSelected = selectedMission.id === mission.id;
                  return (
                    <button
                      key={mission.id}
                      onClick={() => {
                        sound.playLoot();
                        setSelectedMissionId(mission.id);
                        setUserQueryInput('');
                        setMissionFeedback({ status: 'idle', message: '' });
                        setShowHint(false);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#00f3ff15] border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                          : 'bg-[#090e1c] border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-orbitron font-bold text-white">
                            {mission.title}
                          </span>
                          {isDone ? (
                            <span className="px-1.5 py-0.5 text-[9px] bg-[#00ff4122] border border-[#00ff41] text-[#00ff41] rounded font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              RÉSOLU
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 border border-amber-500 text-amber-300 rounded font-bold">
                              EN ATTENTE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Cible : <span className="text-[#00f3ff] font-bold">{mission.targetName}</span> • Catégorie : <span className="text-gray-300">{mission.category}</span>
                        </p>
                      </div>

                      <div className="text-right text-[10px] font-mono text-[#ffaa00] shrink-0 font-bold">
                        +{mission.btcRewardSats} sats
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Mission Workspace & Input */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 bg-[#091122] border border-[#00f3ff44] rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <span className="text-[10px] font-orbitron text-[#00f3ff] uppercase block">
                      MISSION D'INVESTIGATION ACTIVE
                    </span>
                    <h2 className="text-base font-orbitron font-black text-white">
                      {selectedMission.title}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-orbitron font-bold bg-[#00f3ff15] border border-[#00f3ff] text-[#00f3ff] rounded">
                    {selectedMission.category}
                  </span>
                </div>

                {/* Scenario Description */}
                <div className="p-3 bg-[#060a16] border border-white/10 rounded text-xs text-gray-300 leading-relaxed">
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5 text-xs text-[#00f3ff]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    SCÉNARIO TACTIQUE :
                  </p>
                  {selectedMission.promptScenario}
                </div>

                {/* Clues */}
                <div className="space-y-1">
                  <span className="text-[11px] font-orbitron font-bold text-gray-400">
                    INDICES & DIRECTIVES METHODOLOGIQUES :
                  </span>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {selectedMission.clues.map((clue, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff]" />
                        <span>{clue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Input & Validation Form */}
                <form onSubmit={handleValidateMission} className="space-y-2.5 pt-2">
                  <label className="text-[11px] font-orbitron font-bold text-white block">
                    VOTRE COMMANDE OU RÉPONSE OSINT :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userQueryInput}
                      onChange={(e) => setUserQueryInput(e.target.value)}
                      placeholder={`Exemple: ${selectedMission.expectedQueryOrSolution}`}
                      className="flex-1 bg-[#060a16] border border-[#00f3ff55] rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>VALIDER</span>
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {missionFeedback.status !== 'idle' && (
                    <div className={`p-2.5 rounded border text-xs font-mono flex items-center gap-2 ${
                      missionFeedback.status === 'success'
                        ? 'bg-[#00ff4115] border-[#00ff41] text-[#00ff41]'
                        : 'bg-red-500/15 border-red-500 text-red-400'
                    }`}>
                      {missionFeedback.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{missionFeedback.message}</span>
                    </div>
                  )}

                  {/* Hint Toggle */}
                  <div className="flex items-center justify-between pt-1 text-[11px] flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowHint(h => !h)}
                        className="text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Key className="w-3 h-3" />
                        <span>{showHint ? 'Masquer l’indice MaxIntel' : 'Besoin d’aide ? Afficher l’indice'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playLoot();
                          setUserQueryInput(selectedMission.expectedQueryOrSolution);
                        }}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-mono text-[10px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 hover:border-amber-400"
                        title="Insérer automatiquement la syntaxe modèle dans le champ"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>⚡ Insérer la syntaxe exacte</span>
                      </button>
                    </div>

                    <span className="text-gray-400">
                      Récompense : <strong className="text-[#ffaa00]">+{selectedMission.btcRewardSats} sats</strong> / <strong className="text-[#00ff41]">+{selectedMission.xpReward} XP</strong>
                    </span>
                  </div>

                  {showHint && (
                    <div className="p-2.5 bg-[#0b1b2b] border border-[#38bdf855] text-xs text-[#38bdf8] rounded font-mono space-y-1">
                      <div>💡 <strong>Indice MaxIntel :</strong> {selectedMission.hint}</div>
                      <div className="text-[10px] text-gray-400">
                        Cliquez sur "⚡ Insérer la syntaxe exacte" ci-dessus si vous souhaitez tester directement.
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Unlocked Classified Report (If Completed) */}
              {isMissionCompleted && (
                <div className="p-4 bg-[#0a1818] border border-[#00ff4155] rounded-lg space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#00ff4133] pb-1.5">
                    <span className="text-xs font-orbitron font-bold text-[#00ff41] flex items-center gap-1.5">
                      <Unlock className="w-3.5 h-3.5" />
                      {selectedMission.unlockedIntelReport.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#00ff4122] text-[#00ff41] border border-[#00ff41] rounded font-bold">
                      {selectedMission.unlockedIntelReport.classification}
                    </span>
                  </div>

                  <ul className="space-y-1 text-xs text-gray-200 font-mono">
                    {selectedMission.unlockedIntelReport.content.map((line, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#00ff41] font-bold">►</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 text-[10px] text-gray-400 flex items-center justify-between border-t border-white/5">
                    <span>Explication forensique : {selectedMission.explanation}</span>
                    <a 
                      href={MAXINTEL_FRAMEWORK_INFO.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#00f3ff] hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Approfondir sur maxintel.org</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: DOSSIERS CIBLES DU JEU (TARGET PROFILES) */}
        {activeTab === 'targets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
            {/* Left Targets List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="p-2.5 bg-[#091122] border border-[#f59e0b33] rounded-lg">
                <span className="text-xs font-orbitron font-bold text-[#f59e0b] uppercase">
                  CIBLES SOUS SURVEILLANCE OSINT
                </span>
              </div>

              {GAME_CHARACTER_DOSSIERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => {
                    sound.playLoot();
                    setSelectedCharacterId(char.id);
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1 ${
                    selectedCharacter.id === char.id
                      ? 'bg-[#f59e0b15] border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-[#090e1c] border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-orbitron font-bold text-white">
                      {char.name}
                    </span>
                    <span 
                      className="text-[9px] px-1.5 py-0.5 border rounded font-bold font-orbitron"
                      style={{
                        color: char.avatarAccent,
                        borderColor: `${char.avatarAccent}55`,
                        backgroundColor: `${char.avatarAccent}15`
                      }}
                    >
                      {char.threatLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{char.role}</p>
                </button>
              ))}
            </div>

            {/* Right Character Detail Dossier */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 bg-[#091122] border border-[#f59e0b44] rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <span className="text-[10px] font-orbitron text-[#f59e0b] uppercase block">
                      FICHE DE RENSEIGNEMENT FORENSIQUE
                    </span>
                    <h2 className="text-lg font-orbitron font-black text-white">
                      {selectedCharacter.name}
                    </h2>
                    <span className="text-xs text-gray-400 font-mono">
                      {selectedCharacter.role} • {selectedCharacter.location}
                    </span>
                  </div>

                  <span 
                    className="text-xs px-3 py-1 border rounded-lg font-bold font-orbitron shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    style={{
                      color: selectedCharacter.avatarAccent,
                      borderColor: selectedCharacter.avatarAccent,
                      backgroundColor: `${selectedCharacter.avatarAccent}15`
                    }}
                  >
                    MENACE {selectedCharacter.threatLevel}
                  </span>
                </div>

                <div className="p-3 bg-[#060a16] border border-white/10 rounded text-xs text-gray-300 leading-relaxed">
                  {selectedCharacter.profileSummary}
                </div>

                {/* Digital Footprints Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#080e1c] border border-white/10 rounded space-y-1">
                    <span className="text-[10px] font-orbitron font-bold text-[#00f3ff] uppercase block">
                      EMAILS & IDENTIFIANTS
                    </span>
                    {selectedCharacter.digitalFootprints.emails.map((e, idx) => (
                      <div key={idx} className="text-gray-300 font-mono">{e}</div>
                    ))}
                    <div className="text-gray-400 text-[10px] mt-1">
                      Handles : {selectedCharacter.digitalFootprints.handles.join(', ')}
                    </div>
                  </div>

                  <div className="p-3 bg-[#080e1c] border border-white/10 rounded space-y-1">
                    <span className="text-[10px] font-orbitron font-bold text-[#ffaa00] uppercase block">
                      PORTEFEUILLES CRYPTO & IPS
                    </span>
                    {selectedCharacter.digitalFootprints.cryptoWallets.map((w, idx) => (
                      <div key={idx} className="text-gray-300 font-mono text-[10px] truncate">{w}</div>
                    ))}
                    <div className="text-gray-400 text-[10px] mt-1">
                      IPs : {selectedCharacter.digitalFootprints.ips.join(', ')}
                    </div>
                  </div>
                </div>

                {/* OSINT Techniques for this Target */}
                <div className="p-3 bg-[#080e1c] border border-[#f59e0b33] rounded space-y-1.5">
                  <span className="text-[11px] font-orbitron font-bold text-[#f59e0b] uppercase flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    TECHNIQUES MAXINTEL RECOMMANDÉES POUR CE PERSONNAGE :
                  </span>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {selectedCharacter.osintTechniquesGuide.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#f59e0b] font-bold">►</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerabilities */}
                <div className="p-3 bg-[#150a0a] border border-red-500/30 rounded space-y-1">
                  <span className="text-[11px] font-orbitron font-bold text-red-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    VULNÉRABILITÉS EXPLOITABLES EN COMBAT & ENQUÊTE :
                  </span>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {selectedCharacter.vulnerabilities.map((v, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">✖</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PILIERS MÉTHODOLOGIQUES MAXINTEL */}
        {activeTab === 'methodologies' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#091122] border border-[#38bdf844] rounded-lg">
              <h2 className="text-base font-orbitron font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38bdf8]" />
                LES 6 GRANDS PILIERS DE L’OSINT MODERNE (MAXINTEL.ORG)
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1">
                L’OSINT (Open Source Intelligence) repose sur la collecte, l’analyse et la corrélation rigoureuse de données accessibles publiquement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MAXINTEL_FRAMEWORK_INFO.coreMethodologies.map((meth, idx) => (
                <div key={idx} className="p-3.5 bg-[#090e1c] border border-white/10 rounded-lg space-y-2 hover:border-[#38bdf855] transition-all">
                  <h3 className="font-orbitron font-bold text-xs text-[#38bdf8]">
                    {meth.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-mono">
                    {meth.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#081524] border border-[#00f3ff33] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-orbitron font-bold text-white block">
                  Envie de devenir un expert OSINT certifié ?
                </span>
                <span className="text-[11px] text-gray-400">
                  Consultez les guides complets, outils et tutoriels sur la plateforme officielle.
                </span>
              </div>
              <a
                href={MAXINTEL_FRAMEWORK_INFO.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#00f3ff] text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer hover:bg-[#00f3ff]/90 transition-all flex items-center gap-1.5"
              >
                <span>VISITER MAXINTEL.ORG</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: OUTILS & DORKS INDEXÉS */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#091122] border border-[#00ff4144] rounded-lg flex items-center justify-between">
              <div>
                <h2 className="text-base font-orbitron font-black text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#00ff41]" />
                  ARSENAL FORENSIQUE & REQUÊTES TYPES
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Répertoire des commandes et outils utilisés par les enquêteurs et hackers éthiques.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OSINT_TOOLS_CATALOG.map(tool => (
                <div key={tool.id} className="p-3.5 bg-[#090e1c] border border-white/10 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-xs text-[#00ff41] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      {tool.name}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded font-bold">
                      {tool.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-mono">
                    {tool.description}
                  </p>

                  <div className="p-2 bg-[#040810] border border-[#00ff4133] rounded font-mono text-[11px] text-[#00ff41] break-all">
                    $ {tool.commandExample}
                  </div>

                  {tool.realWorldUrl && (
                    <a
                      href={tool.realWorldUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#38bdf8] hover:underline flex items-center gap-1 font-bold pt-1"
                    >
                      <span>Documentation officielle & Dépôt</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SIMULATEUR TERMINAL OSINT */}
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="p-3 bg-[#091122] border border-[#ff00ff44] rounded-lg flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#ff00ff]" />
                <span className="font-orbitron font-bold text-xs text-white uppercase">
                  CONSOLE TACTIQUE MAXINTEL & CORRELATION DE DONNEES
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Tapez "help" ou "targets" pour tester vos commandes
              </span>
            </div>

            {/* Terminal Window Box */}
            <div className="flex-1 bg-[#03060d] border border-[#ff00ff33] rounded-lg p-3 font-mono text-xs overflow-y-auto space-y-1.5 shadow-inner">
              {terminalHistory.map((line, idx) => (
                <div 
                  key={idx} 
                  className={line.startsWith('>') ? 'text-[#00f3ff] font-bold' : line.includes('SUCCESS') ? 'text-[#00ff41]' : 'text-gray-300'}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Terminal Command Input Form */}
            <form onSubmit={handleTerminalSubmit} className="flex gap-2 shrink-0">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-2.5 text-[#ff00ff] font-bold text-xs">&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Ex: dork viktor vance filetype:pdf, sherlock oracle33, geoint mont-royal..."
                  className="w-full bg-[#070b16] border border-[#ff00ff55] rounded pl-7 pr-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#ff00ff]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all shadow-[0_0_15px_rgba(255,0,255,0.4)]"
              >
                EXÉCUTER
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-[#050811] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#00ff41]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Flux MaxIntel Synchronisé</span>
          </span>
          <span>•</span>
          <span>Mandat : Investigation & Renseignement sur les Boss et Rebelles de Montréal</span>
        </div>

        <div className="flex items-center gap-2">
          {onLaunchGame && (
            <button
              onClick={() => {
                sound.playVictory();
                onLaunchGame();
              }}
              className="text-[#00f3ff] hover:underline font-bold font-orbitron cursor-pointer"
            >
              Appliquer les failles OSINT en combat ARPG →
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
