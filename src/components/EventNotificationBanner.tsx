import React from 'react';
import { WorldEvent } from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  ShoppingBag, 
  Clock, 
  Award, 
  Sparkles,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface EventNotificationBannerProps {
  event: WorldEvent | null;
  notification: { title: string; subtitle: string; type: 'start' | 'complete' | 'fail'; timestamp: number } | null;
  onOpenTrader?: () => void;
  playerNearTrader?: boolean;
}

export const EventNotificationBanner: React.FC<EventNotificationBannerProps> = ({
  event,
  notification,
  onOpenTrader,
  playerNearTrader
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-lg w-full px-4 select-none">
      
      {/* Toast Alert on Start / Conclude */}
      {notification && Date.now() - notification.timestamp < 4500 && (
        <div 
          className={`pointer-events-auto w-full p-3.5 border text-center shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md animate-bounce transition-all ${
            notification.type === 'start' 
              ? 'bg-[#11111a]/95 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : notification.type === 'complete'
                ? 'bg-[#00ff4115]/95 border-[#00ff41] text-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.4)]'
                : 'bg-[#ff004415]/95 border-[#ff0044] text-[#ff0044] shadow-[0_0_20px_rgba(255,0,68,0.4)]'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/80">
            {notification.type === 'start' ? '⚡ ÉVÉNEMENT MONDIAL EN COURS' : notification.type === 'complete' ? '★ OBJECTIF MONDIAL ACCOMPLI' : '✕ ÉVÉNEMENT ÉCHOUÉ'}
          </div>
          <div className="text-sm sm:text-base font-orbitron font-black uppercase tracking-wider text-white">
            {notification.title}
          </div>
          <div className="text-xs font-mono text-gray-300">
            {notification.subtitle}
          </div>
        </div>
      )}

      {/* Persistent Live Event Widget */}
      {event && event.status === 'active' && (
        <div 
          className="pointer-events-auto w-full bg-[#050506]/90 border border-l-4 p-3 shadow-[0_0_25px_rgba(0,0,0,0.7)] backdrop-blur-sm"
          style={{ borderLeftColor: event.accentColor, borderColor: `${event.accentColor}44` }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 border"
                style={{ borderColor: event.accentColor, color: event.accentColor, backgroundColor: `${event.accentColor}15` }}
              >
                {getIcon(event.icon)}
              </div>
              <div>
                <h4 className="text-xs font-bold font-orbitron text-white uppercase">{event.title}</h4>
                <p className="text-[10px] text-gray-400 font-mono">{event.subtitle}</p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 bg-[#11111a] px-2 py-1 border border-[#ffffff11] text-[11px] font-mono text-white">
              <Clock className="w-3.5 h-3.5 text-[#f2994a]" />
              <span className="font-bold">{Math.max(0, Math.round(event.timeRemaining))}s</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 font-sans mb-2">
            {event.objectiveText}
          </p>

          {/* Progress / Status bars */}
          {event.type === 'corporate_ambush' && (
            <div className="flex items-center justify-between text-[10px] font-mono bg-[#11111a] px-2 py-1 border border-[#ffffff11]">
              <span className="text-gray-400">Assaillants Corporatistes Restants :</span>
              <span className="text-[#ff0044] font-bold">{event.enemiesRemaining} Cibles</span>
            </div>
          )}

          {event.type === 'escaped_prisoner' && event.prisonerHp !== undefined && event.maxPrisonerHp !== undefined && (
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1 text-gray-300">
                <span>Vitalité du Résistant Évadé</span>
                <span className="text-[#00f3ff] font-bold">{event.prisonerHp} / {event.maxPrisonerHp} PV</span>
              </div>
              <div className="w-full h-1.5 bg-[#222] border border-[#ffffff11]">
                <div 
                  className="h-full bg-[#00f3ff] transition-all"
                  style={{ width: `${Math.max(0, (event.prisonerHp / event.maxPrisonerHp) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {event.type === 'wandering_trader' && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] font-mono text-gray-400">
                {playerNearTrader ? '★ Proche du Marchand (Portée Interactive)' : 'Naviguez vers l’icône de sac sur la carte'}
              </span>
              {playerNearTrader && onOpenTrader && (
                <button
                  onClick={onOpenTrader}
                  className="px-3 py-1 bg-[#f2994a] hover:bg-[#f2994a]/80 text-black font-orbitron font-bold text-[10px] uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(242,153,74,0.5)] cursor-pointer"
                >
                  <span>Ouvrir Boutique</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Rewards Preview */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#ffffff11] text-[10px] font-mono text-[#f2994a]">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>+{event.rewardNanites} Nanites // +{event.rewardExp} EXP</span>
            </div>
            {event.rewardItemRarity && (
              <span className="uppercase font-bold text-[#00f3ff]">Butin {event.rewardItemRarity}</span>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
