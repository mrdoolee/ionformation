import React from 'react';
import { ElementData } from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Atom } from 'lucide-react';

interface ModelSettingsPanelProps {
  element: ElementData;
  currentElectrons: number;
  onElectronsChange?: (newCount: number, reason: 'user_drag_out' | 'user_drag_in' | 'button' | 'auto') => void;
  onResetToNeutral?: () => void;
  onMakeStableIon: () => void;
}

const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export function formatIonSymbol(symbol: string, netCharge: number): string {
  if (netCharge === 0) return `${symbol}`;
  const abs = Math.abs(netCharge);
  const numStr = abs === 1 ? '' : String(abs).split('').map((d) => SUPERSCRIPT_DIGITS[Number(d)]).join('');
  const signChar = netCharge > 0 ? '⁺' : '⁻';
  return `${symbol}${numStr}${signChar}`;
}

export const ModelSettingsPanel: React.FC<ModelSettingsPanelProps> = ({
  element,
  currentElectrons,
  onMakeStableIon,
}) => {
  const netCharge = element.protons - currentElectrons;
  const valenceElectrons = element.defaultShells[element.defaultShells.length - 1] ?? element.protons;
  const isNobleGas = element.group === 18 || element.category === 'noble_gas';
  const currentIonSymbol = formatIonSymbol(element.symbol, netCharge);

  return (
    <div className="w-full flex flex-col text-slate-100">
      {/* Selected Element Info & Ion Formation */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base" role="img" aria-label="energy">⚡</span>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              원소 정보 및 이온 조작
            </h2>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            isNobleGas
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : element.defaultIonType === 'cation'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {isNobleGas
              ? '18족 비활성 기체 (최대 안정)'
              : element.defaultIonType === 'cation'
              ? '양이온 형성'
              : '음이온 형성'}
          </span>
        </div>

        {/* Selected Element Header Card */}
        <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border shadow-md shrink-0 ${
            isNobleGas
              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400/40'
              : 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-400/40'
          }`}>
            <span className="text-base font-black font-mono leading-none text-white">{element.symbol}</span>
            <span className={`text-[9px] mt-0.5 ${isNobleGas ? 'text-emerald-200' : 'text-indigo-200'}`}>{element.atomicNumber}번</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-base font-bold text-white truncate">{element.nameKr}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              {element.period}주기 · {element.group}족 · 원자가전자 {valenceElectrons}개
            </p>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              원자 전자배치: [{element.defaultShells.join(', ')}]
            </p>
          </div>
        </div>

        {/* Protons & Valence Electrons Stat Boxes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">양성자 수 (+)</span>
            <span className="text-sm font-bold font-mono text-rose-400">+{element.protons}개</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">원자가 전자</span>
            <span className={`text-sm font-bold font-mono ${isNobleGas ? 'text-emerald-300' : 'text-emerald-400'}`}>
              {valenceElectrons}개 {isNobleGas && '(옥텟 충족)'}
            </span>
          </div>
        </div>

        {/* Ion Action Buttons & Chemical Equation */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          {/* 1-Click Auto Make Stable Ion */}
          <button
            id="panel-make-stable-ion-btn"
            onClick={onMakeStableIon}
            className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isNobleGas
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            {isNobleGas
              ? `✨ 안정한 중성 원자 상태 (${element.symbol})`
              : `안정한 ${element.ionNameKr} 완성 (${element.ionFormula})`}
          </button>

          {/* Chemical Reaction Formula */}
          <div className={`p-1.5 rounded-xl bg-slate-950/80 border border-white/5 text-center font-mono font-bold text-xs tracking-wider ${
            isNobleGas ? 'text-emerald-300' : 'text-indigo-300'
          }`}>
            {element.reactionEquation}
          </div>
        </div>
      </div>
    </div>
  );
};
