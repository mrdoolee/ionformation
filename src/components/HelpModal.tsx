import React from 'react';
import { X, BookOpen, Atom, Zap, Flame, CheckCircle, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6 bg-slate-900/95 border border-white/10 shadow-2xl relative text-slate-100 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                이온의 형성 원리 학습 가이드
              </h2>
              <p className="text-xs text-slate-400">
                원소에서 양이온과 음이온이 만들어지는 과정을 이해해봅시다.
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

        {/* Content sections */}
        <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          {/* Section 1: Neutral Atom */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-1.5">
              <Atom className="w-4 h-4 text-emerald-400" />
              1. 중성 원자란?
            </h3>
            <p>
              원자는 중심의 <b className="text-rose-400">원자핵(+)</b>과 그 주위를 도는 <b className="text-emerald-400">전자(-)</b>로 이루어져 있습니다. 
              평소 원자는 <span className="text-emerald-300 font-semibold">양성자 수와 전자 수가 같아</span> 전기적으로 <b className="text-white">중성(0)</b>을 띱니다.
            </p>
          </div>

          {/* Section 2: Cation */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <h3 className="font-bold text-indigo-200 flex items-center gap-2 text-sm mb-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              2. 양이온(Cation)의 형성 (전자를 잃음)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                주로 <b className="text-indigo-300">금속 원소</b>(Na, K, Mg, Ca 등)가 안정해지기 위해 <b className="text-white">전자를 잃을 때</b> 형성됩니다.
              </li>
              <li>
                <span className="text-indigo-200 font-semibold">양성자 수(+) &gt; 전자 수(-)</span> 가 되어 전체적으로 <b className="text-indigo-300">(+)전하</b>를 띱니다.
              </li>
              <li>
                <b className="text-white">이름 짓는 법:</b> 원소 이름 뒤에 <b className="text-indigo-300">'이온'</b>을 붙입니다.
                <br />
                <span className="text-slate-400 text-xs">예: 나트륨 원자 → <span className="text-indigo-300 font-mono font-bold">나트륨 이온 (Na⁺)</span>, 마그네슘 원자 → <span className="text-indigo-300 font-mono font-bold">마그네슘 이온 (Mg²⁺)</span></span>
              </li>
            </ul>
          </div>

          {/* Section 3: Anion */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <h3 className="font-bold text-rose-200 flex items-center gap-2 text-sm mb-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              3. 음이온(Anion)의 형성 (전자를 얻음)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                주로 <b className="text-rose-300">비금속 원소</b>(F, Cl, O, S 등)가 가장 바깥 껍질에 8개의 전자를 채우기 위해 <b className="text-white">전자를 얻을 때</b> 형성됩니다.
              </li>
              <li>
                <span className="text-rose-200 font-semibold">양성자 수(+) &lt; 전자 수(-)</span> 가 되어 전체적으로 <b className="text-rose-300">(-)전하</b>를 띱니다.
              </li>
              <li>
                <b className="text-white">이름 짓는 법:</b> 원소 이름 뒤에 <b className="text-rose-300">'화 이온'</b>을 붙입니다. 단, '소'로 끝나면 '소'를 생략합니다.
                <br />
                <span className="text-slate-400 text-xs">
                  • 플루오린 → <span className="text-rose-300 font-mono font-bold">플루오린화 이온 (F⁻)</span>, 황 → <span className="text-rose-300 font-mono font-bold">황화 이온 (S²⁻)</span><br />
                  • 산<s className="text-rose-400">소</s> → <span className="text-rose-300 font-mono font-bold">산화 이온 (O²⁻)</span>, 염<s className="text-rose-400">소</s> → <span className="text-rose-300 font-mono font-bold">염화 이온 (Cl⁻)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Section 4: Models */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h3 className="font-bold text-purple-200 flex items-center gap-2 text-sm mb-1.5">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              4. 보어 모형 vs 러더퍼드 모형
            </h3>
            <p>
              • <b className="text-purple-300">보어 모형:</b> 전자가 특정한 에너지 준위를 가진 <b className="text-white">동심원 껍질(K, L, M 껍질)</b>을 따라 돕니다. 옥텟 규칙(가장 바깥 8개 전자)을 시각적으로 관찰하기에 가장 좋습니다.<br />
              • <b className="text-purple-300">러더퍼드 모형:</b> 원자핵 주위를 전자가 다양한 각도의 타원 궤도로 자유롭게 회전하는 모형입니다.
            </p>
          </div>

        </div>

        {/* Footer close button */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            이해했습니다! 탐구 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
