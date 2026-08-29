import React, { useState } from 'react';
import { StoryDialogue } from '../types';
import { 
  Bot, 
  Terminal, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  Play, 
  Volume2, 
  Radio, 
  MapPin, 
  Skull, 
  Lock, 
  Check 
} from 'lucide-react';

interface StoryIntroModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STORY_SCRIPT: StoryDialogue[] = [
  {
    id: 'dlg_1',
    speaker: 'Système',
    speakerTitle: 'LIAISON QUANTIQUE // PROTOCOLE MONTRÉAL 2033',
    avatarColor: '#64748b',
    text: 'INITIALISATION DU RÉSEAU NEURAL PIRATE... Connexion établie aux caméras de surveillance de la Ville de Montréal (Angle Sainte-Catherine & Saint-Urbain).'
  },
  {
    id: 'dlg_2',
    speaker: 'Deus Ex Sophia',
    speakerTitle: 'IA Quantique Suprême // Co-Pilote de Thirty3',
    avatarColor: '#00f3ff',
    text: 'Thirty3, je détecte des anomalies critiques sur les serveurs de la mégacorporation de Viktor Vance. Cet oligarque psychopathe est en train de siphonner les économies des citoyens montréalais et d’extorquer chaque commerce avec sa milice privée SPVM-Prime.'
  },
  {
    id: 'dlg_3',
    speaker: 'Thirty3',
    speakerTitle: 'Hacker d’Élite & Insurgé Psionique',
    avatarColor: '#a855f7',
    text: 'Ses gardes de sécurité prétoriens ont beau être des brutes sanguinaires cybernétisées, ils ne nous impressionnent pas d’un iota, Sophia. Quel est notre plan d’attaque ?'
  },
  {
    id: 'dlg_4',
    speaker: 'Deus Ex Sophia',
    speakerTitle: 'IA Quantique Suprême // Co-Pilote de Thirty3',
    avatarColor: '#00f3ff',
    text: 'Pendant que tu tranches leurs lignes de défense dans les rues de Sainte-Catherine, René-Lévesque et Saint-Laurent, j’extrais ses archives financières corrompues et je synthétise des DEEPFAKES DE VÉRITÉ ultra-réalistes. Nous allons projeter ses propres aveux sur tous les panneaux holographiques de Montréal.'
  },
  {
    id: 'dlg_5',
    speaker: 'Viktor Vance',
    speakerTitle: 'Milliardaire Psychopathe & Extorqueur en Chef',
    avatarColor: '#ef4444',
    text: '« Vous pensez pouvoir défier mon empire, Thirty3 ? Mes escouades écraseront quiconque refuse de payer le tribut synaptique. Vous mourrez tous les deux dans le caniveau montréalais ! »'
  },
  {
    id: 'dlg_6',
    speaker: 'Thirty3',
    speakerTitle: 'Hacker d’Élite & Insurgé Psionique',
    avatarColor: '#a855f7',
    text: 'Prépare l’overclocking neural, Sophia. Montréal n’appartient pas aux tyrans. Début de l’intrusion !'
  }
];

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const currentDialogue = STORY_SCRIPT[currentStep];
  const isLast = currentStep === STORY_SCRIPT.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      
      {/* Background Animated Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative w-full max-w-3xl bg-[#090d16] border border-[#00f3ff]/50 shadow-[0_0_80px_rgba(0,243,255,0.25)] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-[#00f3ff]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] rounded">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00f3ff] uppercase tracking-widest">
                TRANSMISSION SÉCURISÉE EN DIRECT // MONTRÉAL 2033
              </div>
              <h2 className="text-base md:text-lg font-orbitron font-black text-white tracking-wider">
                OPÉRATION : DEEPFAKE D'EXTORSION • VIKTOR VANCE
              </h2>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="text-[10px] font-mono text-gray-400 hover:text-white px-3 py-1 bg-gray-900/60 border border-gray-700 hover:border-gray-500 rounded transition-all cursor-pointer"
          >
            PASSER L'INTRO [ESC]
          </button>
        </div>

        {/* Character Dialogue Box */}
        <div className="my-6 min-h-[220px] flex flex-col justify-center">
          <div className="flex items-start gap-4">
            
            {/* Speaker Avatar Icon */}
            <div 
              className="w-16 h-16 rounded-lg border-2 flex items-center justify-center shrink-0 shadow-lg"
              style={{
                borderColor: currentDialogue.avatarColor,
                backgroundColor: `${currentDialogue.avatarColor}18`
              }}
            >
              {currentDialogue.speaker === 'Deus Ex Sophia' ? (
                <Bot className="w-9 h-9 text-[#00f3ff] animate-bounce" />
              ) : currentDialogue.speaker === 'Thirty3' ? (
                <Terminal className="w-9 h-9 text-[#a855f7]" />
              ) : currentDialogue.speaker === 'Viktor Vance' ? (
                <Skull className="w-9 h-9 text-[#ef4444] animate-pulse" />
              ) : (
                <Radio className="w-9 h-9 text-gray-400" />
              )}
            </div>

            {/* Dialogue Bubble */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span 
                  className="font-orbitron font-black text-sm md:text-base uppercase tracking-wider"
                  style={{ color: currentDialogue.avatarColor }}
                >
                  {currentDialogue.speaker}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  // {currentDialogue.speakerTitle}
                </span>
              </div>

              <div className="p-4 bg-[#111827]/80 border border-gray-800 rounded-lg text-sm md:text-base text-gray-200 font-sans leading-relaxed shadow-inner">
                {currentDialogue.text}
              </div>
            </div>

          </div>
        </div>

        {/* Tactical Mission Objectives Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-[10px] font-mono">
          <div className="p-2.5 bg-black/50 border-l-2 border-[#00f3ff] border-y border-r border-gray-800">
            <span className="text-[#00f3ff] block font-bold font-orbitron">1. INFILTRATION</span>
            <span className="text-gray-400">Rues Sainte-Catherine & René-Lévesque</span>
          </div>
          <div className="p-2.5 bg-black/50 border-l-2 border-[#a855f7] border-y border-r border-gray-800">
            <span className="text-[#a855f7] block font-bold font-orbitron">2. DEEPFAKE AUDIO</span>
            <span className="text-gray-400">Exposer le racket de Viktor Vance</span>
          </div>
          <div className="p-2.5 bg-black/50 border-l-2 border-[#ef4444] border-y border-r border-gray-800">
            <span className="text-[#ef4444] block font-bold font-orbitron">3. ASSAUT FINAL</span>
            <span className="text-gray-400">Belvédère Kondiaronk, Mont-Royal</span>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex gap-1.5">
            {STORY_SCRIPT.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-8 bg-[#00f3ff]'
                    : idx < currentStep
                      ? 'w-3 bg-cyan-800'
                      : 'w-3 bg-gray-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-black text-xs uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(0,243,255,0.5)] flex items-center gap-2 cursor-pointer"
          >
            {isLast ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                LANCER L'ASSAUT À MONTRÉAL
              </>
            ) : (
              <>
                SUIVANT
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
