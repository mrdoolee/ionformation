import React from 'react';
import { X, Sparkles, CheckCircle2, Atom, ArrowRight, BookOpen, Lightbulb, Zap, ShieldCheck } from 'lucide-react';
import { LearningMission } from '../types';
import { sound } from '../utils/audio';

interface MissionTheoryModalProps {
  mission: LearningMission | null;
  isOpen: boolean;
  onClose: () => void;
  onNextMission?: () => void;
  hasNextMission?: boolean;
}

export const MissionTheoryModal: React.FC<MissionTheoryModalProps> = ({
  mission,
  isOpen,
  onClose,
  onNextMission,
  hasNextMission,
}) => {
  if (!isOpen || !mission) return null;

  const isCation = mission.targetCharge > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-xl w-full max-h-[92vh] overflow-y-auto rounded-2xl p-5 sm:p-6 bg-slate-900/95 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.25)] relative text-slate-100 flex flex-col gap-4">
        
        {/* Header with celebration banner */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  미션 달성 완료!
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {mission.title.split(':')[0]}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {mission.targetIonName} 형성 이론 해설
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Summary Card */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
          isCation
            ? 'bg-indigo-950/50 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
            : 'bg-rose-950/50 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Atom className="w-4 h-4 text-indigo-400" />
              형성된 이온 상태
            </span>
            <span className={`text-lg font-black font-mono px-2.5 py-0.5 rounded-lg border ${
              isCation
                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                : 'bg-rose-600/30 border-rose-400 text-rose-200'
            }`}>
              {mission.targetIonName}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
            {mission.theory.summary}
          </p>
        </div>

        {/* Theory Breakdown Grid */}
        <div className="flex flex-col gap-3 text-xs sm:text-[13px] text-slate-300">
          
          {/* Point 1: Why did electrons move? */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-1.5">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              1. 전자가 이동하는 이유 (옥텟 규칙)
            </h3>
            <p className="leading-relaxed text-slate-300">
              {mission.theory.electronMovementReason}
            </p>
          </div>

          {/* Point 2: Charge balance & Math */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-1.5">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. 양성자와 전자 수에 따른 전하 계산
            </h3>
            <p className="leading-relaxed text-slate-300">
              {mission.theory.chargeBalanceDetail}
            </p>
          </div>

          {/* Point 3: Stable noble gas configuration & Naming rule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-1">
              <h4 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                안정한 전자 배치 도달
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mission.theory.nobleGasConfiguration}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-1">
              <h4 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                이온 명명 규칙
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mission.theory.namingRule}
              </p>
            </div>
          </div>

          {/* Point 4: Chemical Reaction Equation */}
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              이온 형성 화학 반응식
            </span>
            <span className="text-base font-black font-mono text-indigo-200 tracking-wider">
              {mission.theory.reactionEquation}
            </span>
          </div>

          {/* Point 5: Key Takeaway */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-200 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span><b className="text-amber-100">핵심 정리:</b> {mission.theory.keyTakeaway}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>

          {hasNextMission && onNextMission && (
            <button
              onClick={() => {
                sound.playClick();
                onNextMission();
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>다음 미션 도전하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
