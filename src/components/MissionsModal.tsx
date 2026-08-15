import React from 'react';
import { LearningMission, SupportedElementSymbol } from '../types';
import { sound } from '../utils/audio';
import { Trophy, CheckCircle2, Circle, ArrowRight, Sparkles, X, Lightbulb } from 'lucide-react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: LearningMission[];
  currentElementSymbol: string;
  currentElectrons: number;
  onSelectMission: (mission: LearningMission) => void;
  onViewTheory?: (mission: LearningMission) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onSelectMission,
  onViewTheory,
}) => {
  if (!isOpen) return null;

  const completedCount = missions.filter((m) => m.completed).length;
  const progressPercent = (completedCount / missions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-5 sm:p-6 bg-slate-900/95 border border-white/10 shadow-2xl relative text-slate-100 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                이온 형성 탐구 미션 & 챌린지
              </h2>
              <p className="text-xs text-slate-400">
                미션을 선택하고 시뮬레이션에서 전자를 직접 옮겨 완성해보세요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              학습 달성도
            </span>
            <span className="font-mono font-bold text-indigo-300">
              {completedCount} / {missions.length} 완료 ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Missions List */}
        <div className="flex flex-col gap-2.5">
          {missions.map((mission) => (
            <div
              key={mission.id}
              onClick={() => {
                sound.playClick();
                onSelectMission(mission);
                onClose();
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                mission.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {mission.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-white">{mission.title}</h3>
                    <span className="text-xs font-mono font-semibold text-indigo-300">
                      목표: {mission.targetIonName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {mission.completed && onViewTheory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onViewTheory(mission);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-[11px] text-emerald-200 font-semibold transition-colors cursor-pointer"
                    >
                      이론 해설 📖
                    </button>
                  )}
                  <button className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white flex items-center gap-1 font-medium transition-colors cursor-pointer shadow-sm">
                    {mission.completed ? '다시 도전' : '도전'} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-7">
                {mission.instruction}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-indigo-200/90 pl-7 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                <Lightbulb className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span><b>힌트:</b> {mission.hint}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 text-xs font-medium cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
