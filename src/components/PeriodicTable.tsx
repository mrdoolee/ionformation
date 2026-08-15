import React from 'react';
import { ELEMENTS_DATA, PERIODIC_GRID, PRIMARY_ELEMENT_SYMBOLS } from '../data/elements';
import { ElementSymbol, SupportedElementSymbol } from '../types';
import { sound } from '../utils/audio';

interface PeriodicTableProps {
  selectedSymbol: ElementSymbol;
  onSelectElement: (symbol: ElementSymbol) => void;
}

const GROUP_LABELS = ['1', '2', '13', '14', '15', '16', '17', '18'];

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  selectedSymbol,
  onSelectElement,
}) => {
  const handleSelect = (symbol: ElementSymbol) => {
    sound.playClick();
    onSelectElement(symbol);
  };

  const getElementStyle = (data: typeof ELEMENTS_DATA[ElementSymbol]) => {
    const isSelected = data.symbol === selectedSymbol;
    const isCurriculum = PRIMARY_ELEMENT_SYMBOLS.includes(data.symbol as SupportedElementSymbol);

    let bgClass = 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-500';

    if (data.defaultIonType === 'cation' && data.category !== 'noble_gas') {
      bgClass = isSelected
        ? 'border-2 border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_12px_rgba(52,211,153,0.5)] scale-[1.04] z-10'
        : 'border border-indigo-400/40 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200';
    } else if (data.defaultIonType === 'anion') {
      bgClass = isSelected
        ? 'border-2 border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_12px_rgba(52,211,153,0.5)] scale-[1.04] z-10'
        : 'border border-rose-400/40 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200';
    } else if (data.category === 'noble_gas') {
      bgClass = isSelected
        ? 'border-2 border-purple-400 bg-purple-600/30 text-purple-100 ring-1 ring-purple-400 z-10'
        : 'border border-slate-700 bg-slate-800/40 text-slate-400 opacity-50 hover:opacity-80';
    }

    return {
      classes: `${bgClass} opacity-100 ${isCurriculum ? 'font-medium' : ''}`,
    };
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* 8-Column Periodic Grid (1~20 Elements: 1, 2, 13~18족) */}
      <div className="w-full flex flex-col gap-1 p-2 bg-slate-950/80 rounded-xl border border-white/10">
        {/* Group Headers */}
        <div className="grid grid-cols-8 gap-1 text-center font-mono text-[9px] text-slate-400 pb-0.5 border-b border-white/5">
          {GROUP_LABELS.map((grp) => (
            <span key={grp} className="font-semibold">{grp}족</span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-8 gap-1">
          {PERIODIC_GRID.flatMap((row, rIdx) =>
            row.map((sym, cIdx) => {
              if (!sym) {
                return (
                  <div
                    key={`empty-${rIdx}-${cIdx}`}
                    className="aspect-square bg-white/[0.02] rounded-md border border-white/[0.03] pointer-events-none"
                  />
                );
              }

              const data = ELEMENTS_DATA[sym];
              const { classes } = getElementStyle(data);
              const isCurriculum = PRIMARY_ELEMENT_SYMBOLS.includes(data.symbol as SupportedElementSymbol);
              const isSelected = data.symbol === selectedSymbol;

              return (
                <button
                  key={sym}
                  id={`periodic-cell-${sym}`}
                  onClick={() => handleSelect(sym)}
                  title={`${data.atomicNumber}번 ${data.nameKr} (${data.symbol}) - ${data.ionFormula}`}
                  className={`relative aspect-square rounded-md border flex flex-col items-center justify-center p-0.5 transition-all text-center group cursor-pointer ${classes}`}
                >
                  {isCurriculum && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                  )}
                  <span className="text-[8px] text-slate-400 font-mono leading-none">
                    {data.atomicNumber}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black leading-tight font-mono">
                    {data.symbol}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Compact Quick 10 Textbook Elements */}
      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/10 flex flex-col gap-1.5">
        <div className="text-[10px] font-medium text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            핵심 10종 원소:
          </span>
          <span className="text-[9px] text-slate-400">10종</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {PRIMARY_ELEMENT_SYMBOLS.map((sym) => {
            const data = ELEMENTS_DATA[sym];
            const isSelected = data.symbol === selectedSymbol;
            const isCation = data.defaultIonType === 'cation';
            return (
              <button
                key={sym}
                id={`quick-select-${sym}`}
                onClick={() => handleSelect(sym)}
                className={`py-1 px-1 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-2 border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_10px_rgba(52,211,153,0.4)] scale-[1.02]'
                    : isCation
                    ? 'border border-indigo-400/40 bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-200'
                    : 'border border-rose-400/40 bg-rose-500/20 hover:bg-rose-500/35 text-rose-200'
                }`}
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[8px] text-slate-400 leading-none">{data.atomicNumber}</span>
                  <span className="text-xs font-black leading-tight font-mono">{data.symbol}</span>
                </div>
                <span className="text-[9px] font-medium leading-none truncate max-w-full text-slate-300">{data.nameKr}</span>
                <span className={`text-[8px] font-bold mt-0.5 leading-none ${isCation ? 'text-indigo-300' : 'text-rose-300'}`}>
                  {data.ionFormula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Legend */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-indigo-500/40 border border-indigo-400 inline-block" />
            금속 (양이온+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500/40 border border-rose-400 inline-block" />
            비금속 (음이온-)
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] text-amber-300/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          핵심 10종
        </span>
      </div>
    </div>
  );
};
