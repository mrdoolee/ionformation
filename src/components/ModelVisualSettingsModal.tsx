import React from 'react';
import { X, Sliders, CircleDot, Layers, Play, Pause, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { ModelType } from '../types';
import { sound } from '../utils/audio';

interface ModelVisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelType: ModelType;
  animSpeed: number;
  isPaused: boolean;
  showLabels: boolean;
  onModelChange: (model: ModelType) => void;
  onSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onToggleLabels: () => void;
}

export const ModelVisualSettingsModal: React.FC<ModelVisualSettingsModalProps> = ({
  isOpen,
  onClose,
  modelType,
  animSpeed,
  isPaused,
  showLabels,
  onModelChange,
  onSpeedChange,
  onTogglePause,
  onToggleLabels,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full rounded-2xl p-5 sm:p-6 bg-slate-900/95 border border-white/15 shadow-2xl relative text-slate-100 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                원자 모형 시각화 설정
              </h2>
              <p className="text-xs text-slate-400">
                시뮬레이션 모형 형태 및 애니메이션 조작
              </p>
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

        {/* Setting 1: Model Type Selection */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            원자 모형 선택
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="modal-bohr-toggle-btn"
              onClick={() => {
                sound.playClick();
                onModelChange('bohr');
              }}
              className={`py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                modelType === 'bohr'
                  ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CircleDot className="w-4 h-4" />
              <span>보어 모형 (전자 껍질)</span>
            </button>
            <button
              id="modal-rutherford-toggle-btn"
              onClick={() => {
                sound.playClick();
                onModelChange('rutherford');
              }}
              className={`py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                modelType === 'rutherford'
                  ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>러더퍼드 모형 (3D)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            {modelType === 'bohr'
              ? '💡 보어 모형은 동심원 전자 껍질(K, L, M)로 옥텟 규칙과 원자가 전자를 학습하기에 최적화되어 있습니다.'
              : '💡 러더퍼드 모형은 원자핵을 중심으로 회전하는 3D 입체 궤도를 시각화합니다.'}
          </p>
        </div>

        {/* Setting 2: Shell Labels Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-200">
              전자 껍질 라벨 표시
            </span>
            <span className="text-[11px] text-slate-400">
              K, L, M 껍질 및 최대 수용 전자 수(2, 8, 8개) 안내 표시
            </span>
          </div>
          <button
            id="modal-toggle-labels-btn"
            onClick={() => {
              sound.playClick();
              onToggleLabels();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              showLabels
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {showLabels ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>표시 중</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>숨김</span>
              </>
            )}
          </button>
        </div>

        {/* Setting 3: Animation Speed & Play/Pause */}
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              전자 회전 애니메이션
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onTogglePause();
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span>{isPaused ? '정지됨' : '회전 중'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 whitespace-nowrap">회전 속도:</span>
            <input
              id="modal-anim-speed-slider"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={animSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-indigo-300 w-10 text-right">
              {animSpeed.toFixed(1)}x
            </span>
            <button
              onClick={() => onSpeedChange(1.0)}
              title="기본 속도(1.0x)로 리셋"
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all text-xs"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            설정 완료
          </button>
        </div>

      </div>
    </div>
  );
};
