import React, { useState, useEffect } from 'react';
import { CodexEntry, CodexCategory } from '../types';
import { 
  X, 
  BookOpen, 
  Search, 
  Lock, 
  Radio, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Cpu, 
  Anchor, 
  Mountain, 
  Maximize2, 
  Building, 
  User, 
  Sword, 
  Crosshair, 
  Shield, 
  Flame, 
  Zap, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  Terminal,
  FileText
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CodexEntry[];
  currentStageId: number;
  onSelectStage?: (stageId: number) => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentStageId,
  onSelectStage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CodexCategory | 'all'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?.id || 'bastion_stage_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudioLog, setIsPlayingAudioLog] = useState(false);
  const [audioLogTimer, setAudioLogTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      soundEngine.playCodexOpen();
    } else {
      if (audioLogTimer) clearTimeout(audioLogTimer);
      setIsPlayingAudioLog(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || filteredEntries[0] || entries[0];
  const unlockedCount = entries.filter((e) => e.unlocked).length;
  const progressPercent = Math.round((unlockedCount / entries.length) * 100);

  const getCategoryIcon = (cat: CodexCategory) => {
    switch (cat) {
      case 'bastions': return <Building className="w-4 h-4 text-[#00f3ff]" />;
      case 'factions': return <User className="w-4 h-4 text-[#ff00ff]" />;
      case 'technologies': return <Cpu className="w-4 h-4 text-[#f2994a]" />;
      case 'targets': return <Crosshair className="w-4 h-4 text-[#ef4444]" />;
    }
  };

  const getEntryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Anchor': return <Anchor className="w-5 h-5" />;
      case 'Maximize2': return <Maximize2 className="w-5 h-5" />;
      case 'Mountain': return <Mountain className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'User': return <User className="w-5 h-5" />;
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Sword': return <Sword className="w-5 h-5" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handlePlayAudioLog = () => {
    if (isPlayingAudioLog) {
      if (audioLogTimer) clearTimeout(audioLogTimer);
      setIsPlayingAudioLog(false);
    } else {
      setIsPlayingAudioLog(true);
      soundEngine.playAudioLogBeep();
      const timer = setTimeout(() => {
        setIsPlayingAudioLog(false);
      }, 7000);
      setAudioLogTimer(timer);
    }
  };

  const handleSelectEntry = (entry: CodexEntry) => {
    setSelectedEntryId(entry.id);
    if (audioLogTimer) clearTimeout(audioLogTimer);
    setIsPlayingAudioLog(false);
    soundEngine.playCodexDecrypt();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050508] border border-[#00f3ff] w-full max-w-6xl h-[88vh] max-h-[850px] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.25)] overflow-hidden relative">
        {/* Top Cyber Line Indicator */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#f2994a]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#00f3ff33] bg-[#0c0d14] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f3ff1a] border border-[#00f3ff44] text-[#00f3ff]">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                  ARCHIVES DU CODEX // MONTRÉAL 2033
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff44] hidden sm:inline">
                  CONFIDENTIALITÉ NIVEAU 4
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Rapports de renseignement, dossiers de bastions urbains et histoire de la dystopie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress pill */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-mono text-gray-400">
                DÉCRYPTAGE TOTAL : <span className="text-[#00f3ff] font-bold">{unlockedCount} / {entries.length} ({progressPercent}%)</span>
              </span>
              <div className="w-32 h-1.5 bg-[#1a1a24] border border-[#ffffff11] mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1a24] transition-colors border border-transparent hover:border-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-cyber-radial">
          {/* LEFT COLUMN: Filters & Entry List (4 cols) */}
          <div className="md:col-span-5 border-r border-[#ffffff15] flex flex-col bg-[#08090f] overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-[#ffffff10] bg-[#0c0d14]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans le Codex..."
                  className="w-full bg-[#141520] border border-[#ffffff20] pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00f3ff] font-mono"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="p-2 border-b border-[#ffffff10] flex flex-wrap gap-1 bg-[#090a12]">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'bastions', label: 'Bastions (4)' },
                { id: 'factions', label: 'Factions' },
                { id: 'technologies', label: 'Tech & Psi' },
                { id: 'targets', label: 'Cibles' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1 text-[10px] font-orbitron font-bold transition-all uppercase cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                      : 'bg-[#12131d] text-gray-400 hover:text-white border border-[#ffffff11]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredEntries.map((entry) => {
                const isSelected = entry.id === selectedEntry.id;
                const isLocked = !entry.unlocked;

                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`w-full text-left p-2.5 border transition-all flex items-start gap-2.5 cursor-pointer relative group ${
                      isSelected 
                        ? 'bg-[#141829] border-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.2)]' 
                        : isLocked 
                          ? 'bg-[#0a0b12] border-white/5 opacity-60 hover:opacity-80' 
                          : 'bg-[#0d0e17] border-white/10 hover:border-white/25 hover:bg-[#121422]'
                    }`}
                  >
                    {/* Left Accent Strip */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: isLocked ? '#475569' : entry.bannerAccent }}
                    />

                    {/* Icon container */}
                    <div 
                      className="p-1.5 border mt-0.5 shrink-0"
                      style={{ 
                        borderColor: isLocked ? '#334155' : `${entry.bannerAccent}44`,
                        backgroundColor: isLocked ? '#0f172a' : `${entry.bannerAccent}15`,
                        color: isLocked ? '#64748b' : entry.bannerAccent
                      }}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : getEntryIcon(entry.iconName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          {getCategoryIcon(entry.category)}
                          {entry.category}
                        </span>
                        {entry.unlocked ? (
                          <span className="text-[9px] font-mono text-[#00ff41] flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> DÉCRYPTÉ
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-red-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> VERROUILLÉ
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-orbitron font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {entry.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate font-mono">
                        {entry.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredEntries.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-mono text-xs">
                  Aucun dossier trouvé pour cette recherche.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Lore Dossier Details (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-[#07080e] overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
            {selectedEntry ? (
              <div className="space-y-5">
                {/* Dossier Header Card */}
                <div 
                  className="p-4 sm:p-5 border relative overflow-hidden bg-[#0c0e18]"
                  style={{ borderColor: `${selectedEntry.bannerAccent}55` }}
                >
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle, ${selectedEntry.bannerAccent} 0%, transparent 70%)` 
                    }}
                  />

                  {/* Header Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 text-[10px] font-orbitron font-bold uppercase border"
                        style={{ 
                          borderColor: selectedEntry.bannerAccent, 
                          color: selectedEntry.bannerAccent,
                          backgroundColor: `${selectedEntry.bannerAccent}15`
                        }}
                      >
                        CLEARANCE NIVEAU {selectedEntry.clearanceLevel}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {selectedEntry.date}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00f3ff]" />
                      <span className="truncate max-w-[200px]">{selectedEntry.location}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex items-start gap-3.5">
                    <div 
                      className="p-3 border shrink-0 hidden sm:block"
                      style={{ 
                        borderColor: selectedEntry.bannerAccent,
                        backgroundColor: `${selectedEntry.bannerAccent}20`,
                        color: selectedEntry.bannerAccent,
                        boxShadow: `0 0 15px ${selectedEntry.bannerAccent}33`
                      }}
                    >
                      {getEntryIcon(selectedEntry.iconName)}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white tracking-wide">
                        {selectedEntry.title}
                      </h3>
                      <p className="text-xs text-[#00f3ff] font-mono mt-0.5">
                        {selectedEntry.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="mt-4 p-3 bg-[#05060a] border border-white/10 text-xs font-sans text-gray-300 leading-relaxed italic border-l-2" style={{ borderLeftColor: selectedEntry.bannerAccent }}>
                    "{selectedEntry.summary}"
                  </div>
                </div>

                {/* Locked Notification if applicable */}
                {!selectedEntry.unlocked ? (
                  <div className="p-4 bg-[#18090f] border border-red-500/40 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-red-400 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-orbitron font-bold text-red-400 uppercase">
                        DOSSIER VERROUILLÉ // RESTRICTION PROTOCOLE OMNICORP
                      </h4>
                      <p className="text-[11px] text-gray-300 font-mono mt-0.5">
                        Condition de déblocage : <span className="text-white font-bold">{selectedEntry.unlockRequirement}</span>
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Audio Log Transcript & Player */}
                {selectedEntry.audioLogTranscript && (
                  <div className="p-4 bg-[#0a0c16] border border-[#00f3ff33] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#00f3ff] animate-pulse" />
                        <span className="text-xs font-orbitron font-bold text-white tracking-wider uppercase">
                          INTERCEPTION AUDIO TRANSMISSION
                        </span>
                      </div>
                      <button
                        onClick={handlePlayAudioLog}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-orbitron font-bold transition-all border cursor-pointer ${
                          isPlayingAudioLog 
                            ? 'bg-[#ff0055] text-white border-[#ff0055] shadow-[0_0_12px_rgba(255,0,85,0.5)] animate-pulse' 
                            : 'bg-[#00f3ff20] text-[#00f3ff] border-[#00f3ff] hover:bg-[#00f3ff] hover:text-black'
                        }`}
                      >
                        {isPlayingAudioLog ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{isPlayingAudioLog ? 'LECTURE EN COURS...' : 'ÉCOUTER TRANSMISSION'}</span>
                      </button>
                    </div>

                    {/* Frequency Wave Visualizer Animation */}
                    {isPlayingAudioLog && (
                      <div className="flex items-center gap-1 h-6 my-2 bg-[#05060b] px-3 py-1 border border-[#00f3ff33]">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-[#00f3ff] transition-all"
                            style={{
                              height: `${Math.max(15, Math.sin(Date.now() * 0.01 + i) * 100)}%`,
                              opacity: 0.6 + Math.random() * 0.4
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-xs font-mono text-[#00f3ff] bg-[#05060a] p-3 border border-[#00f3ff22] leading-relaxed">
                      {selectedEntry.audioLogTranscript}
                    </p>
                  </div>
                )}

                {/* Detailed Lore Content Paragraphs */}
                <div className="space-y-3 bg-[#0a0c16] p-4 sm:p-5 border border-white/10">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Terminal className="w-4 h-4 text-[#00f3ff]" />
                    <h4 className="text-xs font-orbitron font-bold text-white tracking-wider uppercase">
                      RAPPORT D'ENQUÊTE & HISTOIRE DU MONDE
                    </h4>
                  </div>
                  {selectedEntry.content.map((paragraph, idx) => (
                    <p key={idx} className="text-xs text-gray-300 font-sans leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Tactical Schematics & Notes */}
                {selectedEntry.tacticalNotes && selectedEntry.tacticalNotes.length > 0 && (
                  <div className="p-4 bg-[#0d0a14] border border-[#f2994a44]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Crosshair className="w-4 h-4 text-[#f2994a]" />
                      <h4 className="text-xs font-orbitron font-bold text-[#f2994a] tracking-wider uppercase">
                        NOTES TACTIQUES DE COMBAT // ANALYSE DE LA FAILLE
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {selectedEntry.tacticalNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-300 font-mono flex items-start gap-2">
                          <span className="text-[#f2994a] font-bold">▶</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action button: Quick-Jump to Stage */}
                {selectedEntry.stageId && onSelectStage && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectStage(selectedEntry.stageId!);
                      }}
                      className="px-4 py-2 bg-[#00f3ff22] hover:bg-[#00f3ff] text-[#00f3ff] hover:text-black border border-[#00f3ff] font-orbitron font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>SÉLECTIONNER LE STAGE {selectedEntry.stageId}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono">
                <BookOpen className="w-12 h-12 mb-2 opacity-30" />
                <p>Sélectionnez une entrée du Codex pour consulter le rapport.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
