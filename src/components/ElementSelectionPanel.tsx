import React from 'react';
import { ElementData, ElementSymbol } from '../types';
import { PeriodicTable } from './PeriodicTable';

interface ElementSelectionPanelProps {
  element: ElementData;
  onSelectElement: (symbol: ElementSymbol) => void;
}

export const ElementSelectionPanel: React.FC<ElementSelectionPanelProps> = ({
  element,
  onSelectElement,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 text-slate-100">
      {/* 1. Element Selection Panel */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base" role="img" aria-label="flask">🧪</span>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              원소 선택
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
            1~20번 주기율표
          </span>
        </div>

        {/* Periodic Table Grid (8 Columns: 1, 2, 13~18족) */}
        <PeriodicTable
          selectedSymbol={element.symbol}
          onSelectElement={onSelectElement}
        />
      </div>
    </div>
  );
};
