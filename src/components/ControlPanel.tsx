import React from 'react';
import { ElementData, ElementSymbol, ModelType } from '../types';
import { PeriodicTable } from './PeriodicTable';
import { sound } from '../utils/audio';
import {
  Zap,
  Flame,
  RotateCcw,
  Sparkles,
  Sliders,
  Play,
  Pause,
  Layers,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ControlPanelProps {
  element: ElementData;
  currentElectrons: number;
  modelType: ModelType;
  animSpeed: number;
  isPaused: boolean;
  onSelectElement: (symbol: ElementSymbol) => void;
  onModelChange: (model: ModelType) => void;
  onSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onElectronsChange: (newCount: number, reason: 'user_drag_out' | 'user_drag_in' | 'button' | 'auto') => void;
  onResetToNeutral: () => void;
  onMakeStableIon: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  element,
  currentElectrons,
  modelType,
  animSpeed,
  isPaused,
  onSelectElement,
  onModelChange,
  onSpeedChange,
  onTogglePause,
  onElectronsChange,
  onResetToNeutral,
  onMakeStableIon,
}) => {
  const netCharge = element.protons - currentElectrons;
  const isCation = netCharge > 0;
  const isAnion = netCharge < 0;
  const isNeutral = netCharge === 0;
  const isStable = netCharge === element.stableCharge;

  const handleAddElectron = () => {
    sound.playElectronGained();
    onElectronsChange(currentElectrons + 1, 'button');
  };

  const handleRemoveElectron = () => {
    sound.playElectronLost();
    onElectronsChange(Math.max(0, currentElectrons - 1), 'button');
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-100">
      
      {/* 1. Periodic Table & Element Selector Section */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col gap-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            원소 선택 (주기율표)
          </h2>
          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">대상: 중2 과학</span>
        </div>

        <PeriodicTable
          selectedSymbol={element.symbol}
          onSelectElement={onSelectElement}
        />
      </section>

      {/* 2. Model Settings & Current Element Status Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col gap-4 shadow-xl relative overflow-hidden">
        {/* Subtle background aura */}
        <div
          className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isCation ? 'bg-indigo-500' : isAnion ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />

        {/* Model Setting Segmented Control */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2.5">
            원자 모형 설정
          </h2>
          <div className="flex bg-slate-800/60 rounded-xl p-1 border border-white/10">
            <button
              id="model-bohr-btn"
              onClick={() => {
                sound.playClick();
                onModelChange('bohr');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modelType === 'bohr'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              보어 모형
            </button>
            <button
              id="model-rutherford-btn"
              onClick={() => {
                sound.playClick();
                onModelChange('rutherford');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modelType === 'rutherford'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              러더퍼드 모형
            </button>
          </div>
        </div>

        {/* Element Info & Numbers */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">{element.symbol}</span>
              <span className="text-sm text-indigo-300 font-medium">{element.nameKr} ({element.nameEn})</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
              {element.period}주기 {element.group}족
            </span>
          </div>

          <div className="h-px bg-white/10 w-full" />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[11px]">원자 번호 / 양성자(+)</span>
              <span className="text-lg font-bold font-mono text-white">+{element.protons}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[11px]">현재 전자 수(-)</span>
              <span className="text-lg font-bold font-mono text-emerald-400">-{currentElectrons}</span>
            </div>
          </div>
        </div>

        {/* Charge Calculation & Visual Balance */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">전하 균형:</span>
            <span className="font-mono font-bold text-slate-200">
              (+{element.protons}) + (-{currentElectrons}) ={' '}
              <span
                className={`text-sm ${
                  isCation ? 'text-indigo-300 font-black' : isAnion ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'
                }`}
              >
                {netCharge > 0 ? `+${netCharge}` : netCharge}
              </span>
            </span>
          </div>

          {/* Visual Balance Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="bg-indigo-500 transition-all duration-300"
              style={{
                width: `${(element.protons / Math.max(1, element.protons + currentElectrons)) * 100}%`,
              }}
              title={`양성자 +${element.protons}`}
            />
            <div
              className="bg-emerald-400 transition-all duration-300"
              style={{
                width: `${(currentElectrons / Math.max(1, element.protons + currentElectrons)) * 100}%`,
              }}
              title={`전자 -${currentElectrons}`}
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">현재 상태:</span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${
                isNeutral
                  ? 'text-emerald-400'
                  : isStable
                  ? 'text-indigo-300'
                  : 'text-amber-300'
              }`}
            >
              {isNeutral ? (
                <>안정적인 중성 원자 상태 (전하 ±0)</>
              ) : isStable ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  안정한 {element.ionNameKr} ({element.ionFormula})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  불안정한 상태 ({netCharge > 0 ? `+${netCharge}` : netCharge})
                </>
              )}
            </span>
          </div>
        </div>

        {/* Animation Speed & Play/Pause */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-xs">
          <button
            id="toggle-pause-btn"
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 cursor-pointer transition-all"
            title={isPaused ? '회전 재생' : '회전 일시정지'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">회전 속도:</span>
            <input
              id="orbit-speed-slider"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={animSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-300 w-8">{animSpeed.toFixed(1)}x</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Ionization Controls Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col gap-3 shadow-xl">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          이온 조작 & 실험 컨트롤
        </h2>

        {/* 1-Click Auto Make Stable Ion */}
        <button
          id="make-stable-ion-btn"
          onClick={onMakeStableIon}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          안정한 {element.ionNameKr} 만들기 ({element.ionFormula})
        </button>

        {/* Manual Step Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="remove-electron-btn"
            onClick={handleRemoveElectron}
            disabled={currentElectrons <= 0}
            className="py-2 px-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 hover:bg-indigo-500/25 hover:border-indigo-400/60 text-indigo-200 text-xs font-semibold active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            - 전자 잃음 (양이온)
          </button>

          <button
            id="add-electron-btn"
            onClick={handleAddElectron}
            disabled={currentElectrons >= 24}
            className="py-2 px-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 hover:bg-rose-500/25 hover:border-rose-400/60 text-rose-200 text-xs font-semibold active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            + 전자 얻음 (음이온)
          </button>
        </div>

        {/* Chemical Reaction Equation */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center font-mono font-bold text-xs text-indigo-300 tracking-wide mt-1">
          {element.reactionEquation}
        </div>
      </section>

      {/* 4. Sleek Callout Help Tip */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs leading-relaxed">
        <p className="text-indigo-200">
          💡 <span className="font-bold">도움말:</span> 가장 바깥쪽 껍질의 전자를 드래그하여 원자 밖으로 이동시키면 양이온이 형성되며, 자유 전자를 안으로 끌어오면 음이온이 형성됩니다.
        </p>
      </div>

    </div>
  );
};
