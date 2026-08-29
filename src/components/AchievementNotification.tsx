import React from 'react';
import { AchievementNotificationItem } from '../types';
import { Trophy, Sparkles, X, Award, CheckCircle2 } from 'lucide-react';

interface AchievementNotificationProps {
  notifications: AchievementNotificationItem[];
  onDismiss: (id: string) => void;
  onOpenAchievements?: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notifications,
  onDismiss,
  onOpenAchievements
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none font-chakra">
      {notifications.map((item) => {
        const { achievement } = item;
        return (
          <div
            key={item.id}
            onClick={() => {
              if (onOpenAchievements) onOpenAchievements();
              onDismiss(item.id);
            }}
            className="pointer-events-auto cursor-pointer bg-[#05050a]/95 border border-[#f59e0b] shadow-[0_0_25px_rgba(245,158,11,0.35)] p-3 sm:p-3.5 backdrop-blur-md relative overflow-hidden animate-in slide-in-from-right-10 fade-in duration-300 transition-all hover:scale-[1.02]"
          >
            {/* Top Accent Glowing Bar */}
            <div 
              className="absolute top-0 left-0 h-1 w-full"
              style={{ backgroundColor: achievement.badgeColor || '#f59e0b' }}
            />

            <div className="flex items-start gap-3">
              {/* Badge Icon Frame */}
              <div 
                className="w-11 h-11 shrink-0 rounded-xs flex items-center justify-center text-xl font-bold border relative overflow-hidden bg-black/60 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
                style={{ 
                  borderColor: achievement.badgeColor || '#f59e0b',
                  boxShadow: `0 0 12px ${achievement.badgeColor}66`
                }}
              >
                <span>{achievement.badgeIcon || '🏆'}</span>
              </div>

              {/* Info Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-[#f59e0b]" />
                    Succès Déverrouillé !
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(item.id);
                    }}
                    className="text-gray-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs sm:text-sm font-orbitron font-bold text-white tracking-wide truncate mt-0.5">
                  {achievement.title}
                </h4>

                <p className="text-[10px] sm:text-[11px] text-gray-300 font-sans line-clamp-1 mt-0.5 leading-snug">
                  {achievement.description}
                </p>

                {/* Badge title & Rewards */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span 
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 border"
                    style={{
                      borderColor: achievement.badgeColor,
                      color: achievement.badgeColor,
                      backgroundColor: `${achievement.badgeColor}15`
                    }}
                  >
                    Badge: {achievement.badgeTitle}
                  </span>

                  <span className="text-[9px] font-mono text-[#00ff41]">
                    +{achievement.rewardNanites} ⬡
                  </span>
                  <span className="text-[9px] font-mono text-[#00f3ff]">
                    +{achievement.rewardExp} EXP
                  </span>
                </div>
              </div>
            </div>

            {/* Click to open badge guide */}
            <div className="mt-1 text-[8px] font-mono text-gray-400 text-right opacity-80">
              CLIQUEZ POUR ÉQUIPER CE BADGE // [U]
            </div>
          </div>
        );
      })}
    </div>
  );
};
